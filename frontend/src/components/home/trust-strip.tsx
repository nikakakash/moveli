"use client";

import { useTranslations } from "next-intl";
import { Truck, CurrencyCircleDollar, ArrowCounterClockwise, Headset } from "@phosphor-icons/react";

export function TrustStrip() {
  const t = useTranslations("home");

  const items = [
    {
      icon: Truck,
      title: t("freeDelivery"),
      desc: t("freeDeliveryDesc"),
    },
    {
      icon: CurrencyCircleDollar,
      title: t("cashOnDelivery"),
      desc: t("cashOnDeliveryDesc"),
    },
    {
      icon: ArrowCounterClockwise,
      title: t("returns"),
      desc: t("returnsDesc"),
    },
    {
      icon: Headset,
      title: t("support"),
      desc: t("supportDesc"),
    },
  ];

  return (
    <section className="bg-gray-50 py-10 mt-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-moveli-gradient-soft flex items-center justify-center flex-shrink-0">
                <item.icon size={20} className="text-moveli-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
