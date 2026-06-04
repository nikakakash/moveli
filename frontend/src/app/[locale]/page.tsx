import { getTranslations } from "next-intl/server";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductRow } from "@/components/home/product-row";
import { TrustStrip } from "@/components/home/trust-strip";
import { getFeaturedProducts } from "@/lib/api/products";
import { getCategoryTree } from "@/lib/api/categories";
import { getDeals } from "@/lib/api/deals";
import { DealsSection } from "@/components/home/deals-section";

export default async function HomePage() {
  const t = await getTranslations("home");

  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];
  let deals: Awaited<ReturnType<typeof getDeals>> = [];

  try {
    [featuredProducts, categories, deals] = await Promise.all([
      getFeaturedProducts(10),
      getCategoryTree(),
      getDeals({ home: true }),
    ]);
  } catch {
    // API might not be running during build
  }

  return (
    <StorefrontLayout>
      <HeroSection />

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("categories")}
            </h2>
            <span className="text-sm text-moveli-purple-600 font-medium cursor-pointer hover:underline">
              {t("viewAll")} →
            </span>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      )}

      <DealsSection deals={deals} />

      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("bestSellers")}
            </h2>
          </div>
          <ProductRow products={featuredProducts} />
        </section>
      )}

      <TrustStrip />
    </StorefrontLayout>
  );
}
