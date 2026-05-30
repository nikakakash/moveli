import { apiFetch } from "./client";
import type {
  PagedResult,
  PriceHistogramDto,
  ProductDto,
  ProductListDto,
} from "./types";

interface GetProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: string;
}

export function getProducts(params: GetProductsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.brandId) query.set("brandId", params.brandId);
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.minRating != null) query.set("minRating", String(params.minRating));
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  return apiFetch<PagedResult<ProductListDto>>(
    `/products?${query.toString()}`
  );
}

interface GetPriceHistogramParams {
  buckets?: number;
  categoryId?: string;
  brandId?: string;
  minRating?: number;
  search?: string;
}

export function getPriceHistogram(params: GetPriceHistogramParams = {}) {
  const query = new URLSearchParams();
  if (params.buckets) query.set("buckets", String(params.buckets));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.brandId) query.set("brandId", params.brandId);
  if (params.minRating != null) query.set("minRating", String(params.minRating));
  if (params.search) query.set("search", params.search);
  return apiFetch<PriceHistogramDto>(
    `/products/price-histogram?${query.toString()}`
  );
}

export function getProductBySlug(slug: string) {
  return apiFetch<ProductDto>(`/products/${slug}`);
}

export function getFeaturedProducts(count = 10) {
  return apiFetch<ProductListDto[]>(`/products/featured?count=${count}`);
}
