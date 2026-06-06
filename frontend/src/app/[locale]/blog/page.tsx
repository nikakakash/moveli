import { getTranslations } from "next-intl/server";
import { StaticPageLayout } from "@/components/static/static-page-layout";
import { Article } from "@phosphor-icons/react/dist/ssr";

export default async function BlogPage() {
  const t = await getTranslations("pages");

  return (
    <StaticPageLayout title={t("blog")} subtitle={t("blogSubtitle")}>
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-moveli-gradient-soft flex items-center justify-center mx-auto">
          <Article size={32} className="text-moveli-purple-400" />
        </div>
        <p className="mt-4 text-gray-400 font-medium">{t("blogEmpty")}</p>
      </div>
    </StaticPageLayout>
  );
}
