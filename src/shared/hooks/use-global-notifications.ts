import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { http } from "@/lib/http/clientFetch";
import { GlobalNotificationDto, NotificationSnapshotResponseDto } from "@/shared/types/notifications.types";
import { useMqttTopic } from "./use-mqtt-topic";

export interface UseGlobalNotificationsReturn {
  // Data
  notifications: GlobalNotificationDto[];
  clientId?: string;

  // Loading states
  isLoading: boolean;
  isSnapshotLoading: boolean;

  // Actions
  onNewGlobalNotification: (callback: (notification: GlobalNotificationDto) => void) => () => void;
  markGlobalAsRead: (notificationId: string) => void;

  // Mutation states
  isMarkingGlobalAsRead: boolean;

  // Error states
  error: Error | null;
}

/**
 * Hook específico para manejar notificaciones globales
 * Combina HTTP snapshot + MQTT tiempo real
 */
export function useGlobalNotifications(): UseGlobalNotificationsReturn {
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

      console.log(`🔔 useGlobalNotifications: Fetching snapshot for userId: ${userId}`);

      const response = await http.get<NotificationSnapshotResponseDto>(`/notifications/snapshot/${userId}`);

      console.log("🔔 useGlobalNotifications: Snapshot received", {
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

  // Suscripciones MQTT globales
  const globalSystemMqtt = useMqttTopic("notifications/global/system", {
    autoSubscribe: !!clientId,
  });
  const globalAlertsMqtt = useMqttTopic("notifications/global/alerts", {
    autoSubscribe: !!clientId,
  });
  const globalMaintenanceMqtt = useMqttTopic("notifications/global/maintenance", {
    autoSubscribe: !!clientId,
  });

  // Efecto para procesar notificaciones globales de sistema
  useEffect(() => {
    if (!globalSystemMqtt.messages.length) return;
    const latestMessage = globalSystemMqtt.messages[globalSystemMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 useGlobalNotifications: Global system MQTT effect triggered", {
      topic: latestMessage.topic,
      messageCount: globalSystemMqtt.messages.length,
      lastUpdated: globalSystemMqtt.lastUpdated,
      callbacksCount: globalNotificationCallbacks.size,
      payloadLength: latestMessage.payload?.length || 0,
    });

    try {
      // IMPORTANTE: Ignorar mensajes vacíos que son de limpieza del backend
      if (!latestMessage.payload || latestMessage.payload === "" || latestMessage.payload === "{}") {
        console.log("🔔 useGlobalNotifications: Ignoring empty message (cleanup)");
        return;
      }

      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        console.log("🔔 useGlobalNotifications: Executing callbacks for global system notification:", {
          id: newGlobalNotification.id,
          title: newGlobalNotification.title,
          callbacksCount: globalNotificationCallbacks.size,
        });
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useGlobalNotifications: Error parsing global system notification:", error);
    }
  }, [globalSystemMqtt.messages, globalSystemMqtt.lastUpdated, globalNotificationCallbacks]);

  // Efecto para procesar notificaciones globales de alertas
  useEffect(() => {
    if (!globalAlertsMqtt.messages.length) return;
    const latestMessage = globalAlertsMqtt.messages[globalAlertsMqtt.messages.length - 1];
    if (!latestMessage) return;

    // Evitar procesar el mismo mensaje múltiples veces
    const messageKey = `${latestMessage.topic}-${latestMessage.payload}`;
    if (lastProcessedAlertsRef.current === messageKey) return;
    lastProcessedAlertsRef.current = messageKey;

    try {
      // IMPORTANTE: Ignorar mensajes vacíos que son de limpieza del backend
      if (!latestMessage.payload || latestMessage.payload === "" || latestMessage.payload === "{}") {
        console.log("🔔 useGlobalNotifications: Ignoring empty message (cleanup)");
        return;
      }

      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useGlobalNotifications: Error parsing global alerts notification:", error);
    }
  }, [globalAlertsMqtt.messages, globalNotificationCallbacks]);

  // Efecto para procesar notificaciones globales de mantenimiento
  useEffect(() => {
    if (!globalMaintenanceMqtt.messages.length) return;
    const latestMessage = globalMaintenanceMqtt.messages[globalMaintenanceMqtt.messages.length - 1];
    if (!latestMessage) return;

    // Evitar procesar el mismo mensaje múltiples veces
    const messageKey = `${latestMessage.topic}-${latestMessage.payload}`;
    if (lastProcessedMaintenanceRef.current === messageKey) return;
    lastProcessedMaintenanceRef.current = messageKey;

    console.log("🔔 useGlobalNotifications: Processing global maintenance notification from MQTT", {
      topic: latestMessage.topic,
      timestamp: globalMaintenanceMqtt.lastUpdated,
      callbacksCount: globalNotificationCallbacks.size,
      payloadLength: latestMessage.payload?.length || 0,
    });

    try {
      // IMPORTANTE: Ignorar mensajes vacíos que son de limpieza del backend
      if (!latestMessage.payload || latestMessage.payload === "" || latestMessage.payload === "{}") {
        console.log("🔔 useGlobalNotifications: Ignoring empty message (cleanup)");
        return;
      }

      const newGlobalNotification: GlobalNotificationDto = JSON.parse(latestMessage.payload as string);
      if (newGlobalNotification && newGlobalNotification.id && newGlobalNotification.title) {
        console.log("🔔 useGlobalNotifications: Executing callbacks for global maintenance notification:", {
          id: newGlobalNotification.id,
          title: newGlobalNotification.title,
          callbacksCount: globalNotificationCallbacks.size,
        });
        globalNotificationCallbacks.forEach((callback) => callback(newGlobalNotification));
      }
    } catch (error) {
      console.error("🔔 useGlobalNotifications: Error parsing global maintenance notification:", error);
    }
  }, [globalMaintenanceMqtt.messages, globalMaintenanceMqtt.lastUpdated, globalNotificationCallbacks]);

  // Notificaciones globales (solo del snapshot)
  const notifications: GlobalNotificationDto[] = useMemo(() => {
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

  // Mutación para marcar notificación global como vista (NO REMOVER, solo marcar como vista)
  const markGlobalAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error("User not found");
      const response = await http.put<{ success: boolean }>(
        `/notifications/global/${notificationId}/read/${userId}`,
        {}
      );
      return response.data;
    },
    onSuccess: (_data: { success: boolean }, _notificationId: string) => {
      console.log("🔔 useGlobalNotifications: Successfully marked global as viewed:", _notificationId);
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
    onError: (error: Error, _notificationId: string) => {
      console.error("🔔 useGlobalNotifications: Error marking global as viewed:", error);
    },
  });

  return {
    // Data
    notifications,
    clientId,

    // Loading states
    isLoading: isProfileLoading || isSnapshotLoading,
    isSnapshotLoading,

    // Actions
    onNewGlobalNotification,
    markGlobalAsRead: markGlobalAsReadMutation.mutate,

    // Mutation states
    isMarkingGlobalAsRead: markGlobalAsReadMutation.isPending,

    // Error states
    error: snapshotError as Error | null,
  };
}
