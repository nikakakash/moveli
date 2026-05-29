"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Header } from "./header";
import { Footer } from "./footer";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { useAuthStore } from "@/stores/auth-store";
import { getPublicSettings } from "@/lib/api/settings";
import type { PublicSettingsDto } from "@/lib/api/types";
import { Wrench } from "@phosphor-icons/react";

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const { user } = useAuthStore();
  const isAdmin = !!user?.roles?.includes("Admin");
  const [settings, setSettings] = useState<PublicSettingsDto | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicSettings()
      .then((s) => {
        if (active) setSettings(s);
      })
      .catch(() => {
        // On error, fail open (don't lock the store out).
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Block the storefront for non-admin visitors when maintenance mode is on.
  if (loaded && settings?.maintenanceMode && !isAdmin) {
    const message =
      locale === "ka"
        ? settings.announcementKa
        : settings.announcementEn;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-moveli-gradient-soft">
        <MoveliLogo size={40} />
        <div className="mt-8 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-moveli-purple-600">
          <Wrench size={32} weight="fill" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {locale === "ka" ? "ვმუშაობთ საიტზე" : "We'll be back soon"}
        </h1>
        <p className="mt-3 max-w-md text-gray-600">
          {message ||
            (locale === "ka"
              ? "საიტი დროებით მიუწვდომელია ტექნიკური სამუშაოების გამო. გთხოვთ, ცადოთ მოგვიანებით."
              : "Our store is temporarily down for maintenance. Please check back a little later.")}
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
