"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Heart, Star } from "@phosphor-icons/react";
import { formatPrice, getDiscountPercentage, normalizeImageUrl } from "@/lib/format";
import type { ProductListDto } from "@/lib/api/types";

interface ProductCardProps {
  product: ProductListDto;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
}: ProductCardProps) {
  const locale = useLocale();
  const [imgError, setImgError] = useState(false);
  const name = locale === "ka" ? product.nameKa : product.nameEn;
  const imageUrl = normalizeImageUrl(product.mainImageUrl);
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discount = hasDiscount
    ? getDiscountPercentage(product.price, product.compareAtPrice!)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.isFeatured && !hasDiscount && (
          <span className="absolute top-2 left-2 bg-moveli-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle?.();
          }}
          className={`absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center transition hover:bg-white hover:text-red-500 ${
            isWishlisted
              ? "opacity-100 text-red-500"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart size={16} weight={isWishlisted ? "fill" : "regular"} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.brandName}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">
          {name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star size={12} weight="fill" className="text-amber-400" />
            <span className="text-xs text-gray-600 font-medium">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
