"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Lightning, Tag } from "@phosphor-icons/react";

// Curated Unsplash fallbacks (mirroring claude design/screen-home.jsx) for when an
// admin hasn't uploaded a hero photo yet.
const FALLBACK_PRIMARY = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=85";
const FALLBACK_SECONDARY = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=85";

interface Props {
  /** Admin-uploaded large photo (rotated -6°). Falls back to the curated default. */
  primaryImageUrl?: string | null;
  /** Admin-uploaded small photo (rotated +8°, lower-left of cluster). */
  secondaryImageUrl?: string | null;
}

export function HeroSection({ primaryImageUrl, secondaryImageUrl }: Props) {
  const t = useTranslations("home");

  const primary = primaryImageUrl || FALLBACK_PRIMARY;
  const secondary = secondaryImageUrl || FALLBACK_SECONDARY;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8">
      <div
        className="rounded-2xl overflow-hidden relative min-h-[440px] p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-center"
        style={{
          background:
            "linear-gradient(115deg, #F0EBFE 0%, #E6F4FB 60%, #DAF0FA 100%)",
        }}
      >
        {/* Copy column */}
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-moveli-purple-50 text-moveli-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Lightning size={14} weight="fill" />
            {t("viewDeals")}
          </span>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
            {t("heroTitle")}{" "}
            <span className="text-moveli-gradient">{t("heroTitleHighlight")}</span>
            <br />
            {t("heroSubtitle")}
          </h1>

          <p className="text-gray-600 mb-6 max-w-md">{t("heroDescription")}</p>

          <div className="flex gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl hover:shadow-moveli-purple-500/30 transition"
            >
              {t("startShopping")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              {t("viewDeals")}
            </Link>
          </div>

          <div className="flex gap-8 mt-8">
            {[
              { value: "50K+", label: t("products") },
              { value: "1,200+", label: t("sellers") },
              { value: "4.8", label: t("rating") },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <span className="text-xl font-extrabold text-moveli-purple-700 tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Image cluster — hidden on small screens so the copy isn't squeezed. */}
        <div className="relative hidden lg:block h-[420px]">
          {/* Soft radial glow behind the photos. */}
          <div
            className="absolute -right-10 -top-5 w-[360px] h-[360px] rounded-full pointer-events-none blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(157,142,229,0.18), rgba(125,206,234,0.05) 70%)",
            }}
          />

          {/* Primary photo — top right, slight CCW rotation, large shadow. */}
          <div className="absolute right-6 top-0 w-[280px] h-[280px] rounded-2xl overflow-hidden shadow-2xl -rotate-6">
            <Image
              src={primary}
              alt=""
              width={560}
              height={560}
              className="w-full h-full object-cover"
              priority
              unoptimized={primary.startsWith("/uploads/")}
            />
          </div>

          {/* Secondary photo — overlaps the lower-left of the primary, slight CW rotation. */}
          <div className="absolute right-[220px] top-[180px] w-[160px] h-[160px] rounded-xl overflow-hidden shadow-2xl rotate-[8deg] border-4 border-white">
            <Image
              src={secondary}
              alt=""
              width={320}
              height={320}
              className="w-full h-full object-cover"
              priority
              unoptimized={secondary.startsWith("/uploads/")}
            />
          </div>

          {/* "Best prices" pill — sits below the cluster so it never overlaps the photos. */}
          <div className="absolute -right-2 bottom-0 flex items-center gap-3 bg-white rounded-xl shadow-lg px-3.5 py-3">
            <span className="w-9 h-9 rounded-full bg-moveli-purple-50 text-moveli-purple-600 flex items-center justify-center">
              <Tag size={20} weight="fill" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-900">
                {t("bestPrices")}
              </div>
              <div className="text-xs text-gray-500">{t("bestPricesSub")}</div>
            </div>
          </div>
        </div>

        {/* Decorative gradient circle behind both columns (kept from original). */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full opacity-30 blur-3xl bg-moveli-purple-200 pointer-events-none" />
      </div>
    </section>
  );
}
