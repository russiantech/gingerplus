import type { AdminOrder, Application, Category, ContactMessage, CustomerListItem, DashboardData, EmailMessage, Paginated, Payment, Product, ProductInput,
  Promotion, PromotionInput, Role, ShippingRate, Store, StoreInput, Subscriber, TrafficData, User, HeroSlide, CmsPage, BlogPost, Recipe, Testimonial, Faq,
  Address, Order, StorePublic, SiteSettings } from "@/types";
import { api } from "../http";

type Q = Record<string, string | number | boolean | null | undefined>;
const crud = <T, I = Partial<T>>(base: string) => ({
  list: (q?: Q) => api.get<T[]>(base, q),
  get: (id: string) => api.get<T>(`${base}/${id}`),
  create: (d: I) => api.post<T>(base, d),
  update: (id: string, d: Partial<I>) => api.patch<T>(`${base}/${id}`, d),
  remove: (id: string) => api.del<{ detail: string }>(`${base}/${id}`),
});

export const adminApi = {
  dashboard: (days = 30) => api.get<DashboardData>("/admin/dashboard", { days }),
  traffic: (days = 30) => api.get<TrafficData>("/admin/traffic", { days }),

  products: {
    list: (q?: Q) => api.get<Paginated<Product>>("/admin/products", q),
    get: (id: string) => api.get<Product>(`/admin/products/${id}`),
    create: (d: ProductInput) => api.post<Product>("/admin/products", d),
    update: (id: string, d: Partial<ProductInput>) => api.patch<Product>(`/admin/products/${id}`, d),
    remove: (id: string) => api.del<{ detail: string }>(`/admin/products/${id}`),
    setStock: (variantId: string, stock: number) => api.patch(`/admin/variants/${variantId}/stock`, { stock }),
  },
  categories: crud<Category>("/admin/categories"),
  promotions: crud<Promotion, PromotionInput>("/admin/promotions"),

  orders: {
    list: (q?: Q) => api.get<Paginated<AdminOrder>>("/admin/orders", q),
    get: (id: string) => api.get<AdminOrder>(`/admin/orders/${id}`),
    create: (d: Record<string, unknown>) => api.post<{ order: Order; authorization_url?: string | null; next_step: string }>("/admin/orders", d),
    update: (id: string, d: { internal_notes?: string; tracking_note?: string; delivery_fee?: number }) => api.patch<AdminOrder>(`/admin/orders/${id}`, d),
    setStatus: (id: string, status: string, note?: string, notify_customer = true) => api.post<AdminOrder>(`/admin/orders/${id}/status`, { status, note, notify_customer }),
    assignStore: (id: string, store_id: string | null) => api.post<AdminOrder>(`/admin/orders/${id}/assign-store`, { store_id }),
    suggestStore: (id: string) => api.post<{ store: StorePublic | null; reason: string }>(`/admin/orders/${id}/suggest-store`),
    approveStore: (id: string) => api.post<AdminOrder>(`/admin/orders/${id}/approve-store`),
    rejectStore: (id: string) => api.post<AdminOrder>(`/admin/orders/${id}/reject-store`),
    recordPayment: (id: string, amount: number, note?: string, channel = "bank_transfer") => api.post<Payment>(`/admin/orders/${id}/payments`, { order_id: id, amount, note, channel }),
  },
  shippingRates: crud<ShippingRate>("/admin/shipping-rates"),

  payments: {
    list: (q?: Q) => api.get<Paginated<Payment>>("/admin/payments", q),
    stats: () => api.get<Record<string, { count: number; amount: number }>>("/admin/payments/stats"),
    verify: (id: string) => api.post<Payment>(`/admin/payments/${id}/verify`),
    confirmManually: (id: string, note?: string) => api.post<Payment>(`/admin/payments/${id}/confirm-manually`, { note }),
  },

  customers: {
    list: (q?: Q) => api.get<Paginated<CustomerListItem>>("/admin/customers", q),
    get: (id: string) => api.get<{ customer: CustomerListItem; addresses: Address[]; orders: Order[]; linked_store: StorePublic | null }>(`/admin/customers/${id}`),
    update: (id: string, d: Record<string, unknown>) => api.patch<CustomerListItem>(`/admin/customers/${id}`, d),
    suggestStore: (id: string) => api.post<{ store: StorePublic | null; reason: string }>(`/admin/customers/${id}/suggest-store`),
  },

  users: {
    list: (q?: Q) => api.get<Paginated<User>>("/admin/users", q),
    create: (d: Record<string, unknown>) => api.post<User>("/admin/users", d),
    update: (id: string, d: Record<string, unknown>) => api.patch<User>(`/admin/users/${id}`, d),
  },
  roles: {
    list: () => api.get<Role[]>("/admin/roles"),
    create: (d: { key: string; name: string; description?: string; permissions: string[] }) => api.post<Role>("/admin/roles", d),
    update: (id: string, d: Partial<{ name: string; description: string; permissions: string[] }>) => api.patch<Role>(`/admin/roles/${id}`, d),
    remove: (id: string) => api.del<{ detail: string }>(`/admin/roles/${id}`),
    permissions: () => api.get<{ key: string; group: string }[]>("/admin/permissions"),
  },

  stores: {
    list: (q?: Q) => api.get<Paginated<Store>>("/admin/stores", q),
    get: (id: string) => api.get<Store>(`/admin/stores/${id}`),
    create: (d: StoreInput) => api.post<Store>("/admin/stores", d),
    update: (id: string, d: Partial<StoreInput>) => api.patch<Store>(`/admin/stores/${id}`, d),
    remove: (id: string) => api.del<{ detail: string }>(`/admin/stores/${id}`),
  },
  applications: {
    list: (q?: Q) => api.get<Paginated<Application>>("/admin/applications", q),
    update: (id: string, d: { status?: string; admin_notes?: string }) => api.patch<Application>(`/admin/applications/${id}`, d),
    approve: (id: string, d: Record<string, unknown>) => api.post<Store>(`/admin/applications/${id}/approve`, d),
  },

  emails: {
    list: (q?: Q) => api.get<Paginated<EmailMessage>>("/admin/emails", q),
    unread: () => api.get<{ unread: number }>("/admin/emails/unread-count"),
    thread: (id: string) => api.get<EmailMessage[]>(`/admin/emails/thread/${id}`),
    send: (d: { to_email: string; subject: string; body: string; thread_id?: string; contact_message_id?: string; order_id?: string }) => api.post<EmailMessage>("/admin/emails", d),
    flag: (id: string, d: { is_read?: boolean; is_starred?: boolean; is_archived?: boolean }) => api.patch<EmailMessage>(`/admin/emails/${id}`, d),
  },
  contacts: {
    list: (q?: Q) => api.get<Paginated<ContactMessage>>("/admin/contacts", q),
    update: (id: string, d: { status?: string; assigned_to_id?: string | null }) => api.patch<ContactMessage>(`/admin/contacts/${id}`, d),
  },
  subscribers: {
    list: (q?: Q) => api.get<Paginated<Subscriber>>("/admin/subscribers", q),
    remove: (id: string) => api.del<{ detail: string }>(`/admin/subscribers/${id}`),
  },

  content: {
    settings: () => api.get<SiteSettings>("/admin/content/settings"),
    saveSetting: (key: string, value: Record<string, unknown>, is_public = true) => api.put(`/admin/content/settings/${key}`, { value, is_public }),
    hero: crud<HeroSlide>("/admin/content/hero"),
    pages: crud<CmsPage>("/admin/content/pages"),
    blog: crud<BlogPost>("/admin/content/blog"),
    recipes: crud<Recipe>("/admin/content/recipes"),
    testimonials: crud<Testimonial>("/admin/content/testimonials"),
    faqs: crud<Faq>("/admin/content/faqs"),
  },
  media: { upload: (file: File) => api.upload<{ url: string; filename: string; size: number }>("/admin/media", file) },
  partner: {
    store: () => api.get<Store>("/partner/store"),
    orders: () => api.get<AdminOrder[]>("/partner/orders"),
    setStatus: (id: string, status: string, note?: string) => api.post<AdminOrder>(`/partner/orders/${id}/status`, { status, note }),
  },
};
