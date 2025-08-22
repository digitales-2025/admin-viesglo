import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { http } from "@/lib/http/clientFetch";
import {
  NotificationDto,
  NotificationOperationResponseDto,
  NotificationSnapshotResponseDto,
} from "@/shared/types/notifications.types";
import { useMqttTopic } from "./use-mqtt-topic";

export interface UsePersonalNotificationsReturn {
  // Data
  notifications: NotificationDto[];
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
 * Hook específico para manejar notificaciones personales
 * Combina HTTP snapshot + MQTT tiempo real
 */
export function usePersonalNotifications(): UsePersonalNotificationsReturn {
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

      console.log(`🔔 usePersonalNotifications: Fetching snapshot for userId: ${userId}`);

      const response = await http.get<NotificationSnapshotResponseDto>(`/notifications/snapshot/${userId}`);

      console.log("🔔 usePersonalNotifications: Snapshot received", {
        personal: response.data.personal?.length || 0,
        clientId: response.data.clientId,
      });

      return response.data;
    },
    enabled: !!userId && !isProfileLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const clientId = snapshot?.clientId;

  // Suscripciones MQTT personales
  const personalTopic = clientId ? `notifications/client/${clientId}` : null;
  const updatesTopic = clientId ? `notifications/client/${clientId}/updates` : null;

  const personalMqtt = useMqttTopic(personalTopic || "", {
    autoSubscribe: !!personalTopic,
  });

  const updatesMqtt = useMqttTopic(updatesTopic || "", {
    autoSubscribe: !!updatesTopic,
  });

  // Efecto para procesar mensajes personales cuando cambien
  useEffect(() => {
    if (!userId || !personalMqtt.messages.length) return;

    const latestMessage = personalMqtt.messages[personalMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 usePersonalNotifications: Processing personal notification from MQTT", {
      topic: latestMessage.topic,
      timestamp: personalMqtt.lastUpdated,
      payloadLength: latestMessage.payload?.length || 0,
    });

    try {
      // IMPORTANTE: Ignorar mensajes vacíos que son de limpieza del backend
      if (!latestMessage.payload || latestMessage.payload === "" || latestMessage.payload === "{}") {
        console.log("🔔 usePersonalNotifications: Ignoring empty message (cleanup)");
        return;
      }

      const newNotification = JSON.parse(latestMessage.payload as string);

      // Solo procesar mensajes válidos (no limpieza de retain)
      if (newNotification && newNotification.id && newNotification.title) {
        // IMPORTANTE: NO marcar como leída automáticamente
        // Solo agregar la notificación al estado
        queryClient.setQueryData(["notifications", userId], (oldData: any) => {
          if (!oldData)
            return {
              personal: [{ ...newNotification, isRead: false }],
              global: [],
              metadata: { totalUnread: 1, globalActive: 0, lastSyncAt: new Date().toISOString() },
            };

          // Evitar duplicados
          const existingIds = new Set([
            ...oldData.personal.map((n: any) => n.id),
            ...oldData.global.map((n: any) => n.id),
          ]);

          if (!existingIds.has(newNotification.id)) {
            return {
              ...oldData,
              personal: [{ ...newNotification, isRead: false }, ...oldData.personal],
              metadata: {
                ...oldData.metadata,
                totalUnread: (oldData.metadata?.totalUnread || 0) + 1,
              },
            };
          }

          return oldData;
        });
      }
    } catch (error) {
      console.error("🔔 usePersonalNotifications: Error parsing personal notification:", error);
    }
  }, [personalMqtt.messages, personalMqtt.lastUpdated, userId, queryClient]);

  // Efecto para procesar actualizaciones cuando cambien
  useEffect(() => {
    if (!userId || !updatesMqtt.messages.length) return;

    const latestMessage = updatesMqtt.messages[updatesMqtt.messages.length - 1];
    if (!latestMessage) return;

    console.log("🔔 usePersonalNotifications: Processing update from MQTT", {
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
              totalUnread: Math.max(0, (oldData.metadata?.totalUnread || 0) - 1),
            },
          };
        });
      }
    } catch (error) {
      console.error("🔔 usePersonalNotifications: Error parsing update:", error);
    }
  }, [updatesMqtt.messages, updatesMqtt.lastUpdated, userId, queryClient]);

  // Notificaciones personales (del snapshot + nuevas de MQTT) - Limitadas a las últimas 10
  const notifications: NotificationDto[] = useMemo(() => {
    if (!snapshot) return [];
    const allPersonal = [...snapshot.personal];

    const mappedNotifications = allPersonal.map((n: NotificationDto) => ({
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

  // Contar no leídas (todas las personales, no solo las 10 mostradas)
  const unreadCount = useMemo(() => {
    if (!snapshot) return 0;
    return snapshot.personal.filter((n: NotificationDto) => n.isRead === false).length;
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
      console.log("🔔 usePersonalNotifications: Successfully marked as read:", notificationId);
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (error, notificationId, context) => {
      console.error("🔔 usePersonalNotifications: Error marking as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  // Mutación para marcar todas las personales como leídas
  const markAllPersonalAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not found");

      const unreadPersonalNotifications = notifications.filter((n) => !n.isRead);

      if (unreadPersonalNotifications.length === 0) {
        return [];
      }

      return http.put<{ success: boolean; count: number }>(`/notifications/read/all/${userId}`, {});
    },
    onMutate: async () => {
      const previousData = queryClient.getQueryData(["notifications", userId]);

      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const now = new Date().toISOString();
        const updatedPersonal = oldData.personal.map((n: any) => (n.isRead ? n : { ...n, isRead: true, readAt: now }));

        const newUnreadCount = updatedPersonal.filter((n: any) => n.isRead === false).length;

        return {
          ...oldData,
          personal: updatedPersonal,
          global: oldData.global,
          metadata: {
            ...oldData.metadata,
            totalUnread: newUnreadCount,
          },
        };
      });

      return { previousData };
    },
    onSuccess: (_data) => {
      console.log("🔔 usePersonalNotifications: Successfully marked all personal as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (error, variables, context) => {
      console.error("🔔 usePersonalNotifications: Error marking all personal as read:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
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
    notifications,
    unreadCount,
    clientId,

    // Loading states
    isLoading: isProfileLoading || isSnapshotLoading,
    isSnapshotLoading,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllPersonalAsReadMutation.mutate,
    removeNotification,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllPersonalAsReadMutation.isPending,

    // Error states
    error: snapshotError as Error | null,
  };
}
