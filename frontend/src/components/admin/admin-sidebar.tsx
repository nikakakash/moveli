"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ChartBar,
  Package,
  ClipboardText,
  FolderSimple,
  Tag,
  Users,
  Percent,
  Ticket,
  Star,
  ChartLineUp,
  GearSix,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/admin", icon: ChartBar, labelKey: "dashboard" as const },
  { href: "/admin/orders", icon: ClipboardText, labelKey: "orders" as const },
  { href: "/admin/products", icon: Package, labelKey: "products" as const },
  { href: "/admin/categories", icon: FolderSimple, labelKey: "categories" as const },
  { href: "/admin/brands", icon: Tag, labelKey: "brands" as const },
  { href: "/admin/discounts", icon: Percent, labelKey: "discounts" as const },
  { href: "/admin/promo-codes", icon: Ticket, labelKey: "promoCodes" as const },
  { href: "/admin/reviews", icon: Star, labelKey: "reviews" as const },
  { href: "/admin/reports", icon: ChartLineUp, labelKey: "reports" as const },
  { href: "/admin/customers", icon: Users, labelKey: "customers" as const },
  { href: "/admin/settings", icon: GearSix, labelKey: "settings" as const },
];

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4">
      <h2 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 px-3">
        {t("adminPanel")}
      </h2>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-moveli-purple-50 text-moveli-purple-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
