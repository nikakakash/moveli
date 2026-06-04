"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  uploadImage,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import type {
  ProductListDto,
  PagedResult,
  CreateProductRequest,
  CategoryTreeDto,
  BrandDto,
} from "@/lib/api/types";
import {
  Plus,
  Trash,
  Eye,
  EyeSlash,
  X,
  PencilSimple,
  UploadSimple,
} from "@phosphor-icons/react";
import { AdminPagination } from "@/components/admin/admin-pagination";

const emptyForm: CreateProductRequest = {
  nameKa: "",
  nameEn: "",
  slug: "",
  descriptionKa: "",
  descriptionEn: "",
  sku: "",
  price: 0,
  compareAtPrice: undefined,
  categoryId: "",
  brandId: "",
  stockQuantity: 0,
  isActive: true,
  isFeatured: false,
  imageUrls: [],
};

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<PagedResult<ProductListDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductRequest>({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [categories, setCategories] = useState<CategoryTreeDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("pageSize", String(pageSize));
      if (search) query.set("search", search);
      const result = await apiFetch<PagedResult<ProductListDto>>(
        `/products?${query.toString()}`
      );
      setData(result);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  const fetchFormData = useCallback(async () => {
    try {
      const [cats, brs] = await Promise.all([
        apiFetch<CategoryTreeDto[]>("/categories"),
        apiFetch<BrandDto[]>("/brands"),
      ]);
      setCategories(cats);
      setBrands(brs);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, form);
        toast.success("Product updated");
      } else {
        await createProduct(form);
        toast.success("Product created");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save product"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (product: ProductListDto) => {
    // Fetch full product details for editing
    try {
      const full = await apiFetch<{
        id: string;
        nameKa: string;
        nameEn: string;
        slug: string;
        descriptionKa: string;
        descriptionEn: string;
        sku: string;
        price: number;
        compareAtPrice: number | null;
        categoryId: string;
        brandId: string;
        stockQuantity: number;
        isActive: boolean;
        isFeatured: boolean;
        images: { url: string }[];
      }>(`/products/${product.slug}`);
      setForm({
        nameKa: full.nameKa,
        nameEn: full.nameEn,
        slug: full.slug,
        descriptionKa: full.descriptionKa || "",
        descriptionEn: full.descriptionEn || "",
        sku: full.sku || "",
        price: full.price,
        compareAtPrice: full.compareAtPrice ?? undefined,
        categoryId: full.categoryId,
        brandId: full.brandId,
        stockQuantity: full.stockQuantity,
        isActive: full.isActive,
        isFeatured: full.isFeatured,
        imageUrls: full.images?.map((img) => img.url) ?? [],
      });
      setEditingId(product.id);
      setShowForm(true);
    } catch {
      toast.error("Failed to load product details");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleProductActive(id);
      toast.success("Product updated");
      fetchProducts();
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadImage(file);
        urls.push(result.url);
      }
      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("products")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} weight="bold" />
          {t("addProduct")}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? t("editProduct") : t("addProduct")}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("nameKa")}
                </label>
                <input
                  type="text"
                  required
                  value={form.nameKa}
                  onChange={(e) =>
                    setForm({ ...form, nameKa: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("nameEn")}
                </label>
                <input
                  type="text"
                  required
                  value={form.nameEn}
                  onChange={(e) => {
                    const nameEn = e.target.value;
                    setForm({
                      ...form,
                      nameEn,
                      slug: form.slug || autoSlug(nameEn),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Slug + SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("slug")}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku || ""}
                  onChange={(e) =>
                    setForm({ ...form, sku: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (KA)
                </label>
                <textarea
                  value={form.descriptionKa}
                  onChange={(e) =>
                    setForm({ ...form, descriptionKa: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (EN)
                </label>
                <textarea
                  value={form.descriptionEn}
                  onChange={(e) =>
                    setForm({ ...form, descriptionEn: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("price")} (₾)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at price (₾)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.compareAtPrice ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      compareAtPrice: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("stock")}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.stockQuantity || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stockQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Category + Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("category")}
                </label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  required
                  value={form.brandId}
                  onChange={(e) =>
                    setForm({ ...form, brandId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="accent-moveli-purple-500"
                />
                {t("active")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                  className="accent-moveli-purple-500"
                />
                Featured
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {form.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-moveli-purple-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {isUploading ? (
                    <span className="text-xs text-gray-400">...</span>
                  ) : (
                    <UploadSimple size={20} className="text-gray-400" />
                  )}
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-moveli-gradient text-white font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50"
              >
                {isSaving
                  ? "..."
                  : editingId
                    ? t("save")
                    : t("create")}
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

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 w-64"
        />
      </div>

      {/* Products table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("name")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("price")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("stock")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("category")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("active")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              data.items.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.mainImageUrl && (
                        <img
                          src={product.mainImageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.nameEn}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.nameKa}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        product.stockQuantity === 0
                          ? "text-red-600"
                          : product.stockQuantity < 10
                            ? "text-orange-500"
                            : "text-green-600"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.categoryNameEn}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`p-1.5 rounded-lg ${
                        product.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {product.isActive ? (
                        <Eye size={18} />
                      ) : (
                        <EyeSlash size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      >
                        <PencilSimple size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash size={18} />
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
