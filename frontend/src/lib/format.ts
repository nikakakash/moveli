export function formatPrice(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  const formatted = hasDecimals ? amount.toFixed(2) : String(amount);
  return `₾${formatted}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("995")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

/**
 * Normalize image URL: strip API host prefix so images go through
 * Next.js rewrite proxy (e.g. /uploads/...) instead of hitting
 * localhost directly (which Next.js blocks as a private IP).
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // If it's already a relative path, return as-is
  if (url.startsWith("/")) return url;
  // Strip the API host to make it a relative /uploads/... path
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return url;
}

export function getDiscountPercentage(
  price: number,
  compareAtPrice: number
): number {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
