"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getWishlist } from "@/lib/api/wishlist";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ProductCard } from "@/components/product/product-card";
import type { WishlistItemDto } from "@/lib/api/types";
import { Heart } from "@phosphor-icons/react";

export function WishlistContent() {
  const t = useTranslations("account");
  const { isAuthenticated } = useAuthStore();
  const wishlistedIds = useWishlistStore((s) => s.productIds);
  const setProductIds = useWishlistStore((s) => s.setProductIds);

  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getWishlist()
      .then((data) => {
        setItems(data);
        // Seed the shared store from this authoritative fetch so filtering below doesn't
        // depend on the store's own (separate) load having resolved.
        setProductIds(data.map((i) => i.productId));
      })
      .catch((err) => {
        console.error("Failed to load wishlist:", err);
        toast.error(t("wishlistLoadError"));
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, t, setProductIds]);

  // Fetched once for the product details; membership is driven by the store so a card
  // removed via its own heart button disappears without a refetch.
  const visibleItems = items.filter((i) => wishlistedIds.includes(i.productId));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("wishlist")}</h1>

      {visibleItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t("emptyWishlist")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visibleItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
