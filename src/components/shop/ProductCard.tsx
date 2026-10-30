import { Link } from "react-router-dom";
import { Img, Money } from "@/components/common";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import type { Product, Variant } from "@/types";
import "@/styles/storefront.css";
import { FLAVOR_COLOR } from "@/utils/constants";
import { isPhoto, productImage } from "@/utils/images";
import FlavorChip from "./FlavorChip";

export const variantImage = productImage;
export const unitPrice = (v: Variant) => v.effective_price ?? v.price;

export default function ProductCard({ product, variant }: { product: Product; variant: Variant }) {
  const { add } = useCart(); const toast = useToast();
  const price = unitPrice(variant); const onSale = price < variant.price;
  const tier = variant.tiers?.[0];
  const to = `/products/${product.slug}?variant=${variant.id}`;
  const tint = FLAVOR_COLOR[product.flavor ?? ""] ?? "#e8a317";
  return (
    <article className="product-card">
      <div className="media" style={{ ["--tint" as string]: tint }}>
        <FlavorChip flavor={product.flavor} />
        {variant.promo_label && <span className="badge bg-danger rounded-pill position-absolute" style={{ top: 44, left: 12, zIndex: 2 }}>{variant.promo_label}</span>}
        <Link to={to} className="eye" aria-label={`View ${product.name}`}><span className="circle-btn light"><i className="ri-arrow-right-up-line" /></span></Link>
        <Link to={to} className="text-decoration-none"><Img src={variantImage(product, variant)} className={isPhoto(variantImage(product, variant)) ? "photo" : ""} alt={`${product.name} ${variant.label}`} /></Link>
      </div>
      <div className="info">
        <span className="size-tag"><i className="ri-goblet-line" />{variant.label}</span>
        <Link to={to} className="text-body text-decoration-none"><h3 className="h6 fw-bold mb-1" style={{ fontFamily: "var(--sr-font-body)", letterSpacing: 0 }}>{product.name.replace("Southern Rose ", "")}</h3></Link>
        <p className="text-muted fs-sm mb-3">{product.tagline}</p>
        <div className="mt-auto d-flex align-items-end justify-content-between gap-2">
          <div>
            <div className="d-flex align-items-baseline gap-2 flex-wrap"><span className="price-tag"><Money value={price} /></span>{onSale && <Money value={variant.price} strike />}</div>
            <div className="text-muted fs-xs">per pack{tier ? <> · <span className="text-success fw-semibold">{tier.min_qty}+ packs <Money value={tier.price} /></span></> : null}</div>
          </div>
          <button className="add-circle" disabled={!variant.in_stock} aria-label={variant.in_stock ? "Add to cart" : "Out of stock"} title={variant.in_stock ? "Add to cart" : "Out of stock"}
            onClick={() => { add(product, variant, 1); toast.success("Added to cart"); }}><i className={variant.in_stock ? "ri-add-line" : "ri-forbid-line"} /></button>
        </div>
      </div>
    </article>
  );
}
