"use client";

import { create } from "zustand";
import type { CartItemDto } from "@/lib/api/types";
import * as cartApi from "@/lib/api/cart";

interface CartState {
  items: CartItemDto[];
  total: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearLocal: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.getCart();
      set({ items: cart.items, total: cart.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartApi.addCartItem(productId, quantity);
    set({ items: cart.items, total: cart.total });
  },

  updateQuantity: async (itemId, quantity) => {
    const cart = await cartApi.updateCartItem(itemId, quantity);
    set({ items: cart.items, total: cart.total });
  },

  removeItem: async (itemId) => {
    const cart = await cartApi.removeCartItem(itemId);
    set({ items: cart.items, total: cart.total });
  },

  clearLocal: () => {
    set({ items: [], total: 0 });
  },

  itemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
