"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Bell, Calendar, Check, CheckCircle, Clock, FileText, Users } from "lucide-react";

import { usePersonalNotifications } from "@/shared/hooks/use-personal-notifications";
import type { NotificationDto } from "@/shared/types/notifications.types";
import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

// Alias para compatibilidad
type Notification = NotificationDto;

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
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications: personalNotifications,
    unreadCount,
    isLoading,
    isSnapshotLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = usePersonalNotifications();

  const notificationsToDisplay = useMemo(() => {
    return personalNotifications.map((n) => ({
      ...n,
      timeAgo: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es }),
    }));
  }, [personalNotifications]);

  const handleMarkAsRead = (id: string) => markAsRead(id);
  const handleMarkAllAsRead = () => markAllAsRead();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="scale-95 rounded-full" disabled>
        <Bell className="h-4 w-4 text-muted-foreground/50" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" type="button" size="icon" className="scale-95 rounded-full group relative">
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
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs"
              disabled={isMarkingAllAsRead}
            >
              {isMarkingAllAsRead ? "Marcando..." : "Marcar todas como leídas"}
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isSnapshotLoading ? (
            <div className="p-4 text-center text-muted-foreground">Cargando...</div>
          ) : notificationsToDisplay.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No tienes notificaciones</div>
          ) : (
            <div className="p-2">
              {notificationsToDisplay.map((notification) => {
                // Determinar si el elemento es interactivo
                const isClickable = "isRead" in notification && (notification as Notification).isRead === false;

                return (
                  <div // Contenedor no interactivo por ahora
                    key={notification.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors group relative ${
                      isClickable
                        ? `cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getTypeColor(notification.type as Notification["type"])}`
                        : "bg-muted/20"
                    }`}
                  >
                    {/* Futuro: activar navegación al hacer clic en toda la notificación */}
                    {/* onClick={() => router.push(`/ruta/${notification.id}`)} */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 text-muted-foreground">
                          {getCategoryIcon(notification.category as Notification["category"])}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4
                              className={`text-sm font-medium ${isClickable ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </h4>
                            {isClickable && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0.5 capitalize flex-shrink-0 ${getPriorityColor(notification.priority as Notification["priority"])}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className={`text-xs mb-2 ${isClickable ? "text-foreground/80" : "text-muted-foreground"}`}>
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
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-green-100 text-green-600 hover:text-green-700 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isClickable) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                        title="Marcar como leída"
                        disabled={!isClickable}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                    {/* El separador debe estar fuera del elemento clickeable */}
                  </div>
                );
              })}
              {/* He movido el separador fuera del map para que no se anide incorrectamente */}
              {notificationsToDisplay.map((notification, index) =>
                index < notificationsToDisplay.length - 1 ? (
                  <Separator key={`sep-${notification.id}`} className="my-1" />
                ) : null
              )}
            </div>
          )}
        </ScrollArea>

        {notificationsToDisplay.length > 0 && (
          <div className="p-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Mostrando {notificationsToDisplay.length} de {unreadCount} no leídas
              </span>
            </div>
            <Button variant="outline" className="w-full text-xs bg-transparent">
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
