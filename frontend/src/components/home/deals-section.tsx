"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { ProductCard } from "@/components/product/product-card";
import { CountdownTimer } from "@/components/deals/countdown-timer";
import { formatPrice, normalizeImageUrl } from "@/lib/format";
import type { DealDto } from "@/lib/api/types";

export function DealsSection({ deals }: { deals: DealDto[] }) {
  const t = useTranslations("deals");
  const locale = useLocale();
  if (deals.length === 0) return null;

  const title = (d: DealDto) => (locale === "ka" ? d.titleKa : d.titleEn) || d.targetName;
  const dealOfMonth = deals.find((d) => d.placement === "Featured");
  const productDeals = deals.filter((d) => d.product).map((d) => d.product!);
  const bannerImage = dealOfMonth
    ? dealOfMonth.product?.mainImageUrl ?? dealOfMonth.imageUrl
    : null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
        <Link href="/deals" className="text-sm font-medium text-moveli-purple-600 hover:underline">
          {t("viewAll")} →
        </Link>
      </div>

      {dealOfMonth && (
        <Link
          href="/deals"
          className="relative block overflow-hidden rounded-2xl bg-neutral-900 text-white p-8 min-h-[200px]"
        >
          <div className="relative z-10 max-w-md">
            <span className="inline-block bg-white/12 px-3 py-1 rounded-full text-sm">
              {t("dealOfMonth")}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-3">{title(dealOfMonth)}</h3>
            <div className="flex items-center gap-3 mt-3">
              {dealOfMonth.product && (
                <span className="num text-2xl font-extrabold">
                  {formatPrice(dealOfMonth.product.price)}
                </span>
              )}
              <span className="bg-moveli-cyan-400 text-neutral-900 text-sm font-bold px-2 py-0.5 rounded-full">
                −{dealOfMonth.percentage}%
              </span>
            </div>
            {dealOfMonth.showCountdown && dealOfMonth.endsAt && (
              <div className="mt-5">
                <CountdownTimer endsAt={dealOfMonth.endsAt} variant="hero" />
              </div>
            )}
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">
              {t("shopNow")} <ArrowRight size={14} />
            </span>
          </div>
          {bannerImage && (
            <Image
              src={normalizeImageUrl(bannerImage) ?? bannerImage}
              alt=""
              width={220}
              height={220}
              className="absolute right-0 bottom-0 w-44 h-44 md:w-56 md:h-56 object-cover rounded-2xl rotate-[-8deg] translate-x-4 translate-y-4 opacity-90"
            />
          )}
        </Link>
      )}

      {productDeals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productDeals.slice(0, 5).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
