"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Lightning } from "@phosphor-icons/react";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8">
      <div
        className="rounded-2xl overflow-hidden relative min-h-[360px] p-12 lg:p-14"
        style={{
          background:
            "linear-gradient(115deg, #F0EBFE 0%, #E6F4FB 60%, #DAF0FA 100%)",
        }}
      >
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
              href="/products?sortBy=newest"
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

        {/* Decorative gradient circle */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full opacity-30 blur-3xl bg-moveli-purple-200 pointer-events-none" />
      </div>
    </section>
  );
}
