import { apiFetch } from "./client";
import type { CartDto } from "./types";

export function getCart() {
  return apiFetch<CartDto>("/cart");
}

export function addCartItem(productId: string, quantity = 1) {
  return apiFetch<CartDto>("/cart/items", {
    method: "POST",
    body: { productId, quantity },
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<CartDto>(`/cart/items/${itemId}`, {
    method: "PUT",
    body: { quantity },
  });
}

export function removeCartItem(itemId: string) {
  return apiFetch<CartDto>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}
