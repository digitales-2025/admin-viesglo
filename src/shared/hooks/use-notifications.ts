import { useMemo } from "react";

import { useGlobalNotifications } from "./use-global-notifications";
import { usePersonalNotifications } from "./use-personal-notifications";

export interface UseNotificationsOptions {
  autoSubscribe?: boolean;
  enableGlobalTopics?: boolean;
}

export interface UseNotificationsReturn {
  // Data
  personalNotifications: any[];
  globalNotifications: any[];
  unreadCount: number;
  clientId?: string;

  // Loading states
  isLoading: boolean;
  isSnapshotLoading: boolean;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  onNewGlobalNotification: (callback: (notification: any) => void) => () => void;

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
 * Hook principal que combina notificaciones personales y globales
 * Mantiene compatibilidad con el código existente
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { enableGlobalTopics = true } = options;

  // Usar hooks separados
  const personalNotifications = usePersonalNotifications();
  const globalNotifications = useGlobalNotifications();

  // Combinar datos y estados
  const combinedData = useMemo(() => {
    return {
      personalNotifications: personalNotifications.notifications,
      globalNotifications: enableGlobalTopics ? globalNotifications.notifications : [],
      unreadCount: personalNotifications.unreadCount,
      clientId: personalNotifications.clientId || globalNotifications.clientId,
      isLoading: personalNotifications.isLoading || globalNotifications.isLoading,
      isSnapshotLoading: personalNotifications.isSnapshotLoading || globalNotifications.isSnapshotLoading,
      error: personalNotifications.error || globalNotifications.error,
    };
  }, [personalNotifications, globalNotifications, enableGlobalTopics]);

  return {
    // Data
    personalNotifications: combinedData.personalNotifications,
    globalNotifications: combinedData.globalNotifications,
    unreadCount: combinedData.unreadCount,
    clientId: combinedData.clientId,

    // Loading states
    isLoading: combinedData.isLoading,
    isSnapshotLoading: combinedData.isSnapshotLoading,

    // Actions
    markAsRead: personalNotifications.markAsRead,
    markAllAsRead: personalNotifications.markAllAsRead,
    removeNotification: personalNotifications.removeNotification,
    onNewGlobalNotification: globalNotifications.onNewGlobalNotification,

    // Actions for future use (not exposed in main interface)
    _markGlobalAsRead: globalNotifications.markGlobalAsRead,

    // Mutation states
    isMarkingAsRead: personalNotifications.isMarkingAsRead,
    isMarkingAllAsRead: personalNotifications.isMarkingAllAsRead,
    _isMarkingGlobalAsRead: globalNotifications.isMarkingGlobalAsRead,

    // Error states
    error: combinedData.error,
  };
}
