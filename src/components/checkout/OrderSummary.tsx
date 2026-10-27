import { Img } from "@/components/common";
import type { Quote } from "@/types";
import { money } from "@/utils/format";

export default function OrderSummary({ quote, loading, error, coupon }: { quote: Quote | null; loading: boolean; error?: string | null; coupon?: React.ReactNode }) {
  return (
    <div className="card border-0 shadow-soft summary-card"><div className="card-body">
      <h6 className="fw-bold mb-3">Order summary</h6>
      {error && <div className="alert alert-danger py-2 fs-sm">{error}</div>}
      {!quote && loading && <div className="skeleton" style={{ height: 120 }} />}
      {quote && (<div style={{ opacity: loading ? 0.6 : 1 }}>
        {quote.lines.map((l) => (
          <div key={l.variant_id} className="d-flex gap-2 align-items-center mb-2">
            <Img src={l.image_url ?? undefined} alt="" className="order-thumb" />
            <div className="flex-grow-1 min-w-0 fs-sm"><div className="fw-semibold text-truncate">{l.product_name}</div>
              <div className="text-muted">{l.variant_label} × {l.quantity}{l.tier_label && <span className="badge badge-soft-success ms-1">{l.tier_label}</span>}{l.promo_label && <span className="badge badge-soft-warning ms-1">{l.promo_label}</span>}</div>
              {!l.available && <div className="text-danger fs-xs">Limited stock — we'll confirm availability</div>}</div>
            <div className="fw-semibold fs-sm">{money(l.line_total)}</div>
          </div>))}
        {coupon}
        <div className="border-top pt-2 mt-2">
          <div className="summary-line"><span>Subtotal</span><span>{money(quote.subtotal)}</span></div>
          {quote.discount_total > 0 && <div className="summary-line text-success"><span>Coupon {quote.coupon_code}</span><span>−{money(quote.discount_total)}</span></div>}
          <div className="summary-line"><span>Delivery</span><span>{quote.delivery_fee ? money(quote.delivery_fee) : "Free"}</span></div>
          {quote.eta_min_days != null && <div className="text-muted fs-xs">Estimated {quote.eta_min_days}–{quote.eta_max_days} working days</div>}
          <div className="summary-line summary-total"><span>Total</span><span>{money(quote.total)}</span></div>
          <div className="text-muted fs-xs mt-1">{quote.total_packs} pack{quote.total_packs === 1 ? "" : "s"}</div>
        </div></div>)}
    </div></div>
  );
}
