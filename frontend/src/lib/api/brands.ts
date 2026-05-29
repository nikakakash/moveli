import { apiFetch } from "./client";
import type { BrandDto } from "./types";

export function getBrands() {
  return apiFetch<BrandDto[]>("/brands");
}
