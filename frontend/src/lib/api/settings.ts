import { apiFetch } from "./client";
import type { PublicSettingsDto } from "./types";

export function getPublicSettings() {
  return apiFetch<PublicSettingsDto>("/settings");
}
