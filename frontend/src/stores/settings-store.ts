"use client";

import { create } from "zustand";
import type { PublicSettingsDto } from "@/lib/api/types";
import { getPublicSettings } from "@/lib/api/settings";

interface SettingsState {
  settings: PublicSettingsDto | null;
  ensureLoaded: () => Promise<void>;
}

// Public store settings (shipping rules, minimum order) fetched once and shared so the cart
// and checkout enforce the same values the backend charges — the backend stays authoritative.
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,

  ensureLoaded: async () => {
    if (get().settings) return;
    try {
      set({ settings: await getPublicSettings() });
    } catch {
      // Leave null; consumers fall back to safe defaults.
    }
  },
}));
