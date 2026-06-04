export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Products
export interface ProductDto {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa: string;
  descriptionEn: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  categoryNameKa: string;
  categoryNameEn: string;
  brandId: string;
  brandName: string;
  images: ProductImageDto[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
}

export interface ProductListDto {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  mainImageUrl: string | null;
  categoryNameKa: string;
  categoryNameEn: string;
  brandName: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isMain: boolean;
}

export interface PriceHistogramDto {
  min: number;
  max: number;
  buckets: number[];
}

// Categories
export interface CategoryDto {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa: string | null;
  descriptionEn: string | null;
  parentCategoryId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryTreeDto {
  id: string;
  nameKa: string;
  nameEn: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  children: CategoryTreeDto[];
}

// Brands
export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
}

// Auth
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  preferredLanguage: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  preferredLanguage?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Cart
export interface CartDto {
  id: string;
  items: CartItemDto[];
  total: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productNameKa: string;
  productNameEn: string;
  productSlug: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Orders
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "Card" | "CashOnDelivery" | "Installment";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingFullName: string;
  shippingPhoneNumber: string;
  shippingCity: string;
  shippingStreet: string;
  shippingPostalCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItemDto[];
  subTotal: number;
  shippingCost: number;
  discount: number;
  promoCode: string | null;
  total: number;
  currencyCode: string;
  notes: string | null;
  createdAt: string;
}

export interface OrderListDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingFullName: string;
  shippingPhoneNumber: string;
  shippingCity: string;
  shippingStreet: string;
  shippingPostalCode: string | null;
  total: number;
  currencyCode: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateOrderRequest {
  shippingFullName: string;
  shippingPhoneNumber: string;
  shippingCity: string;
  shippingStreet: string;
  shippingPostalCode?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  promoCode?: string;
}

// Reviews
export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

// Admin
export interface AdminCustomerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  preferredLanguage: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface AdminCustomerDetailDto extends AdminCustomerDto {
  recentOrders: CustomerOrderDto[];
}

export interface CustomerOrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

// Admin Dashboard
export interface DashboardStatsDto {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: RecentOrderDto[];
  topProducts: TopProductDto[];
  lowStockProducts: LowStockProductDto[];
}

export interface RecentOrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface TopProductDto {
  id: string;
  nameEn: string;
  nameKa: string;
  orderCount: number;
}

export interface LowStockProductDto {
  id: string;
  nameEn: string;
  nameKa: string;
  slug: string;
  stockQuantity: number;
}

// Admin Product Management
export interface CreateProductRequest {
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa: string;
  descriptionEn: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  brandId: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrls: string[];
}

export interface UpdateProductRequest extends CreateProductRequest {}

// Admin Category Management
export interface CreateCategoryRequest {
  nameKa: string;
  nameEn: string;
  slug: string;
  descriptionKa?: string;
  descriptionEn?: string;
  parentCategoryId?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// Admin Brand Management
export interface CreateBrandRequest {
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface UpdateBrandRequest extends CreateBrandRequest {}

// Admin Order Management
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// Discounts
export type DiscountScope = "Product" | "Category" | "Brand";
export type DealPlacement = "None" | "DealsPage" | "FlashSale" | "Featured";

export interface DiscountDto {
  id: string;
  scope: DiscountScope;
  targetId: string;
  targetName: string;
  percentage: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  titleKa: string;
  titleEn: string;
  imageUrl: string | null;
  placement: DealPlacement;
  showOnHome: boolean;
  showCountdown: boolean;
}

export interface CreateDiscountRequest {
  scope: DiscountScope;
  targetId: string;
  percentage: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  titleKa?: string | null;
  titleEn?: string | null;
  imageUrl?: string | null;
  placement: DealPlacement;
  showOnHome: boolean;
  showCountdown: boolean;
}

export interface UpdateDiscountRequest extends CreateDiscountRequest {}

// Public deals (curated, live discounts with Placement != None)
export interface DealDto {
  id: string;
  scope: DiscountScope;
  targetId: string;
  targetName: string;
  percentage: number;
  titleKa: string;
  titleEn: string;
  imageUrl: string | null;
  placement: DealPlacement;
  showOnHome: boolean;
  showCountdown: boolean;
  startsAt: string | null;
  endsAt: string | null;
  product: ProductListDto | null;
}

// Promo Codes
export type PromoDiscountType = "Percentage" | "FixedAmount";

export interface PromoCodeDto {
  id: string;
  code: string;
  type: PromoDiscountType;
  value: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  redemptionCount: number;
}

export interface ValidatePromoResult {
  code: string;
  discountAmount: number;
}

export interface CreatePromoCodeRequest {
  code: string;
  type: PromoDiscountType; // backend parses via Enum.TryParse
  value: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface UpdatePromoCodeRequest extends CreatePromoCodeRequest {
  id: string;
}

// Wishlist
export interface WishlistItemDto {
  id: string;
  productId: string;
  product: ProductListDto;
  addedAt: string;
}

// Admin Reviews
export interface AdminReviewDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

// Addresses
export interface AddressDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  street: string;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phoneNumber: string;
  city: string;
  street: string;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}

// Reports
export interface SalesSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
}

export interface RevenuePointDto {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySalesDto {
  categoryId: string;
  categoryName: string;
  revenue: number;
  unitsSold: number;
}

export interface ReportTopProductDto {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
}

export interface StatusCountDto {
  status: number;
  count: number;
}

export interface SalesReportDto {
  summary: SalesSummaryDto;
  revenueOverTime: RevenuePointDto[];
  salesByCategory: CategorySalesDto[];
  topProducts: ReportTopProductDto[];
  ordersByStatus: StatusCountDto[];
}

// Store Settings
export interface SettingsDto {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currencyCode: string;
  freeShippingThreshold: number;
  shippingCost: number;
  freeShippingCity: string;
  maintenanceMode: boolean;
  announcementEn: string | null;
  announcementKa: string | null;
}

export interface PublicSettingsDto {
  storeName: string;
  maintenanceMode: boolean;
  announcementEn: string | null;
  announcementKa: string | null;
}

export interface UpdateSettingsRequest {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currencyCode: string;
  freeShippingThreshold: number;
  shippingCost: number;
  freeShippingCity: string;
  maintenanceMode: boolean;
  announcementEn?: string | null;
  announcementKa?: string | null;
}
