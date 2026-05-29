import { apiFetch } from "./client";
import type {
  CategoryDto,
  CategoryTreeDto,
  PagedResult,
  ProductListDto,
} from "./types";

export function getCategoryTree() {
  return apiFetch<CategoryTreeDto[]>("/categories");
}

export function getCategoryBySlug(slug: string) {
  return apiFetch<CategoryDto>(`/categories/${slug}`);
}

export function getCategoryProducts(
  id: string,
  page = 1,
  pageSize = 20,
  sortBy?: string
) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (sortBy) query.set("sortBy", sortBy);
  return apiFetch<PagedResult<ProductListDto>>(
    `/categories/${id}/products?${query.toString()}`
  );
}
