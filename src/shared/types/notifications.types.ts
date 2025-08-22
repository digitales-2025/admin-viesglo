// 🔔 TIPOS DE NOTIFICACIONES - Frontend
// Tipos temporales hasta que se generen automáticamente desde la API

export interface NotificationDto {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  category: "project" | "milestone" | "deliverable" | "assignment" | "approval" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface GlobalNotificationDto {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  category: "system" | "maintenance" | "alert";
  scope: "alerts" | "system" | "maintenance";
  priority: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, any>;
}

export interface NotificationSnapshotMetadataDto {
  totalUnread: number;
  globalActive: number;
  lastSyncAt: string;
}

export interface NotificationSnapshotResponseDto {
  clientId: string;
  personal: NotificationDto[];
  global: GlobalNotificationDto[];
  metadata: NotificationSnapshotMetadataDto;
}

export interface NotificationOperationResponseDto {
  success: boolean;
  notificationId?: string;
  message: string;
  count?: number;
}

export interface NotificationStatsResponseDto {
  totalUnread: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

// Tipo combinado para la UI
export type CombinedNotification = (NotificationDto | GlobalNotificationDto) & {
  timeAgo: string;
};

// Opciones para useMqttTopic (corregir el tipo)
export interface UseMqttTopicOptions<T> {
  parser?: (data: any) => T;
  qos?: 0 | 1 | 2;
  maxMessages?: number;
  autoSubscribe?: boolean;
  onMessage?: (topic: string, message: any) => void;
  onParseError?: (error: Error, message: any) => void;
}
