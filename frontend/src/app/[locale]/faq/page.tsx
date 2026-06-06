"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { StaticPageLayout } from "@/components/static/static-page-layout";
import { CaretDown } from "@phosphor-icons/react";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <CaretDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const t = useTranslations("pages");

  const faqs = Array.from({ length: 7 }, (_, i) => ({
    q: t(`faqQ${i + 1}`),
    a: t(`faqA${i + 1}`),
  }));

  return (
    <StaticPageLayout title={t("faq")} subtitle={t("faqSubtitle")}>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <FaqItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </StaticPageLayout>
  );
}
