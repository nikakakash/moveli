import { apiFetch } from "./client";
import { getAccessToken } from "./client";
import type {
  PagedResult,
  AdminCustomerDto,
  AdminCustomerDetailDto,
  DashboardStatsDto,
  ProductDto,
  CategoryDto,
  BrandDto,
  OrderDto,
  OrderListDto,
  OrderStatus,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateBrandRequest,
  UpdateBrandRequest,
  DiscountDto,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  PromoCodeDto,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  AdminReviewDto,
  SalesReportDto,
  SettingsDto,
  UpdateSettingsRequest,
} from "./types";

// Dashboard
export function getDashboardStats() {
  return apiFetch<DashboardStatsDto>("/admin/dashboard", { requireAuth: true });
}

// Products
export function createProduct(data: CreateProductRequest) {
  return apiFetch<ProductDto>("/admin/products", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updateProduct(id: string, data: UpdateProductRequest) {
  return apiFetch<void>(`/admin/products/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deleteProduct(id: string) {
  return apiFetch<void>(`/admin/products/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

export function toggleProductActive(id: string) {
  return apiFetch<void>(`/admin/products/${id}/toggle-active`, {
    method: "PATCH",
    requireAuth: true,
  });
}

// Categories
export function createCategory(data: CreateCategoryRequest) {
  return apiFetch<CategoryDto>("/admin/categories", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updateCategory(id: string, data: UpdateCategoryRequest) {
  return apiFetch<void>(`/admin/categories/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deleteCategory(id: string) {
  return apiFetch<void>(`/admin/categories/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

export function reorderCategories(categoryIds: string[]) {
  return apiFetch<void>("/admin/categories/reorder", {
    method: "PUT",
    body: { categoryIds },
    requireAuth: true,
  });
}

// Brands
export function createBrand(data: CreateBrandRequest) {
  return apiFetch<BrandDto>("/admin/brands", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updateBrand(id: string, data: UpdateBrandRequest) {
  return apiFetch<void>(`/admin/brands/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deleteBrand(id: string) {
  return apiFetch<void>(`/admin/brands/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

// Discounts
export function getDiscounts() {
  return apiFetch<DiscountDto[]>("/admin/discounts", { requireAuth: true });
}

export function createDiscount(data: CreateDiscountRequest) {
  return apiFetch<{ id: string }>("/admin/discounts", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updateDiscount(id: string, data: UpdateDiscountRequest) {
  return apiFetch<void>(`/admin/discounts/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deleteDiscount(id: string) {
  return apiFetch<void>(`/admin/discounts/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

// Promo Codes
export function getPromoCodes() {
  return apiFetch<PromoCodeDto[]>("/admin/promo-codes", { requireAuth: true });
}

export function createPromoCode(data: CreatePromoCodeRequest) {
  return apiFetch<{ id: string }>("/admin/promo-codes", {
    method: "POST",
    body: data,
    requireAuth: true,
  });
}

export function updatePromoCode(id: string, data: UpdatePromoCodeRequest) {
  return apiFetch<void>(`/admin/promo-codes/${id}`, {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

export function deletePromoCode(id: string) {
  return apiFetch<void>(`/admin/promo-codes/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

// Reviews
interface GetAdminReviewsParams {
  page?: number;
  pageSize?: number;
  isApproved?: boolean;
}

export function getAdminReviews(params: GetAdminReviewsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.isApproved !== undefined) query.set("isApproved", String(params.isApproved));
  return apiFetch<PagedResult<AdminReviewDto>>(`/admin/reviews?${query.toString()}`, {
    requireAuth: true,
  });
}

export function approveReview(id: string) {
  return apiFetch<void>(`/admin/reviews/${id}/approve`, {
    method: "PATCH",
    requireAuth: true,
  });
}

export function rejectReview(id: string) {
  return apiFetch<void>(`/admin/reviews/${id}/reject`, {
    method: "PATCH",
    requireAuth: true,
  });
}

export function deleteReview(id: string) {
  return apiFetch<void>(`/admin/reviews/${id}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

// Reports
export function getSalesReport(from?: string, to?: string) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  return apiFetch<SalesReportDto>(`/admin/reports/sales?${query.toString()}`, {
    requireAuth: true,
  });
}

// Settings
export function getSettings() {
  return apiFetch<SettingsDto>("/admin/settings", { requireAuth: true });
}

export function updateSettings(data: UpdateSettingsRequest) {
  return apiFetch<SettingsDto>("/admin/settings", {
    method: "PUT",
    body: data,
    requireAuth: true,
  });
}

// Orders
interface GetAdminOrdersParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
}

export function getAdminOrders(params: GetAdminOrdersParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  return apiFetch<PagedResult<OrderListDto>>(`/admin/orders?${query.toString()}`, {
    requireAuth: true,
  });
}

export function getAdminOrderDetail(id: string) {
  return apiFetch<OrderDto>(`/admin/orders/${id}`, { requireAuth: true });
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return apiFetch<void>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
    requireAuth: true,
  });
}

// Customers
interface GetAdminCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function getAdminCustomers(params: GetAdminCustomersParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  return apiFetch<PagedResult<AdminCustomerDto>>(
    `/admin/customers?${query.toString()}`,
    { requireAuth: true }
  );
}

export function getAdminCustomerDetail(id: string) {
  return apiFetch<AdminCustomerDetailDto>(`/admin/customers/${id}`, {
    requireAuth: true,
  });
}

// Upload
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api";
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}/admin/upload/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to upload image");
  }

  return res.json();
}
