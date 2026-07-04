"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getSettings, updateSettings, uploadImage } from "@/lib/api/admin";
import type { UpdateSettingsRequest } from "@/lib/api/types";
import { GEORGIAN_CITIES } from "@/lib/cities";
import Image from "next/image";
import { UploadSimple, X } from "@phosphor-icons/react";

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
  heroImagePrimaryUrl: null,
  heroImageSecondaryUrl: null,
  dealsHeroImagePrimaryUrl: null,
  dealsHeroImageSecondaryUrl: null,
};

// All four hero image slots live on the same StoreSettings row; this keeps the
// admin form generic — one helper renders any of them.
type HeroSlotKey =
  | "heroImagePrimaryUrl"
  | "heroImageSecondaryUrl"
  | "dealsHeroImagePrimaryUrl"
  | "dealsHeroImageSecondaryUrl";

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const [form, setForm] = useState<UpdateSettingsRequest>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<HeroSlotKey | null>(null);

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
          heroImagePrimaryUrl: s.heroImagePrimaryUrl,
          heroImageSecondaryUrl: s.heroImageSecondaryUrl,
          dealsHeroImagePrimaryUrl: s.dealsHeroImagePrimaryUrl,
          dealsHeroImageSecondaryUrl: s.dealsHeroImageSecondaryUrl,
        });
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleHeroUpload = async (slot: HeroSlotKey, file: File) => {
    setUploadingSlot(slot);
    try {
      const { url } = await uploadImage(file);
      setForm((prev) => ({ ...prev, [slot]: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  };

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
              <select
                value={form.freeShippingCity}
                onChange={(e) =>
                  setForm({ ...form, freeShippingCity: e.target.value })
                }
                className={inputClass}
              >
                {GEORGIAN_CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value} ({c.en})
                  </option>
                ))}
              </select>
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

        {/* Hero images — separate panels for the home hero and the /deals page hero. */}
        {(
          [
            {
              title: t("heroImages"),
              help: t("heroImagesHelp"),
              primaryKey: "heroImagePrimaryUrl" as const,
              secondaryKey: "heroImageSecondaryUrl" as const,
            },
            {
              title: t("dealsHeroImages"),
              help: t("dealsHeroImagesHelp"),
              primaryKey: "dealsHeroImagePrimaryUrl" as const,
              secondaryKey: "dealsHeroImageSecondaryUrl" as const,
            },
          ]
        ).map((panel) => (
          <div key={panel.title} className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">{panel.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{panel.help}</p>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { slot: panel.primaryKey, label: t("heroImagePrimary") },
                  { slot: panel.secondaryKey, label: t("heroImageSecondary") },
                ]
              ).map(({ slot, label }) => {
                const url = form[slot] ?? null;
                return (
                  <div key={slot}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
                      {url ? (
                        <>
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, [slot]: null })}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                            aria-label="Remove"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-100 transition">
                          {uploadingSlot === slot ? (
                            <span>...</span>
                          ) : (
                            <>
                              <UploadSimple size={24} />
                              <span>{t("uploadImage")}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroUpload(slot, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
