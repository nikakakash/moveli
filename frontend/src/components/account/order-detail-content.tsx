"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getOrderDetail } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderDto, OrderStatus } from "@/lib/api/types";
import { ArrowLeft } from "@phosphor-icons/react";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_STEPS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const t = useTranslations("account");
  const tStatus = useTranslations("status");
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getOrderDetail(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, orderId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} /> {t("myOrders")}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}
        >
          {tStatus(order.status.toLowerCase())}
        </span>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStepIndex
                        ? "bg-moveli-gradient text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {tStatus(step.toLowerCase())}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      i < currentStepIndex
                        ? "bg-moveli-purple-300"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(item.total)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span>
              {order.shippingCost > 0
                ? formatPrice(order.shippingCost)
                : "Free"}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">
                -{formatPrice(order.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
            <span>{t("orderTotal")}</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + Payment info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Shipping</h3>
          <p className="text-sm text-gray-600">{order.shippingFullName}</p>
          <p className="text-sm text-gray-600">{order.shippingPhoneNumber}</p>
          <p className="text-sm text-gray-600">
            {order.shippingStreet}, {order.shippingCity}
          </p>
          {order.shippingPostalCode && (
            <p className="text-sm text-gray-600">{order.shippingPostalCode}</p>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Payment</h3>
          <p className="text-sm text-gray-600">
            {order.paymentMethod === "CashOnDelivery"
              ? "Cash on delivery"
              : order.paymentMethod === "Card"
                ? "Bank card"
                : order.paymentMethod}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Status: {order.paymentStatus}
          </p>
          {order.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              Note: {order.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
