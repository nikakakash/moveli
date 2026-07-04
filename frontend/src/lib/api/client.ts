import { API_BASE_URL } from "@/lib/config";

// The access token is held in memory only. The refresh token lives in an HttpOnly cookie set
// by the API and is never accessible to JavaScript, so it can't be exfiltrated via XSS.
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setTokens(access: string) {
  accessToken = access;
}

export function clearTokens() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAuth(): Promise<boolean> {
  try {
    // No body token: the refresh cookie is sent automatically via credentials: "include".
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      credentials: "include",
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.accessToken);
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

  // On 401, try a cookie-based refresh once. We can't read the HttpOnly refresh cookie from JS,
  // so attempt whenever the caller expected auth or we held an access token.
  if (res.status === 401 && (accessToken || requireAuth)) {
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

  // Some endpoints return 200 with an empty body (e.g. wishlist add/remove); parsing that
  // as JSON would throw, so only parse when there is actually a body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
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
