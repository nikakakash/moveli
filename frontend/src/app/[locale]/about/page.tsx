import { getTranslations } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";
import { ShieldCheck, CurrencyCircleDollar, Flag } from "@phosphor-icons/react/dist/ssr";

export default async function AboutPage() {
  const t = await getTranslations("pages");

  const values = [
    { icon: ShieldCheck, title: t("aboutValue1Title"), text: t("aboutValue1Text") },
    { icon: CurrencyCircleDollar, title: t("aboutValue2Title"), text: t("aboutValue2Text") },
    { icon: Flag, title: t("aboutValue3Title"), text: t("aboutValue3Text") },
  ];

  return (
    <StaticPageLayout title={t("about")} subtitle={t("aboutSubtitle")}>
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t("aboutMission")}</h2>
        <p>{t("aboutMissionText")}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">{t("aboutValues")}</h2>
        <div className="grid gap-5">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-moveli-gradient-soft flex items-center justify-center flex-shrink-0">
                <v.icon size={20} className="text-moveli-purple-600" weight="fill" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{v.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </StaticPageLayout>
  );
}
