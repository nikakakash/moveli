import { apiFetch } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from "./types";

export function login(data: LoginRequest) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: data,
  });
}

export function register(data: RegisterRequest) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: data,
  });
}

export function refreshTokens() {
  // The refresh token is carried by the HttpOnly cookie (credentials: "include"), not the body.
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: {},
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(data: { email: string; token: string; newPassword: string }) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: data,
  });
}

export function getMe() {
  return apiFetch<UserDto>("/auth/me", { requireAuth: true });
}
