"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeDto } from "@/lib/api/types";
import Image from "next/image";

// Curated Unsplash photo IDs per category slug, mirroring the design file's stock set.
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

// Emoji fallback when a category has neither a curated photo nor an uploaded image.
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const name = locale === "ka" ? cat.nameKa : cat.nameEn;
        const icon = CATEGORY_ICONS[cat.slug] || "📦";
        const photoId = CATEGORY_PHOTOS[cat.slug];
        const imageSrc = photoId ? unsplashSrc(photoId) : cat.imageUrl;
        const hasImage = imageSrc && !failedImages.has(imageSrc);

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            {hasImage ? (
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() =>
                  setFailedImages((s) => new Set(s).add(imageSrc))
                }
              />
            ) : (
              <div className="absolute inset-0 bg-moveli-gradient-soft flex items-center justify-center text-5xl">
                {icon}
              </div>
            )}

            {/* Scrim keeps the label readable over any photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold text-white drop-shadow">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
