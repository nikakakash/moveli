"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from "@/lib/api/admin";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import type {
  PromoCodeDto,
  CreatePromoCodeRequest,
  PromoDiscountType,
} from "@/lib/api/types";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { AdminPagination } from "@/components/admin/admin-pagination";

const emptyForm: CreatePromoCodeRequest = {
  code: "",
  type: "Percentage",
  value: 10,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

// "2026-05-29T14:30:00Z" -> "2026-05-29" for date inputs
function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fromDateInput(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminPromoCodesPage() {
  const t = useTranslations("admin");
  const [codes, setCodes] = useState<PromoCodeDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePromoCodeRequest>(emptyForm);

  const fetchCodes = useCallback(async () => {
    try {
      const data = await getPromoCodes({ page, pageSize });
      setCodes(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreatePromoCodeRequest = {
      ...form,
      code: form.code.trim(),
      startsAt: fromDateInput(form.startsAt),
      endsAt: fromDateInput(form.endsAt),
    };
    try {
      if (editingId) {
        await updatePromoCode(editingId, { id: editingId, ...payload });
        toast.success(t("save"));
      } else {
        await createPromoCode(payload);
        toast.success(t("save"));
      }
      resetForm();
      fetchCodes();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save promo code"
      );
    }
  };

  const handleEdit = (c: PromoCodeDto) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      isActive: c.isActive,
      startsAt: toDateInput(c.startsAt),
      endsAt: toDateInput(c.endsAt),
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("promoCodeDeleteConfirm"))) return;
    try {
      await deletePromoCode(id);
      fetchCodes();
    } catch {
      toast.error("Failed to delete promo code");
    }
  };

  const statusOf = (c: PromoCodeDto) => {
    const now = Date.now();
    if (!c.isActive)
      return { key: "promoCodeStatusOff", cls: "bg-gray-100 text-gray-500" };
    if (c.endsAt && new Date(c.endsAt).getTime() < now)
      return { key: "promoCodeStatusExpired", cls: "bg-red-100 text-red-700" };
    if (c.startsAt && new Date(c.startsAt).getTime() > now)
      return {
        key: "promoCodeStatusScheduled",
        cls: "bg-blue-100 text-blue-700",
      };
    return { key: "promoCodeStatusActive", cls: "bg-green-100 text-green-700" };
  };

  const valueLabel = (c: PromoCodeDto) =>
    c.type === "FixedAmount" ? formatPrice(c.value) : `${c.value}%`;

  const windowLabel = (c: PromoCodeDto) => {
    if (!c.startsAt && !c.endsAt) return "—";
    return `${toDateInput(c.startsAt) || "—"} → ${toDateInput(c.endsAt) || "—"}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("promoCodes")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} weight="bold" />
          {t("promoCodeCreate")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? t("promoCodeEdit") : t("promoCodeCreate")}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("promoCodeCode")}
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("promoCodeType")}
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as PromoDiscountType })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Percentage">
                  {t("promoCodeTypePercentage")}
                </option>
                <option value="FixedAmount">{t("promoCodeTypeFixed")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("promoCodeValue")}
              </label>
              <input
                type="number"
                required
                min={form.type === "Percentage" ? 1 : 0.01}
                max={form.type === "Percentage" ? 100 : undefined}
                step="0.01"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="accent-moveli-purple-500"
                />
                {t("promoCodeActive")}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("promoCodeStartsAt")}
              </label>
              <input
                type="date"
                value={form.startsAt ?? ""}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("promoCodeEndsAt")}
              </label>
              <input
                type="date"
                value={form.endsAt ?? ""}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-moveli-gradient text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
              >
                {editingId ? t("save") : t("create")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("promoCodeCode")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("promoCodeValue")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("status")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("promoCodeStartsAt")} / {t("promoCodeEndsAt")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("promoCodeRedemptions")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              codes.map((c) => {
                const st = statusOf(c);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 uppercase">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{valueLabel(c)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}
                      >
                        {t(st.key)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {windowLabel(c)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.redemptionCount}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
