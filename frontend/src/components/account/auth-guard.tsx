"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const t = useTranslations("auth");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-moveli-purple-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("signIn")}</h2>
        <Link
          href="/login"
          className="inline-flex bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg"
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
