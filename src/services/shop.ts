import type { Category, CheckoutRequest, CheckoutResponse, Order, Product, Promotion, Quote } from "@/types";
import { api } from "./http";

export interface InitPayment { reference: string; authorization_url: string; access_code?: string | null; amount: number }
export interface PaymentStatusOut { reference: string; status: "unpaid" | "pending" | "paid" | "failed" | "refunded"; amount: number; order_number?: string | null; paid_at?: string | null }

export const shopService = {
  categories: () => api.get<Category[]>("/catalog/categories"),
  products: (q?: { category?: string; flavor?: string; q?: string; featured?: boolean }) => api.get<Product[]>("/catalog/products", q),
  product: (slug: string) => api.get<Product>(`/catalog/products/${slug}`),
  banners: () => api.get<Promotion[]>("/catalog/promotions/banners"),
  quote: (items: { variant_id: string; quantity: number }[], state?: string, coupon_code?: string) =>
    api.post<Quote>("/checkout/quote", { items, state, coupon_code }),
  checkout: (d: CheckoutRequest) => api.post<CheckoutResponse>("/checkout", d),
  track: (number: string, email: string) => api.post<Order>("/orders/track", { number, email }),
  payOrder: (number: string, email: string) => api.post<InitPayment>("/orders/pay", { number, email }),
  payDirect: (d: { name: string; email: string; phone?: string; amount: number; order_number?: string; description?: string }) =>
    api.post<InitPayment>("/payments/direct", d),
  verifyPayment: (reference: string) => api.get<PaymentStatusOut>(`/payments/verify/${reference}`),
};
