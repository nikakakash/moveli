"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { getProducts } from "@/lib/api/products";
import type { ProductListDto } from "@/lib/api/types";
import { formatPrice, normalizeImageUrl } from "@/lib/format";

interface HeaderSearchProps {
  onNavigate?: () => void;
  autoFocus?: boolean;
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await getProducts({ search: term, pageSize: 6 });
        setSuggestions(res.items);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const goToSearch = useCallback(() => {
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/products?search=${encodeURIComponent(term)}`);
  }, [query, router, onNavigate]);

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
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].slug);
    } else {
      goToSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
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
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">…</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">{t("noSuggestions")}</div>
          ) : (
            <>
              {suggestions.map((p, i) => {
                const img = normalizeImageUrl(p.mainImageUrl);
                return (
                  <button
                    key={p.id}
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
                );
              })}
              <Link
                href={`/products?search=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="block px-4 py-2.5 text-sm font-medium text-moveli-purple-600 border-t border-gray-100 hover:bg-gray-50"
              >
                {t("viewAllResults")}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
