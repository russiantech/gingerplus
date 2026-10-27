import { useState } from "react";
import { EmptyState, ErrorState, PageLoader, StatusBadge } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { ApiError } from "@/services/http";
import type { AdminOrder } from "@/types";
import { dateTime, money, waLink } from "@/utils/format";
import "@/styles/commerce.css";

const NEXT: Record<string, { to: string; label: string }[]> = {
  confirmed: [{ to: "processing", label: "Start processing" }], pending: [{ to: "processing", label: "Start processing" }],
  processing: [{ to: "dispatched", label: "Mark dispatched" }], dispatched: [{ to: "delivered", label: "Mark delivered" }],
};

export default function PartnerPortalPage() {
  useDocumentTitle("Partner portal");
  const toast = useToast();
  const store = useAsync(() => adminApi.partner.store(), []);
  const orders = useAsync(() => adminApi.partner.orders(), []);
  const [busy, setBusy] = useState<string | null>(null);

  const move = async (o: AdminOrder, status: string) => {
    setBusy(o.id);
    try { await adminApi.partner.setStatus(o.id, status); toast.success(`${o.number} → ${status}`); orders.reload(); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : "Update failed"); } finally { setBusy(null); }
  };
  if (store.loading) return <PageLoader />;
  if (store.error) return <div className="container py-5"><ErrorState message={store.error} /></div>;
  const s = store.data!;
  return (
    <div className="container py-4 py-md-5">
      <div className="card border-0 shadow-soft mb-4"><div className="card-body d-flex flex-wrap gap-3 align-items-center">
        <span className="avatar-circle"><i className="ri-store-2-line" /></span>
        <div className="flex-grow-1"><div className="text-muted fs-sm text-capitalize">{s.store_type} partner portal</div><h1 className="h4 fw-bold mb-0">{s.name}</h1><div className="text-muted fs-sm">{s.address}, {s.state}</div></div>
        <StatusBadge status={s.status} />{s.is_public && <span className="badge badge-soft-success">Listed publicly</span>}</div></div>
      <h2 className="h5 fw-bold mb-3">Orders assigned to you</h2>
      {orders.error && <ErrorState message={orders.error} onRetry={orders.reload} />}
      {!orders.loading && !orders.data?.length && <EmptyState icon="ri-inbox-line" title="No orders assigned yet" text="When Southern Rose assigns orders to your store they'll appear here." />}
      <div className="row g-3">{orders.data?.map((o) => (
        <div className="col-lg-6" key={o.id}><div className="card border-0 shadow-soft h-100"><div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2"><div><div className="fw-bold">{o.number}</div><div className="text-muted fs-xs">{dateTime(o.created_at)}</div></div><div className="d-flex gap-1"><StatusBadge status={o.status} /><StatusBadge status={o.payment_status} /></div></div>
          <ul className="list-unstyled fs-sm mb-2">{o.items.map((i) => <li key={i.id}>{i.quantity} × {i.product_name} <span className="text-muted">({i.variant_label})</span></li>)}</ul>
          <div className="fs-sm text-muted mb-1"><i className="ri-user-line me-1" />{o.customer_name} · {o.customer_phone}</div>
          <div className="fs-sm text-muted mb-3"><i className="ri-map-pin-line me-1" />{[(o.shipping_address as Record<string, string>).line1, (o.shipping_address as Record<string, string>).city, o.delivery_state].filter(Boolean).join(", ")}</div>
          <div className="d-flex flex-wrap gap-2 align-items-center"><strong className="me-auto">{money(o.total)}</strong>
            <a className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer" href={waLink(o.customer_phone, `Hello, about your Southern Rose order ${o.number}`)}><i className="ri-whatsapp-line" /></a>
            {(NEXT[o.status] ?? []).map((n) => <button key={n.to} className="btn btn-sm btn-primary" disabled={busy === o.id} onClick={() => move(o, n.to)}>{n.label}</button>)}</div>
        </div></div></div>))}</div>
    </div>
  );
}
