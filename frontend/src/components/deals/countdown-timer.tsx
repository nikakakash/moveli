"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  endsAt: string;
  variant?: "hero" | "compact";
}

function diff(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownTimer({ endsAt, variant = "hero" }: Props) {
  const t = useTranslations("deals");
  // Start as null so the server and the first client render both emit nothing,
  // matching exactly. The effect populates the real countdown post-hydration,
  // which is why `Date.now()` no longer triggers a mismatch.
  const [left, setLeft] = useState<ReturnType<typeof diff>>(null);

  useEffect(() => {
    setLeft(diff(endsAt));
    const id = setInterval(() => setLeft(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!left) return null;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5" aria-label={t("endsIn")}>
        {[pad(left.hours + left.days * 24), pad(left.minutes), pad(left.seconds)].map(
          (v, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="num bg-white text-moveli-purple-700 font-bold text-sm px-2 py-1 rounded">
                {v}
              </span>
              {i < 2 && <span className="text-white font-bold">:</span>}
            </span>
          )
        )}
      </div>
    );
  }

  const segments = [
    { v: pad(left.days), label: t("days") },
    { v: pad(left.hours), label: t("hours") },
    { v: pad(left.minutes), label: t("minutes") },
    { v: pad(left.seconds), label: t("seconds") },
  ];

  return (
    <div className="flex items-center gap-2" aria-label={t("endsIn")}>
      {segments.map((s, i) => (
        <div
          key={i}
          className="min-w-[56px] px-2.5 py-2 rounded-lg text-center bg-white/15 backdrop-blur border border-white/20"
        >
          <div className="num text-2xl font-extrabold text-white leading-none">{s.v}</div>
          <div className="text-[11px] text-white/60 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
