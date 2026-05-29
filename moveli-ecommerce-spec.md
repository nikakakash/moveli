# MOVELI — Georgian E-Commerce Platform — Budget Build ($20-30/month)

---

## Budget Breakdown

| Service | Cost | Notes |
|---|---|---|
| **VPS (API + DB + Redis)** | $4-6/mo | Hostinger $4.99 (4GB RAM) or Vultr $4. Runs PostgreSQL + Redis + .NET API on one box. |
| **Frontend hosting** | $0 | Vercel free tier (100GB bandwidth, auto-SSL, built for Next.js) |
| **Domain (.ge)** | ~$15-20/yr | Georgian registrar (~$1.50/mo amortized) |
| **Email (transactional)** | $0 | Resend free tier (3,000 emails/month) or Brevo free (300/day) |
| **Image storage** | $0 | Cloudflare R2 free tier (10GB) or store on VPS initially |
| **SSL** | $0 | Let's Encrypt via Caddy (auto) + Vercel auto-SSL |
| **Total** | **~$7-10/mo** | Leaves $10-20/mo buffer |

---

## Admin Panel — Research & Approach

### What top e-commerce admin panels include

Based on research of leading platforms (Shopify, Medusa, Saleor, nopCommerce, Zoommer-style Georgian platforms), the essential admin panel modules for an e-commerce platform are:

**Product Management (the core)**
- Create/edit products with a multi-section form: basic info, pricing, images, inventory, SEO, category/brand assignment
- Bilingual fields side-by-side (Georgian + English) so the admin sees both at once
- Image upload with drag-and-drop reordering and thumbnail preview
- Product status toggle (active/draft/archived)
- Bulk actions: activate, deactivate, delete multiple products
- Product variants (size, color) — can be added later as a V2 feature

**Category Management**
- Tree view showing parent-child category hierarchy
- Create/edit categories with name (ka/en), slug, image, sort order
- Drag-and-drop reordering within the tree
- Assign parent category (or make it top-level)
- Quick toggle for active/inactive

**Order Management**
- Order list with filters: status, date range, payment status
- Order detail view with items, customer info, addresses, payment method
- Status workflow buttons: Confirm → Process → Ship → Deliver (or Cancel)
- Order notes for internal communication

**Dashboard (overview)**
- Today's orders count + revenue
- Weekly/monthly revenue chart
- Top selling products
- Low stock alerts
- Recent orders list

**Customer Management**
- Customer list with search
- View customer details, order history, addresses

**Brand Management**
- Simple CRUD: name, logo, active toggle

### Best approach for our budget: integrated Next.js admin

There are three common approaches for admin panels in modern e-commerce:

1. **Separate SPA** (React/Vue standalone app) — more work, separate deployment
2. **Integrated in the same Next.js app** (under /admin route group) — single deployment, shared components, protected by middleware
3. **Server-rendered (Blazor/Razor)** — stays within .NET ecosystem but less interactive

**For MOVELI, approach #2 is the best fit** because:
- Zero extra hosting cost — the admin lives inside the same Next.js app on Vercel free tier
- Shares components (product cards, forms, layouts) with the storefront
- Next.js middleware protects /admin routes (redirect to login if not admin)
- shadcn/ui provides excellent table, form, dialog, and sheet components perfect for admin CRUD
- One codebase to maintain

The admin panel will be built as a route group `(admin)` inside the Next.js app with its own layout (sidebar navigation, different styling from the storefront).

---

## Claude Code Prompt

**How to use this:** Copy everything inside the code block below and paste it directly into Claude Code. It will understand it — the prompt is structured as clear specifications with a step-by-step build order.

After the initial setup is done, guide Claude Code through features one at a time ("now build the category management page", "now add image upload", etc.)

