"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useLocale } from "next-intl";
import { Minus, Plus, Trash, ShoppingCart, Truck, Warning } from "@phosphor-icons/react";
import { formatPrice, normalizeImageUrl } from "@/lib/format";

export function CartContent() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, total, isLoading, fetchCart, updateQuantity, removeItem } =
    useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">
        {t("title")}...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("empty")}</h2>
        <p className="text-gray-500 mb-6">{t("emptyDesc")}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const name =
              locale === "ka" ? item.productNameKa : item.productNameEn;
            const imgSrc = normalizeImageUrl(item.productImageUrl);
            return (
              <div
                key={item.id}
                className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-sm font-medium text-gray-900 hover:text-moveli-purple-600 transition line-clamp-1"
                  >
                    {name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatPrice(item.unitPrice)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.total)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">
              {t("orderSummary")}
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("subtotal")}</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("delivery")}</span>
                <span className="text-gray-400 text-xs">{t("shippingAtCheckout")}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">{t("total")}</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Truck size={14} className="text-moveli-purple-500" />
              {t("deliveryTime")}
            </div>
            <p className="text-xs text-gray-400 mt-1">{t("freeDeliveryInfo")}</p>

            {/* Minimum order warning */}
            {total < 30 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <Warning size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-700">
                  <p className="font-medium">{t("minimumOrder")}</p>
                  <p>{t("addMore", { amount: (30 - total).toFixed(2) })}</p>
                </div>
              </div>
            )}

            <Link
              href="/checkout"
              aria-disabled={total < 30}
              className={`mt-6 w-full flex items-center justify-center font-semibold py-3 rounded-lg transition ${
                total < 30
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                  : "bg-moveli-gradient text-white shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl"
              }`}
              onClick={(e) => { if (total < 30) e.preventDefault(); }}
            >
              {t("checkout")}
            </Link>

            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-moveli-purple-600 hover:underline"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
