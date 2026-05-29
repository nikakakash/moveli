"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const startPolling = useNotificationStore((s) => s.startPolling);

  useEffect(() => {
    restoreSession().then(() => fetchCart());
  }, [restoreSession, fetchCart]);

  // Start notification polling when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const cleanup = startPolling();
      return cleanup;
    }
  }, [isAuthenticated, fetchNotifications, startPolling]);

  return <>{children}</>;
}
