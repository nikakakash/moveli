"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const startPolling = useNotificationStore((s) => s.startPolling);
  const initWishlist = useWishlistStore((s) => s.init);
  const mergeWishlist = useWishlistStore((s) => s.mergeGuestIntoAccount);

  useEffect(() => {
    restoreSession().then(() => fetchCart());
  }, [restoreSession, fetchCart]);

  // Guests load their wishlist from localStorage; on login, merge those guest
  // items into the account and then load the authoritative server list.
  useEffect(() => {
    if (isAuthenticated) {
      mergeWishlist();
    } else {
      initWishlist();
    }
  }, [isAuthenticated, mergeWishlist, initWishlist]);

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
