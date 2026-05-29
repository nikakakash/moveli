import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductListingContent } from "@/components/product/product-listing-content";
import { getCategoryBySlug } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import type { ProductListDto, BrandDto, CategoryDto } from "@/lib/api/types";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  let products: ProductListDto[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let brands: BrandDto[] = [];
  let category: CategoryDto | null = null;
  const page = Number(sp.page) || 1;

  try {
    category = await getCategoryBySlug(slug);
    const [productsResult, brandsResult] = await Promise.all([
      getProducts({
        page,
        pageSize: 20,
        categoryId: category.id,
        brandId: sp.brandId,
        minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
        sortBy: sp.sortBy,
      }),
      getBrands(),
    ]);
    products = productsResult.items;
    totalCount = productsResult.totalCount;
    totalPages = productsResult.totalPages;
    brands = brandsResult;
  } catch {}

  return (
    <StorefrontLayout>
      <ProductListingContent
        products={products}
        brands={brands}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
        currentBrandId={sp.brandId}
        currentSortBy={sp.sortBy}
        currentMinPrice={sp.minPrice}
        currentMaxPrice={sp.maxPrice}
        categoryName={
          category
            ? { ka: category.nameKa, en: category.nameEn }
            : undefined
        }
      />
    </StorefrontLayout>
  );
}
