"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "@/lib/api/addresses";
import type { AddressDto, CreateAddressRequest } from "@/lib/api/types";
import { Plus, PencilSimple, Trash, X, MapPin, Star } from "@phosphor-icons/react";

const EMPTY_FORM: CreateAddressRequest = {
  fullName: "",
  phoneNumber: "",
  city: "",
  street: "",
  postalCode: "",
  isDefault: false,
};

export function AddressesContent() {
  const t = useTranslations("account");
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressRequest>(EMPTY_FORM);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(data);
    } catch {
      toast.error(t("addressLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data load; fetchAddresses toggles its loading flag
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        toast.success(t("addressUpdated"));
      } else {
        await createAddress(form);
        toast.success(t("addressCreated"));
      }
      resetForm();
      fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("addressSaveError"));
    }
  };

  const handleEdit = (a: AddressDto) => {
    setForm({
      fullName: a.fullName,
      phoneNumber: a.phoneNumber,
      city: a.city,
      street: a.street,
      postalCode: a.postalCode ?? "",
      isDefault: a.isDefault,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("addressConfirmDelete"))) return;
    try {
      await deleteAddress(id);
      toast.success(t("addressDeleted"));
      fetchAddresses();
    } catch {
      toast.error(t("addressSaveError"));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch {
      toast.error(t("addressSaveError"));
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("addresses")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-moveli-gradient text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
        >
          <Plus size={16} weight="bold" />
          {t("addAddress")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? t("editAddress") : t("addAddress")}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("fullName")}
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("phone")}
              </label>
              <input
                type="tel"
                required
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 9) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("city")}
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("postalCode")}
              </label>
              <input
                type="text"
                value={form.postalCode ?? ""}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("street")}
              </label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-moveli-purple-500"
                />
                {t("setAsDefault")}
              </label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-moveli-gradient text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
              >
                {editingId ? t("saveChanges") : t("addAddress")}
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

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
          Loading...
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t("noAddresses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-100 rounded-xl p-5 relative"
            >
              {a.isDefault && (
                <span className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-moveli-purple-50 text-moveli-purple-600">
                  <Star size={12} weight="fill" />
                  {t("default")}
                </span>
              )}
              <p className="font-bold text-gray-900">{a.fullName}</p>
              <p className="text-sm text-gray-500 mt-1">{a.phoneNumber}</p>
              <p className="text-sm text-gray-600 mt-2">
                {a.street}, {a.city}
                {a.postalCode ? `, ${a.postalCode}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-4">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="text-xs font-medium text-moveli-purple-600 hover:underline"
                  >
                    {t("setAsDefault")}
                  </button>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
