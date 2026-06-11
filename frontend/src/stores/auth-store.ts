"use client";

import { create } from "zustand";
import type { UserDto } from "@/lib/api/types";
import * as authApi from "@/lib/api/auth";
import { setTokens, clearTokens } from "@/lib/api/client";

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setTokens(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    setTokens(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: () => {
    // Revoke the refresh token + clear its cookie server-side; don't block the UI on it.
    void authApi.logout().catch(() => {});
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    // The refresh token is in an HttpOnly cookie; attempt a refresh and treat failure as
    // "not logged in". One refresh call on load is fine whether or not a session exists.
    try {
      const res = await authApi.refreshTokens();
      setTokens(res.accessToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },
}));
