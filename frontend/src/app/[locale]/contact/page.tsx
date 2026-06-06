import { getTranslations } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";
import { EnvelopeSimple, Phone, Clock, MapPin } from "@phosphor-icons/react/dist/ssr";

export default async function ContactPage() {
  const t = await getTranslations("pages");

  const items = [
    { icon: EnvelopeSimple, label: t("contactEmail"), value: "support@moveli.ge" },
    { icon: Phone, label: t("contactPhone"), value: "+995 XXX XXX XXX" },
    { icon: Clock, label: t("contactHours"), value: t("contactHoursValue") },
    { icon: MapPin, label: t("contactAddress"), value: t("contactAddressValue") },
  ];

  return (
    <StaticPageLayout title={t("contact")} subtitle={t("contactSubtitle")}>
      <div className="grid gap-5">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-moveli-gradient-soft flex items-center justify-center flex-shrink-0">
              <item.icon size={20} className="text-moveli-purple-600" weight="fill" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 bg-moveli-purple-50 rounded-xl p-4">
        {t("contactResponseTime")}
      </p>
    </StaticPageLayout>
  );
}