```
Build a production e-commerce platform called "MOVELI" (moveli.ge) for the Georgian (country) market. Budget is very low so keep everything lean and efficient. Work step by step — set up one thing at a time and make sure it works before moving on.

## TECH STACK

Backend:
- C# / .NET 9 / ASP.NET Core 9 Web API
- Entity Framework Core 9 with PostgreSQL (Npgsql provider)
- Clean Architecture with 3 projects: Moveli.Domain, Moveli.Application, Moveli.API (API project contains Infrastructure code in an Infrastructure/ folder to keep it simple)
- MediatR for CQRS pattern
- FluentValidation for request validation
- ASP.NET Core Identity + JWT for auth
- PostgreSQL full-text search (no Elasticsearch — budget constraint)
- Redis for caching cart sessions (via StackExchange.Redis)
- Serilog for logging to console + file

Frontend + Admin (single Next.js app):
- Next.js 15 with App Router, React Server Components, TypeScript strict mode
- Tailwind CSS 4 + shadcn/ui components
- next-intl for i18n (Georgian "ka" default, English "en" secondary)
- React Hook Form + Zod for form validation
- zustand for client cart/UI state
- The ADMIN PANEL is built inside the same Next.js app under a (admin) route group with its own sidebar layout — NOT a separate app. This saves hosting costs.
- Will be deployed on Vercel free tier (use NEXT_PUBLIC_API_URL env var for API URL)

Infrastructure:
- Docker Compose for LOCAL development only (PostgreSQL 16 + Redis containers)
- Production: single VPS running .NET API + PostgreSQL + Redis directly
- Caddy as reverse proxy in production (auto-SSL via Let's Encrypt)

## ARCHITECTURE RULES

1. Clean Architecture — simplified for a lean project:
   - Moveli.Domain: Entities, Value Objects, Enums, Repository interfaces. Zero external dependencies.
   - Moveli.Application: MediatR handlers (Commands + Queries), DTOs, Validators, Service interfaces. Depends only on Domain.
   - Moveli.API: Controllers, Middleware, DI setup, AND Infrastructure code (DbContext, Repositories, External services) in an Infrastructure/ folder. Depends on all layers.

2. CQRS via MediatR: Commands for writes, Queries for reads.

3. Base entity: Id (Guid), CreatedAt (DateTime UTC), UpdatedAt (DateTime UTC nullable).

4. Result<T> pattern for business logic errors — no throwing exceptions for expected failures. Simple Result<T> class with IsSuccess, Value, Error properties.

5. All product/category text fields support two languages using a LocalizedString value object with Ka and En string properties. Store as an owned entity in EF Core.

## DOMAIN ENTITIES

Product:
- Id, Name (LocalizedString), Slug, Description (LocalizedString), SKU
- Price (decimal, GEL), CompareAtPrice (decimal? — for strike-through discount display)
- CategoryId, BrandId
- Images (List<ProductImage>: Id, Url, AltText, SortOrder, IsMain)
- StockQuantity, IsActive, IsFeatured
- Rating (decimal), ReviewCount (int)
- MetaTitle (LocalizedString?), MetaDescription (LocalizedString?) — for SEO

Category:
- Id, Name (LocalizedString), Slug, Description (LocalizedString?)
- ParentCategoryId (Guid? — for hierarchy), ImageUrl, SortOrder, IsActive
- Children (navigation property for tree structure)

Brand:
- Id, Name, Slug, LogoUrl, IsActive

User (extend IdentityUser):
- FirstName, LastName, PhoneNumber, PreferredLanguage ("ka"/"en"), Addresses collection

Address:
- Id, UserId, FullName, PhoneNumber, City, Street, PostalCode, IsDefault

Cart:
- Id, UserId (Guid? nullable for guests), SessionId (string), Items collection

CartItem:
- Id, CartId, ProductId, Quantity, UnitPrice

Order:
- Id, UserId, OrderNumber (format: "MV-240001")
- Status enum: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
- ShippingAddress (embedded value object), PaymentMethod enum: Card, CashOnDelivery, Installment
- PaymentStatus enum: Pending, Paid, Failed, Refunded
- Items collection, SubTotal, ShippingCost, Discount, Total, CurrencyCode = "GEL"

OrderItem:
- Id, OrderId, ProductId, ProductName (snapshot), Quantity, UnitPrice, Total

Review:
- Id, ProductId, UserId, Rating (1-5), Comment, IsApproved

Wishlist:
- Id, UserId, ProductId, AddedAt

## API ENDPOINTS

**Products:**
- GET /api/products?page=1&pageSize=20&categoryId=&brandId=&minPrice=&maxPrice=&search=&sortBy=price|rating|newest
- GET /api/products/{slug}
- GET /api/products/featured

**Categories:**
- GET /api/categories (returns full tree with children nested)
- GET /api/categories/{slug}
- GET /api/categories/{slug}/products

**Cart:**
- GET /api/cart (identified by session cookie or JWT user)
- POST /api/cart/items { productId, quantity }
- PUT /api/cart/items/{id} { quantity }
- DELETE /api/cart/items/{id}

**Auth:**
- POST /api/auth/register { email, password, firstName, lastName, phone }
- POST /api/auth/login { email, password } → returns JWT + refresh token
- POST /api/auth/refresh
- GET /api/auth/me

**Orders:**
- POST /api/orders { shippingAddressId, paymentMethod, notes }
- GET /api/orders (user's orders, paginated)
- GET /api/orders/{id}

**Reviews:**
- GET /api/products/{id}/reviews
- POST /api/products/{id}/reviews { rating, comment }

**Wishlist:**
- GET /api/wishlist
- POST /api/wishlist { productId }
- DELETE /api/wishlist/{productId}

**Admin endpoints (require Admin role):**
- POST /api/admin/products (create product with all fields + image URLs)
- PUT /api/admin/products/{id} (update product)
- DELETE /api/admin/products/{id}
- PUT /api/admin/products/{id}/toggle-active
- POST /api/admin/categories (create category, including parentCategoryId for nesting)
- PUT /api/admin/categories/{id}
- DELETE /api/admin/categories/{id} (only if no products assigned)
- PUT /api/admin/categories/reorder { categoryIds[] } (update sort order)
- POST /api/admin/brands
- PUT /api/admin/brands/{id}
- DELETE /api/admin/brands/{id}
- GET /api/admin/orders?status=&dateFrom=&dateTo=&page=
- PUT /api/admin/orders/{id}/status { newStatus, note }
- GET /api/admin/customers?search=&page=
- GET /api/admin/dashboard (stats: totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders[], topProducts[], lowStockProducts[])
- POST /api/admin/upload/image (accept multipart file, save to disk, return URL)

## STOREFRONT PAGES (customer-facing)

1. **Homepage** — Hero banner with CTA, featured products carousel, category grid (icons + names), new arrivals section, "Why MOVELI" trust badges
2. **Product Listing** — Sidebar filters (category tree, brand checkboxes, price range slider), sort dropdown, grid view, pagination with page numbers
3. **Product Detail** — Image gallery with thumbnail strip, product info (name, price with ₾, stock status), add-to-cart with quantity picker, tabbed content (description, specifications, reviews), related products
4. **Cart** — Item list with product image/name/price, quantity +/- buttons, remove button, order summary sidebar, proceed to checkout
5. **Checkout** — Multi-step form: Step 1 Shipping (address form or select saved), Step 2 Payment (Card/COD/Installment radio), Step 3 Review & Place Order, Step 4 Confirmation with order number
6. **Account** — Tabs: Profile edit, Saved addresses, Order history with status badges and detail expansion
7. **Auth** — Login page, Register page (with phone number field), clean centered card layout
8. **Category page** — Breadcrumbs, products filtered by category
9. **Search** — Search bar in header with debounced suggestions, results page with highlighting

## ADMIN PANEL (under /admin route group in the same Next.js app)

The admin panel is a CRITICAL part of MOVELI. Build it as a professional, functional dashboard — not an afterthought. It lives at /admin/* routes inside the same Next.js app, with its own layout (sidebar + topbar).

### Admin Layout
- **Sidebar navigation** (collapsible on mobile): Dashboard, Products, Categories, Brands, Orders, Customers
- **Top bar**: Admin name, logout button, quick link to storefront
- **Color scheme**: Use a neutral/dark sidebar with the main content area in light. Use shadcn/ui components throughout.
- Protect all /admin routes with Next.js middleware — redirect to /admin/login if no valid admin JWT

### Admin Pages — detailed specs:

**1. Dashboard (/admin)**
- 4 stat cards at top: Total Revenue (₾), Total Orders, Total Products, Total Customers — each with a small trend indicator
- Revenue chart (last 30 days) using recharts — simple line or bar chart
- Two columns below: "Recent Orders" table (last 10, with status badges) and "Top Selling Products" list
- "Low Stock Alerts" section: products with stock < 10, with quick link to edit

**2. Products (/admin/products)**
- **Product list page**: Data table (shadcn/ui DataTable) with columns: Image thumbnail, Name (ka), Price (₾), Category, Stock, Status (active badge/inactive badge), Actions (edit/delete)
- Search bar + filter by category dropdown + filter by status
- "Add Product" button in top right
- Bulk selection checkboxes + bulk actions bar (Activate, Deactivate, Delete)

- **Product create/edit page (/admin/products/new and /admin/products/[id]/edit)**:
  This is a multi-section form. Use a single-page layout with clearly separated sections (cards or accordion), NOT a multi-step wizard:

  Section 1 — "Basic Information":
  - Name (Georgian) text input — required
  - Name (English) text input — required
  - Slug (auto-generated from English name, editable)
  - Description (Georgian) — rich textarea
  - Description (English) — rich textarea
  - SKU — text input

  Section 2 — "Pricing & Inventory":
  - Price (₾) — number input, required
  - Compare At Price (₾) — number input, optional (when filled, storefront shows strikethrough)
  - Stock Quantity — number input
  - "Featured product" toggle switch

  Section 3 — "Organization":
  - Category — dropdown/select, populated from categories API. Show hierarchy with indentation (e.g. "Electronics > Smartphones")
  - Brand — dropdown/select
  - Status — Active/Draft radio or toggle

  Section 4 — "Images":
  - Image upload area (click or drag-and-drop)
  - Show uploaded image thumbnails in a sortable grid
  - Mark one image as "main" (shown in product cards)
  - Delete individual images with confirmation

  Section 5 — "SEO" (collapsible, optional):
  - Meta Title (ka/en)
  - Meta Description (ka/en)
  - Preview of how it would look in Google search results

  Footer: "Save Product" primary button + "Save as Draft" secondary + "Cancel" link

**3. Categories (/admin/categories)**
- **Category list**: Display as an INDENTED TREE VIEW, not a flat table. Show hierarchy clearly:
  ```
  📁 Electronics
     📁 Smartphones
     📁 Laptops
     📁 Tablets
  📁 Home Appliances
     📁 Kitchen
     📁 Cleaning
  📁 Fashion
  ```
- Each row shows: Name (ka), Name (en), product count, status badge, Edit/Delete buttons
- "Add Category" button that opens a dialog/sheet (slide-over panel from the right side):
  - Name (Georgian) — required
  - Name (English) — required
  - Slug (auto-generated, editable)
  - Description (ka/en) — optional textareas
  - Parent Category — dropdown (select "None" for top-level, or pick a parent). This is how hierarchy is created.
  - Image URL — text input or upload
  - Sort Order — number
  - Active toggle
  - Save / Cancel buttons
- Edit uses the same dialog/sheet, pre-filled with existing data
- Delete shows confirmation dialog. If category has products, show warning: "This category has X products. Reassign them first."
- Drag-and-drop reordering within the tree (nice-to-have, can skip in V1 and use sort order numbers)

**4. Brands (/admin/brands)**
- Simple data table: Logo, Name, Product count, Status, Actions
- Add/Edit via dialog (not separate page — brands are simple): Name, Logo URL, Active toggle

**5. Orders (/admin/orders)**
- Data table with columns: Order # (MV-240001), Customer name, Date, Total (₾), Payment method, Payment status badge, Order status badge
- Filters: status dropdown, date range picker, search by order number
- Click a row to open order detail page:
  - Customer info card
  - Shipping address
  - Order items table with product images
  - Payment info
  - Status timeline showing progression
  - **Status update section**: dropdown to select new status + optional note textarea + "Update Status" button. Available transitions: Pending→Confirmed, Confirmed→Processing, Processing→Shipped, Shipped→Delivered, Any→Cancelled

**6. Customers (/admin/customers)**
- Data table: Name, Email, Phone, Total Orders, Total Spent (₾), Joined date
- Search by name/email/phone
- Click to view detail: profile info, address list, full order history

### Admin UX principles to follow:
- Use toast notifications (shadcn/ui toast) for success/error feedback on all actions
- Confirm destructive actions (delete) with a dialog
- Show loading states (skeleton loaders) while data fetches
- Form validation with inline error messages (red text below fields)
- Mobile-responsive: sidebar collapses to hamburger menu, tables become card layouts on small screens
- Use breadcrumbs on all admin pages for navigation context

## GEORGIAN SPECIFICS

- Currency: GEL (₾). Display as "₾ 99.99" or "99.99 ₾"
- Phone format: +995 5XX XXX XXX
- Georgian cities for delivery: თბილისი (Tbilisi), ბათუმი (Batumi), ქუთაისი (Kutaisi), რუსთავი (Rustavi), ზუგდიდი (Zugdidi), გორი (Gori), თელავი (Telavi), ფოთი (Poti)
- Language toggle in header: 🇬🇪 ქართული | 🇬🇧 English
- Payment methods (stub interfaces only, no real integration): Card (ბარათით გადახდა), Cash on Delivery (ნაღდი ანგარიშსწორება), Bank Installment (განვადება)
- The brand name "MOVELI" should appear in the header/logo area. Use a clean, modern wordmark.

## SEED DATA

Populate on first migration:
- 8 categories with hierarchy:
  - ელექტრონიკა/Electronics → children: სმარტფონები/Smartphones, ლეპტოპები/Laptops, ტაბლეტები/Tablets
  - საყოფაცხოვრებო ტექნიკა/Home Appliances → children: სამზარეულო/Kitchen, დასუფთავება/Cleaning
  - ტანსაცმელი/Fashion (no children)
  - სილამაზე/Beauty (no children)
  - სპორტი/Sports (no children)
- 5 brands: Samsung, Apple, Bosch, Nike, Sony
- 20+ products spread across categories, realistic GEL prices:
  - Smartphones: ₾1,299 – ₾4,999
  - Laptops: ₾1,899 – ₾6,499
  - Home appliances: ₾299 – ₾2,999
  - Fashion: ₾49 – ₾399
  - Beauty: ₾15 – ₾199
  - Sports: ₾29 – ₾599
  - Use https://placehold.co/600x600 for images
  - Georgian names and descriptions (use real Georgian text for product names, e.g. "Samsung Galaxy S24 Ultra" stays the same, but description in Georgian like "უახლესი ფლაგმანი სმარტფონი...")
- 2 users:
  - admin@moveli.ge (Admin role, password: Admin123!)
  - user@moveli.ge (Customer role, password: User123!)

## STEP-BY-STEP BUILD ORDER

Complete each step fully before moving to the next. Confirm each works.

**Phase 1 — Backend Foundation:**
1. Create solution: `dotnet new sln -n Moveli`, create 3 projects with proper references
2. Docker Compose: PostgreSQL 16 + Redis for local dev
3. Domain entities + value objects (LocalizedString, Address as value object)
4. DbContext with EF Core config (owned entities for LocalizedString, proper indexes)
5. Initial migration + seed data
6. MediatR + FluentValidation pipeline + Result<T> class
7. Product feature — full slice: GetProducts query (paginated, filterable), GetProductBySlug, admin CreateProduct/UpdateProduct/DeleteProduct commands
8. Category feature — full slice: GetCategoryTree query, admin CRUD with hierarchy support
9. Brand feature — simple CRUD
10. Auth — register, login, JWT issuance, role-based authorization, /me endpoint
11. Cart feature
12. Order feature with status workflow
13. Review + Wishlist features
14. Admin dashboard stats endpoint
15. Image upload endpoint (save to /uploads folder, return URL)

**Phase 2 — Frontend Storefront:**
16. Initialize Next.js 15 in /frontend folder with App Router
17. Set up next-intl with ka/en, Tailwind CSS 4, shadcn/ui
18. Storefront layout: header (logo "MOVELI", nav, search, cart icon, language toggle, auth), footer
19. Homepage with hero, featured products, categories
20. Product listing page with filters and pagination
21. Product detail page
22. Cart page
23. Checkout multi-step flow
24. Auth pages (login, register)
25. Account pages (profile, orders, addresses, wishlist)

**Phase 3 — Admin Panel:**
26. Admin layout: sidebar nav + topbar, route protection middleware
27. Admin login page
28. Dashboard page with stats and charts
29. Products list page with data table, search, filters
30. Product create/edit form (the multi-section form described above)
31. Categories page with tree view + add/edit dialog
32. Brands page with simple table + dialog
33. Orders page with list + detail + status update
34. Customers page

START with step 1. Create the Moveli solution structure and show me what you've created.
```

