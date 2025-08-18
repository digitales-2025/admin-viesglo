"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Bell, Calendar, CheckCircle, Clock, FileText, Users, X } from "lucide-react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { http } from "@/lib/http/clientFetch";
import { useMqttTopic } from "@/shared/hooks";
import {
  CombinedNotification,
  GlobalNotificationDto,
  NotificationDto,
  NotificationSnapshotResponseDto,
} from "@/shared/types/notifications.types";
import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

// Alias para compatibilidad
type Notification = NotificationDto;
type GlobalNotification = GlobalNotificationDto;

// Componente hijo para manejar suscripciones MQTT que dependen del clientId
function MqttNotificationSubscriptions({ clientId, userId }: { clientId: string; userId: string }) {
  const queryClient = useQueryClient();

  const personalTopic = `notifications/client/${clientId}`;
  const updatesTopic = `notifications/client/${clientId}/updates`;

  const personalMqtt = useMqttTopic(personalTopic, { autoSubscribe: true });

  useEffect(() => {
    if (!userId) return;
    const msg = personalMqtt.lastMessage;
    if (!msg) return;
    try {
      const raw = (msg as any)?.payload;
      const text = typeof raw === "string" ? raw : raw?.toString?.();
      if (!text) return;
      const newNotification = JSON.parse(text);
      if (newNotification && newNotification.id && newNotification.title) {
        queryClient.setQueryData(["notifications", userId], (oldData: any) => {
          if (!oldData) return { personal: [newNotification], global: [] };
          const existingIds = new Set([
            ...oldData.personal.map((n: any) => n.id),
            ...oldData.global.map((n: any) => n.id),
          ]);
          if (!existingIds.has(newNotification.id)) {
            return { ...oldData, personal: [newNotification, ...oldData.personal] };
          }
          return oldData;
        });
      }
    } catch (error) {
      console.error("Error parsing personal notification:", error);
    }
  }, [personalMqtt.lastMessage, queryClient, userId]);

  const updatesMqtt = useMqttTopic(updatesTopic, { autoSubscribe: true });

  useEffect(() => {
    if (!userId) return;
    const msg = updatesMqtt.lastMessage;
    if (!msg) return;
    try {
      const raw = (msg as any)?.payload;
      const text = typeof raw === "string" ? raw : raw?.toString?.();
      if (!text) return;
      const update = JSON.parse(text);
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
      console.error("Error parsing update notification:", error);
    }
  }, [updatesMqtt.lastMessage, queryClient, userId]);

  return null;
}

const getTypeColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const getCategoryIcon = (category: Notification["category"]) => {
  switch (category) {
    case "project":
      return <FileText className="h-4 w-4" />;
    case "milestone":
      return <Calendar className="h-4 w-4" />;
    case "deliverable":
      return <CheckCircle className="h-4 w-4" />;
    case "assignment":
      return <Users className="h-4 w-4" />;
    case "approval":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: Notification["priority"]) => {
  switch (priority) {
    case "high":
    case "urgent":
      return "text-red-600";
    case "normal":
      return "text-yellow-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export default function NotificationsBell() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const userId = profile?.id;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: snapshot, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async (): Promise<NotificationSnapshotResponseDto> => {
      if (!userId) throw new Error("User not found");
      const response = await http.get<NotificationSnapshotResponseDto>(`/notifications/snapshot/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const clientId = snapshot?.clientId;

  const globalSystemMqtt = useMqttTopic("notifications/global/system", { autoSubscribe: true });
  const globalAlertsMqtt = useMqttTopic("notifications/global/alerts", { autoSubscribe: true });
  const globalMaintenanceMqtt = useMqttTopic("notifications/global/maintenance", { autoSubscribe: true });

  const notifications: CombinedNotification[] = useMemo(() => {
    let allNotifications: (Notification | GlobalNotification)[] = [];

    if (snapshot) {
      allNotifications = [...snapshot.personal, ...snapshot.global];
    }

    const addMqttNotifications = (mqttData: any) => {
      if (mqttData?.messages) {
        mqttData.messages.forEach((msg: any) => {
          try {
            const raw = msg?.payload;
            const text = typeof raw === "string" ? raw : raw?.toString?.();
            if (!text) return;
            const parsed = JSON.parse(text);
            if (parsed && parsed.id && !allNotifications.some((n) => n.id === parsed.id)) {
              allNotifications.push(parsed);
            }
          } catch (e) {
            console.warn("🔔 Ignorando mensaje MQTT no-JSON o vacío", e);
          }
        });
      }
    };

    addMqttNotifications(globalSystemMqtt.data);
    addMqttNotifications(globalAlertsMqtt.data);
    addMqttNotifications(globalMaintenanceMqtt.data);

    const mappedNotifications = allNotifications.map((n) => ({
      ...n,
      timeAgo: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es }),
    }));

    mappedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return mappedNotifications;
  }, [snapshot, globalSystemMqtt.data, globalAlertsMqtt.data, globalMaintenanceMqtt.data]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => ("isRead" in n && n.isRead === false) || !("isRead" in n)).length;
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => {
      if (!userId) return Promise.reject("User not found");
      return http.put(`/notifications/${notificationId}/read/${userId}`, {});
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
            ...oldData,
            metadata: {
              ...oldData.metadata,
              totalUnread: Math.max(0, oldData.metadata.totalUnread - 1),
            },
          },
        };
      });
      return { previousData };
    },
    onError: (error, notificationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!userId) return Promise.reject("User not found");
      return http.put(`/notifications/read/all/${userId}`, {});
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
      if (context?.previousData) {
        queryClient.setQueryData(["notifications", userId], context.previousData);
      }
    },
  });

  const handleMarkAsRead = (id: string) => markAsReadMutation.mutate(id);
  const handleMarkAllAsRead = () => markAllAsReadMutation.mutate();

  const removeNotification = (id: string) => {
    queryClient.setQueryData(["notifications", userId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        personal: oldData.personal.filter((n: Notification) => n.id !== id),
        global: oldData.global.filter((n: GlobalNotification) => n.id !== id),
      };
    });
  };

  if (isProfileLoading) {
    return (
      <Button variant="ghost" size="icon" className="scale-95 rounded-full" disabled>
        <Bell className="h-4 w-4 text-muted-foreground/50" />
      </Button>
    );
  }

  return (
    <>
      {clientId && userId && <MqttNotificationSubscriptions clientId={clientId} userId={userId} />}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="scale-95 rounded-full group relative">
            <Bell className="h-4 w-4 group-hover:animate-shake transition-transform" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
                disabled={markAllAsReadMutation.isPending}
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {isSnapshotLoading ? (
              <div className="p-4 text-center text-muted-foreground">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No tienes notificaciones</div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => {
                  // Determinar si el elemento es interactivo
                  const isClickable = "isRead" in notification && (notification as Notification).isRead === false;

                  return (
                    <div // 👈 CAMBIO PRINCIPAL: de <button> a <div>
                      key={notification.id}
                      role="button" // 👈 Añadido para accesibilidad
                      tabIndex={isClickable ? 0 : -1} // 👈 Añadido para navegación con teclado
                      className={`w-full text-left p-3 rounded-lg transition-colors group relative ${
                        isClickable
                          ? `cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getTypeColor(notification.type as Notification["type"])}`
                          : "bg-muted/20"
                      }`}
                      onClick={() => isClickable && handleMarkAsRead(notification.id)}
                      onKeyDown={(e) => {
                        // 👈 Añadido para accesibilidad
                        if (isClickable && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          handleMarkAsRead(notification.id);
                        }
                      }}
                      aria-label={
                        isClickable ? `Marcar notificación "${notification.title}" como leída` : notification.title
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5 text-muted-foreground">
                            {getCategoryIcon(notification.category as Notification["category"])}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`text-sm font-medium truncate ${isClickable ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {notification.title}
                              </h4>
                              {isClickable && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                              <Badge
                                variant="outline"
                                className={`text-xs px-1.5 py-0.5 capitalize ${getPriorityColor(notification.priority as Notification["priority"])}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p
                              className={`text-xs mb-2 ${isClickable ? "text-foreground/80" : "text-muted-foreground"}`}
                            >
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{notification.timeAgo}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground z-10" // Añadido z-10 para asegurar que esté por encima
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que el clic se propague al div padre
                            if (isClickable) {
                              handleMarkAsRead(notification.id);
                            } else {
                              removeNotification(notification.id);
                            }
                          }}
                          title={isClickable ? "Marcar como leída" : "Eliminar notificación"}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* El separador debe estar fuera del elemento clickeable */}
                    </div>
                  );
                })}
                {/* He movido el separador fuera del map para que no se anide incorrectamente */}
                {notifications.map((notification, index) =>
                  index < notifications.length - 1 ? (
                    <Separator key={`sep-${notification.id}`} className="my-1" />
                  ) : null
                )}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="outline" className="w-full text-xs bg-transparent">
                Ver todas las notificaciones
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
