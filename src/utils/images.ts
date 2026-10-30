import type { Product, Variant } from "@/types";

/** Old built-in placeholder artwork (SVG). Treated as "no image" so real uploads/photos always win. */
export const isPlaceholderImage = (u?: string | null) => !u || (u.startsWith("/images/") && u.endsWith(".svg"));
/** Transparent cut-outs (webp/png) look best contained on a tinted card; photographs fill their frame. */
export const isPhoto = (u?: string | null) => !!u && /\.(jpe?g)(\?|$)/i.test(u);

/** Single source of truth for "which picture represents this product/variant": the variant's own photo if an admin set one, otherwise the product's primary image. */
export function productImage(p: Pick<Product, "images">, v?: Pick<Variant, "image_url"> | null): string | null {
  if (v?.image_url && !isPlaceholderImage(v.image_url)) return v.image_url;
  return p.images?.find((u) => !isPlaceholderImage(u)) ?? null;
}

/** Gallery: variant photo first, then the product images, de-duplicated. */
export function productGallery(p: Pick<Product, "images">, v?: Pick<Variant, "image_url"> | null): string[] {
  return Array.from(new Set([v?.image_url, ...(p.images ?? [])].filter((u): u is string => !isPlaceholderImage(u))));
}

export const FLAVOR_CUTOUT: Record<string, string> = { turmeric: "/images/products/turmeric.webp", honey: "/images/products/honey.webp", guarana: "/images/products/guarana.webp" };
