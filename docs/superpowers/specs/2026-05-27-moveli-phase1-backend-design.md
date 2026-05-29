# MOVELI Phase 1 — Backend Foundation Design

## Context

MOVELI is a Georgian e-commerce platform (moveli.ge) targeting a $7-10/mo hosting budget. This spec covers Phase 1: the complete backend API that powers both the customer-facing storefront and the admin panel. The frontend (Phase 2) and admin panel (Phase 3) will consume this API.

Complete visual designs exist in `claude design/` and the full project spec lives in `moveli-ecommerce-spec.md`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | .NET 9 / ASP.NET Core 9 Web API |
| ORM | Entity Framework Core 9 (Npgsql provider) |
| Database | PostgreSQL 16 (Docker for local dev) |
| Cache | Redis via StackExchange.Redis |
| Auth | ASP.NET Core Identity + JWT (access + refresh tokens) |
| CQRS | MediatR |
| Validation | FluentValidation |
| Logging | Serilog (console + file sinks) |
| Search | PostgreSQL full-text search (no Elasticsearch) |
| Containerization | Docker Compose for local dev only |

## Architecture

3-project Clean Architecture:

```
Moveli.sln
├── src/
│   ├── Moveli.Domain/              # Zero external dependencies
│   │   ├── Entities/               # Product, Category, Brand, Order, etc.
│   │   ├── ValueObjects/           # LocalizedString, Address (shipping)
│   │   ├── Enums/                  # OrderStatus, PaymentMethod, PaymentStatus
│   │   └── Interfaces/             # IProductRepository, ICategoryRepository, etc.
│   │
│   ├── Moveli.Application/         # Depends on Domain only
│   │   ├── Common/                 # Result<T>, PagedResult<T>, ICurrentUser
│   │   │   └── Behaviors/          # ValidationBehavior, LoggingBehavior
│   │   ├── Products/
│   │   │   ├── Commands/           # CreateProduct, UpdateProduct, DeleteProduct, ToggleActive
│   │   │   ├── Queries/            # GetProducts (paginated), GetProductBySlug, GetFeatured
│   │   │   ├── Dtos/               # ProductDto, ProductListDto, CreateProductRequest
│   │   │   └── Validators/         # CreateProductValidator, etc.
│   │   ├── Categories/             # Same pattern: Commands/ Queries/ Dtos/ Validators/
│   │   ├── Brands/
│   │   ├── Auth/
│   │   ├── Cart/
│   │   ├── Orders/
│   │   ├── Reviews/
│   │   ├── Wishlist/
│   │   └── Admin/                  # Dashboard stats query
│   │
│   └── Moveli.API/                 # Depends on Domain + Application
│       ├── Controllers/            # ProductsController, CategoriesController, etc.
│       ├── Middleware/              # ExceptionHandling, RequestLogging
│       ├── Infrastructure/
│       │   ├── Data/
│       │   │   ├── MoveliDbContext.cs
│       │   │   ├── Configurations/  # EF Core entity configs (one per entity)
│       │   │   └── Migrations/
│       │   ├── Repositories/       # ProductRepository, CategoryRepository, etc.
│       │   ├── Services/           # ImageUploadService, (email stub)
│       │   └── Identity/           # ApplicationUser extends IdentityUser
│       ├── Extensions/             # ServiceCollection extensions for DI
│       └── Program.cs
```

### Dependency Rules
- Domain → nothing
- Application → Domain
- API → Domain + Application (API project also contains Infrastructure)

### Key Patterns

**Result\<T\>**: All business operations return `Result<T>` instead of throwing exceptions for expected failures. Simple class with `IsSuccess`, `Value`, `Error` properties. Controllers map `Result<T>` to appropriate HTTP status codes.

**CQRS via MediatR**: Commands for writes (return `Result<T>`), Queries for reads (return DTOs directly). Pipeline behaviors handle validation and logging.

**Repository pattern**: Interfaces in Domain, implementations in API/Infrastructure. Repositories encapsulate EF Core queries.

## Domain Entities

### Base Entity
```
BaseEntity: Id (Guid, auto-generated), CreatedAt (DateTime UTC), UpdatedAt (DateTime? UTC)
```

### Value Objects

