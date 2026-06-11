"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
} from "@/lib/api/admin";
import { apiFetch } from "@/lib/api/client";
import { normalizeImageUrl } from "@/lib/format";
import { toast } from "sonner";
import type { CategoryTreeDto, CreateCategoryRequest } from "@/lib/api/types";
import { Plus, PencilSimple, Trash, X, UploadSimple } from "@phosphor-icons/react";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<CategoryTreeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<CreateCategoryRequest>({
    nameKa: "",
    nameEn: "",
    slug: "",
    descriptionKa: "",
    descriptionEn: "",
    sortOrder: 0,
    isActive: true,
    isComingSoon: false,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch<CategoryTreeDto[]>("/categories");
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setForm({
      nameKa: "",
      nameEn: "",
      slug: "",
      descriptionKa: "",
      descriptionEn: "",
      sortOrder: 0,
      isActive: true,
      isComingSoon: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success("Category updated");
      } else {
        await createCategory(form);
        toast.success("Category created");
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const handleEdit = (cat: CategoryTreeDto) => {
    setForm({
      nameKa: cat.nameKa,
      nameEn: cat.nameEn,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      isComingSoon: cat.isComingSoon,
      imageUrl: cat.imageUrl ?? undefined,
    });
    setEditingId(cat.id);
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
      await deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("categories")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} weight="bold" />
          {t("addCategory")}
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? t("editCategory") : t("addCategory")}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("nameKa")}
              </label>
              <input
                type="text"
                required
                value={form.nameKa}
                onChange={(e) => setForm({ ...form, nameKa: e.target.value })}
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
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("slug")}
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isComingSoon}
                  onChange={(e) => setForm({ ...form, isComingSoon: e.target.checked })}
                  className="accent-moveli-purple-500"
                />
                {t("comingSoon")}
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("coverImage")}
              </label>
              <div className="flex items-center gap-3">
                {form.imageUrl ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(form.imageUrl) ?? form.imageUrl}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: undefined })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </div>
                ) : null}
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-moveli-purple-400 transition">
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  {isUploading ? (
                    <span className="text-xs text-gray-400">...</span>
                  ) : (
                    <UploadSimple size={20} className="text-gray-400" />
                  )}
                </label>
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

      {/* Categories list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("nameEn")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("nameKa")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("slug")}</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">{t("active")}</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.nameEn}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.nameKa}</td>
                  <td className="px-4 py-3 text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                    {cat.isComingSoon && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {t("comingSoon")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
