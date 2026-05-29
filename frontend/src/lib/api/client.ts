const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken");
  }
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredRefreshToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

async function refreshAuth(): Promise<boolean> {
  const token = refreshToken || getStoredRefreshToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, requireAuth = false } = options;

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (accessToken) {
    fetchHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 401 && (accessToken || getStoredRefreshToken())) {
    if (!refreshPromise) {
      refreshPromise = refreshAuth();
    }
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      fetchHeaders["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: fetchHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    let message = `Request failed with status ${res.status}`;
    if (errorData?.error) {
      message = errorData.error;
    } else if (errorData?.errors) {
      // FluentValidation returns { errors: { FieldName: ["msg1", "msg2"] } }
      const allMessages = Object.values(errorData.errors as Record<string, string[]>)
        .flat();
      if (allMessages.length > 0) {
        message = allMessages.join(" ");
      }
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
