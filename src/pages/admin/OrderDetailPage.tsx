import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader, Panel } from "@/components/admin";
import StoreAssignPanel from "@/components/admin/sales/StoreAssignPanel";
import { ErrorState, Img, Input, Modal, PageLoader, Select, Spinner, StatusBadge, Switch, Textarea } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { AdminOrder, Payment } from "@/types";
import { ORDER_STATUSES } from "@/utils/constants";
import { dateTime, money, titleCase, waLink } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const toast = useToast(); const { can } = useAuth();
  const { data, setData, loading, error, reload } = useAsync(() => adminApi.orders.get(id), [id]);
  // AdminOrder doesn't embed payments → look up by customer email and filter by order id
  const pays = useAsync(async () => (data ? (await adminApi.payments.list({ q: data.customer_email, page_size: 100 })).items.filter((p) => p.order_id === data.id) : []), [data?.id, data?.payment_status]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [confirmFor, setConfirmFor] = useState<Payment | null>(null);
  const [st, setSt] = useState({ status: "confirmed", note: "", notify: true });
  const [pay, setPay] = useState({ amount: "", note: "", channel: "bank_transfer" });
  const [cnote, setCnote] = useState("");
  const [notes, setNotes] = useState({ internal: "", tracking: "" });
  const [busy, setBusy] = useState(false);
  useDocumentTitle(data ? `Order ${data.number}` : "Order");
  useEffect(() => { if (data) { setNotes({ internal: data.internal_notes ?? "", tracking: data.tracking_note ?? "" }); setSt((s) => ({ ...s, status: data.status })); } }, [data?.id]);

  if (loading && !data) return <PageLoader />;
  if (error || !data) return <ErrorState message={error ?? "Order not found"} onRetry={reload} />;
  const o: AdminOrder = data;
  const a = o.shipping_address as Record<string, string | undefined>;
  const due = Math.max(0, o.total - (pays.data ?? []).filter((p) => p.status === "paid").reduce((n, p) => n + p.amount, 0));
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); const fresh = await adminApi.orders.get(id); setData(fresh); pays.reload(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader back={{ to: "/admin/orders", label: "Orders" }} title={`Order ${o.number}`} subtitle={`Placed ${dateTime(o.created_at)} via ${titleCase(o.channel)}`}
        actions={<div className="no-print d-flex flex-wrap gap-2">
          <a className="btn btn-sm btn-outline-success" target="_blank" rel="noreferrer" href={waLink(o.customer_phone, `Hello ${o.customer_name}, about your Southern Rose order ${o.number}: `)}><i className="ri-whatsapp-line me-1" />WhatsApp</a>
          <a className="btn btn-sm btn-outline-secondary" href={`mailto:${o.customer_email}?subject=${encodeURIComponent("Your order " + o.number)}`}><i className="ri-mail-line me-1" />Email</a>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}><i className="ri-printer-line me-1" />Invoice</button>
          {can("orders:manage") && <button className="btn btn-sm btn-primary" onClick={() => setStatusOpen(true)}>Update status</button>}</div>} />
      <div className="invoice-only mb-4"><h2>Southern Rose — Invoice</h2><div>Order {o.number} · {dateTime(o.created_at)}</div><hr /></div>
      <div className="d-flex flex-wrap gap-2 mb-3"><StatusBadge status={o.status} /><StatusBadge status={o.payment_status} />{o.is_wholesale && <span className="badge badge-soft-primary">Wholesale · {o.total_packs} packs</span>}<span className="badge badge-soft-secondary">{titleCase(o.payment_method)}</span></div>
      <div className="row g-3">
        <div className="col-xl-8 d-flex flex-column gap-3">
          <Panel title="Items" flush>
            <div className="table-responsive order-items"><table className="table align-middle mb-0"><tbody>
              {o.items.map((i) => <tr key={i.id}><td style={{ width: 64 }}><Img src={i.image_url ?? undefined} alt="" /></td><td><div className="fw-semibold">{i.product_name}</div><small className="text-muted">{i.variant_label} · {i.sku}</small></td>
                <td className="text-end">{money(i.unit_price)} × {i.quantity}</td><td className="text-end fw-semibold">{money(i.line_total)}</td></tr>)}</tbody>
              <tfoot className="fs-sm"><tr><td colSpan={3} className="text-end text-muted">Subtotal</td><td className="text-end">{money(o.subtotal)}</td></tr>
                {o.discount_total > 0 && <tr><td colSpan={3} className="text-end text-muted">Discount {o.coupon_code && `(${o.coupon_code})`}</td><td className="text-end text-success">-{money(o.discount_total)}</td></tr>}
                <tr><td colSpan={3} className="text-end text-muted">Delivery</td><td className="text-end">{money(o.delivery_fee)}</td></tr>
                <tr className="fs-6"><td colSpan={3} className="text-end fw-bold">Total</td><td className="text-end fw-bold">{money(o.total)}</td></tr></tfoot></table></div>
          </Panel>
          <Panel title="Payments" actions={can("payments:confirm") && due > 0 && <button className="btn btn-sm btn-outline-primary no-print" onClick={() => { setPay({ amount: String(due), note: "", channel: "bank_transfer" }); setPayOpen(true); }}><i className="ri-add-line me-1" />Record payment</button>} flush>
            {pays.loading ? <div className="p-3"><Spinner size="sm" /></div> : !pays.data?.length ? <div className="p-3 text-muted fs-sm">No payment attempts yet. Balance due: <strong>{money(due)}</strong></div> :
              <div className="table-responsive"><table className="table align-middle mb-0 admin-table"><thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Channel</th><th>Date</th><th className="no-print" /></tr></thead><tbody>
                {pays.data.map((p) => <tr key={p.id}><td className="fs-sm">{p.reference}<div className="text-muted fs-xs">{p.gateway_response}</div></td><td>{money(p.amount)}</td><td><StatusBadge status={p.status} /></td><td>{p.channel ?? p.provider}</td><td className="fs-sm text-muted">{dateTime(p.paid_at ?? p.created_at)}</td>
                  <td className="text-end no-print">{p.status !== "paid" && can("payments:confirm") && <div className="d-flex gap-1 justify-content-end">
                    {p.provider === "paystack" && <button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => act(() => adminApi.payments.verify(p.id), "Verification complete")}>Verify</button>}
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => { setCnote(""); setConfirmFor(p); }}>Confirm</button></div>}</td></tr>)}</tbody></table></div>}
          </Panel>
          <Panel title="Timeline"><div className="timeline">{[...o.history].reverse().map((h, i) => <div key={i} className="timeline-item"><div className="fw-semibold fs-sm">{titleCase(h.status)} {!h.is_public && <span className="badge badge-soft-secondary ms-1">internal</span>}</div>
            {h.note && <div className="text-muted fs-sm">{h.note}</div>}<div className="text-muted fs-xs">{dateTime(h.created_at)}</div></div>)}</div></Panel>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-3">
          <Panel title="Customer"><dl className="kv mb-0"><dt>Name</dt><dd>{o.customer_name}</dd><dt>Email</dt><dd className="text-break">{o.customer_email}</dd><dt>Phone</dt><dd>{o.customer_phone}</dd>
            <dt>Account</dt><dd>{o.user_id ? <Link to={`/admin/customers/${o.user_id}`}>View customer</Link> : <span className="text-muted">Guest checkout</span>}</dd></dl></Panel>
          <Panel title="Delivery address"><address className="mb-0 fs-sm">{a.recipient_name}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state}{a.lga && ` · ${a.lga}`}<br />{a.country}<br />{a.phone}</address>
            {o.notes && <div className="mt-3 p-2 bg-gold-soft rounded fs-sm"><strong>Customer note:</strong> {o.notes}</div>}</Panel>
          <StoreAssignPanel order={o} onChange={setData} />
          {can("orders:manage") && <Panel title="Internal notes & tracking" className="no-print">
            <Textarea label="Tracking note (visible to customer)" rows={2} value={notes.tracking} onChange={(e) => setNotes({ ...notes, tracking: e.target.value })} />
            <Textarea label="Internal notes" rows={3} value={notes.internal} onChange={(e) => setNotes({ ...notes, internal: e.target.value })} />
            <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => act(() => adminApi.orders.update(o.id, { internal_notes: notes.internal, tracking_note: notes.tracking }), "Notes saved")}>Save notes</button></Panel>}
        </div>
      </div>

      <Modal show={statusOpen} onClose={() => setStatusOpen(false)} title="Update order status"
        footer={<><button className="btn btn-light" onClick={() => setStatusOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy} onClick={() => act(async () => { await adminApi.orders.setStatus(o.id, st.status, st.note || undefined, st.notify); setStatusOpen(false); }, "Status updated")}>Save</button></>}>
        <Select label="Status" value={st.status} onChange={(e) => setSt({ ...st, status: e.target.value })}>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</Select>
        <Textarea label="Note (shown on tracking)" rows={2} value={st.note} onChange={(e) => setSt({ ...st, note: e.target.value })} />
        <Switch label="Email the customer" checked={st.notify} onChange={(v) => setSt({ ...st, notify: v })} />
      </Modal>
      <Modal show={payOpen} onClose={() => setPayOpen(false)} title="Record manual payment" size="sm"
        footer={<><button className="btn btn-light" onClick={() => setPayOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy || !Number(pay.amount)} onClick={() => act(async () => { await adminApi.orders.recordPayment(o.id, Number(pay.amount), pay.note || undefined, pay.channel); setPayOpen(false); }, "Payment recorded")}>Record</button></>}>
        <Input label="Amount (₦)" type="number" min={0} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
        <Select label="Method" value={pay.channel} onChange={(e) => setPay({ ...pay, channel: e.target.value })}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="pos">POS</option></Select>
        <Textarea label="Note" rows={2} value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
      </Modal>
      <Modal show={!!confirmFor} onClose={() => setConfirmFor(null)} title="Confirm payment manually" size="sm"
        footer={<><button className="btn btn-light" onClick={() => setConfirmFor(null)}>Cancel</button><button className="btn btn-primary" disabled={busy || !cnote.trim()} onClick={() => act(async () => { await adminApi.payments.confirmManually(confirmFor!.id, cnote); setConfirmFor(null); }, "Payment confirmed")}>Confirm</button></>}>
        <p className="text-muted fs-sm">Use when you've seen the money arrive (e.g. in the bank app). An audit note is required.</p>
        <Textarea label="Note" required rows={3} value={cnote} onChange={(e) => setCnote(e.target.value)} />
      </Modal>
    </>
  );
}
