"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Lightning, Fire, ArrowRight } from "@phosphor-icons/react";
import { ProductCard } from "@/components/product/product-card";
import { CountdownTimer } from "@/components/deals/countdown-timer";
import { getDealProducts } from "@/lib/api/deals";
import { normalizeImageUrl } from "@/lib/format";
import type { DealDto, PagedResult, ProductListDto } from "@/lib/api/types";

interface Props {
  deals: DealDto[];
  initialProducts: PagedResult<ProductListDto>;
}

const PAGE_SIZE = 10;

export function DealsContent({ deals, initialProducts }: Props) {
  const t = useTranslations("deals");
  const locale = useLocale();

  const dealTitle = (d: DealDto) =>
    (locale === "ka" ? d.titleKa : d.titleEn) || d.targetName;

  const hero = deals.find((d) => d.placement === "Featured");
  const flash = deals.filter((d) => d.placement === "FlashSale" && d.product);
  const banners = deals.filter(
    (d) =>
      d.scope === "Category" &&
      d.imageUrl &&
      (d.placement === "Featured" || d.placement === "DealsPage")
  );

  // Category pills derived from category-scoped deals.
  const categoryPills = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of deals)
      if (d.scope === "Category") map.set(d.targetId, dealTitle(d));
    return Array.from(map, ([id, name]) => ({ id, name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals, locale]);

  const [items, setItems] = useState(initialProducts.items);
  const [page, setPage] = useState(initialProducts.page);
  const [totalPages, setTotalPages] = useState(initialProducts.totalPages);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [minPct, setMinPct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const applyFilter = async (nextCategoryId: string | null, nextMinPct: number | null) => {
    setCategoryId(nextCategoryId);
    setMinPct(nextMinPct);
    setLoading(true);
    try {
      const res = await getDealProducts({
        page: 1,
        pageSize: PAGE_SIZE,
        categoryId: nextCategoryId ?? undefined,
        minPercentage: nextMinPct ?? undefined,
      });
      setItems(res.items);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await getDealProducts({
        page: page + 1,
        pageSize: PAGE_SIZE,
        categoryId: categoryId ?? undefined,
        minPercentage: minPct ?? undefined,
      });
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const pillBase =
    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition";
  const isAll = categoryId === null && minPct === null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-white"
        style={{
          background:
            "linear-gradient(120deg, #8B7DD8 0%, #7BC8E6 60%, #8FD7E9 100%)",
        }}
      >
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
            <Lightning size={14} weight="fill" /> {t("badge")}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight">
            {hero ? dealTitle(hero) : t("heroTitle")}
          </h1>
          <p className="text-white/80 mt-3">{t("heroSubtitle")}</p>
          {hero?.showCountdown && hero.endsAt && (
            <div className="mt-6">
              <CountdownTimer endsAt={hero.endsAt} variant="hero" />
            </div>
          )}
        </div>
      </section>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => applyFilter(null, null)}
          className={`${pillBase} ${isAll ? "bg-moveli-gradient text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {t("allDeals")}
        </button>
        {categoryPills.map((c) => (
          <button
            key={c.id}
            onClick={() => applyFilter(c.id, null)}
            className={`${pillBase} ${categoryId === c.id ? "bg-moveli-gradient text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => applyFilter(null, 50)}
          className={`${pillBase} inline-flex items-center gap-1 ${minPct === 50 ? "bg-red-500 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
        >
          <Fire size={14} weight="fill" /> {t("fiftyPlus")}
        </button>
      </div>

      {/* Flash sale */}
      {flash.length > 0 && (
        <section>
          <div
            className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
            style={{
              background: "linear-gradient(95deg, #8B7DD8, #8FD7E9)",
            }}
          >
            <div className="flex items-center gap-3 text-white">
              <Lightning size={26} weight="fill" />
              <div>
                <h2 className="text-xl font-extrabold leading-none">{t("flashSale")}</h2>
                <p className="text-xs text-white/85 mt-1">{t("whileStocksLast")}</p>
              </div>
            </div>
            {flash[0].endsAt && <CountdownTimer endsAt={flash[0].endsAt} variant="compact" />}
          </div>
          <div className="border border-t-0 border-gray-100 rounded-b-2xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {flash.map((d) => (
              <ProductCard key={d.id} product={d.product!} />
            ))}
          </div>
        </section>
      )}

      {/* Category banners */}
      {banners.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((d) => (
            <Link
              key={d.id}
              href={`/categories/${d.targetId}`}
              className="relative h-40 rounded-2xl overflow-hidden flex flex-col justify-center p-6 text-white"
            >
              {d.imageUrl && (
                <Image
                  src={normalizeImageUrl(d.imageUrl) ?? d.imageUrl}
                  alt={dealTitle(d)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold drop-shadow">{dealTitle(d)}</h3>
                <p className="mt-1 font-medium drop-shadow">
                  {t("saveUpTo", { pct: d.percentage })}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                  {t("shopNow")} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Biggest discounts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("biggestDiscounts")}</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">{t("noDeals")}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {page < totalPages && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? "..." : t("loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
