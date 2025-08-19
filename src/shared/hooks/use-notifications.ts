import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { http } from "@/lib/http/clientFetch";
import {
  GlobalNotificationDto,
  NotificationDto,
  NotificationOperationResponseDto,
  NotificationSnapshotResponseDto,
} from "@/shared/types/notifications.types";
import { useMqttTopic } from "./use-mqtt-topic";

export interface UseNotificationsOptions {
  autoSubscribe?: boolean;
  enableGlobalTopics?: boolean;
}

export interface UseNotificationsReturn {
  // Data
  personalNotifications: NotificationDto[];
  globalNotifications: GlobalNotificationDto[];
  unreadCount: number;
  clientId?: string;

  // Loading states
  isLoading: boolean;
  isSnapshotLoading: boolean;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  onNewGlobalNotification: (callback: (notification: GlobalNotificationDto) => void) => () => void;

  // Mutation states
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;

  // Private actions for future use (prefixed with _)
  _markGlobalAsRead?: (notificationId: string) => void;
  _isMarkingGlobalAsRead?: boolean;

  // Error states
  error: Error | null;
}

/**
 * Hook personalizado para manejar notificaciones
 * Combina HTTP snapshot + MQTT tiempo real + gestión de estado
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoSubscribe = true, enableGlobalTopics = true } = options;
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const userId = profile?.id;
  const queryClient = useQueryClient();

  // Callbacks para notificaciones globales en tiempo real
  const globalNotificationCallbacks = useMemo(() => new Set<(notification: GlobalNotificationDto) => void>(), []);

  // Refs para trackear el último mensaje procesado de cada tópico global
  const lastProcessedAlertsRef = useRef<string>("");
  const lastProcessedMaintenanceRef = useRef<string>("");

  const onNewGlobalNotification = useCallback(
    (callback: (notification: GlobalNotificationDto) => void) => {
      globalNotificationCallbacks.add(callback);
      return () => {
        globalNotificationCallbacks.delete(callback);
      };
    },
    [globalNotificationCallbacks]
  );

  // Query para el snapshot inicial
  const {
    data: snapshot,
    isLoading: isSnapshotLoading,
    error: snapshotError,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async (): Promise<NotificationSnapshotResponseDto> => {
      if (!userId) throw new Error("User ID not available");

      console.log(`🔔 useNotifications: Fetching snapshot for userId: ${userId}`);

      const response = await http.get<NotificationSnapshotResponseDto>(`/notifications/snapshot/${userId}`);

      console.log("🔔 useNotifications: Snapshot received", {
        personal: response.data.personal?.length || 0,
        global: response.data.global?.length || 0,
        clientId: response.data.clientId,
      });

      return response.data;
    },
    enabled: !!userId && !isProfileLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const clientId = snapshot?.clientId;

  // Suscripciones MQTT personales (solo si tenemos clientId)
  const personalTopic = clientId ? `notifications/client/${clientId}` : null;
  const updatesTopic = clientId ? `notifications/client/${clientId}/updates` : null;

  const personalMqtt = useMqttTopic(personalTopic || "", {
    autoSubscribe: autoSubscribe && !!personalTopic,
  });

  const updatesMqtt = useMqttTopic(updatesTopic || "", {
    autoSubscribe: autoSubscribe && !!updatesTopic,
  });

  // Efecto para procesar mensajes personales cuando cambien
  useEffect(() => {
    if (!userId || !personalMqtt.messages.length) return;

    const latestMessage = personalMqtt.messages[personalMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 useNotifications: Processing personal notification from MQTT", {
      topic: latestMessage.topic,
      timestamp: personalMqtt.lastUpdated,
    });

    try {
      const newNotification = JSON.parse(latestMessage.payload as string);

      // Solo procesar mensajes válidos (no limpieza de retain)
      if (newNotification && newNotification.id && newNotification.title) {
        queryClient.setQueryData(["notifications", userId], (oldData: any) => {
          if (!oldData) return { personal: [newNotification], global: [] };

          // Evitar duplicados
          const existingIds = new Set([
            ...oldData.personal.map((n: any) => n.id),
            ...oldData.global.map((n: any) => n.id),
          ]);

          if (!existingIds.has(newNotification.id)) {
            return {
              ...oldData,
              personal: [newNotification, ...oldData.personal],
              metadata: {
                ...oldData.metadata,
                totalUnread: oldData.metadata.totalUnread + 1,
              },
            };
          }

          return oldData;
        });
      }
    } catch (error) {
      console.error("🔔 useNotifications: Error parsing personal notification:", error);
    }
  }, [personalMqtt.messages, personalMqtt.lastUpdated, userId, queryClient]);

  // Efecto para procesar actualizaciones cuando cambien
  useEffect(() => {
    if (!userId || !updatesMqtt.messages.length) return;

    const latestMessage = updatesMqtt.messages[updatesMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 useNotifications: Processing update from MQTT", {
      topic: latestMessage.topic,
      timestamp: updatesMqtt.lastUpdated,
    });

    try {
      const update = JSON.parse(latestMessage.payload as string);

      if (update.action === "read") {
        queryClient.setQueryData(["notifications", userId], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            personal: oldData.personal.map((n: any) =>
              n.id === update.notificationId ? { ...n, isRead: true, readAt: update.timestamp } : n
            ),
            metadata: {
              ...oldData.metadata,
              totalUnread: Math.max(0, oldData.metadata.totalUnread - 1),
            },
          };
        });
      }
    } catch (error) {
      console.error("🔔 useNotifications: Error parsing update:", error);
    }
  }, [updatesMqtt.messages, updatesMqtt.lastUpdated, userId, queryClient]);

  // Suscripciones MQTT globales
  const globalSystemMqtt = useMqttTopic("notifications/global/system", {
    autoSubscribe: autoSubscribe && enableGlobalTopics,
  });
  const globalAlertsMqtt = useMqttTopic("notifications/global/alerts", {
    autoSubscribe: autoSubscribe && enableGlobalTopics,
  });
  const globalMaintenanceMqtt = useMqttTopic("notifications/global/maintenance", {
    autoSubscribe: autoSubscribe && enableGlobalTopics,
  });

  // Efecto para procesar notificaciones globales de sistema
  useEffect(() => {
    if (!enableGlobalTopics || !globalSystemMqtt.messages.length) return;
    const latestMessage = globalSystemMqtt.messages[globalSystemMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 useNotifications: Global system MQTT effect triggered", {
      topic: latestMessage.topic,
      messageCount: globalSystemMqtt.messages.length,
      lastUpdated: globalSystemMqtt.lastUpdated,
      callbacksCount: globalNotificationCallbacks.size,
    });

    try {
      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        console.log("🔔 useNotifications: Executing callbacks for global system notification:", {
          id: newGlobalNotification.id,
          title: newGlobalNotification.title,
          callbacksCount: globalNotificationCallbacks.size,
        });
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useNotifications: Error parsing global system notification:", error);
    }
  }, [globalSystemMqtt.messages, globalSystemMqtt.lastUpdated, enableGlobalTopics, globalNotificationCallbacks]);

  // Efecto para procesar notificaciones globales de alertas
  useEffect(() => {
    if (!enableGlobalTopics || !globalAlertsMqtt.messages.length) return;
    const latestMessage = globalAlertsMqtt.messages[globalAlertsMqtt.messages.length - 1];
    if (!latestMessage) return;

    // Evitar procesar el mismo mensaje múltiples veces
    const messageKey = `${latestMessage.topic}-${latestMessage.payload}`;
    if (lastProcessedAlertsRef.current === messageKey) return;
    lastProcessedAlertsRef.current = messageKey;

    try {
      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useNotifications: Error parsing global alerts notification:", error);
    }
  }, [globalAlertsMqtt.messages, enableGlobalTopics, globalNotificationCallbacks]);

  // Efecto para procesar notificaciones globales de mantenimiento
  useEffect(() => {
    if (!enableGlobalTopics || !globalMaintenanceMqtt.messages.length) return;
    const latestMessage = globalMaintenanceMqtt.messages[globalMaintenanceMqtt.messages.length - 1];
    if (!latestMessage) return;

    // Evitar procesar el mismo mensaje múltiples veces
    const messageKey = `${latestMessage.topic}-${latestMessage.payload}`;
    if (lastProcessedMaintenanceRef.current === messageKey) return;
    lastProcessedMaintenanceRef.current = messageKey;

    console.log("🔔 useNotifications: Processing global maintenance notification from MQTT", {
      topic: latestMessage.topic,
      timestamp: globalMaintenanceMqtt.lastUpdated,
      callbacksCount: globalNotificationCallbacks.size,
    });

    try {
      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        console.log("🔔 useNotifications: Executing callbacks for global maintenance notification:", {
          id: newGlobalNotification.id,
          title: newGlobalNotification.title,
          callbacksCount: globalNotificationCallbacks.size,
        });
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useNotifications: Error parsing global maintenance notification:", error);
    }
  }, [
    globalMaintenanceMqtt.messages,
    globalMaintenanceMqtt.lastUpdated,
    enableGlobalTopics,
    globalNotificationCallbacks,
  ]);

  // Notificaciones personales (del snapshot + nuevas de MQTT) - Limitadas a las últimas 10
  const personalNotifications: NotificationDto[] = useMemo(() => {
    if (!snapshot) return [];
    const allPersonal = [...snapshot.personal];

    // Add new personal notifications from MQTT (already handled in previous useEffect)
    // The queryClient.setQueryData already updates the snapshot.personal array directly.

    const mappedNotifications = allPersonal.map((n) => ({
      ...n,
      timeAgo: formatDistanceToNow(new Date(n.createdAt), {
        addSuffix: true,
        locale: es,
      }),
    }));

    // Ordenar por fecha de creación (más recientes primero) y limitar a 10
    mappedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return mappedNotifications.slice(0, 10);
  }, [snapshot]);

  // Notificaciones globales (solo del snapshot)
  const globalNotifications: GlobalNotificationDto[] = useMemo(() => {
    if (!snapshot) return [];
    const allGlobal = [...snapshot.global];

    const mappedNotifications = allGlobal.map((n) => ({
      ...n,
      timeAgo: formatDistanceToNow(new Date(n.createdAt), {
        addSuffix: true,
        locale: es,
      }),
    }));

    mappedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return mappedNotifications;
  }, [snapshot]);

  // Contar no leídas (todas las personales, no solo las 10 mostradas)
  const unreadCount = useMemo(() => {
    if (!snapshot) return 0;
    // Contar todas las notificaciones personales no leídas, no solo las 10 mostradas
    return snapshot.personal.filter((n) => n.isRead === false).length;
  }, [snapshot]);

  // Mutación para marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!userId) throw new Error("User not found");
      return http.put<NotificationOperationResponseDto>(`/notifications/${notificationId}/read/${userId}`, {});
    },
    onMutate: async (notificationId: string) => {
      const previousData = queryClient.getQueryData(["notifications", userId]);

      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPersonal = oldData.personal.map((n: any) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );

        const newUnreadCount = updatedPersonal.filter((n: any) => n.isRead === false).length;

        return {
          ...oldData,
          personal: updatedPersonal,
          metadata: {
            ...oldData.metadata,
            totalUnread: newUnreadCount,
          },
        };
      });

      return { previousData };
    },
    onSuccess: (data, notificationId) => {
      console.log("🔔 useNotifications: Successfully marked as read:", notificationId);
      // Forzar una actualización del cache para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (error, notificationId, context) => {
      console.error("🔔 useNotifications: Error marking as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  // Mutación para marcar todas las personales como leídas (sin afectar globales)
  const markAllPersonalAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not found");

      // Obtener solo las notificaciones personales no leídas
      const unreadPersonalNotifications = personalNotifications.filter((n) => !n.isRead);

      if (unreadPersonalNotifications.length === 0) {
        return [];
      }

      // Usar el endpoint para marcar todas las personales como leídas
      return http.put<{ success: boolean; count: number }>(`/notifications/read/all/${userId}`, {});
    },
    onMutate: async () => {
      const previousData = queryClient.getQueryData(["notifications", userId]);

      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const now = new Date().toISOString();
        // Solo marcar las personales como leídas, mantener las globales intactas
        const updatedPersonal = oldData.personal.map((n: any) => (n.isRead ? n : { ...n, isRead: true, readAt: now }));

        // Calcular el nuevo conteo solo basado en personales no leídas
        const newUnreadCount = updatedPersonal.filter((n: any) => n.isRead === false).length;

        return {
          ...oldData,
          personal: updatedPersonal,
          // Las globales no se modifican
          global: oldData.global,
          metadata: {
            ...oldData.metadata,
            totalUnread: newUnreadCount, // Solo contar personales no leídas
          },
        };
      });

      return { previousData };
    },
    onSuccess: (_data) => {
      console.log("🔔 useNotifications: Successfully marked all personal as read");
      // Forzar una actualización del cache para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (error, variables, context) => {
      console.error("🔔 useNotifications: Error marking all personal as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  // Mutación para marcar notificación global como vista (NO REMOVER, solo marcar como vista)
  const markGlobalAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!userId) throw new Error("User not found");
      return http.put<{ success: boolean }>(`/notifications/global/${notificationId}/read/${userId}`, {});
    },
    onSuccess: (data, _notificationId) => {
      console.log("🔔 useNotifications: Successfully marked global as viewed:", _notificationId);
      // NO remover la notificación global del estado, solo marcarla como vista
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedGlobal = oldData.global.map((n: any) =>
          n.id === _notificationId ? { ...n, isViewed: true, viewedAt: new Date().toISOString() } : n
        );

        return {
          ...oldData,
          global: updatedGlobal,
        };
      });
    },
    onError: (error, _notificationId) => {
      console.error("🔔 useNotifications: Error marking global as viewed:", error);
    },
  });

  // Función para remover notificación personal localmente
  const removeNotification = useCallback(
    (notificationId: string) => {
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPersonal = oldData.personal.filter((n: any) => n.id !== notificationId);
        const newUnreadCount = updatedPersonal.filter((n: any) => n.isRead === false).length;

        return {
          ...oldData,
          personal: updatedPersonal,
          metadata: {
            ...oldData.metadata,
            totalUnread: newUnreadCount,
          },
        };
      });
    },
    [queryClient, userId]
  );

  return {
    // Data
    personalNotifications,
    globalNotifications,
    unreadCount,
    clientId,

    // Loading states
    isLoading: isProfileLoading || isSnapshotLoading,
    isSnapshotLoading,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllPersonalAsReadMutation.mutate,
    removeNotification,
    onNewGlobalNotification,

    // Actions for future use (not exposed in main interface)
    _markGlobalAsRead: markGlobalAsReadMutation.mutate,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllPersonalAsReadMutation.isPending,
    _isMarkingGlobalAsRead: markGlobalAsReadMutation.isPending,

    // Error states
    error: snapshotError as Error | null,
  };
}
