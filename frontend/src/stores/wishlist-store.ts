"use client";

import { create } from "zustand";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { useAuthStore } from "@/stores/auth-store";

const GUEST_KEY = "moveli_guest_wishlist";

function readGuestIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeGuestIds(ids: string[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  } catch {
    // Wishlist is non-critical; ignore storage quota/availability errors.
  }
}

interface WishlistState {
  productIds: string[];
  isLoading: boolean;
  init: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  mergeGuestIntoAccount: () => Promise<void>;
  setProductIds: (ids: string[]) => void;
  clearLocal: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  isLoading: false,

  init: async () => {
    if (!useAuthStore.getState().isAuthenticated) {
      set({ productIds: readGuestIds(), isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const items = await getWishlist();
      set({ productIds: items.map((i) => i.productId), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggle: async (productId) => {
    const { productIds } = get();
    const has = productIds.includes(productId);
    const next = has
      ? productIds.filter((id) => id !== productId)
      : [...productIds, productId];
    set({ productIds: next }); // optimistic

    if (!useAuthStore.getState().isAuthenticated) {
      writeGuestIds(next);
      return;
    }

    try {
      if (has) await removeFromWishlist(productId);
      else await addToWishlist(productId);
    } catch (err) {
      set({ productIds }); // revert on failure
      throw err;
    }
  },

  mergeGuestIntoAccount: async () => {
    const guestIds = readGuestIds();
    if (guestIds.length > 0) {
      // Adds are idempotent server-side; ignore individual failures so one bad id
      // can't block the rest of the merge.
      await Promise.allSettled(guestIds.map((id) => addToWishlist(id)));
      writeGuestIds([]);
    }
    await get().init();
  },

  // Seed from an authoritative server list a caller already fetched (e.g. the wishlist page),
  // so display doesn't depend on this store's own fetch having resolved.
  setProductIds: (ids) => set({ productIds: ids }),

  clearLocal: () => set({ productIds: [] }),
}));
