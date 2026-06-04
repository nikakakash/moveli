import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { DealsContent } from "@/components/deals/deals-content";
import { getDeals, getDealProducts } from "@/lib/api/deals";
import { getPublicSettings } from "@/lib/api/settings";
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
  let settings: Awaited<ReturnType<typeof getPublicSettings>> | null = null;

  try {
    [deals, products, settings] = await Promise.all([
      getDeals(),
      getDealProducts({ pageSize: 10 }),
      getPublicSettings(),
    ]);
  } catch {
    // API might not be running during build
  }

  return (
    <StorefrontLayout>
      <DealsContent
        deals={deals}
        initialProducts={products}
        heroPrimaryImageUrl={settings?.dealsHeroImagePrimaryUrl ?? null}
        heroSecondaryImageUrl={settings?.dealsHeroImageSecondaryUrl ?? null}
      />
    </StorefrontLayout>
  );
}
