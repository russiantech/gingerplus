import { Link } from "react-router-dom";
import { Img, Money } from "@/components/common";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import type { Product, Variant } from "@/types";
import "@/styles/storefront.css";
import FlavorChip from "./FlavorChip";

export const variantImage = (p: Product, v?: Variant) => v?.image_url ?? p.images[0] ?? null;
export const unitPrice = (v: Variant) => v.effective_price ?? v.price;

export default function ProductCard({ product, variant }: { product: Product; variant: Variant }) {
  const { add } = useCart(); const toast = useToast();
  const price = unitPrice(variant); const onSale = price < variant.price;
  const tier = variant.tiers?.[0];
  const to = `/products/${product.slug}?variant=${variant.id}`;
  return (
    <div className="product-card d-flex flex-column">
      <Link to={to} className="media text-decoration-none">
        <FlavorChip flavor={product.flavor} />
        {variant.promo_label && <span className="badge bg-danger position-absolute top-0 end-0 m-2">{variant.promo_label}</span>}
        <Img src={variantImage(product, variant)} alt={`${product.name} ${variant.label}`} />
      </Link>
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="text-muted fs-xs text-uppercase fw-semibold">{variant.label}</div>
        <Link to={to} className="text-body text-decoration-none"><h3 className="h6 fw-bold mb-1" style={{ fontFamily: "var(--sr-font-body)" }}>{product.name.replace("Southern Rose ", "")}</h3></Link>
        <p className="text-muted fs-sm mb-2">{product.tagline}</p>
        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-2 mb-1"><span className="price-tag"><Money value={price} /></span>{onSale && <Money value={variant.price} strike />}<span className="text-muted fs-xs">/ pack</span></div>
          {tier && <div className="fs-xs text-success mb-2"><i className="ri-price-tag-3-line" /> {tier.min_qty}+ packs: <Money value={tier.price} /> each</div>}
          <div className="d-flex gap-2">
            <button className="btn btn-primary flex-grow-1" disabled={!variant.in_stock} onClick={() => { add(product, variant, 1); toast.success("Added to cart"); }}>
              <i className="ri-shopping-bag-3-line me-1" />{variant.in_stock ? "Add to cart" : "Out of stock"}</button>
            <Link to={to} className="btn btn-outline-primary" aria-label="View product"><i className="ri-eye-line" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
