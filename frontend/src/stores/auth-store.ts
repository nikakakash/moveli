"use client";

import { create } from "zustand";
import type { UserDto } from "@/lib/api/types";
import * as authApi from "@/lib/api/auth";
import {
  setTokens,
  clearTokens,
  getStoredRefreshToken,
} from "@/lib/api/client";

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
    setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const token = getStoredRefreshToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await authApi.refreshTokens(token);
      setTokens(res.accessToken, res.refreshToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },
}));
