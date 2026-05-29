import { apiFetch } from "./client";

export interface NotificationDto {
  id: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: NotificationDto[];
  unreadCount: number;
}

export function getNotifications(limit = 20) {
  return apiFetch<NotificationsResponse>(`/notifications?limit=${limit}`, {
    requireAuth: true,
  });
}

export function markAsRead(id: string) {
  return apiFetch<void>(`/notifications/${id}/read`, {
    method: "POST",
    requireAuth: true,
  });
}

export function markAllAsRead() {
  return apiFetch<void>("/notifications/read-all", {
    method: "POST",
    requireAuth: true,
  });
}
