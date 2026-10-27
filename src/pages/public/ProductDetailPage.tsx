import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ErrorState, Img, Money, PageLoader, QtyStepper } from "@/components/common";
import FlavorChip from "@/components/shop/FlavorChip";
import ProductCard, { unitPrice } from "@/components/shop/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { shopService } from "@/services/shop";
import { waLink } from "@/utils/format";
import "@/styles/storefront.css";
import NotFoundPage from "./NotFoundPage";

export default function ProductDetailPage() {
  const { slug = "" } = useParams(); const [sp, setSp] = useSearchParams();
  const { data: p, loading, error, reload } = useAsync(() => shopService.product(slug), [slug]);
  const related = useAsync(() => shopService.products(), []);
  const { add } = useCart(); const toast = useToast(); const { settings } = useSite();
  const [qty, setQty] = useState(1); const [img, setImg] = useState(0);
  useDocumentTitle(p?.meta_title || p?.name);
  const variant = useMemo(() => p?.variants.find((v) => v.id === sp.get("variant")) ?? p?.variants[0], [p, sp]);
  useEffect(() => setImg(0), [variant?.id]);
  if (loading) return <PageLoader />;
  if (error?.toLowerCase().includes("not found") || (!p && !error)) return <NotFoundPage />;
  if (error || !p || !variant) return <div className="container py-5"><ErrorState message={error ?? "Product unavailable"} onRetry={reload} /></div>;

  const price = unitPrice(variant); const packs = Number(variant.pack_equivalent) * qty;
  const tier = [...variant.tiers].reverse().find((t) => qty >= t.min_qty);
  const shown = tier ? tier.price : price; const wholesale = packs >= settings.commerce.online_payment_max_packs;
  const gallery = Array.from(new Set([variant.image_url, ...p.images].filter(Boolean) as string[]));
  const wa = waLink(settings.contact.whatsapp_numbers[0] ?? "", `Hello Southern Rose, I'd like to buy wholesale: ${qty} × ${p.name} (${variant.label}).`);
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.short_description, offers: { "@type": "Offer", priceCurrency: "NGN", price: price, availability: variant.in_stock ? "InStock" : "OutOfStock" } };

  return (
    <div className="container py-4 py-md-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="fs-sm mb-3 text-muted"><Link to="/" className="text-muted">Home</Link> / <Link to="/shop" className="text-muted">Shop</Link> / <span className="text-body">{p.name}</span></nav>
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="gallery-main position-relative"><FlavorChip flavor={p.flavor} /><Img src={gallery[img]} alt={p.name} loading="eager" /></div>
          {gallery.length > 1 && <div className="d-flex gap-2 mt-3">{gallery.map((g, i) => <button key={g} className={`thumb-btn ${i === img ? "active" : ""}`} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><Img src={g} alt="" /></button>)}</div>}
        </div>
        <div className="col-lg-6">
          <h1 className="h2 fw-bold mb-1">{p.name} — {variant.size_label} (Pack of {variant.unit_count})</h1>
          <p className="text-muted">{p.tagline}</p>
          <div className="d-flex align-items-baseline gap-2 mb-1"><span className="price-tag fs-2"><Money value={shown} /></span>{shown < variant.price && <Money value={variant.price} strike />}<span className="text-muted">per pack</span>
            {variant.promo_label && <span className="badge bg-danger">{variant.promo_label}</span>}</div>
          {variant.tiers.length > 0 && <p className="fs-sm text-success mb-3"><i className="ri-price-tag-3-line" /> {variant.tiers.map((t) => `${t.min_qty}+ packs: ₦${Number(t.price).toLocaleString()} each`).join(" · ")}</p>}
          <p>{p.short_description}</p>
          <div className="mb-3"><div className="fw-semibold fs-sm mb-2">Pack size</div><div className="d-flex gap-2 flex-wrap">
            {p.variants.map((v) => <button key={v.id} className={`size-pill ${v.id === variant.id ? "active" : ""}`} onClick={() => setSp({ variant: v.id }, { replace: true })}>
              <div className="fw-bold">{v.size_label}</div><div className="fs-xs text-muted">Pack of {v.unit_count} · <Money value={unitPrice(v)} /></div></button>)}</div></div>
          <div className="d-flex gap-3 align-items-center flex-wrap mb-3"><QtyStepper value={qty} onChange={setQty} />
            <button className="btn btn-primary btn-lg px-4 flex-grow-1" disabled={!variant.in_stock} onClick={() => { add(p, variant, qty); toast.success("Added to cart"); }}>
              <i className="ri-shopping-bag-3-line me-2" />{variant.in_stock ? `Add to Cart · ₦${(shown * qty).toLocaleString()}` : "Out of stock"}</button></div>
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-outline-primary w-100 mb-3"><i className="ri-whatsapp-line me-2" />Buy Wholesale on WhatsApp</a>
          {wholesale && <div className="alert alert-warning fs-sm"><i className="ri-information-line me-1" />{packs}+ packs counts as a wholesale order — you can still pay online, or complete it on WhatsApp.</div>}
          <div className="bg-cream rounded-xl p-3 fs-sm"><div className="fw-semibold mb-1">Order options</div>Single bottle (sample on request) · 12-pack · 24-pack (standard) · Wholesale (20+ packs). Pay online for orders under {settings.commerce.online_payment_max_packs} packs.
            <div className="mt-2 text-muted"><i className="ri-truck-line me-1" />Nationwide delivery 2–5 working days. Mix 350ml and 125ml in one order.</div></div>
        </div>
      </div>
      <div className="row g-4 mt-4">
        {p.benefits.length > 0 && <div className="col-md-6"><h4 className="display-font fw-bold">Key Benefits</h4><ul className="list-unstyled">{p.benefits.map((b) => <li key={b} className="d-flex gap-2 mb-2"><i className="ri-checkbox-circle-fill text-success mt-1" />{b}</li>)}</ul></div>}
        {p.how_to_enjoy.length > 0 && <div className="col-md-6"><h4 className="display-font fw-bold">How to Enjoy</h4><ul className="list-unstyled">{p.how_to_enjoy.map((b) => <li key={b} className="d-flex gap-2 mb-2"><i className="ri-cup-line text-brown mt-1" />{b}</li>)}</ul></div>}
        {p.ingredients && <div className="col-md-6"><h4 className="display-font fw-bold">Ingredients</h4><p className="text-muted">{p.ingredients}</p></div>}
        {p.storage && <div className="col-md-6"><h4 className="display-font fw-bold">Storage</h4><p className="text-muted">{p.storage}</p></div>}
        {Object.keys(p.nutrition).length > 0 && <div className="col-md-6"><h4 className="display-font fw-bold">Nutritional Information <small className="fs-sm text-muted">(per {variant.size_label})</small></h4>
          <table className="table table-sm"><tbody>{Object.entries(p.nutrition).map(([k, v]) => <tr key={k}><td>{k}</td><td className="text-end fw-semibold">{v}</td></tr>)}</tbody></table></div>}
      </div>
      {related.data && <div className="mt-5"><h3 className="display-font fw-bold mb-3">You may also like</h3><div className="row g-4">
        {related.data.filter((x) => x.id !== p.id).flatMap((x) => x.variants.filter((v) => v.size_label === variant.size_label).map((v) => ({ x, v }))).slice(0, 3).map(({ x, v }) => <div key={v.id} className="col-md-4"><ProductCard product={x} variant={v} /></div>)}</div></div>}
    </div>
  );
}
