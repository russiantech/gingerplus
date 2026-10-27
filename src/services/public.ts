import type { BlogPost, Bootstrap, CmsPage, Faq, Recipe, StorePublic, Testimonial } from "@/types";
import { api } from "./http";

export const publicService = {
  bootstrap: () => api.get<Bootstrap>("/content/bootstrap"),
  page: (slug: string) => api.get<CmsPage>(`/content/pages/${slug}`),
  blog: (category?: string) => api.get<BlogPost[]>("/content/blog", { category }),
  post: (slug: string) => api.get<BlogPost>(`/content/blog/${slug}`),
  recipes: (category?: string) => api.get<Recipe[]>("/content/recipes", { category }),
  recipe: (slug: string) => api.get<Recipe>(`/content/recipes/${slug}`),
  submitRecipe: (d: { submitted_by: string; email: string; title: string; category: string; ingredients: string[]; steps: string[] }) => api.post<{ detail: string }>("/content/recipes/submit", d),
  testimonials: () => api.get<Testimonial[]>("/content/testimonials"),
  submitReview: (d: { author_name: string; author_role?: string; quote: string; rating: number }) => api.post<{ detail: string }>("/content/reviews", d),
  faqs: () => api.get<Faq[]>("/content/faqs"),
  contact: (d: { name: string; email: string; phone?: string; subject: string; message: string; extra?: Record<string, unknown>; website?: string }) => api.post<{ detail: string }>("/contact", d),
  subscribe: (email: string, name?: string) => api.post<{ detail: string }>("/newsletter/subscribe", { email, name }),
  stores: (state?: string) => api.get<StorePublic[]>("/stores", { state }),
  states: () => api.get<string[]>("/stores/states"),
  nearest: (q: { state?: string; lat?: number; lng?: number }) => api.get<{ store: StorePublic | null; reason: string }>("/stores/nearest", q),
  distributorApply: (d: Record<string, unknown>) => api.post<{ detail: string }>("/stores/signup", d),
  track: (d: { session_id: string; path: string; referrer?: string | null; utm_source?: string | null }) => api.post("/analytics/track", d),
};
