import { apiFetch } from "./client";
import type {
  CreateOrderRequest,
  OrderDto,
  OrderListDto,
  PagedResult,
} from "./types";

export function createOrder(data: CreateOrderRequest) {
  return apiFetch<OrderDto>("/orders", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function getOrders(page = 1, pageSize = 10) {
  return apiFetch<PagedResult<OrderListDto>>(
    `/orders?page=${page}&pageSize=${pageSize}`,
    { requireAuth: true }
  );
}

export function getOrderDetail(id: string) {
  return apiFetch<OrderDto>(`/orders/${id}`, { requireAuth: true });
}
