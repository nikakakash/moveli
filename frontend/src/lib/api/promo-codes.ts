import { apiFetch } from "./client";
import type { ValidatePromoResult } from "./types";

export function validatePromoCode(data: { code: string; subtotal: number }) {
  return apiFetch<ValidatePromoResult>("/promo-codes/validate", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}
