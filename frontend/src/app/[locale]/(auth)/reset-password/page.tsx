"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const linkValid = email.length > 0 && token.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await resetPassword({ email, token, newPassword });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("resetInvalidLink"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <MoveliLogo size={28} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t("resetPasswordTitle")}
      </h1>

      {!linkValid ? (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mt-4">
          {t("resetInvalidLink")}
        </div>
      ) : done ? (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mt-4">
          {t("resetSuccess")}{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-medium underline"
          >
            {t("signIn")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("newPassword")}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-moveli-gradient text-white font-semibold py-3 rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl transition disabled:opacity-50"
          >
            {isLoading ? "..." : t("updatePassword")}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-moveli-purple-600 font-medium hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
