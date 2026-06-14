// Single source of truth for the API base URL used by the client-side fetch helpers.
// The refresh token lives in an HttpOnly cookie set by this origin; the access token is
// held in memory only (see lib/api/client.ts).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api";
