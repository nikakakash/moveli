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
  /** Admin-uploaded large photo for the hero collage. Falls back to a curated default. */
  heroPrimaryImageUrl?: string | null;
  /** Admin-uploaded small photo for the hero collage. */
  heroSecondaryImageUrl?: string | null;
}

const PAGE_SIZE = 10;

// Curated Unsplash fallbacks for the deals hero (mirroring claude design/screen-deals.jsx
// which used a Nike sneaker + an iPhone 11 photo).
const FALLBACK_PRIMARY = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=85";
const FALLBACK_SECONDARY = "https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=600&h=600&q=85";

export function DealsContent({
  deals,
  initialProducts,
  heroPrimaryImageUrl,
  heroSecondaryImageUrl,
}: Props) {
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
      {/* Hero — 2-column grid mirroring the home hero pattern, but in the deep
          Black-Friday purple from the design. Right column hides on mobile so the
          copy + countdown get full width. */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-white grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center min-h-[260px] sm:min-h-[300px] lg:min-h-[360px]"
        style={{
          background:
            "linear-gradient(120deg, #2A226B 0%, #44389A 45%, #4099C2 100%)",
        }}
      >
        {/* Glow / radial accents — scaled down on mobile so they don't dominate. */}
        <div className="absolute -top-20 -right-16 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-moveli-cyan-400/15 blur-3xl pointer-events-none" />

        {/* Copy + countdown */}
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            <Lightning size={14} weight="fill" /> {t("badge")}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-3 sm:mt-4 leading-tight">
            {hero ? dealTitle(hero) : t("heroTitle")}
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-2 sm:mt-3">{t("heroSubtitle")}</p>
          {hero?.showCountdown && hero.endsAt && (
            <div className="mt-4 sm:mt-6">
              <CountdownTimer endsAt={hero.endsAt} variant="hero" />
            </div>
          )}
        </div>

        {/* Image cluster — visible from md and up with size scaled per breakpoint.
            Hidden on mobile because the cluster needs horizontal room beside the headline. */}
        <div className="relative hidden md:block h-[260px] lg:h-[340px]">
          {/* Soft glow behind the photos. */}
          <div
            className="absolute right-0 top-0 w-[220px] lg:w-[320px] h-[220px] lg:h-[320px] rounded-full pointer-events-none blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18), rgba(64,153,194,0.05) 70%)",
            }}
          />

          {/* Secondary photo (large, behind). Scales 200→280. */}
          <div className="absolute right-2 top-2 w-[200px] lg:w-[280px] h-[200px] lg:h-[280px] rounded-2xl overflow-hidden shadow-2xl -rotate-6">
            <Image
              src={heroSecondaryImageUrl || FALLBACK_SECONDARY}
              alt=""
              width={560}
              height={560}
              className="w-full h-full object-cover"
              priority
              unoptimized={(heroSecondaryImageUrl ?? "").startsWith("/uploads/")}
            />
          </div>

          {/* Primary photo (small, in front). Scales 130→170; anchored to the secondary. */}
          <div className="absolute right-[150px] lg:right-[210px] top-[90px] lg:top-[110px] w-[130px] lg:w-[170px] h-[130px] lg:h-[170px] rounded-xl overflow-hidden shadow-2xl rotate-[6deg] border-4 border-white">
            <Image
              src={heroPrimaryImageUrl || FALLBACK_PRIMARY}
              alt=""
              width={340}
              height={340}
              className="w-full h-full object-cover"
              priority
              unoptimized={(heroPrimaryImageUrl ?? "").startsWith("/uploads/")}
            />
          </div>
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
