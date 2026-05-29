"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createOrder } from "@/lib/api/orders";
import { getMyAddresses, createAddress } from "@/lib/api/addresses";
import { validatePromoCode } from "@/lib/api/promo-codes";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { Check, Truck, MapPin, Plus, Star, Tag, X } from "@phosphor-icons/react";
import type { PaymentMethod, AddressDto } from "@/lib/api/types";

const CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "ზუგდიდი",
  "გორი",
  "თელავი",
  "ფოთი",
];

export function CheckoutContent() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const { items, total, clearLocal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Address form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<AddressDto[]>([]);
  // null = nothing chosen yet, "new" = entering a fresh address, otherwise an address id
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const applyAddress = (a: AddressDto) => {
    setFullName(a.fullName);
    setPhone(a.phoneNumber);
    setCity(a.city);
    setStreet(a.street);
    setPostalCode(a.postalCode ?? "");
    setSelectedAddressId(a.id);
  };

  const useNewAddress = () => {
    setFullName("");
    setPhone("");
    setCity(CITIES[0]);
    setStreet("");
    setPostalCode("");
    setSelectedAddressId("new");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    getMyAddresses()
      .then((data) => {
        if (!active) return;
        setSavedAddresses(data);
        if (data.length > 0) {
          // Pre-select the default address (or the first one) for convenience.
          applyAddress(data.find((a) => a.isDefault) ?? data[0]);
        } else {
          setSelectedAddressId("new");
        }
      })
      .catch(() => {
        if (active) setSelectedAddressId("new");
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // The city <select> only lists known cities; if a saved address uses a city
  // that isn't in the list, surface it as an extra option so it stays selected.
  const cityOptions = CITIES.includes(city) ? CITIES : [city, ...CITIES];

  // Payment
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CashOnDelivery");
  const [notes, setNotes] = useState("");

  // Shipping cost calculation
  const isTbilisi = city === "თბილისი";
  const shippingCost = isTbilisi ? (total >= 100 ? 0 : 5) : 14;

  // Promo discount (backend re-validates and is authoritative)
  const discount = appliedPromo?.discountAmount ?? 0;
  const grandTotal = total + shippingCost - discount;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const result = await validatePromoCode({
        code: promoInput.trim(),
        subtotal: total,
      });
      setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
      toast.success(t("promoApplied", { code: result.code }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("promoInvalid");
      toast.error(message);
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-4">{t("title")}</h2>
        <Link
          href="/login"
          className="inline-flex bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (orderNumber) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} weight="bold" className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("orderConfirmed")}
        </h2>
        <p className="text-gray-500 mb-2">
          {t("orderNumber")}: <strong>{orderNumber}</strong>
        </p>
        <Link
          href="/account/orders"
          className="mt-6 inline-flex bg-moveli-gradient text-white font-semibold px-6 py-3 rounded-lg"
        >
          View orders
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        shippingFullName: fullName,
        shippingPhoneNumber: phone,
        shippingCity: city,
        shippingStreet: street,
        shippingPostalCode: postalCode || undefined,
        paymentMethod,
        notes: notes || undefined,
        promoCode: appliedPromo?.code,
      });
      setOrderNumber(order.orderNumber);
      clearLocal();

      // Persist a freshly-entered address for reuse on future orders.
      if (selectedAddressId === "new" && saveNewAddress) {
        try {
          await createAddress({
            fullName,
            phoneNumber: phone,
            city,
            street,
            postalCode: postalCode || undefined,
            // First address a customer saves becomes their default.
            isDefault: savedAddresses.length === 0,
          });
        } catch {
          // Saving the address is best-effort — the order already succeeded.
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: t("address") },
    { id: 2, label: t("payment") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s.id <= step
                  ? "bg-moveli-gradient text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s.id < step ? <Check size={14} weight="bold" /> : s.id}
            </span>
            <span
              className={`text-sm font-medium ${s.id <= step ? "text-gray-900" : "text-gray-400"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 ${s.id < step ? "bg-moveli-purple-300" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-4">
              {savedAddresses.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MapPin size={16} className="text-moveli-purple-500" />
                    {t("savedAddresses")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => applyAddress(a)}
                        className={`text-left p-4 border rounded-lg transition relative ${
                          selectedAddressId === a.id
                            ? "border-moveli-purple-400 bg-moveli-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {a.isDefault && (
                          <span className="absolute top-3 right-3 text-moveli-purple-500">
                            <Star size={14} weight="fill" />
                          </span>
                        )}
                        <p className="font-semibold text-sm text-gray-900">
                          {a.fullName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {a.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {a.street}, {a.city}
                          {a.postalCode ? `, ${a.postalCode}` : ""}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={useNewAddress}
                      className={`flex items-center justify-center gap-2 p-4 border border-dashed rounded-lg text-sm font-medium transition ${
                        selectedAddressId === "new"
                          ? "border-moveli-purple-400 bg-moveli-purple-50 text-moveli-purple-600"
                          : "border-gray-300 text-gray-500 hover:border-gray-400"
                      }`}
                    >
                      <Plus size={16} weight="bold" />
                      {t("useNewAddress")}
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={9}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="5XXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("city")}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("street")}
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("postalCode")}
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                />
              </div>
              {selectedAddressId === "new" && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                    className="accent-moveli-purple-500"
                  />
                  {t("saveAddress")}
                </label>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!fullName || !phone || !street}
                className="mt-4 bg-moveli-gradient text-white font-semibold px-8 py-3 rounded-lg disabled:opacity-50"
              >
                {t("payment")} →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {t("payment")}
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      value: "CashOnDelivery" as PaymentMethod,
                      label: t("cashOnDelivery"),
                    },
                    {
                      value: "Card" as PaymentMethod,
                      label: t("bankCard"),
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                        paymentMethod === opt.value
                          ? "border-moveli-purple-400 bg-moveli-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="accent-moveli-purple-500"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("notes")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  ← {t("address")}
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-moveli-gradient text-white font-semibold py-3 rounded-lg shadow-lg shadow-moveli-purple-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "..." : t("placeOrder")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">
              {tCart("orderSummary")}
            </h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[200px]">
                    {item.productNameEn} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500">{tCart("subtotal")}</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("shipping")}</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">{t("freeShipping")}</span>
                ) : (
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                )}
              </div>
              {appliedPromo ? (
                <>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-moveli-purple-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-moveli-purple-600">
                      <Tag size={14} weight="fill" />
                      {t("promoChip", {
                        code: appliedPromo.code,
                        amount: appliedPromo.discountAmount,
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      aria-label={t("promoRemove")}
                      className="text-moveli-purple-500 hover:text-moveli-purple-700"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t("promoDiscountLine", { code: appliedPromo.code })}
                    </span>
                    <span className="font-medium text-green-600">
                      −{formatPrice(appliedPromo.discountAmount)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={t("promoPlaceholder")}
                    className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-moveli-purple-400 focus:ring-2 focus:ring-moveli-purple-100"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("promoApply")}
                  </button>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold">{tCart("total")}</span>
                <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Truck size={14} className="text-moveli-purple-500" />
              {t("deliveryTime")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
