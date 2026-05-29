"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeDto } from "@/lib/api/types";
import Image from "next/image";

const CATEGORY_ICONS: Record<string, string> = {
  electronics: "💻",
  smartphones: "📱",
  laptops: "💻",
  tablets: "📱",
  "home-appliances": "🏠",
  kitchen: "🍳",
  cleaning: "🧹",
  fashion: "👕",
  beauty: "💄",
  sports: "⚽",
};

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

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-100 hover:border-moveli-purple-200 hover:shadow-md transition-all"
          >
            {cat.imageUrl && !failedImages.has(cat.imageUrl) ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={cat.imageUrl}
                  alt={name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  onError={() =>
                    setFailedImages((s) => new Set(s).add(cat.imageUrl!))
                  }
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-moveli-gradient-soft flex items-center justify-center text-2xl">
                {icon}
              </div>
            )}
            <span className="text-sm font-medium text-gray-800 group-hover:text-moveli-purple-700 transition text-center">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
