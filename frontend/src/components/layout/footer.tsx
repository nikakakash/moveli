import { useTranslations } from "next-intl";
import { MoveliLogo } from "@/components/ui/moveli-logo";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <span className="hover:text-white transition cursor-pointer">
                  {t("aboutUs")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("careers")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("blog")}
                </span>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              {t("helpCenter")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("contactUs")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("faq")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("shipping")}
                </span>
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
                <span className="hover:text-white transition cursor-pointer">
                  {t("privacy")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("terms")}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  {t("refund")}
                </span>
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
