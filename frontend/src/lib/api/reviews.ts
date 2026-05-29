import { apiFetch } from "./client";
import type { PagedResult, ReviewDto } from "./types";

export function getProductReviews(
  productId: string,
  page = 1,
  pageSize = 10
) {
  return apiFetch<PagedResult<ReviewDto>>(
    `/products/${productId}/reviews?page=${page}&pageSize=${pageSize}`
  );
}

export function createReview(
  productId: string,
  rating: number,
  comment?: string
) {
  return apiFetch<ReviewDto>(`/products/${productId}/reviews`, {
    method: "POST",
    body: { rating, comment },
    requireAuth: true,
  });
}
