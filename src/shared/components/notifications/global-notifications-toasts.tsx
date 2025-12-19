"use client";

import { useCallback, useEffect, useRef } from "react";
import { AlertTriangle, Bell } from "lucide-react";

import { useNotifications } from "@/shared/hooks/use-notifications";
import { useToast } from "@/shared/hooks/use-toast";
import type { GlobalNotificationDto } from "@/shared/types/notifications.types";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "system":
    case "maintenance":
    case "alert":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getToastType = (type: GlobalNotificationDto["type"]) => {
  switch (type) {
    case "success":
      return "success" as const;
    case "warning":
      return "warning" as const;
    case "error":
      return "error" as const;
    default:
      return "info" as const;
  }
};

export function GlobalNotificationsToasts() {
  const { onNewGlobalNotification } = useNotifications({
    autoSubscribe: true,
    enableGlobalTopics: true,
  });
  const toast = useToast();
  const processedNotifications = useRef(new Set<string>());

  const showGlobalNotificationToast = useCallback(
    (notification: GlobalNotificationDto) => {
      if (!toast) {
        return;
      }

      const toastType = getToastType(notification.type);
      const icon = getCategoryIcon(notification.category);

      const toastMethod = toast[toastType];

      if (toastMethod) {
        toastMethod(`${notification.title}: ${notification.message}`, {
          id: notification.id,
          duration: notification.priority === "urgent" ? 10000 : notification.priority === "high" ? 8000 : 6000,
          icon,
        });
      } else {
        console.warn("🔔 GlobalNotificationsToasts: Toast method not available for type:", toastType);
      }
    },
    [toast]
  );

  // Suscribirse a nuevas notificaciones globales y mostrarlas como toasts
  useEffect(() => {
    const unsubscribe = onNewGlobalNotification((notification) => {
      if (!processedNotifications.current.has(notification.id)) {
        showGlobalNotificationToast(notification);
        processedNotifications.current.add(notification.id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onNewGlobalNotification, showGlobalNotificationToast]);

  // Este componente no renderiza nada visible, solo maneja los toasts
  return null;
}
