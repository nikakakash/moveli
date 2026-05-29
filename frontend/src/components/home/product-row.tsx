"use client";

import { ProductCard } from "@/components/product/product-card";
import type { ProductListDto } from "@/lib/api/types";

export function ProductRow({ products }: { products: ProductListDto[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
