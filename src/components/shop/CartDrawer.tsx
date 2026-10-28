import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Img, QtyStepper } from "@/components/common";
import { useCart } from "@/contexts/CartContext";
import { useSite } from "@/contexts/SiteContext";
import { money, waLink } from "@/utils/format";
import "@/styles/commerce.css";

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, subtotal, count } = useCart();
  const { settings } = useSite();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const max = settings.commerce.online_payment_max_packs;
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [open, setOpen]);
  if (!open) return null;

  return (
    <>
      <div className="offcanvas-backdrop fade show" style={{ zIndex: 1075 }} onClick={() => setOpen(false)} />
      <aside className="offcanvas offcanvas-end show cart-drawer" style={{ zIndex: 1080 }} role="dialog" aria-label="Shopping cart">
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold"><i className="ri-shopping-bag-3-line me-2 text-gold" />Your cart <span className="text-muted fs-6">({count})</span></h5>
          <button className="btn-close" onClick={() => setOpen(false)} aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          {lines.length === 0 ? (
            <div className="text-center my-auto py-5">
              <i className="ri-shopping-basket-line display-3 text-brown opacity-50" />
              <h6 className="mt-3">Your cart is empty</h6><p className="text-muted fs-sm">Three bold blends are waiting for you.</p>
              <Link to="/shop" className="btn btn-primary btn-pill">Shop Ginger Plus</Link>
            </div>
          ) : (
            <>
              <div className="flex-grow-1">
                {lines.map((l) => (
                  <div className="cart-line" key={l.variantId}>
                    <Img src={l.image ?? undefined} alt={l.productName} className="thumb-lg" />
                    <div className="flex-grow-1 min-w-0">
                      <Link to={`/products/${l.productSlug}`} className="fw-semibold text-body text-decoration-none d-block lh-tight">{l.productName}</Link>
                      <div className="text-muted fs-sm mb-2">{l.variantLabel}</div>
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <QtyStepper size="sm" value={l.quantity} onChange={(n) => setQty(l.variantId, n)} />
                        <span className="fw-bold">{money(l.unitPrice * l.quantity)}</span>
                      </div>
                    </div>
                    <button className="btn btn-link text-muted p-0 align-self-start" onClick={() => remove(l.variantId)} aria-label={`Remove ${l.productName}`}><i className="ri-close-line fs-5" /></button>
                  </div>
                ))}
              </div>
              {count >= max && (
                <div className="alert alert-warning fs-sm mt-3 mb-0 py-2"><i className="ri-store-2-line me-1" />Wholesale quantity — you can order online or via{" "}
                  <a href={waLink(settings.contact.whatsapp_numbers?.[0] ?? "", "Hello Southern Rose, I'd like a wholesale quote.")} target="_blank" rel="noreferrer" className="fw-semibold">WhatsApp</a>.</div>
              )}
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="offcanvas-footer border-top p-3">
            <div className="d-flex justify-content-between fw-bold mb-1"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <p className="text-muted fs-xs mb-3">Delivery &amp; discounts are calculated at checkout.</p>
            <button className="btn btn-primary w-100 btn-lg mb-2" onClick={() => nav("/checkout")}>Checkout <i className="ri-arrow-right-line" /></button>
            <Link to="/cart" className="btn btn-outline-primary w-100">View full cart</Link>
          </div>
        )}
      </aside>
    </>
  );
}
