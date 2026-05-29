"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("somethingWentWrong")}
        </h1>
        <p className="text-gray-500 mb-8">{t("errorDescription")}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="px-6 py-2.5 bg-moveli-gradient text-white font-medium rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl transition"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
