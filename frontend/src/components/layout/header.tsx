"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Heart,
  ShoppingCart,
  User,
  Globe,
  List,
  X,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { NotificationBell } from "./notification-bell";
import { HeaderSearch } from "./header-search";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.itemCount());
  const { isAuthenticated, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = () => {
    const next = locale === "ka" ? "en" : "ka";
    router.replace(pathname, { locale: next });
  };

  const navItems = [
    { href: "/" as const, label: t("home") },
    { href: "/products" as const, label: t("categories") },
    { href: "/deals" as const, label: t("deals") },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Utility strip */}
      <div className="bg-moveli-purple-50 text-sm hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <span className="text-moveli-purple-700 font-medium">
            {locale === "ka"
              ? "მიწოდება 24 საათში 🚚"
              : "Delivery within 24 hours 🚚"}
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/account/orders"
              className="text-gray-600 hover:text-moveli-purple-600 transition"
            >
              {t("myOrders")}
            </Link>
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 text-gray-600 hover:text-moveli-purple-600 transition"
            >
              <Globe size={14} />
              {locale === "ka" ? "EN" : "ქართული"}
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden"
            aria-label={mobileOpen ? (locale === "ka" ? "მენიუს დახურვა" : "Close menu") : (locale === "ka" ? "მენიუს გახსნა" : "Open menu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <List size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <MoveliLogo size={24} />
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-moveli-purple-600 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <HeaderSearch />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Language toggle (mobile) */}
            <button
              onClick={switchLocale}
              aria-label={locale === "ka" ? "Switch to English" : "ქართულზე გადართვა"}
              className="lg:hidden text-gray-600"
            >
              <Globe size={20} />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="text-gray-600 hover:text-moveli-purple-600 transition"
            >
              <Heart size={22} />
            </Link>

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart */}
            <Link
              id="cart-target"
              href="/cart"
              className="relative text-gray-600 hover:text-moveli-purple-600 transition"
            >
              <ShoppingCart size={22} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-moveli-gradient text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Admin link */}
            {isAuthenticated && user?.roles?.includes("Admin") && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-moveli-purple-600 hover:text-moveli-purple-800 transition bg-moveli-purple-50 px-3 py-1.5 rounded-lg"
              >
                Admin
              </Link>
            )}

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-moveli-purple-600 transition"
              >
                <div className="w-8 h-8 rounded-full bg-moveli-gradient flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-moveli-purple-600 transition"
              >
                <User size={20} />
                <span className="hidden lg:inline">{t("login")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <div className="mb-3">
              <HeaderSearch onNavigate={() => setMobileOpen(false)} />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-gray-700 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
