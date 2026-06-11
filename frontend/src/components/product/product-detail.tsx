"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Star,
  ShoppingCart,
  Truck,
  ArrowCounterClockwise,
  Minus,
  Plus,
} from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";
import { resolveProductImage } from "@/lib/product-images";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createReview } from "@/lib/api/reviews";
import { toast } from "sonner";
import type { ProductDto, ReviewDto } from "@/lib/api/types";

interface Props {
  product: ProductDto;
  reviews: ReviewDto[];
}

export function ProductDetail({ product, reviews }: Props) {
  const locale = useLocale();
  const t = useTranslations("product");
  const tCart = useTranslations("cart");
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const name = locale === "ka" ? product.nameKa : product.nameEn;
  const description =
    locale === "ka" ? product.descriptionKa : product.descriptionEn;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Image zoom
  const [zoom, setZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const imageBoxRef = useRef<HTMLDivElement>(null);

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  // Fly-to-cart animation: clone the main image and animate it toward the cart icon.
  const flyToCart = () => {
    const box = imageBoxRef.current;
    const cart = document.getElementById("cart-target");
    if (!box || !cart || !currentImage) return;
    const start = box.getBoundingClientRect();
    const end = cart.getBoundingClientRect();

    const clone = document.createElement("img");
    clone.src = currentImage;
    clone.className = "moveli-fly";
    clone.style.left = `${start.left}px`;
    clone.style.top = `${start.top}px`;
    clone.style.width = `${start.width}px`;
    clone.style.height = `${start.height}px`;
    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);
    clone.style.setProperty("--fly-dx", `${dx}px`);
    clone.style.setProperty("--fly-dy", `${dy}px`);
    document.body.appendChild(clone);
    clone.addEventListener("animationend", () => clone.remove());
  };

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [allReviews, setAllReviews] = useState<ReviewDto[]>(reviews);

  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentImage = resolveProductImage(product.slug, images[selectedImage]?.url);

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const savings = hasDiscount ? product.compareAtPrice! - product.price : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    flyToCart();
    try {
      await addItem(product.id, quantity);
      toast.success(tCart("title"), {
        description: `${name} × ${quantity}`,
      });
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error(t("selectRating"));
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await createReview(
        product.id,
        reviewRating,
        reviewComment || undefined
      );
      setAllReviews((prev) => [newReview, ...prev]);
      setReviewRating(0);
      setReviewComment("");
      toast.success(t("reviewSubmitted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === selectedImage
                      ? "border-moveli-purple-500"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {failedImages.has(img.url) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                      📦
                    </div>
                  ) : (
                    <Image
                      src={resolveProductImage(product.slug, img.url, 64) || img.url}
                      alt={img.altText || name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      onError={() =>
                        setFailedImages((s) => new Set(s).add(img.url))
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div
            ref={imageBoxRef}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleZoomMove}
            className="flex-1 aspect-square bg-gray-50 rounded-2xl overflow-hidden relative cursor-zoom-in group"
          >
            {currentImage && !failedImages.has(currentImage) ? (
              <Image
                src={currentImage}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-200 ease-out"
                priority
                style={{
                  transform: zoom ? "scale(2)" : "scale(1)",
                  transformOrigin: zoomOrigin,
                }}
                onError={() =>
                  setFailedImages((s) => new Set(s).add(currentImage))
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-6xl">
                📦
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm text-moveli-purple-600 font-medium mb-1">
            {product.brandName}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            {name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    weight={i < Math.round(product.rating) ? "fill" : "regular"}
                    className={
                      i < Math.round(product.rating)
                        ? "text-amber-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                {t("reviews")})
              </span>
            </div>
          )}

          {/* Price block */}
          <div className="bg-moveli-gradient-soft rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    {t("save")} {formatPrice(savings)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock */}
          <p
            className={`text-sm font-medium mb-4 ${
              product.stockQuantity > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stockQuantity > 0 ? t("inStock") : t("outOfStock")}
          </p>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stockQuantity, quantity + 1))
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || isAdding}
              className="flex-1 flex items-center justify-center gap-2 bg-moveli-gradient text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-moveli-purple-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ShoppingCart size={20} />
              {isAdding ? "..." : t("addToCart")}
            </button>
          </div>

          {/* Delivery info */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck size={18} className="text-moveli-purple-500" />
              {t("deliveryToday")}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ArrowCounterClockwise
                size={18}
                className="text-moveli-purple-500"
              />
              {t("freeReturns")}
            </div>
          </div>

          {/* Description — moved out of the tabs section so it fills the empty space
              under the buy-box rather than appearing below the photo on a separate row. */}
          {description && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                {t("description")}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews — full-width section. Description moved into the right column above,
          so the tab strip collapses to a single titled section. */}
      <div className="mt-12 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          {t("reviews")} ({product.reviewCount})
        </h2>

        <div>
          <div className="space-y-6">
            {/* Review form */}
              {isAuthenticated ? (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-gray-50 rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-sm font-bold text-gray-900">
                    {t("writeReview")}
                  </h3>

                  {/* Star rating selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("yourRating")}
                    </label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          onMouseEnter={() => setReviewHover(i + 1)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="p-0.5 transition"
                        >
                          <Star
                            size={24}
                            weight={
                              i < (reviewHover || reviewRating)
                                ? "fill"
                                : "regular"
                            }
                            className={
                              i < (reviewHover || reviewRating)
                                ? "text-amber-400"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("reviewComment")}
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder={t("reviewPlaceholder")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || reviewRating === 0}
                    className="bg-moveli-gradient text-white font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {isSubmittingReview ? "..." : t("submitReview")}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500">{t("loginToReview")}</p>
              )}

              {/* Reviews list */}
              {allReviews.length === 0 ? (
                <p className="text-gray-500">{t("noReviews")}</p>
              ) : (
                allReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight={i < review.rating ? "fill" : "regular"}
                            className={
                              i < review.rating
                                ? "text-amber-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
