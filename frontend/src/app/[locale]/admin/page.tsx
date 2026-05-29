"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getDashboardStats } from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";
import type { DashboardStatsDto } from "@/lib/api/types";
import {
  ShoppingCart,
  CurrencyCircleDollar,
  Package,
  Users,
} from "@phosphor-icons/react";

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const tStatus = useTranslations("status");
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-moveli-purple-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: t("totalOrders"),
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: t("totalRevenue"),
      value: formatPrice(stats.totalRevenue),
      icon: CurrencyCircleDollar,
      color: "bg-green-50 text-green-600",
    },
    {
      label: t("totalProducts"),
      value: stats.totalProducts,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: t("totalCustomers"),
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("dashboard")}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-gray-100 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={20} weight="bold" />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t("recentOrders")}</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">{t("noResults")}</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.total)}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {tStatus(order.status.toLowerCase() as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t("lowStock")}</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">{t("noResults")}</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">{product.nameKa}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      product.stockQuantity === 0
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {product.stockQuantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
