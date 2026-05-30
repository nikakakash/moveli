"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Eye, EyeSlash, Truck, ShieldCheck, Tag, Star } from "@phosphor-icons/react";

interface Props {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, firstName, lastName, phoneNumber });
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #C9C0F3 0%, #B5C9EF 35%, #A8DCEC 75%, #8FD7E9 100%)",
        }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-moveli-purple-400/25" />

        {/* Floating cards */}
        <div className="absolute top-28 right-12 animate-float">
          <div className="flex items-center gap-3 bg-white/85 backdrop-blur rounded-2xl shadow-xl px-4 py-3">
            <span className="w-9 h-9 rounded-xl bg-moveli-purple-50 text-moveli-purple-600 flex items-center justify-center">
              <Truck size={20} weight="fill" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {t("perkDelivery")}
            </span>
          </div>
        </div>
        <div className="absolute top-44 left-8 animate-float-delayed">
          <div className="flex items-center gap-3 bg-white/85 backdrop-blur rounded-2xl shadow-xl px-4 py-3">
            <span className="w-9 h-9 rounded-xl bg-moveli-purple-50 text-moveli-purple-600 flex items-center justify-center">
              <Tag size={20} weight="fill" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {t("perkDeals")}
            </span>
          </div>
        </div>
        <div className="absolute bottom-32 right-20 animate-float-slow">
          <div className="flex items-center gap-3 bg-white/85 backdrop-blur rounded-2xl shadow-xl px-4 py-3">
            <span className="w-9 h-9 rounded-xl bg-moveli-purple-50 text-moveli-purple-600 flex items-center justify-center">
              <ShieldCheck size={20} weight="fill" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {t("perkSecure")}
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <MoveliLogo size={32} />
        </div>

        <div className="relative z-10 text-center max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-1 mb-3 text-white">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} weight="fill" />
            ))}
          </div>
          <p className="text-4xl font-extrabold text-white leading-tight mb-4">
            {t("tagline")}
          </p>
        </div>

        <div className="relative z-10 text-center text-white/70 text-sm">
          © {new Date().getFullYear()} MOVELI
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <MoveliLogo size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "login" ? t("welcomeBack") : t("createAccount")}
          </h1>
          <p className="text-gray-500 mb-8">{t("tagline")}</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("firstName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("lastName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={9}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="5XXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              {isLoading
                ? "..."
                : mode === "login"
                  ? t("signIn")
                  : t("signUp")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
            <Link
              href={mode === "login" ? "/register" : "/login"}
              className="text-moveli-purple-600 font-medium hover:underline"
            >
              {mode === "login" ? t("signUp") : t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
