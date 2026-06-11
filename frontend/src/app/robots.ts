import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moveli.ge";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Locale-prefixed routes mean admin lives at /ka/admin, /en/admin, etc.
      disallow: ["/admin", "/*/admin", "/api", "/*/account"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
