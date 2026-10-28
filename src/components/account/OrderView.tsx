import { useState } from "react";
import { Link } from "react-router-dom";
import { Img, Spinner, StatusBadge } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/http";
import { shopService } from "@/services/shop";
import type { Order } from "@/types";
import { dateTime, money, titleCase, waLink } from "@/utils/format";
import { usePayment } from "@/components/payments/PaymentProvider";

const LABEL: Record<string, string> = { pending: "Order placed", confirmed: "Confirmed", processing: "Being prepared", dispatched: "On its way", delivered: "Delivered", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded", store_assigned: "Dealer assigned", partial_payment: "Part payment received" };

export function OrderTimeline({ order }: { order: Order }) {
  const events = [...order.history].filter((h) => h.is_public).reverse();
  if (!events.length) return <p className="text-muted fs-sm mb-0">No updates yet.</p>;
  return (
    <div className="timeline">{events.map((h, i) => (
      <div className="timeline-item" key={i}><div className="fw-semibold">{LABEL[h.status] ?? titleCase(h.status)}</div>
        {h.note && <div className="text-muted fs-sm">{h.note}</div>}<div className="text-muted fs-xs">{dateTime(h.created_at)}</div></div>))}</div>
  );
}

/** Full order detail card set — shared by public tracking and the account area. */
export default function OrderView({ order, actions, onChanged }: { order: Order; actions?: React.ReactNode; onChanged?: () => void }) {
  const toast = useToast(); const { pay: openPayment } = usePayment();
  const [busy, setBusy] = useState(false);
  const addr = order.shipping_address as Record<string, string>;
  const payable = !["paid", "refunded"].includes(order.payment_status) && !["cancelled", "refunded"].includes(order.status) && order.payment_method !== "whatsapp";
  const pay = async () => {
    setBusy(true);
    try {
      const out = await openPayment(await shopService.payOrder(order.number, order.customer_email));
      if (out.status === "paid") { toast.success("Payment received — thank you!"); onChanged?.(); }
    } catch (e) { toast.error(e instanceof ApiError ? e.message : "Could not start payment"); } finally { setBusy(false); }
  };
  const store = order.assigned_store;
  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-soft mb-4"><div className="card-body">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
            <div><div className="text-muted fs-sm">Order</div><h4 className="fw-bold mb-0">{order.number}</h4><div className="text-muted fs-sm">Placed {dateTime(order.created_at)}</div></div>
            <div className="d-flex gap-2 align-items-start flex-wrap"><StatusBadge status={order.status} /><StatusBadge status={order.payment_status} label={`Payment: ${titleCase(order.payment_status)}`} />{order.is_wholesale && <span className="badge rounded-pill badge-soft-primary">Wholesale</span>}</div>
          </div>
          {order.items.map((i) => (
            <div key={i.id} className="d-flex align-items-center gap-3 py-2 border-top">
              <Img src={i.image_url ?? undefined} alt="" className="order-thumb" />
              <div className="flex-grow-1 min-w-0"><div className="fw-semibold">{i.product_name}</div><div className="text-muted fs-sm">{i.variant_label} × {i.quantity}</div></div>
              <div className="fw-semibold">{money(i.line_total)}</div>
            </div>))}
          <div className="border-top pt-3 mt-2 ms-auto" style={{ maxWidth: 320 }}>
            <div className="summary-line"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            {Number(order.discount_total) > 0 && <div className="summary-line text-success"><span>Discount {order.coupon_code && `(${order.coupon_code})`}</span><span>−{money(order.discount_total)}</span></div>}
            <div className="summary-line"><span>Delivery</span><span>{money(order.delivery_fee)}</span></div>
            <div className="summary-line summary-total"><span>Total</span><span>{money(order.total)}</span></div>
          </div>
          {(payable || actions) && <div className="d-flex flex-wrap gap-2 mt-3">
            {payable && <button className="btn btn-primary" onClick={pay} disabled={busy}>{busy ? <Spinner size="sm" className="me-2" /> : <i className="ri-bank-card-line me-1" />}Pay {money(order.total)} now</button>}{actions}</div>}
        </div></div>
        <div className="card border-0 shadow-soft"><div className="card-body"><h6 className="fw-bold mb-3">Order progress</h6><OrderTimeline order={order} />
          {order.tracking_note && <div className="alert alert-info mt-3 mb-0 fs-sm"><i className="ri-information-line me-1" />{order.tracking_note}</div>}</div></div>
      </div>
      <div className="col-lg-4">
        <div className="card border-0 shadow-soft mb-4"><div className="card-body"><h6 className="fw-bold mb-3">Delivery</h6>
          <div className="fw-semibold">{addr.recipient_name ?? order.customer_name}</div>
          <div className="text-muted fs-sm">{[addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(", ")}</div>
          <div className="text-muted fs-sm">{addr.phone ?? order.customer_phone}</div></div></div>
        {store && <div className="card border-0 shadow-soft mb-4"><div className="card-body"><h6 className="fw-bold mb-2"><i className="ri-store-2-line text-gold me-1" />Your dealer</h6>
          <div className="fw-semibold">{store.name}</div><div className="text-muted fs-sm mb-2">{store.address}, {store.state}</div>
          <div className="d-flex gap-2 flex-wrap">{store.phone && <a className="btn btn-sm btn-outline-primary" href={`tel:${store.phone}`}><i className="ri-phone-line me-1" />Call</a>}
            {(store.whatsapp || store.phone) && <a className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer" href={waLink(store.whatsapp || store.phone || "", `Hello, about my Southern Rose order ${order.number}`)}><i className="ri-whatsapp-line me-1" />WhatsApp</a>}</div></div></div>}
        <div className="card border-0 shadow-soft"><div className="card-body"><h6 className="fw-bold mb-2">Need help?</h6><p className="text-muted fs-sm mb-2">Quote <strong>{order.number}</strong> when you contact us.</p>
          <Link to="/contact" className="btn btn-sm btn-light">Contact support</Link></div></div>
      </div>
    </div>
  );
}
