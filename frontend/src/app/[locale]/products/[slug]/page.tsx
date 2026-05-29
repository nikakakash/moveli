import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/lib/api/products";
import { getProductReviews } from "@/lib/api/reviews";
import type { ProductDto, ReviewDto } from "@/lib/api/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.nameEn} | MOVELI`,
      description: product.descriptionEn?.substring(0, 160),
      openGraph: {
        images: product.images[0]?.url ? [product.images[0].url] : [],
      },
    };
  } catch {
    return { title: "Product | MOVELI" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product: ProductDto | null = null;
  let reviews: ReviewDto[] = [];

  try {
    product = await getProductBySlug(slug);
    const reviewsResult = await getProductReviews(product.id, 1, 10);
    reviews = reviewsResult.items;
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <StorefrontLayout>
      <ProductDetail product={product} reviews={reviews} />
    </StorefrontLayout>
  );
}
