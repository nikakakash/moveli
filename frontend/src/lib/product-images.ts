import { normalizeImageUrl } from "./format";

// Curated Unsplash photos keyed by seed product slug, so demo data shows real
// product photography instead of placeholder boxes. Admin-uploaded products
// (slugs not listed here) fall back to their stored image via resolveProductImage.
const PRODUCT_PHOTOS: Record<string, string> = {
  "galaxy-s24-ultra": "1511707171634-5f897ff02aa9",
  "galaxy-a55": "1598327105666-5b89351aff97",
  "iphone-15-pro-max": "1592286927505-1def25115558",
  "iphone-15": "1695048133142-1a20484d2569",
  "galaxy-book4-pro": "1496181133206-80ce9b88a853",
  "macbook-air-m3": "1517336714731-489689fd1ca8",
  "macbook-pro-14-m3-pro": "1611186871348-b1ce696e52c9",
  "bosch-serie-6-washer": "1626806787461-102c1bfaaea1",
  "bosch-serie-4-dishwasher": "1585659722983-3a675dabf23d",
  "bosch-optimum-food-processor": "1570222094114-d054a817e56b",
  "nike-air-max-270": "1542291026-7eec264c27ff",
  "nike-dri-fit-tee": "1583743814966-8936f5b7be1a",
  "nike-club-hoodie": "1556821840-3a63f95609a7",
  "sony-wh-1000xm5": "1505740420928-5e560c06d30e",
  "sony-wf-1000xm5": "1606220588913-b3aacb4d2f46",
  "sony-srs-xb100": "1608043152269-423dbba4e7e1",
  "samsung-65-qled-4k": "1593359677879-a4bb92f829d1",
  "playstation-5": "1606144042614-b2417e99c4e3",
  "galaxy-watch6-classic": "1546868871-7041f2a55e12",
  "nike-air-force-1-07": "1595950653106-6c9ebd614d3a",
  "bosch-tassimo": "1572119865084-43c285814d63",
};

const unsplashSrc = (id: string, size: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${size}&h=${size}&q=80`;

export function resolveProductImage(
  slug: string | null | undefined,
  fallbackUrl: string | null | undefined,
  size = 600
): string | null {
  const id = slug ? PRODUCT_PHOTOS[slug] : undefined;
  if (id) return unsplashSrc(id, size);
  return normalizeImageUrl(fallbackUrl);
}
