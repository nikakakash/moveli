"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { Funnel, SortAscending, X } from "@phosphor-icons/react";
import type { ProductListDto, BrandDto } from "@/lib/api/types";
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
  categoryName?: { ka: string; en: string };
}

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

  const hasFilters = currentBrandId || currentMinPrice || currentMaxPrice;

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
