import { apiFetch } from "./client";
import type { WishlistItemDto } from "./types";

export function getWishlist() {
  return apiFetch<WishlistItemDto[]>("/wishlist", { requireAuth: true });
}

export function addToWishlist(productId: string) {
  return apiFetch<void>(`/wishlist/${productId}`, {
    method: "POST",
    requireAuth: true,
  });
}

export function removeFromWishlist(productId: string) {
  return apiFetch<void>(`/wishlist/${productId}`, {
    method: "DELETE",
    requireAuth: true,
  });
}
