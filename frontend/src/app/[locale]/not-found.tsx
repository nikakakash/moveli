import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-moveli-purple-500 mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("pageNotFound")}
        </h1>
        <p className="text-gray-500 mb-8">{t("notFoundDescription")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-moveli-gradient text-white font-medium rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl transition"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