**LocalizedString**: `Ka` (string), `En` (string). Mapped as EF Core owned entity. Used for all translatable text fields.

**ShippingAddress** (embedded in Order): FullName, PhoneNumber, City, Street, PostalCode.

### Entities

**Product**:
- Id, Name (LocalizedString), Slug (unique), Description (LocalizedString), SKU
- Price (decimal, GEL), CompareAtPrice (decimal?, for strikethrough)
- CategoryId → Category, BrandId → Brand
- Images: List\<ProductImage\> (Id, Url, AltText, SortOrder, IsMain)
- StockQuantity (int), IsActive (bool), IsFeatured (bool)
- Rating (decimal, computed), ReviewCount (int, computed)
- MetaTitle (LocalizedString?), MetaDescription (LocalizedString?)

**Category**:
- Id, Name (LocalizedString), Slug (unique), Description (LocalizedString?)
- ParentCategoryId (Guid? → self-referencing for hierarchy)
- ImageUrl, SortOrder (int), IsActive (bool)
- Navigation: Children (ICollection\<Category\>), Parent (Category?)

**Brand**:
- Id, Name (string), Slug (unique), LogoUrl, IsActive (bool)

**ApplicationUser** (extends IdentityUser):
- FirstName, LastName, PreferredLanguage ("ka"/"en")
- Navigation: Addresses (ICollection\<Address\>)

**Address**:
- Id, UserId → ApplicationUser, FullName, PhoneNumber
- City, Street, PostalCode, IsDefault (bool)

**Cart**:
- Id, UserId (Guid? — nullable for guests), SessionId (string)
- Items: ICollection\<CartItem\>

**CartItem**:
- Id, CartId → Cart, ProductId → Product, Quantity (int), UnitPrice (decimal)

