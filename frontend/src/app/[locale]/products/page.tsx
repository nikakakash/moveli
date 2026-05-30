import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductListingContent } from "@/components/product/product-listing-content";
import { getProducts, getPriceHistogram } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import type {
  ProductListDto,
  BrandDto,
  PriceHistogramDto,
} from "@/lib/api/types";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    search?: string;
    sortBy?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  let products: ProductListDto[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let brands: BrandDto[] = [];
  let histogram: PriceHistogramDto | null = null;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;

  try {
    const [productsResult, brandsResult, histogramResult] = await Promise.all([
      getProducts({
        page,
        pageSize,
        categoryId: params.categoryId,
        brandId: params.brandId,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        minRating: params.minRating ? Number(params.minRating) : undefined,
        search: params.search,
        sortBy: params.sortBy,
      }),
      getBrands(),
      getPriceHistogram({
        categoryId: params.categoryId,
        brandId: params.brandId,
        minRating: params.minRating ? Number(params.minRating) : undefined,
        search: params.search,
      }),
    ]);
    products = productsResult.items;
    totalCount = productsResult.totalCount;
    totalPages = productsResult.totalPages;
    brands = brandsResult;
    histogram = histogramResult;
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
        currentMinRating={params.minRating}
        histogram={histogram}
      />
    </StorefrontLayout>
  );
}
