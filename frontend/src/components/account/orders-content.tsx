"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderListDto, OrderStatus, PagedResult } from "@/lib/api/types";
import { Package } from "@phosphor-icons/react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

type FilterTab = "all" | "active" | "delivered" | "cancelled";

export function OrdersContent() {
  const t = useTranslations("account");
  const tStatus = useTranslations("status");
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<PagedResult<OrderListDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    getOrders(page, 10)
      .then(setData)
      .catch((err) => {
        console.error("Failed to load orders:", err);
        toast.error(t("ordersLoadError"));
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, page, t]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "active", label: t("active") },
    { key: "delivered", label: t("delivered") },
    { key: "cancelled", label: t("cancelled") },
  ];

  const filtered =
    data?.items.filter((o) => {
      if (filter === "all") return true;
      if (filter === "active")
        return !["Delivered", "Cancelled"].includes(o.status);
      if (filter === "delivered") return o.status === "Delivered";
      return o.status === "Cancelled";
    }) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("myOrders")}</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.key
                ? "bg-moveli-purple-50 text-moveli-purple-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-5 hover:border-moveli-purple-200 transition"
            >
              <div>
                <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                  {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}
                >
                  {tStatus(order.status.toLowerCase())}
                </span>
                <p className="font-bold text-gray-900 mt-1">
                  {formatPrice(order.total)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${
                  p === page
                    ? "bg-moveli-gradient text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
