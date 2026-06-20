"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { MagnifyingGlass, X, ClockCounterClockwise } from "@phosphor-icons/react";
import { getProducts } from "@/lib/api/products";
import type { ProductListDto } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { resolveProductImage } from "@/lib/product-images";

interface HeaderSearchProps {
  onNavigate?: () => void;
  autoFocus?: boolean;
}

const RECENT_KEY = "moveli:recent-searches";
const RECENT_LIMIT = 5;
const LISTBOX_ID = "header-search-listbox";
const OPTION_ID_PREFIX = "header-search-option-";
// Brand/product terms read the same in both locales, so no translation needed.
const TRENDING = ["iPhone", "AirPods", "PlayStation", "Samsung", "MacBook"];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function HeaderSearch({ onNavigate, autoFocus }: HeaderSearchProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductListDto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const term = query.trim();
  const showSuggestions = term.length >= 2;

  // Load recent searches once on mount.
  useEffect(() => {
    setRecent(readRecent());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (!showSuggestions) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await getProducts({ search: term, pageSize: 6 });
        setSuggestions(res.items);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [term, showSuggestions]);

  const saveRecent = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(
        0,
        RECENT_LIMIT
      );
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {}
  }, []);

  const goToSearch = useCallback(
    (value?: string) => {
      const search = (value ?? query).trim();
      if (!search) return;
      saveRecent(search);
      setOpen(false);
      onNavigate?.();
      router.push(`/products?search=${encodeURIComponent(search)}`);
    },
    [query, router, onNavigate, saveRecent]
  );

  const goToProduct = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      onNavigate?.();
      router.push(`/products/${slug}`);
    },
    [router, onNavigate]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].slug);
    } else {
      goToSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !showSuggestions || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const name = (p: ProductListDto) => (locale === "ka" ? p.nameKa : p.nameEn);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            autoFocus={autoFocus}
            placeholder={t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            role="combobox"
            aria-expanded={open && showSuggestions}
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${OPTION_ID_PREFIX}${activeIndex}` : undefined
            }
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      <div aria-live="polite" role="status" className="sr-only">
        {open && showSuggestions && !loading
          ? suggestions.length === 0
            ? t("noSuggestions")
            : t("resultsAnnounce", { count: suggestions.length })
          : ""}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          {showSuggestions ? (
            loading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">…</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                {t("noSuggestions")}
              </div>
            ) : (
              <>
              <ul id={LISTBOX_ID} role="listbox" aria-label={t("search")}>
                {suggestions.map((p, i) => {
                  const img = resolveProductImage(p.slug, p.mainImageUrl, 80);
                  return (
                    <li key={p.id} role="option" aria-selected={activeIndex === i} id={`${OPTION_ID_PREFIX}${i}`}>
                    <button
                      type="button"
                      onClick={() => goToProduct(p.slug)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
                        activeIndex === i ? "bg-moveli-purple-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="flex-1 text-sm text-gray-800 line-clamp-1">
                        {name(p)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                    </button>
                    </li>
                  );
                })}
                </ul>
                <Link
                  href={`/products?search=${encodeURIComponent(term)}`}
                  onClick={() => {
                    saveRecent(term);
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="block px-4 py-2.5 text-sm font-medium text-moveli-purple-600 border-t border-gray-100 hover:bg-gray-50"
                >
                  {t("viewAllResults")}
                </Link>
              </>
            )
          ) : (
            <div className="py-2">
              {recent.length > 0 && (
                <div className="px-2 pb-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t("recentSearches")}
                    </span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-xs text-moveli-purple-600 hover:underline"
                    >
                      {t("clearRecent")}
                    </button>
                  </div>
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => goToSearch(r)}
                      className="w-full flex items-center gap-3 px-2 py-2 text-left rounded-lg hover:bg-gray-50 transition"
                    >
                      <ClockCounterClockwise size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{r}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("trending")}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TRENDING.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => goToSearch(term)}
                      className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-moveli-purple-50 hover:text-moveli-purple-700 transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
