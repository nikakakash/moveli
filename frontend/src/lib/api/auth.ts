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

export function refreshTokens(refreshToken: string) {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function getMe() {
  return apiFetch<UserDto>("/auth/me", { requireAuth: true });
}
