import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, FilterBar, PageHeader, Panel, StatCard, type Column } from "@/components/admin";
import { ErrorState, Modal, SearchInput, Select, StatusBadge, Textarea } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { Payment } from "@/types";
import { PAYMENT_STATUSES } from "@/utils/constants";
import { dateTime, money, titleCase } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function PaymentsPage() {
  useDocumentTitle("Payments");
  const { can } = useAuth(); const toast = useToast();
  const [q, setQ] = useState(""); const dq = useDebounce(q);
  const [f, setF] = useState({ status: new URLSearchParams(location.search).get("status") ?? "", purpose: "", provider: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Payment | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState("");
  const stats = useAsync(() => adminApi.payments.stats(), []);
  const { data, loading, error, reload } = useAsync(() => adminApi.payments.list({ page, page_size: 20, q: dq, status: f.status, purpose: f.purpose, provider: f.provider,
    date_from: f.from ? new Date(f.from).toISOString() : undefined, date_to: f.to ? new Date(f.to + "T23:59:59").toISOString() : undefined }), [page, dq, f]);
  const set = (p: Partial<typeof f>) => { setF({ ...f, ...p }); setPage(1); };
  const refresh = () => { reload(); stats.reload(); };
  const verify = async (p: Payment) => { setBusyId(p.id); try { const r = await adminApi.payments.verify(p.id); toast.success(r.status === "paid" ? "Payment confirmed" : `Gateway says: ${r.gateway_response ?? r.status}`); refresh(); } catch (e) { toast.error((e as Error).message); } finally { setBusyId(""); } };
  const confirm = async () => { if (!target) return; setBusyId(target.id); try { await adminApi.payments.confirmManually(target.id, note); toast.success("Payment confirmed"); setTarget(null); refresh(); } catch (e) { toast.error((e as Error).message); } finally { setBusyId(""); } };
  const s = stats.data ?? {};
  const cols: Column<Payment>[] = [
    { key: "r", header: "Reference", render: (p) => <><div className="fw-semibold fs-sm">{p.reference}</div><small className="text-muted">{p.description}</small></> },
    { key: "p", header: "Payer", render: (p) => <div>{p.payer_name ?? "—"}<small className="d-block text-muted">{p.email}</small></div> },
    { key: "a", header: "Amount", render: (p) => <strong>{money(p.amount)}</strong> },
    { key: "s", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "pu", header: "Type", render: (p) => <span className="text-muted">{titleCase(p.purpose)} · {titleCase(p.provider)}</span> },
    { key: "o", header: "Order", render: (p) => p.order_id ? <Link to={`/admin/orders/${p.order_id}`}>{p.order_number ?? "View"}</Link> : "—" },
    { key: "d", header: "Date", render: (p) => <span className="text-muted fs-sm">{dateTime(p.paid_at ?? p.created_at)}</span> },
    { key: "x", header: "", render: (p) => p.status !== "paid" && p.status !== "refunded" && can("payments:confirm") ? <div className="d-flex gap-1 justify-content-end">
      {p.provider === "paystack" && <button className="btn btn-sm btn-outline-primary" disabled={busyId === p.id} onClick={() => verify(p)}>Verify</button>}
      <button className="btn btn-sm btn-outline-secondary" onClick={() => { setNote(""); setTarget(p); }}>Confirm</button></div> : null },
  ];
  return (
    <>
      <PageHeader title="Payments" subtitle="Paystack and manually recorded payments" />
      <div className="row g-3 mb-3">
        {([["paid", "Paid", "ri-checkbox-circle-line", "green"], ["pending", "Pending", "ri-time-line", "gold"], ["failed", "Failed", "ri-close-circle-line", "red"], ["refunded", "Refunded", "ri-refund-2-line", "brown"]] as const).map(([k, l, i, c]) =>
          <div className="col-sm-6 col-xl-3" key={k}><StatCard label={`${l} (${s[k]?.count ?? 0})`} icon={i} color={c} loading={stats.loading} value={money(s[k]?.amount ?? 0)} /></div>)}
      </div>
      <Panel flush>
        <FilterBar>
          <SearchInput className="flex-grow-1" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search reference, email, payer…" />
          <Select className="mb-0" value={f.status} onChange={(e) => set({ status: e.target.value })}><option value="">All statuses</option>{PAYMENT_STATUSES.map((x) => <option key={x} value={x}>{titleCase(x)}</option>)}</Select>
          <Select className="mb-0" value={f.purpose} onChange={(e) => set({ purpose: e.target.value })}><option value="">All purposes</option><option value="order">Order</option><option value="direct">Direct</option></Select>
          <Select className="mb-0" value={f.provider} onChange={(e) => set({ provider: e.target.value })}><option value="">All providers</option><option value="paystack">Paystack</option><option value="manual">Manual</option></Select>
          <input type="date" className="form-control w-auto" value={f.from} onChange={(e) => set({ from: e.target.value })} aria-label="From" />
          <input type="date" className="form-control w-auto" value={f.to} onChange={(e) => set({ to: e.target.value })} aria-label="To" />
        </FilterBar>
        {error ? <div className="p-3"><ErrorState message={error} onRetry={reload} /></div> : <DataTable columns={cols} rows={data?.items} loading={loading} page={data?.page} pages={data?.pages} onPage={setPage} empty={{ title: "No payments found" }} />}
      </Panel>
      <Modal show={!!target} onClose={() => setTarget(null)} title="Confirm payment manually" size="sm"
        footer={<><button className="btn btn-light" onClick={() => setTarget(null)}>Cancel</button><button className="btn btn-primary" disabled={!note.trim() || !!busyId} onClick={confirm}>Confirm payment</button></>}>
        <p className="text-muted fs-sm">{target && `${target.reference} · ${money(target.amount)}`}<br />Only confirm after seeing the funds. This marks the order paid.</p>
        <Textarea label="Audit note" required rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
    </>
  );
}
