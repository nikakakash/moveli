import { apiFetch } from "./client";
import type { DealDto, DealPlacement, PagedResult, ProductListDto } from "./types";

interface GetDealsParams {
  placement?: DealPlacement;
  home?: boolean;
}

export function getDeals(params: GetDealsParams = {}) {
  const query = new URLSearchParams();
  if (params.placement) query.set("placement", params.placement);
  if (params.home) query.set("home", "true");
  const qs = query.toString();
  return apiFetch<DealDto[]>(`/deals${qs ? `?${qs}` : ""}`);
}

interface GetDealProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  minPercentage?: number;
}

export function getDealProducts(params: GetDealProductsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.minPercentage != null) query.set("minPercentage", String(params.minPercentage));
  const qs = query.toString();
  return apiFetch<PagedResult<ProductListDto>>(`/deals/products${qs ? `?${qs}` : ""}`);
}
