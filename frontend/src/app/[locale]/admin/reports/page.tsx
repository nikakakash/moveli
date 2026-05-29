"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getSalesReport } from "@/lib/api/admin";
import type { SalesReportDto } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { CurrencyCircleDollar, ShoppingBag, ChartBar, Package } from "@phosphor-icons/react";

const STATUS_NAMES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function rangeStart(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const [report, setReport] = useState<SalesReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalesReport(rangeStart(days));
      setReport(data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const maxRevenue = report
    ? Math.max(...report.revenueOverTime.map((r) => r.revenue), 1)
    : 1;
  const maxCategory = report
    ? Math.max(...report.salesByCategory.map((c) => c.revenue), 1)
    : 1;

  const ranges = [7, 30, 90];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("reports")}</h1>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                days === r
                  ? "bg-moveli-purple-50 text-moveli-purple-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("lastNDays", { n: r })}
            </button>
          ))}
        </div>
      </div>

      {loading || !report ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              icon={<CurrencyCircleDollar size={22} />}
              label={t("totalRevenue")}
              value={formatPrice(report.summary.totalRevenue)}
            />
            <SummaryCard
              icon={<ShoppingBag size={22} />}
              label={t("totalOrders")}
              value={String(report.summary.totalOrders)}
            />
            <SummaryCard
              icon={<ChartBar size={22} />}
              label={t("avgOrderValue")}
              value={formatPrice(report.summary.averageOrderValue)}
            />
            <SummaryCard
              icon={<Package size={22} />}
              label={t("itemsSold")}
              value={String(report.summary.totalItemsSold)}
            />
          </div>

          {/* Revenue over time */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">{t("revenueOverTime")}</h2>
            {report.revenueOverTime.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("noResults")}</p>
            ) : (
              <div className="flex items-end gap-1 h-48">
                {report.revenueOverTime.map((p) => (
                  <div
                    key={p.date}
                    className="flex-1 flex flex-col items-center justify-end group relative"
                  >
                    <div
                      className="w-full bg-moveli-gradient rounded-t transition-all"
                      style={{ height: `${(p.revenue / maxRevenue) * 100}%` }}
                    />
                    <div className="absolute -top-8 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {formatPrice(p.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by category */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t("salesByCategory")}</h2>
              {report.salesByCategory.length === 0 ? (
                <p className="text-gray-400 text-sm">{t("noResults")}</p>
              ) : (
                <div className="space-y-3">
                  {report.salesByCategory.map((c) => (
                    <div key={c.categoryId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{c.categoryName}</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(c.revenue)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-moveli-gradient rounded-full"
                          style={{ width: `${(c.revenue / maxCategory) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders by status */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t("ordersByStatus")}</h2>
              {report.ordersByStatus.length === 0 ? (
                <p className="text-gray-400 text-sm">{t("noResults")}</p>
              ) : (
                <div className="space-y-2">
                  {report.ordersByStatus.map((s) => (
                    <div
                      key={s.status}
                      className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-600">
                        {STATUS_NAMES[s.status] ?? s.status}
                      </span>
                      <span className="font-medium text-gray-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <h2 className="font-bold text-gray-900 px-6 pt-6 pb-2">{t("topProducts")}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">{t("product")}</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">{t("itemsSold")}</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">{t("totalRevenue")}</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  report.topProducts.map((p) => (
                    <tr key={p.productId} className="border-b border-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{p.productName}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{p.unitsSold}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">
                        {formatPrice(p.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="w-10 h-10 rounded-lg bg-moveli-purple-50 text-moveli-purple-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
