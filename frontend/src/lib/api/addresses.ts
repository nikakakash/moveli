import { apiFetch } from "./client";
import type {
  AddressDto,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "./types";

export function getMyAddresses() {
  return apiFetch<AddressDto[]>("/addresses", { requireAuth: true });
}

export function createAddress(data: CreateAddressRequest) {
  return apiFetch<AddressDto>("/addresses", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updateAddress(id: string, data: UpdateAddressRequest) {
  return apiFetch<void>(`/addresses/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function setDefaultAddress(id: string) {
  return apiFetch<void>(`/addresses/${id}/default`, {
    method: "PATCH",
    requireAuth: true,
  });
}

export function deleteAddress(id: string) {
  return apiFetch<void>(`/addresses/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}