**Order**:
- Id, UserId → ApplicationUser
- OrderNumber (string, format: "MV-YYNNNN" auto-generated)
- Status: OrderStatus enum (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- ShippingAddress (embedded value object)
- PaymentMethod: PaymentMethod enum (Card, CashOnDelivery, Installment)
- PaymentStatus: PaymentStatus enum (Pending, Paid, Failed, Refunded)
- Items: ICollection\<OrderItem\>
- SubTotal, ShippingCost, Discount, Total (all decimal), CurrencyCode = "GEL"
- Notes (string?)

**OrderItem**:
- Id, OrderId → Order, ProductId (Guid, no FK — product could be deleted)
- ProductName (string, snapshot at order time), Quantity, UnitPrice, Total

**Review**:
- Id, ProductId → Product, UserId → ApplicationUser
- Rating (int, 1-5), Comment (string?), IsApproved (bool, default false)

**Wishlist**:
- Id, UserId → ApplicationUser, ProductId → Product, AddedAt (DateTime UTC)

## API Endpoints

### Public (no auth required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/products | Paginated list, filterable by categoryId, brandId, minPrice, maxPrice, search, sortBy (price/rating/newest) |
| GET | /api/products/{slug} | Single product by slug with images, category, brand |
| GET | /api/products/featured | Featured products list |
| GET | /api/categories | Full category tree (nested children) |
| GET | /api/categories/{slug} | Single category |
| GET | /api/categories/{slug}/products | Products in a category |
| GET | /api/products/{id}/reviews | Reviews for a product |

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register with email, password, firstName, lastName, phone |
| POST | /api/auth/login | Returns JWT access token + refresh token |
| POST | /api/auth/refresh | Refresh expired access token |
| GET | /api/auth/me | Current user profile (requires auth) |

### Cart (identified by session cookie for guests, JWT for authenticated users)

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/cart | Get current cart |
| POST | /api/cart/items | Add item { productId, quantity } |
| PUT | /api/cart/items/{id} | Update quantity { quantity } |
| DELETE | /api/cart/items/{id} | Remove item |

### Orders (requires auth)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/orders | Create order from cart { shippingAddressId, paymentMethod, notes } |
| GET | /api/orders | User's orders (paginated) |
| GET | /api/orders/{id} | Single order detail |

### Reviews (requires auth for POST)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/products/{id}/reviews | Submit review { rating, comment } |

### Wishlist (requires auth)

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/wishlist | User's wishlist |
| POST | /api/wishlist | Add product { productId } |
| DELETE | /api/wishlist/{productId} | Remove product |

### Admin (requires Admin role)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/admin/products | Create product |
| PUT | /api/admin/products/{id} | Update product |
| DELETE | /api/admin/products/{id} | Delete product |
| PUT | /api/admin/products/{id}/toggle-active | Toggle active status |
| POST | /api/admin/categories | Create category |
| PUT | /api/admin/categories/{id} | Update category |
| DELETE | /api/admin/categories/{id} | Delete (fails if has products) |
| PUT | /api/admin/categories/reorder | Reorder { categoryIds[] } |
| POST | /api/admin/brands | Create brand |
| PUT | /api/admin/brands/{id} | Update brand |
| DELETE | /api/admin/brands/{id} | Delete brand |
| GET | /api/admin/orders | Orders list with filters (status, date range, pagination) |
| PUT | /api/admin/orders/{id}/status | Update status { newStatus, note } |
| GET | /api/admin/customers | Customer list with search |
| GET | /api/admin/dashboard | Dashboard stats |
| POST | /api/admin/upload/image | Upload image file, return URL |

## Cross-Cutting Concerns

### Validation Pipeline
FluentValidation validators run automatically via MediatR `ValidationBehavior<TRequest, TResponse>`. Returns 400 with structured error object listing field-level errors.

### Error Handling
Global exception middleware catches unhandled exceptions and returns:
- 400 for validation errors (from Result pattern)
- 401 for missing/invalid JWT
- 403 for insufficient role
- 404 for not found (from Result pattern)
- 500 for unexpected errors (logged via Serilog, generic message returned)

### Pagination
`PagedResult<T>` with: Items (List\<T\>), Page (int), PageSize (int), TotalCount (int), TotalPages (int). Default page size: 20, max: 50.

### JWT Configuration
- Access token: 30 min expiry, signed with HMAC-SHA256
- Refresh token: 7 day expiry, stored in database, single-use (rotated on refresh)
- Roles: "Admin", "Customer"

### Logging
Serilog with console + rolling file sinks. Structured logging. Request/response logging via middleware (sanitize passwords).

## Seed Data

On first migration, seed:
- **8 categories** with hierarchy:
  - ელექტრონიკა/Electronics → სმარტფონები/Smartphones, ლეპტოპები/Laptops, ტაბლეტები/Tablets
  - საყოფაცხოვრებო ტექნიკა/Home Appliances → სამზარეულო/Kitchen, დასუფთავება/Cleaning
  - ტანსაცმელი/Fashion, სილამაზე/Beauty, სპორტი/Sports (no children)
- **5 brands**: Samsung, Apple, Bosch, Nike, Sony
- **20+ products** with realistic GEL prices, Georgian names/descriptions, placeholder images (placehold.co/600x600)
- **2 users**: admin@moveli.ge (Admin, password: Admin123!), user@moveli.ge (Customer, password: User123!)

## Docker Compose (Local Dev)

```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: moveli
      POSTGRES_USER: moveli
      POSTGRES_PASSWORD: moveli_dev
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

volumes:
  postgres_data:
  redis_data:
```

## Build Order (15 Steps)

1. Solution scaffolding: create sln + 3 projects with proper references
2. Docker Compose for PostgreSQL + Redis
3. Domain entities + value objects + enums
4. DbContext with EF Core configurations (owned entities for LocalizedString, indexes, relationships)
5. Initial migration + seed data
6. MediatR setup + FluentValidation pipeline + Result\<T\> class
7. Product feature — full slice (queries + admin commands + controller + validators)
8. Category feature — full slice with hierarchy support
9. Brand feature — simple CRUD
10. Auth — register, login, JWT, refresh, roles, /me endpoint
11. Cart feature (session-based for guests, user-based for authenticated)
12. Order feature with status workflow + order number generation
13. Review + Wishlist features
14. Admin dashboard stats endpoint
15. Image upload endpoint (save to /uploads, return URL)

## Verification

After each step, verify:
- `dotnet build` succeeds with no warnings
- Docker containers are running (steps 2+)
- EF migrations apply cleanly (steps 4-5)
- API endpoints return expected responses via manual testing or HTTP file
- Auth flow works end-to-end (step 10)

Final verification: all 40+ endpoints respond correctly, seed data is accessible, admin role protection works.
