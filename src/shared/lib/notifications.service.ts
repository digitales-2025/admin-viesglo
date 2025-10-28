import { type components } from "@/lib/api/types/api";
import { http } from "@/lib/http/clientFetch";

// Tipos de DTOs generados por OpenAPI
type NotificationSnapshotResponseDto = components["schemas"]["NotificationSnapshotResponseDto"];

/**
 * Fetches the initial snapshot of notifications for a given user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the notification snapshot data.
 */
export async function fetchNotificationSnapshot(userId: string): Promise<NotificationSnapshotResponseDto> {
  try {
    const response = await http.get<NotificationSnapshotResponseDto>(`/notifications/snapshot/${userId}`);
    return response.data;
  } catch (error) {
    console.error("🔔 Service - Failed to fetch notification snapshot", error);
    throw new Error("Failed to fetch notifications");
  }
}

/**
 * Marks a specific notification as read for a given user.
 * @param notificationId The ID of the notification to mark as read.
 * @param userId The ID of the user.
 * @returns A promise that resolves when the operation is complete.
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    await http.put(`/notifications/${notificationId}/read/${userId}`, {});
  } catch (error) {
    console.error(`🔔 Service - Failed to mark notification ${notificationId} as read`, error);
    throw new Error(`Failed to mark notification ${notificationId} as read`);
  }
}

/**
 * Marks all unread notifications for a given user as read.
 * @param userId The ID of the user.
 * @returns A promise that resolves when the operation is complete.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await http.put(`/notifications/read/all/${userId}`, {});
  } catch (error) {
    console.error(`🔔 Service - Failed to mark all notifications as read for user ${userId}`, error);
    throw new Error(`Failed to mark all notifications as read for user ${userId}`);
  }
}
