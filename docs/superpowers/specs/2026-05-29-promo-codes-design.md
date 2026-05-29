# Promo Codes — Design

## Context

Admins need to generate promo codes; customers enter a code at checkout to get a discount on
their order. The checkout "Order summary" shows a `Discount (CODE) −₾X` line and an "applied"
chip, then the discounted total.

This is **separate** from the existing product/category/brand auto-discounts (`Discount` entity),
which automatically lower product prices. Promo codes are customer-entered coupons with their own
rules (percentage *or* fixed amount, once-per-customer redemption). The two mechanisms stack: a
promo applies to the order subtotal, which already reflects any auto-discounts.

The `Order` entity already has a `Discount` field and computes
`Total = SubTotal + ShippingCost - Discount`, so the promo discount plugs into that existing slot.

## Decisions (from brainstorming)

- **Discount type:** admin chooses per code — **Percentage** or **Fixed amount (₾)**.
- **Rules supported:** **Active toggle** + optional **Expiry window** (start/end dates). No minimum
  order amount, no total usage cap.
- **Reuse:** **Once per customer** — each customer can redeem a given code only once (requires
  redemption tracking).

## Backend (.NET)

### Domain (`Moveli.Domain`)

- **`Enums/PromoDiscountType.cs`**: `Percentage = 0`, `FixedAmount = 1`.
- **`Entities/PromoCode.cs`** (extends `BaseEntity`):
  - `string Code` — unique, stored **uppercase**.
  - `PromoDiscountType Type`.
  - `decimal Value` — percent `(0, 100]` when `Percentage`; ₾ amount `> 0` when `FixedAmount`.
  - `bool IsActive` (default `true`).
  - `DateTime? StartsAt`, `DateTime? EndsAt`.
  - `bool IsLive(DateTime now)` → `IsActive && (StartsAt == null || now >= StartsAt) && (EndsAt == null || now <= EndsAt)`.
- **`Entities/PromoCodeRedemption.cs`** (extends `BaseEntity`):
  - `Guid PromoCodeId`, `Guid UserId`, `Guid OrderId`. `CreatedAt` records when used.

### Discount math (shared helper)

Given `subtotal`, `Type`, `Value`:
- Percentage → `Math.Round(subtotal * Value / 100m, 2)`.
- Fixed → `Math.Min(Value, subtotal)`.
- Always capped at `subtotal` (the total never drops below shipping). Applies to **subtotal only**,
  not shipping.

### Validation rules

A code is usable for a given user + subtotal when **all** hold:
1. A `PromoCode` with that code (case-insensitive) exists.
2. `IsLive(DateTime.UtcNow)` is true (active + within window).
3. No `PromoCodeRedemption` exists for `(PromoCodeId, UserId)`.

Each failed rule maps to a distinct error message: invalid / expired-or-inactive / already used.

### Persistence (`Moveli.API/Infrastructure`)

- **`Data/Configurations/PromoCodeConfiguration.cs`**: `Value` precision `(18,2)`; `Code` max length
  with a **unique index**.
- **`Data/Configurations/PromoCodeRedemptionConfiguration.cs`**: **unique index on
  `(PromoCodeId, UserId)`** to enforce once-per-customer at the DB level.
- **`MoveliDbContext`**: add `DbSet<PromoCode>` and `DbSet<PromoCodeRedemption>`.
- **`Order` entity + config**: add nullable `string? PromoCode` column (the code applied to the
  order, for display/reporting).
- **`IPromoCodeRepository` + `PromoCodeRepository`**: `GetByCodeAsync`, `GetAllAsync`,
  `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`, `HasUserRedeemedAsync(codeId, userId)`,
  `GetRedemptionCountAsync(codeId)`. Register in DI alongside existing repositories.
- One EF migration `AddPromoCodes` (new tables + `Orders.PromoCode` column), auto-applied on startup
  like existing migrations.

### Application + API

- **`PromoCodes/Dtos/`**: `PromoCodeDto` (id, code, type, value, isActive, startsAt, endsAt,
  redemptionCount), `ValidatePromoRequest` (code, subtotal), `ValidatePromoResult`
  (code, discountAmount), `CreatePromoCodeRequest` / `UpdatePromoCodeRequest`.
- **Customer query** `ValidatePromoCodeQuery(string Code, decimal Subtotal)` → `Result<ValidatePromoResult>`.
  Uses `ICurrentUser.UserId` to apply the once-per-customer check; computes discount via the shared
  helper. Returns failure with a specific reason on any rule violation.
