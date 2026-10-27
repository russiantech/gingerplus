import { Link, useNavigate } from "react-router-dom";
import { EmptyState, Img, QtyStepper } from "@/components/common";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/contexts/CartContext";
import { useDocumentTitle } from "@/hooks";
import { useQuote } from "@/hooks/useQuote";
import { money } from "@/utils/format";
import "@/styles/commerce.css";

export default function CartPage() {
  useDocumentTitle("Your cart");
  const { lines, setQty, remove, clear } = useCart();
  const nav = useNavigate();
  const { quote, loading, error } = useQuote(lines);
  if (!lines.length) return <div className="container py-5"><EmptyState icon="ri-shopping-basket-line" title="Your cart is empty" text="Add a blend to get started." action={<Link to="/shop" className="btn btn-primary btn-pill">Shop Ginger Plus</Link>} /></div>;
  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4"><h1 className="h2 fw-bold mb-0">Your cart</h1><button className="btn btn-link text-muted" onClick={clear}>Clear cart</button></div>
      <div className="row g-4">
        <div className="col-lg-8"><div className="card border-0 shadow-soft"><div className="card-body">
          {lines.map((l) => (
            <div className="cart-line" key={l.variantId}>
              <Img src={l.image ?? undefined} alt={l.productName} className="thumb-lg" />
              <div className="flex-grow-1 min-w-0">
                <Link to={`/products/${l.productSlug}`} className="fw-semibold text-body text-decoration-none">{l.productName}</Link>
                <div className="text-muted fs-sm mb-2">{l.variantLabel} · {money(l.unitPrice)} each</div>
                <QtyStepper value={l.quantity} onChange={(n) => setQty(l.variantId, n)} size="sm" />
              </div>
              <div className="text-end"><div className="fw-bold">{money(l.unitPrice * l.quantity)}</div><button className="btn btn-link text-danger p-0 fs-sm" onClick={() => remove(l.variantId)}>Remove</button></div>
            </div>))}
          <Link to="/shop" className="btn btn-link ps-0 mt-2"><i className="ri-arrow-left-line" /> Continue shopping</Link>
        </div></div></div>
        <div className="col-lg-4"><OrderSummary quote={quote} loading={loading} error={error} />
          {quote?.is_wholesale && <div className="wholesale-banner mt-3 fs-sm"><i className="ri-store-2-line me-1" />Wholesale quantity detected — wholesale pricing applied. Order via WhatsApp or pay online at checkout.</div>}
          <button className="btn btn-primary btn-lg w-100 mt-3" onClick={() => nav("/checkout")}>Proceed to checkout</button></div>
      </div>
    </div>
  );
}
