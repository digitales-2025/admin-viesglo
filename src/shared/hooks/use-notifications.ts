import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { http } from "@/lib/http/clientFetch";
import {
  CombinedNotification,
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
  notifications: CombinedNotification[];
  unreadCount: number;
  clientId?: string;

  // Loading states
  isLoading: boolean;
  isSnapshotLoading: boolean;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;

  // Mutation states
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;

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

  // Combinar todas las notificaciones
  const notifications: CombinedNotification[] = useMemo(() => {
    let allNotifications: (NotificationDto | GlobalNotificationDto)[] = [];

    // Agregar del snapshot
    if (snapshot) {
      allNotifications = [...snapshot.personal, ...snapshot.global];
    }

    // Agregar notificaciones globales de MQTT
    const addMqttNotifications = (mqttData: any) => {
      if (mqttData?.messages) {
        mqttData.messages.forEach((msg: any) => {
          try {
            const parsed = JSON.parse(msg.payload);
            if (parsed && parsed.id && !allNotifications.some((n) => n.id === parsed.id)) {
              allNotifications.push(parsed);
            }
          } catch (error) {
            console.error("🔔 useNotifications: Error parsing MQTT message:", error);
          }
        });
      }
    };

    if (enableGlobalTopics) {
      addMqttNotifications(globalSystemMqtt.data);
      addMqttNotifications(globalAlertsMqtt.data);
      addMqttNotifications(globalMaintenanceMqtt.data);
    }

    // Mapear y ordenar
    const mappedNotifications = allNotifications.map((n) => ({
      ...n,
      timeAgo: formatDistanceToNow(new Date(n.createdAt), {
        addSuffix: true,
        locale: es,
      }),
    }));

    mappedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return mappedNotifications;
  }, [snapshot, enableGlobalTopics, globalSystemMqtt.data, globalAlertsMqtt.data, globalMaintenanceMqtt.data]);

  // Contar no leídas
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => ("isRead" in n && n.isRead === false) || !("isRead" in n)).length;
  }, [notifications]);

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

        return {
          ...oldData,
          personal: oldData.personal.map((n: any) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          ),
          metadata: {
            ...oldData.metadata,
            totalUnread: Math.max(0, oldData.metadata.totalUnread - 1),
          },
        };
      });

      return { previousData };
    },
    onError: (error, notificationId, context) => {
      console.error("🔔 useNotifications: Error marking as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User not found");
      return http.put<NotificationOperationResponseDto>(`/notifications/read/all/${userId}`, {});
    },
    onMutate: async () => {
      const previousData = queryClient.getQueryData(["notifications", userId]);

      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const now = new Date().toISOString();
        return {
          ...oldData,
          personal: oldData.personal.map((n: any) => (n.isRead ? n : { ...n, isRead: true, readAt: now })),
          metadata: {
            ...oldData.metadata,
            totalUnread: 0,
          },
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("🔔 useNotifications: Error marking all as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  // Función para remover notificación localmente
  const removeNotification = useCallback(
    (notificationId: string) => {
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          personal: oldData.personal.filter((n: any) => n.id !== notificationId),
          global: oldData.global.filter((n: any) => n.id !== notificationId),
        };
      });
    },
    [queryClient, userId]
  );

  return {
    // Data
    notifications,
    unreadCount,
    clientId,

    // Loading states
    isLoading: isProfileLoading || isSnapshotLoading,
    isSnapshotLoading,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    removeNotification,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,

    // Error states
    error: snapshotError as Error | null,
  };
}
