import { getTranslations } from "next-intl/server";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductListingContent } from "@/components/product/product-listing-content";
import { getProducts } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import type { ProductListDto, BrandDto } from "@/lib/api/types";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("product");

  let products: ProductListDto[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let brands: BrandDto[] = [];
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;

  try {
    const [productsResult, brandsResult] = await Promise.all([
      getProducts({
        page,
        pageSize,
        categoryId: params.categoryId,
        brandId: params.brandId,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        search: params.search,
        sortBy: params.sortBy,
      }),
      getBrands(),
    ]);
    products = productsResult.items;
    totalCount = productsResult.totalCount;
    totalPages = productsResult.totalPages;
    brands = brandsResult;
  } catch {
    // API might not be running
  }

  return (
    <StorefrontLayout>
      <ProductListingContent
        products={products}
        brands={brands}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
        searchQuery={params.search}
        currentBrandId={params.brandId}
        currentSortBy={params.sortBy}
        currentMinPrice={params.minPrice}
        currentMaxPrice={params.maxPrice}
      />
    </StorefrontLayout>
  );
}
