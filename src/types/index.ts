/** Friendly aliases over the generated OpenAPI types. Regenerate with `npm run gen:types`. */
import type { components } from "./openapi";

type S = components["schemas"];

export type User = S["UserOut"];
export type Role = S["RoleOut"];
export type TokenPair = S["TokenPair"];
export type AuthResponse = S["AuthResponse"];
export type Address = S["AddressOut"];
export type AddressInput = S["AddressIn"];
export type Category = S["CategoryOut"];
export type Product = Omit<S["ProductOut"], "images" | "benefits" | "how_to_enjoy" | "nutrition" | "attributes"> & { images: string[]; benefits: string[]; how_to_enjoy: string[]; nutrition: Record<string, string>; attributes: Record<string, unknown> };
export type Variant = S["VariantOut"];
export type ProductInput = S["ProductIn"];
export type VariantInput = S["VariantIn"];
export type Promotion = Omit<S["PromotionOut"], "product_ids" | "category_ids"> & { product_ids: string[]; category_ids: string[] };
export type PromotionInput = S["PromotionIn"];
export type Quote = S["Quote"];
export type QuoteLine = S["QuoteLine"];
export type CheckoutRequest = S["CheckoutRequest"];
export type CheckoutResponse = S["CheckoutResponse"];
export type InitPayment = S["InitPaymentResponse"];
export type PaymentStatusOut = S["PaymentPublicStatus"];
export type PaymentConfig = S["PaymentConfigOut"];
export type BankDetails = S["BankDetails"];
export type PaymentProviderInfo = Omit<S["ProviderOut"], "extra"> & { extra: Record<string, string> };
export type ProviderUpdate = S["ProviderUpdate"];
export type ProviderTestResult = S["TestResult"];
export type Order = S["OrderOut"];
export type AdminOrder = S["AdminOrderOut"];
export type Payment = S["PaymentOut"];
export type Store = Omit<S["StoreOut"], "coverage_states"> & { coverage_states: string[] };
export type StorePublic = Omit<S["StorePublic"], "coverage_states"> & { coverage_states: string[] };
export type StoreInput = S["StoreIn"];
export type Application = S["ApplicationOut"];
export type ContactMessage = S["ContactOut"];
export type EmailMessage = S["EmailOut"];
export type Subscriber = S["SubscriberOut"];
export type HeroSlide = S["HeroSlideOut"];
export type CmsPage = Omit<S["PageOut"], "blocks"> & { blocks: CmsBlock[] };
export type BlogPost = S["BlogOut"];
export type Recipe = Omit<S["RecipeOut"], "ingredients" | "steps"> & { ingredients: string[]; steps: string[] };
export type Testimonial = S["TestimonialOut"];
export type Faq = S["FaqOut"];
export type ShippingRate = S["ShippingRateOut"];
export type CustomerListItem = S["CustomerListItem"];

export type OrderStatus = S["OrderStatus"];
export type PaymentStatus = S["PaymentStatus"];
export type PaymentMethod = S["PaymentMethod"];
export type OrderChannel = S["OrderChannel"];

export interface Paginated<T> { items: T[]; total: number; page: number; page_size: number; pages: number }

// ---- hand-typed shapes for untyped (dict) endpoints ----
export interface SiteSettings {
  brand: { name: string; product_line: string; slogan: string; taglines: string[] };
  contact: { email: string; press_email: string; phone: string; phone_hours: string; whatsapp_numbers: string[]; address: string; maps_url: string };
  social: { instagram: string; facebook: string; tiktok: string; handle: string };
  commerce: { online_payment_max_packs: number; allow_online_wholesale: boolean; wholesale_min_packs: number; auto_suggest_store: boolean; default_delivery_fee: number; free_delivery_over: number | null; currency: string; bank_details?: string };
  announcement: { enabled: boolean; text: string };
}
export interface Bootstrap {
  settings: SiteSettings;
  hero: HeroSlide[];
  footer_pages: { slug: string; title: string }[];
  banners: { id: string; text: string; code: string | null }[];
}
export interface DashboardData {
  days: number;
  kpis: { revenue: number; revenue_prev: number; orders: number; orders_prev: number; new_customers: number; new_customers_prev: number; avg_order_value: number; pending_orders: number; unpaid_orders: number; pending_store_approvals: number };
  series: { date: string; orders: number; order_value: number; revenue: number }[];
  orders_by_status: { status: string; count: number }[];
  orders_by_channel: { channel: string; count: number; total: number }[];
  sales_by_state: { state: string; orders: number; total: number }[];
  top_products: { name: string; variant: string; quantity: number; revenue: number }[];
  low_stock: { sku: string; label: string; stock: number }[];
  recent_orders: { id: string; number: string; customer: string; total: number; status: string; payment_status: string; created_at: string }[];
}
export interface TrafficData {
  days: number; page_views: number; visitors: number; bounce_rate: number;
  series: { date: string; views: number; visitors: number }[];
  top_pages: { label: string; count: number }[]; referrers: { label: string; count: number }[];
  devices: { label: string; count: number }[]; browsers: { label: string; count: number }[];
}
export interface CmsBlock { type: string; heading?: string; body?: string; [k: string]: unknown }
export interface CartLine { variantId: string; quantity: number; productName: string; variantLabel: string; image?: string | null; unitPrice: number; productSlug: string }