---

## After initial build — follow-up prompts for Claude Code

Phase by phase, you can ask:

**Immediate improvements:**
- "Add image upload with drag-and-drop to the product form, save files to /uploads on the VPS"
- "Add a product import feature — upload CSV with products and bulk create them"
- "Add email notifications on order status changes using Resend"

**Payment integration (when ready):**
- "Add TBC Bank payment page integration (test mode) — here is their API docs: [link]"
- "Add BOG (Bank of Georgia) iPay integration for card payments"

**SEO & Performance:**
- "Add sitemap.xml generation for all product and category pages"
- "Add structured data (JSON-LD) for products (schema.org/Product)"
- "Add OpenGraph meta tags for social sharing"

**Deployment:**
- "Create a Caddyfile for production that proxies api.moveli.ge to the .NET app"
- "Write a deployment script for Ubuntu 24 VPS: install deps, setup systemd service, configure PostgreSQL"
- "Create a GitHub Actions workflow to build and deploy on push to main"

---

## Deployment plan (when ready)

**Frontend → Vercel (free)**
1. Push /frontend to GitHub
2. Connect to Vercel, set NEXT_PUBLIC_API_URL=https://api.moveli.ge
3. Auto-deploys on push

**Backend → VPS ($5/mo)**
1. Hostinger or Vultr VPS (Ubuntu 24, 4GB RAM)
2. Install: .NET 9 runtime, PostgreSQL 16, Redis, Caddy
3. Clone, publish, run as systemd service
4. Caddy handles SSL automatically

**Monthly cost: ~$7-10/mo total**
