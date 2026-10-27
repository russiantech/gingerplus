import { useState } from "react";
import { Panel } from "@/components/admin";
import { Modal, Select, Spinner, StatusBadge } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { AdminOrder } from "@/types";

export default function StoreAssignPanel({ order, onChange }: { order: AdminOrder; onChange: (o: AdminOrder) => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState(false);
  const [sel, setSel] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const stores = useAsync(() => (pick ? adminApi.stores.list({ status: "approved", page_size: 100 }) : Promise.resolve(null)), [pick]);
  const run = async (fn: () => Promise<AdminOrder | void>, ok: string) => {
    setBusy(true);
    try { const r = await fn(); if (r) onChange(r); toast.success(ok); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const sug = order.suggested_store;
  return (
    <Panel title={<><i className="ri-store-2-line me-2" />Store / dealer fulfilment</>} className="no-print">
      <div className="mb-3 d-flex gap-2 align-items-center"><span className="text-muted fs-sm">Status</span><StatusBadge status={order.assignment_status} /></div>
      {order.assigned_store ? (
        <div className="border rounded-3 p-3 mb-3"><div className="fw-semibold">{order.assigned_store.name}</div><div className="fs-sm text-muted">{order.assigned_store.address}, {order.assigned_store.state}</div>
          <div className="fs-sm">{order.assigned_store.phone}</div></div>
      ) : <p className="text-muted fs-sm">No store assigned — fulfilled directly by Southern Rose.</p>}
      {order.assignment_status === "suggested" && sug && (
        <div className="alert alert-warning py-2 fs-sm"><strong>System suggestion:</strong> {sug.name} ({sug.state}). Requires your approval.
          <div className="d-flex gap-2 mt-2"><button className="btn btn-sm btn-primary" disabled={busy} onClick={() => run(() => adminApi.orders.approveStore(order.id), "Store assigned")}>Approve</button>
            <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => run(() => adminApi.orders.rejectStore(order.id), "Suggestion rejected")}>Reject</button></div></div>
      )}
      {note && <div className="alert alert-info py-2 fs-sm">{note}</div>}
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => run(async () => { const r = await adminApi.orders.suggestStore(order.id); setNote(r.store ? `Matched ${r.store.name}${r.store.distance_km ? ` (${r.store.distance_km} km)` : ""} — ${r.reason}` : r.reason); return adminApi.orders.get(order.id); }, "Match complete")}>
          {busy ? <Spinner size="sm" /> : <i className="ri-map-pin-user-line me-1" />}Run system match</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setPick(true)}>Assign manually</button>
        {order.assigned_store && <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => run(() => adminApi.orders.assignStore(order.id, null), "Unassigned")}>Unassign</button>}
      </div>
      <Modal show={pick} onClose={() => setPick(false)} title="Assign to store" size="sm"
        footer={<><button className="btn btn-light" onClick={() => setPick(false)}>Cancel</button><button className="btn btn-primary" disabled={!sel || busy} onClick={() => run(async () => { const r = await adminApi.orders.assignStore(order.id, sel); setPick(false); return r; }, "Store assigned")}>Assign</button></>}>
        {stores.loading ? <Spinner /> : <Select label="Approved store" value={sel} onChange={(e) => setSel(e.target.value)}><option value="">Select…</option>
          {stores.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.state}</option>)}</Select>}
      </Modal>
    </Panel>
  );
}
