"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "@/lib/api/admin";
import type { AdminReviewDto, PagedResult } from "@/lib/api/types";
import { Check, X, Trash, Star } from "@phosphor-icons/react";
import { AdminPagination } from "@/components/admin/admin-pagination";

type Filter = "all" | "pending" | "approved";

export default function AdminReviewsPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<PagedResult<AdminReviewDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const isApproved =
        filter === "all" ? undefined : filter === "approved";
      const result = await getAdminReviews({ page, pageSize, isApproved });
      setData(result);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id);
      toast.success(t("reviewApproved"));
      fetchReviews();
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectReview(id);
      toast.success(t("reviewRejected"));
      fetchReviews();
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteReview(id);
      toast.success(t("reviewDeleted"));
      fetchReviews();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filters: Filter[] = ["pending", "approved", "all"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("reviews")}</h1>

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-moveli-purple-50 text-moveli-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t(`reviewFilter_${f}`)}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("product")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("customer")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("rating")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("comment")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("actions")}</th>
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
              data.items.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.productName}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{r.userName}</div>
                    <div className="text-xs text-gray-400">{r.userEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < r.rating ? "fill" : "regular"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="line-clamp-2">{r.comment || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.isApproved ? t("reviewFilter_approved") : t("reviewFilter_pending")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!r.isApproved && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          title={t("approve")}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {r.isApproved && (
                        <button
                          onClick={() => handleReject(r.id)}
                          title={t("reject")}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        title={t("delete")}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
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
