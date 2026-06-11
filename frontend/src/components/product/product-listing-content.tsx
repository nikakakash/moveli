"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { Funnel, Star, X } from "@phosphor-icons/react";
import type {
  ProductListDto,
  BrandDto,
  PriceHistogramDto,
} from "@/lib/api/types";
import { useState } from "react";

interface Props {
  products: ProductListDto[];
  brands: BrandDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  searchQuery?: string;
  currentBrandId?: string;
  currentSortBy?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentMinRating?: string;
  histogram?: PriceHistogramDto | null;
  categoryName?: { ka: string; en: string };
}

const RATING_OPTIONS = [4.5, 4.0, 3.5];

export function ProductListingContent({
  products,
  brands,
  totalCount,
  totalPages,
  currentPage,
  searchQuery,
  currentBrandId,
  currentSortBy,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
  histogram,
  categoryName,
}: Props) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters =
    currentBrandId || currentMinPrice || currentMaxPrice || currentMinRating;

  const renderHistogram = () => {
    if (!histogram || histogram.buckets.length === 0 || histogram.max <= histogram.min) {
      return null;
    }
    const { min, max, buckets } = histogram;
    const peak = Math.max(...buckets, 1);
    const size = (max - min) / buckets.length;
    const selMin = currentMinPrice ? Number(currentMinPrice) : min;
    const selMax = currentMaxPrice ? Number(currentMaxPrice) : max;

    return (
      <div className="mt-3">
        <div className="flex items-end gap-0.5 h-9">
          {buckets.map((count, i) => {
            const bandStart = min + i * size;
            const bandEnd = bandStart + size;
            const inRange = bandEnd >= selMin && bandStart <= selMax;
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  inRange ? "bg-moveli-purple-400" : "bg-gray-200"
                }`}
                style={{ height: `${Math.max((count / peak) * 100, 4)}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₾{Math.round(min)}</span>
          <span>₾{Math.round(max)}+</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {categoryName
              ? (locale === "ka" ? categoryName.ka : categoryName.en)
              : searchQuery
                ? `"${searchQuery}"`
                : t("popular")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} {t("results")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <Funnel size={16} /> {t("filters")}
          </button>
          <select
            value={currentSortBy || ""}
            onChange={(e) => updateParam("sortBy", e.target.value || null)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">{t("popular")}</option>
            <option value="price_asc">{t("priceAsc")}</option>
            <option value="price_desc">{t("priceDesc")}</option>
            <option value="newest">{t("newest")}</option>
            <option value="reviews">{t("mostReviewed")}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside
          className={`w-60 flex-shrink-0 ${showFilters ? "block" : "hidden"} lg:block`}
        >
          <div className="sticky top-20 space-y-6">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-moveli-purple-600 hover:underline"
              >
                <X size={14} /> {t("clearAll")}
              </button>
            )}

            {/* Price range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("price")}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="₾ Min"
                  value={currentMinPrice || ""}
                  onChange={(e) =>
                    updateParam("minPrice", e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="₾ Max"
                  value={currentMaxPrice || ""}
                  onChange={(e) =>
                    updateParam("maxPrice", e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              {renderHistogram()}
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("rating")}
              </h3>
              <div className="space-y-1">
                {RATING_OPTIONS.map((r) => {
                  const value = String(r);
                  const selected = currentMinRating === value;
                  return (
                    <button
                      key={r}
                      onClick={() =>
                        updateParam("minRating", selected ? null : value)
                      }
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                        selected
                          ? "bg-moveli-purple-50 text-moveli-purple-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            size={13}
                            weight="fill"
                            className={
                              i < Math.floor(r)
                                ? "text-amber-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </span>
                      <span className="font-medium">{r.toFixed(1)}+</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t("brand")}
              </h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={currentBrandId === brand.id}
                      onChange={() => updateParam("brandId", brand.id)}
                      className="accent-moveli-purple-500"
                    />
                    {brand.name}
                  </label>
                ))}
                {currentBrandId && (
                  <button
                    onClick={() => updateParam("brandId", null)}
                    className="text-xs text-moveli-purple-600 hover:underline"
                  >
                    {t("clearAll")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">{t("noResults")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {currentPage > 1 && (
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      aria-label={t("prevPage")}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                      ←
                    </button>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        aria-label={t("pageLabel", { page })}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${
                          page === currentPage
                            ? "bg-moveli-gradient text-white"
                            : "border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      aria-label={t("nextPage")}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
