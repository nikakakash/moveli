"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/api/admin";
import type { UpdateSettingsRequest } from "@/lib/api/types";

const EMPTY: UpdateSettingsRequest = {
  storeName: "",
  supportEmail: "",
  supportPhone: "",
  currencyCode: "GEL",
  freeShippingThreshold: 0,
  shippingCost: 0,
  freeShippingCity: "",
  maintenanceMode: false,
  announcementEn: "",
  announcementKa: "",
};

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const [form, setForm] = useState<UpdateSettingsRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getSettings();
        setForm({
          storeName: s.storeName,
          supportEmail: s.supportEmail,
          supportPhone: s.supportPhone,
          currencyCode: s.currencyCode,
          freeShippingThreshold: s.freeShippingThreshold,
          shippingCost: s.shippingCost,
          freeShippingCity: s.freeShippingCity,
          maintenanceMode: s.maintenanceMode,
          announcementEn: s.announcementEn ?? "",
          announcementKa: s.announcementKa ?? "",
        });
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success(t("settingsSaved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100";

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">Loading...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("settings")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t("storeInfo")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("storeName")}
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("currencyCode")}
              </label>
              <input
                type="text"
                required
                value={form.currencyCode}
                onChange={(e) => setForm({ ...form, currencyCode: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("supportEmail")}
              </label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("supportPhone")}
              </label>
              <input
                type="tel"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t("shippingSettings")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("freeShippingThreshold")}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  setForm({ ...form, freeShippingThreshold: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("shippingCost")}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.shippingCost}
                onChange={(e) =>
                  setForm({ ...form, shippingCost: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("freeShippingCity")}
              </label>
              <input
                type="text"
                value={form.freeShippingCity}
                onChange={(e) =>
                  setForm({ ...form, freeShippingCity: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">{t("storefront")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("announcementEn")}
              </label>
              <input
                type="text"
                value={form.announcementEn ?? ""}
                onChange={(e) => setForm({ ...form, announcementEn: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("announcementKa")}
              </label>
              <input
                type="text"
                value={form.announcementKa ?? ""}
                onChange={(e) => setForm({ ...form, announcementKa: e.target.value })}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                className="accent-moveli-purple-500"
              />
              {t("maintenanceMode")}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? "..." : t("save")}
        </button>
      </form>
    </div>
  );
}
