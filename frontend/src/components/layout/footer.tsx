"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MoveliLogo } from "@/components/ui/moveli-logo";
import { Truck, ArrowCounterClockwise } from "@phosphor-icons/react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <MoveliLogo size={24} />
            <p className="mt-3 text-sm text-gray-400">{t("aboutDesc")}</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("company")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Shipping & delivery */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Truck size={16} className="text-moveli-cyan-400" />
              {t("shippingInfo")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">{t("shippingTbilisi")}</li>
              <li className="text-gray-400">{t("shippingRegional")}</li>
              <li className="text-gray-400">{t("deliveryTime")}</li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <ArrowCounterClockwise size={14} className="text-moveli-cyan-400 flex-shrink-0" />
                {t("refundDesc")}
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("legal")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  {t("refund")}
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">
                  {t("shippingPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} MOVELI. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
