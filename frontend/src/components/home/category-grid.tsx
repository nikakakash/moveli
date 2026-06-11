"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeDto } from "@/lib/api/types";
import Image from "next/image";

// Curated Unsplash photo IDs per category slug — fallback when no admin cover is uploaded.
const CATEGORY_PHOTOS: Record<string, string> = {
  electronics: "1498049794561-7780e7231661",
  "mobile-phones": "1592286927505-1def25115558",
  laptops: "1517336714731-489689fd1ca8",
  "home-appliances": "1555041469-a586c61ea9bc",
  "kitchen-appliances": "1572119865084-43c285814d63",
  clothing: "1551028719-00167b16eac5",
  sports: "1614632537190-23e4146777db",
  "audio-video": "1505740420928-5e560c06d30e",
  beauty: "1556228720-195a672e8a03",
};

// Emoji fallback when a category has neither an uploaded cover nor a curated photo.
const CATEGORY_ICONS: Record<string, string> = {
  electronics: "💻",
  "mobile-phones": "📱",
  laptops: "💻",
  "home-appliances": "🏠",
  "kitchen-appliances": "🍳",
  clothing: "👕",
  sports: "⚽",
  "audio-video": "🎧",
  beauty: "💄",
};

const unsplashSrc = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=400&q=80`;

export function CategoryGrid({
  categories,
}: {
  categories: CategoryTreeDto[];
}) {
  const locale = useLocale();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  return (
    // Horizontal, scrollable strip. Admin-uploaded cover wins; curated Unsplash is the fallback.
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        const name = locale === "ka" ? cat.nameKa : cat.nameEn;
        const icon = CATEGORY_ICONS[cat.slug] || "📦";
        const photoId = CATEGORY_PHOTOS[cat.slug];
        const imageSrc = cat.imageUrl ?? (photoId ? unsplashSrc(photoId) : null);
        const hasImage = imageSrc && !failedImages.has(imageSrc);

        const tileContent = (
          <>
            {hasImage ? (
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="150px"
                className={`object-cover transition-transform duration-300 ${
                  cat.isComingSoon ? "grayscale" : "group-hover:scale-105"
                }`}
                onError={() => setFailedImages((s) => new Set(s).add(imageSrc))}
              />
            ) : (
              <div className="absolute inset-0 bg-moveli-gradient-soft flex items-center justify-center text-5xl">
                {icon}
              </div>
            )}

            {/* Scrim keeps the label readable over any photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            {cat.isComingSoon && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-xs font-semibold text-gray-700">
                {locale === "ka" ? "მალე" : "Coming soon"}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white drop-shadow">
              {name}
            </span>
          </>
        );

        const tileClass =
          "group relative w-[150px] flex-shrink-0 snap-start aspect-square rounded-xl overflow-hidden border border-gray-100";

        // Coming-soon categories are visible but not navigable.
        if (cat.isComingSoon) {
          return (
            <div key={cat.id} className={`${tileClass} cursor-default opacity-80`}>
              {tileContent}
            </div>
          );
        }

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`${tileClass} hover:shadow-lg transition-shadow`}
          >
            {tileContent}
          </Link>
        );
      })}
    </div>
  );
}
