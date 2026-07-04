"use client";

import { create } from "zustand";
import type { NotificationDto } from "@/lib/api/notifications";
import * as notificationsApi from "@/lib/api/notifications";

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  startPolling: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      const res = await notificationsApi.getNotifications();
      set({ notifications: res.items, unreadCount: res.unreadCount });
    } catch {
      // Silently fail on polling errors
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      set((state) => {
        // Only decrement when this notification was actually unread, so re-marking an
        // already-read item can't drive the badge below the true unread count.
        const wasUnread = state.notifications.some((n) => n.id === id && !n.isRead);
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  startPolling: () => {
    const interval = setInterval(() => {
      get().fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  },
}));
