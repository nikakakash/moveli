"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  Package,
  Heart,
  User,
  MapPin,
  SignOut,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/account/orders", icon: Package, labelKey: "myOrders" as const },
  { href: "/account/wishlist", icon: Heart, labelKey: "wishlist" as const },
  { href: "/account/addresses", icon: MapPin, labelKey: "addresses" as const },
  { href: "/account/profile", icon: User, labelKey: "profile" as const },
];

export function AccountSidebar() {
  const t = useTranslations("account");
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-20">
      <div className="mb-6">
        <div className="w-12 h-12 rounded-full bg-moveli-gradient flex items-center justify-center text-white font-bold text-lg">
          {user?.firstName?.[0]?.toUpperCase() ?? "U"}
        </div>
        <p className="mt-3 font-bold text-gray-900">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-moveli-purple-50 text-moveli-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} weight={active ? "fill" : "regular"} />
              {t(item.labelKey)}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <SignOut size={20} />
          Sign out
        </button>
      </nav>
    </div>
  );
}