- **`POST /api/promo-codes/validate`** (`[Authorize]`) — powers the checkout "Apply" button.
- **Order creation** — `CreateOrderCommand` gains `string? PromoCode`. In
  `CreateOrderCommandHandler`, after `order.SubTotal` is computed and inside the existing
  transaction:
  - If `PromoCode` is set: re-run validation against the **real** cart subtotal + current user.
    On failure, return `Result.Failure(reason)` (rolls back). On success, set `order.Discount`,
    `order.PromoCode`, and add a `PromoCodeRedemption` row.
  - This server-side recompute is authoritative — the client cannot fake a discount.
  - `order.Total = order.SubTotal + order.ShippingCost - order.Discount` (unchanged formula).
- **Admin CRUD** — `CreatePromoCodeCommand`, `UpdatePromoCodeCommand`, `DeletePromoCodeCommand`,
  `GetPromoCodesQuery` (records + FluentValidation: code non-empty; `Value` in range per type
  (`(0,100]` for Percentage, `> 0` for Fixed); `EndsAt ≥ StartsAt` when both set). The create/update
  **handlers** also reject a code that already exists (case-insensitive), backed by the unique index. **`AdminPromoCodesController`** with
  `GET/POST /api/admin/promo-codes`, `PUT/DELETE /api/admin/promo-codes/{id}`
  (`[Authorize(Roles = "Admin")]`), mirroring `AdminDiscountsController`.

## Frontend (Next.js)

### API + types
- **`lib/api/types.ts`**: `PromoDiscountType`, `PromoCodeDto`, `ValidatePromoRequest`,
  `ValidatePromoResult`, `CreatePromoCodeRequest`, `UpdatePromoCodeRequest`. Add `promoCode?: string`
  to the create-order request type and `promoCode` to the order DTO.
- **`lib/api/promo-codes.ts`**: `validatePromoCode({ code, subtotal })`.
- **`lib/api/admin.ts`**: `getPromoCodes`, `createPromoCode`, `updatePromoCode`, `deletePromoCode`.

### Checkout (`components/checkout/checkout-content.tsx`)
- In the **Order summary** card: a promo input + **Apply** button.
- On Apply → call `validatePromoCode` with the current subtotal. On success, store
  `{ code, discountAmount }` in component state, show the green "CODE applied · −₾X" chip with a
  remove (×), and add a `Discount (CODE)` line. On failure, toast the reason.
- Recompute displayed total: `subtotal + shipping − discountAmount`.
- Pass `promoCode` to `createOrder`. (Backend re-validates and is authoritative.)

### Admin page
- **`app/[locale]/admin/promo-codes/page.tsx`** — list + inline create/edit form, modeled on
  `admin/discounts/page.tsx`. Form: code, type selector (Percentage / Fixed), value, active toggle,
  optional starts-at / ends-at. List shows code, type+value, status (Active / Scheduled / Expired /
  Off), window, redemption count, edit/delete.
- **`components/admin/admin-sidebar.tsx`** — add `{ href: "/admin/promo-codes", icon: Ticket }`.
- **`messages/en.json` + `ka.json`** — admin promo keys + checkout promo keys (promoCode, apply,
  applied, remove, invalid/expired/alreadyUsed messages).

## Out of scope (YAGNI)
- Minimum order amount, total usage cap, per-product/category restrictions, auto-apply best code,
  stacking multiple promo codes (one code per order).

## Verification
1. `dotnet build` → 0 errors; `dotnet ef migrations add AddPromoCodes`; run API (migration applies).
2. `cd frontend && npx tsc --noEmit` → 0 errors.
3. Admin creates a **percentage** code (e.g. SAVE15 = 15%) and a **fixed** code (e.g. MOVELI80 = ₾80).
4. Checkout: apply SAVE15 → discount = 15% of subtotal, total updates; placed order stores
   `Discount`, `PromoCode`, and a redemption row.
5. Same customer re-applies SAVE15 → rejected "already used".
6. Apply a code outside its date window or with `IsActive=false` → rejected.
7. Apply MOVELI80 on a subtotal < ₾80 → discount capped at subtotal (total never below shipping).
8. Tamper attempt: send a bogus `promoCode` straight to `createOrder` → order fails validation
   (server authoritative).
