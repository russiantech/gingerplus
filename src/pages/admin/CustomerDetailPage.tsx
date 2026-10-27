import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader, Panel } from "@/components/admin";
import { ErrorState, PageLoader, Select, Spinner, StatusBadge, Switch, Textarea, Modal } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { StorePublic } from "@/types";
import { date, dateTime, money, waLink } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function CustomerDetailPage() {
  const { id = "" } = useParams();
  const { can } = useAuth(); const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.customers.get(id), [id]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [sug, setSug] = useState<{ store: StorePublic | null; reason: string } | null>(null);
  const [pick, setPick] = useState(false); const [sel, setSel] = useState("");
  const stores = useAsync(() => (pick ? adminApi.stores.list({ status: "approved", page_size: 100 }) : Promise.resolve(null)), [pick]);
  useDocumentTitle(data?.customer.full_name ?? "Customer");
  useEffect(() => { if (data) setNotes(data.customer.notes ?? ""); }, [data?.customer.id]);
  if (loading && !data) return <PageLoader />;
  if (error || !data) return <ErrorState message={error ?? "Not found"} onRetry={reload} />;
  const c = data.customer; const manage = can("customers:manage");
  const save = async (patch: Record<string, unknown>, ok: string) => { setBusy(true); try { await adminApi.customers.update(id, patch); toast.success(ok); reload(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };
  return (
    <>
      <PageHeader back={{ to: "/admin/customers", label: "Customers" }} title={c.full_name} subtitle={`Customer since ${date(c.created_at)}`}
        actions={c.phone && <a className="btn btn-sm btn-outline-success" target="_blank" rel="noreferrer" href={waLink(c.phone)}><i className="ri-whatsapp-line me-1" />WhatsApp</a>} />
      <div className="row g-3">
        <div className="col-xl-4 d-flex flex-column gap-3">
          <Panel title="Profile"><dl className="kv mb-3"><dt>Email</dt><dd className="text-break">{c.email}</dd><dt>Phone</dt><dd>{c.phone ?? "—"}</dd><dt>Orders</dt><dd>{c.order_count}</dd><dt>Total spent</dt><dd className="fw-bold">{money(c.total_spent)}</dd>
            <dt>Verified</dt><dd>{c.email_verified_at ? dateTime(c.email_verified_at) : "No"}</dd><dt>Marketing</dt><dd>{c.marketing_opt_in ? "Opted in" : "No"}</dd></dl>
            {manage && <Switch label="Account active" checked={c.is_active} onChange={(v) => save({ is_active: v }, v ? "Account activated" : "Account deactivated")} />}</Panel>
          <Panel title={<><i className="ri-store-2-line me-2" />Linked store</>}>
            {data.linked_store ? <div className="border rounded-3 p-3 mb-3"><div className="fw-semibold">{data.linked_store.name}</div><div className="fs-sm text-muted">{data.linked_store.address}, {data.linked_store.state}</div></div> : <p className="text-muted fs-sm">Not linked to any store.</p>}
            {sug && <div className={`alert ${sug.store ? "alert-warning" : "alert-info"} py-2 fs-sm`}>{sug.store ? <><strong>{sug.store.name}</strong> ({sug.store.state}){sug.store.distance_km ? ` · ${sug.store.distance_km} km` : ""}<br />{sug.reason}
              {manage && <div className="mt-2"><button className="btn btn-sm btn-primary" disabled={busy} onClick={() => save({ linked_store_id: sug.store!.id }, "Store linked").then(() => setSug(null))}>Approve & link</button></div>}</> : sug.reason}</div>}
            {manage && <div className="d-flex flex-wrap gap-2"><button className="btn btn-sm btn-outline-primary" onClick={async () => { try { setSug(await adminApi.customers.suggestStore(id)); } catch (e) { toast.error((e as Error).message); } }}>Suggest nearest</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setPick(true)}>Choose store</button>
              {data.linked_store && <button className="btn btn-sm btn-outline-danger" onClick={() => save({ linked_store_id: null }, "Store unlinked")}>Unlink</button>}</div>}</Panel>
          {manage && <Panel title="Internal notes"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="btn btn-sm btn-primary" disabled={busy} onClick={() => save({ notes }, "Notes saved")}>Save</button></Panel>}
        </div>
        <div className="col-xl-8 d-flex flex-column gap-3">
          <Panel title="Addresses">{!data.addresses.length ? <p className="text-muted fs-sm mb-0">No saved addresses.</p> : <div className="row g-2">{data.addresses.map((a) => <div className="col-md-6" key={a.id}><div className="border rounded-3 p-3 h-100 fs-sm">
            <div className="fw-semibold">{a.label} {a.is_default && <span className="badge badge-soft-primary">Default</span>}</div>{a.recipient_name}<br />{a.line1}, {a.city}, {a.state}<br />{a.phone}</div></div>)}</div>}</Panel>
          <Panel title="Orders" flush><div className="table-responsive"><table className="table table-hover align-middle admin-table mb-0"><thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead><tbody>
            {data.orders.map((o) => <tr key={o.id}><td><Link to={`/admin/orders/${o.id}`} className="fw-semibold">{o.number}</Link></td><td className="text-muted fs-sm">{dateTime(o.created_at)}</td><td>{money(o.total)}</td><td><StatusBadge status={o.status} /></td><td><StatusBadge status={o.payment_status} /></td></tr>)}
            {!data.orders.length && <tr><td colSpan={5} className="text-center text-muted py-4">No orders yet</td></tr>}</tbody></table></div></Panel>
        </div>
      </div>
      <Modal show={pick} onClose={() => setPick(false)} title="Link to store" size="sm" footer={<><button className="btn btn-light" onClick={() => setPick(false)}>Cancel</button><button className="btn btn-primary" disabled={!sel} onClick={() => save({ linked_store_id: sel }, "Store linked").then(() => setPick(false))}>Link</button></>}>
        {stores.loading ? <Spinner /> : <Select label="Approved store" value={sel} onChange={(e) => setSel(e.target.value)}><option value="">Select…</option>{stores.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.state}</option>)}</Select>}
      </Modal>
    </>
  );
}
