"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  uploadImage,
  bulkCreateProductDiscounts,
} from "@/lib/api/admin";
import { apiFetch } from "@/lib/api/client";
import { normalizeImageUrl } from "@/lib/format";
import { toast } from "sonner";
import type {
  DiscountDto,
  DiscountScope,
  DealPlacement,
  CreateDiscountRequest,
  PagedResult,
  ProductListDto,
  CategoryTreeDto,
  BrandDto,
} from "@/lib/api/types";
import { Plus, PencilSimple, Trash, X, UploadSimple } from "@phosphor-icons/react";
import { AdminPagination } from "@/components/admin/admin-pagination";

interface TargetOption {
  id: string;
  name: string;
}

const emptyForm: CreateDiscountRequest = {
  scope: "Product",
  targetId: "",
  percentage: 10,
  isActive: true,
  startsAt: null,
  endsAt: null,
  titleKa: "",
  titleEn: "",
  imageUrl: null,
  placement: "None",
  showOnHome: false,
  showCountdown: false,
};

// "2026-05-29T14:30:00Z" -> "2026-05-29T14:30" for datetime-local inputs
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminDiscountsPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<CreateDiscountRequest>(emptyForm);

  // Multi-select state for bulk product-scoped discounts. When `selectedProductIds`
  // has 2+ entries (and scope === Product, no editing), submit hits the bulk endpoint.
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const [products, setProducts] = useState<TargetOption[]>([]);
  const [categories, setCategories] = useState<TargetOption[]>([]);
  const [brands, setBrands] = useState<TargetOption[]>([]);

  const fetchDiscounts = useCallback(async () => {
    try {
      const data = await getDiscounts({ page, pageSize });
      setDiscounts(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const fetchTargets = useCallback(async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        apiFetch<PagedResult<ProductListDto>>("/products?pageSize=200"),
        apiFetch<CategoryTreeDto[]>("/categories"),
        apiFetch<BrandDto[]>("/brands"),
      ]);

      setProducts(
        prodRes.items.map((p) => ({
          id: p.id,
          name: locale === "ka" ? p.nameKa : p.nameEn,
        }))
      );

      const flat: TargetOption[] = [];
      const walk = (nodes: CategoryTreeDto[]) => {
        for (const n of nodes) {
          flat.push({ id: n.id, name: locale === "ka" ? n.nameKa : n.nameEn });
          if (n.children?.length) walk(n.children);
        }
      };
      walk(catRes);
      setCategories(flat);

      setBrands(brandRes.map((b) => ({ id: b.id, name: b.name })));
    } catch {
      toast.error("Failed to load targets");
    }
  }, [locale]);

  useEffect(() => {
    fetchDiscounts();
    fetchTargets();
  }, [fetchDiscounts, fetchTargets]);

  const targetOptions =
    form.scope === "Product"
      ? products
      : form.scope === "Category"
        ? categories
        : brands;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setSelectedProductIds([]);
    setProductSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startsAtIso = fromLocalInput(form.startsAt ?? "");
    const endsAtIso = fromLocalInput(form.endsAt ?? "");

    // Bulk path: create-mode + Product scope + 2+ selected products. One atomic call
    // creates N discount rows so admins don't have to submit the form per-product.
    const useBulk =
      !editingId && form.scope === "Product" && selectedProductIds.length > 1;

    try {
      if (useBulk) {
        const { created } = await bulkCreateProductDiscounts({
          productIds: selectedProductIds,
          percentage: form.percentage,
          isActive: form.isActive,
          startsAt: startsAtIso,
          endsAt: endsAtIso,
          titleKa: form.titleKa,
          titleEn: form.titleEn,
          imageUrl: form.imageUrl,
          placement: form.placement,
          showOnHome: form.showOnHome,
          showCountdown: form.showCountdown,
        });
        toast.success(t("bulkDiscountCreated", { n: created }));
      } else {
        // Single-target path (create OR edit). For Product scope with 1 selected, use it.
        const targetId =
          !editingId && form.scope === "Product" && selectedProductIds.length === 1
            ? selectedProductIds[0]
            : form.targetId;
        if (!targetId) {
          toast.error(t("target") + " ?");
          return;
        }
        const payload: CreateDiscountRequest = {
          ...form,
          targetId,
          startsAt: startsAtIso,
          endsAt: endsAtIso,
        };
        if (editingId) {
          await updateDiscount(editingId, payload);
        } else {
          await createDiscount(payload);
        }
        toast.success(t("discountSaved"));
      }
      resetForm();
      fetchDiscounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save discount");
    }
  };

  const handleEdit = (d: DiscountDto) => {
    setForm({
      scope: d.scope,
      targetId: d.targetId,
      percentage: d.percentage,
      isActive: d.isActive,
      startsAt: toLocalInput(d.startsAt),
      endsAt: toLocalInput(d.endsAt),
      titleKa: d.titleKa,
      titleEn: d.titleEn,
      imageUrl: d.imageUrl,
      placement: d.placement,
      showOnHome: d.showOnHome,
      showCountdown: d.showCountdown,
    });
    // Editing always operates on a single target row — disable multi-select state.
    setSelectedProductIds([]);
    setProductSearch("");
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Cover uploaded");
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteDiscount(id);
      toast.success(t("discountDeleted"));
      fetchDiscounts();
    } catch {
      toast.error("Failed to delete discount");
    }
  };

  const statusOf = (d: DiscountDto) => {
    const now = Date.now();
    if (!d.isActive) return { key: "statusOff", cls: "bg-gray-100 text-gray-500" };
    if (d.startsAt && new Date(d.startsAt).getTime() > now)
      return { key: "statusScheduled", cls: "bg-blue-100 text-blue-700" };
    if (d.endsAt && new Date(d.endsAt).getTime() < now)
      return { key: "statusExpired", cls: "bg-red-100 text-red-700" };
    return { key: "statusActive", cls: "bg-green-100 text-green-700" };
  };

  const scopeLabel = (s: DiscountScope) =>
    s === "Product"
      ? t("scopeProduct")
      : s === "Category"
        ? t("scopeCategory")
        : t("scopeBrand");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("discounts")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} weight="bold" />
          {t("addDiscount")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? t("editDiscount") : t("addDiscount")}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("scope")}
              </label>
              <select
                value={form.scope}
                onChange={(e) => {
                  setForm({ ...form, scope: e.target.value as DiscountScope, targetId: "" });
                  setSelectedProductIds([]);
                  setProductSearch("");
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Product">{t("scopeProduct")}</option>
                <option value="Category">{t("scopeCategory")}</option>
                <option value="Brand">{t("scopeBrand")}</option>
              </select>
            </div>

            {/* Multi-select picker for Product scope in create mode. Lets admins apply one
                discount config to many products at once via /admin/discounts/bulk. */}
            {form.scope === "Product" && !editingId ? (
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("products")}{" "}
                    <span className="text-xs text-gray-400">
                      ({selectedProductIds.length} {t("selected")})
                    </span>
                  </label>
                  <div className="flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const visible = products
                          .filter((p) =>
                            !productSearch ||
                            p.name.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .map((p) => p.id);
                        setSelectedProductIds((prev) =>
                          Array.from(new Set([...prev, ...visible]))
                        );
                      }}
                      className="text-moveli-purple-600 hover:underline"
                    >
                      {t("selectAllVisible")}
                    </button>
                    {selectedProductIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProductIds([])}
                        className="text-gray-500 hover:underline"
                      >
                        {t("clear")}
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t("searchProducts")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2"
                />
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {products
                    .filter((p) =>
                      !productSearch ||
                      p.name.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .map((p) => {
                      const checked = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 ${
                            checked ? "bg-moveli-purple-50" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedProductIds((prev) =>
                                prev.includes(p.id)
                                  ? prev.filter((id) => id !== p.id)
                                  : [...prev, p.id]
                              )
                            }
                            className="accent-moveli-purple-600"
                          />
                          <span>{p.name}</span>
                        </label>
                      );
                    })}
                  {products.filter((p) =>
                    !productSearch ||
                    p.name.toLowerCase().includes(productSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                      {t("noResults")}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("target")}
                </label>
                <select
                  required
                  value={form.targetId}
                  onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">—</option>
                  {targetOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("percentage")} (%)
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                step="0.01"
                value={form.percentage}
                onChange={(e) =>
                  setForm({ ...form, percentage: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-moveli-purple-500"
                />
                {t("active")}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("startsAt")}
              </label>
              <input
                type="datetime-local"
                value={form.startsAt ?? ""}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("endsAt")}
              </label>
              <input
                type="datetime-local"
                value={form.endsAt ?? ""}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            {/* Deal / merchandising controls */}
            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                {t("dealSettings")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dealPlacement")}
                  </label>
                  <select
                    value={form.placement}
                    onChange={(e) =>
                      setForm({ ...form, placement: e.target.value as DealPlacement })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="None">{t("placementNone")}</option>
                    <option value="DealsPage">{t("placementDealsPage")}</option>
                    <option value="FlashSale">{t("placementFlashSale")}</option>
                    <option value="Featured">{t("placementFeatured")}</option>
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.showOnHome}
                      onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                      className="accent-moveli-purple-500"
                    />
                    {t("showOnHome")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.showCountdown}
                      onChange={(e) => setForm({ ...form, showCountdown: e.target.checked })}
                      className="accent-moveli-purple-500"
                    />
                    {t("showCountdown")}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dealTitle")} (KA)
                  </label>
                  <input
                    type="text"
                    value={form.titleKa ?? ""}
                    onChange={(e) => setForm({ ...form, titleKa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dealTitle")} (EN)
                  </label>
                  <input
                    type="text"
                    value={form.titleEn ?? ""}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dealBanner")}
                  </label>
                  <div className="flex items-center gap-3">
                    {form.imageUrl ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeImageUrl(form.imageUrl) ?? form.imageUrl}
                          alt=""
                          className="w-32 h-20 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: null })}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={10} weight="bold" />
                        </button>
                      </div>
                    ) : null}
                    <label className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-moveli-purple-400 transition">
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      {isUploading ? (
                        <span className="text-xs text-gray-400">...</span>
                      ) : (
                        <UploadSimple size={20} className="text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>
              </div>
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
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("scope")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("target")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("percentage")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("status")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : discounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              discounts.map((d) => {
                const st = statusOf(d);
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{scopeLabel(d.scope)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.targetName}</td>
                    <td className="px-4 py-3 text-gray-900">-{d.percentage}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}
                      >
                        {t(st.key)}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => handleEdit(d)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
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
