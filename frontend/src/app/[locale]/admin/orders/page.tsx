"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { getAdminOrders, updateOrderStatus } from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import type { OrderListDto, OrderStatus, PagedResult } from "@/lib/api/types";
import { AdminPagination } from "@/components/admin/admin-pagination";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-purple-100 text-purple-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const tStatus = useTranslations("status");
  const [data, setData] = useState<PagedResult<OrderListDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const requestRef = useRef(0);
  const fetchOrders = useCallback(async () => {
    const reqId = ++requestRef.current;
    setLoading(true);
    try {
      const result = await getAdminOrders({
        page,
        pageSize,
        status: filterStatus || undefined,
        search: search || undefined,
      });
      if (reqId !== requestRef.current) return; // a newer request superseded this one
      setData(result);
    } catch {
      if (reqId === requestRef.current) toast.error("Failed to load orders");
    } finally {
      if (reqId === requestRef.current) setLoading(false);
    }
  }, [page, pageSize, filterStatus, search]);

  // Debounce search so we fetch once the user pauses, not on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data load; fetchOrders toggles its loading flag
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("orders")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={t("search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">{t("status")}: All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {tStatus(s.toLowerCase() as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled")}
            </option>
          ))}
        </select>
      </div>

      {/* Table — overflow-x-auto so wide columns scroll horizontally on mobile. */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("orderNumber")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("customer")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("phone")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("address")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("postalCode")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("total")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("date")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              data.items.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{order.shippingFullName}</td>
                  <td className="px-4 py-3 text-gray-600">{order.shippingPhoneNumber}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.shippingStreet}, {order.shippingCity}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.shippingPostalCode || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {tStatus(order.status.toLowerCase() as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="px-2 py-1 border border-gray-200 rounded text-xs bg-white"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {tStatus(s.toLowerCase() as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <AdminPagination
            page={page}
            pageSize={pageSize}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
