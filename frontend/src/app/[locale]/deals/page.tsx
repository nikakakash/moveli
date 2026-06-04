import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { DealsContent } from "@/components/deals/deals-content";
import { getDeals, getDealProducts } from "@/lib/api/deals";
import type { DealDto, PagedResult, ProductListDto } from "@/lib/api/types";

export default async function DealsPage() {
  let deals: DealDto[] = [];
  let products: PagedResult<ProductListDto> = {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  try {
    [deals, products] = await Promise.all([
      getDeals(),
      getDealProducts({ pageSize: 10 }),
    ]);
  } catch {
    // API might not be running during build
  }

  return (
    <StorefrontLayout>
      <DealsContent deals={deals} initialProducts={products} />
    </StorefrontLayout>
  );
}
