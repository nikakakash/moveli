"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { getAdminCustomers, getAdminCustomerDetail } from "@/lib/api/admin";
import { formatPrice, formatPhone } from "@/lib/format";
import { toast } from "sonner";
import type {
  AdminCustomerDto,
  AdminCustomerDetailDto,
  PagedResult,
} from "@/lib/api/types";
import { ArrowLeft } from "@phosphor-icons/react";
import { AdminPagination } from "@/components/admin/admin-pagination";

export default function AdminCustomersPage() {
  const t = useTranslations("admin");
  const tStatus = useTranslations("status");
  const [data, setData] = useState<PagedResult<AdminCustomerDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<AdminCustomerDetailDto | null>(null);

  const requestRef = useRef(0);
  const fetchCustomers = useCallback(async () => {
    const reqId = ++requestRef.current;
    setLoading(true);
    try {
      const result = await getAdminCustomers({
        page,
        pageSize,
        search: search || undefined,
      });
      if (reqId !== requestRef.current) return; // a newer request superseded this one
      setData(result);
    } catch {
      if (reqId === requestRef.current) toast.error("Failed to load customers");
    } finally {
      if (reqId === requestRef.current) setLoading(false);
    }
  }, [page, pageSize, search]);

  // Debounce search so we fetch once the user pauses, not on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const showDetail = async (id: string) => {
    try {
      const d = await getAdminCustomerDetail(id);
      setDetail(d);
    } catch {
      toast.error("Failed to load customer");
    }
  };

  if (detail) {
    return (
      <div>
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          {t("backToList")}
        </button>

        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {detail.firstName} {detail.lastName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">{t("email")}</p>
              <p className="font-medium">{detail.email}</p>
            </div>
            <div>
              <p className="text-gray-400">{t("phone")}</p>
              <p className="font-medium">{detail.phoneNumber ? formatPhone(detail.phoneNumber) : "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">{t("orderCount")}</p>
              <p className="font-medium">{detail.orderCount}</p>
            </div>
            <div>
              <p className="text-gray-400">{t("totalSpent")}</p>
              <p className="font-medium">{formatPrice(detail.totalSpent)}</p>
            </div>
            <div>
              <p className="text-gray-400">{t("joined")}</p>
              <p className="font-medium">
                {new Date(detail.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {detail.recentOrders.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <h3 className="font-bold text-gray-900 px-6 pt-5 pb-3">
              {t("orders")}
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t("orderNumber")}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t("status")}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t("total")}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {detail.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {tStatus(order.status.toLowerCase() as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("customers")}</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t("search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 w-64"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("customer")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("email")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("phone")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("orderCount")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("totalSpent")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("joined")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              data.items.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => showDetail(customer.id)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {customer.phoneNumber ? formatPhone(customer.phoneNumber) : "—"}
                  </td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
