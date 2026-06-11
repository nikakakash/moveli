"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Backend always responds uniformly; show the sent state regardless.
      await forgotPassword(email);
    } finally {
      setSent(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <MoveliLogo size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-gray-500 mb-8">{t("forgotPasswordDesc")}</p>

        {sent ? (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
            {t("resetLinkSent")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-moveli-gradient text-white font-semibold py-3 rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl transition disabled:opacity-50"
            >
              {isLoading ? "..." : t("sendResetLink")}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-moveli-purple-600 font-medium hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
