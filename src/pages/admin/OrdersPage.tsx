import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DataTable, FilterBar, PageHeader, Panel, type Column } from "@/components/admin";
import { ErrorState, Select, StatusBadge, SearchInput } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { AdminOrder } from "@/types";
import { CHANNELS, ORDER_STATUSES, PAYMENT_STATUSES } from "@/utils/constants";
import { dateTime, money, titleCase } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function OrdersPage() {
  useDocumentTitle("Orders");
  const nav = useNavigate(); const { can } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const dq = useDebounce(q);
  const [page, setPage] = useState(1);
  const f = { status: sp.get("status") ?? "", payment_status: sp.get("payment_status") ?? "", channel: sp.get("channel") ?? "", wholesale: sp.get("wholesale") ?? "",
    needs: sp.get("needs_store_approval") ?? "", from: sp.get("from") ?? "", to: sp.get("to") ?? "", state: sp.get("state") ?? "" };
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); setPage(1); };
  const { data, loading, error, reload } = useAsync(() => adminApi.orders.list({
    page, page_size: 20, q: dq, status: f.status, payment_status: f.payment_status, channel: f.channel, state: f.state,
    wholesale: f.wholesale === "" ? undefined : f.wholesale === "1", needs_store_approval: f.needs ? true : undefined,
    date_from: f.from ? new Date(f.from).toISOString() : undefined, date_to: f.to ? new Date(f.to + "T23:59:59").toISOString() : undefined,
  }), [page, dq, sp.toString()]);

  const cols: Column<AdminOrder>[] = [
    { key: "n", header: "Order", render: (o) => <><span className="fw-semibold">{o.number}</span>{o.is_wholesale && <span className="badge badge-soft-primary ms-2">Wholesale</span>}</> },
    { key: "c", header: "Customer", render: (o) => <div><div>{o.customer_name}</div><small className="text-muted">{o.customer_phone}</small></div> },
    { key: "s", header: "State", render: (o) => o.delivery_state ?? "—" },
    { key: "t", header: "Total", render: (o) => <strong>{money(o.total)}</strong> },
    { key: "st", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "p", header: "Payment", render: (o) => <StatusBadge status={o.payment_status} /> },
    { key: "ch", header: "Channel", render: (o) => <span className="text-muted">{titleCase(o.channel)}</span> },
    { key: "store", header: "Store", render: (o) => o.assignment_status === "suggested" ? <span className="badge badge-soft-warning">Approve match</span> : o.assigned_store?.name ?? <span className="text-muted">—</span> },
    { key: "d", header: "Placed", render: (o) => <span className="text-muted fs-sm">{dateTime(o.created_at)}</span> },
  ];
  return (
    <>
      <PageHeader title="Orders" subtitle={data ? `${data.total} orders` : undefined} actions={can("orders:manage") && <Link to="/admin/orders/new" className="btn btn-primary btn-sm"><i className="ri-add-line me-1" />New order</Link>} />
      <Panel flush>
        <FilterBar>
          <SearchInput className="flex-grow-1" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search number, name, email, phone…" />
          <Select className="mb-0" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</Select>
          <Select className="mb-0" value={f.payment_status} onChange={(e) => set("payment_status", e.target.value)}><option value="">Any payment</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</Select>
          <Select className="mb-0" value={f.channel} onChange={(e) => set("channel", e.target.value)}><option value="">All channels</option>{CHANNELS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</Select>
          <Select className="mb-0" value={f.wholesale} onChange={(e) => set("wholesale", e.target.value)}><option value="">Retail + wholesale</option><option value="1">Wholesale only</option><option value="0">Retail only</option></Select>
          <input className="form-control w-auto" placeholder="State" value={f.state} onChange={(e) => set("state", e.target.value)} style={{ maxWidth: 120 }} aria-label="State" />
          <input type="date" className="form-control w-auto" value={f.from} onChange={(e) => set("from", e.target.value)} aria-label="From" />
          <input type="date" className="form-control w-auto" value={f.to} onChange={(e) => set("to", e.target.value)} aria-label="To" />
          <div className="form-check mb-0"><input id="nsa" type="checkbox" className="form-check-input" checked={!!f.needs} onChange={(e) => set("needs_store_approval", e.target.checked ? "1" : "")} /><label htmlFor="nsa" className="form-check-label fs-sm">Needs store approval</label></div>
          {sp.toString() && <button className="btn btn-sm btn-link" onClick={() => { setSp({}); setQ(""); }}>Clear</button>}
        </FilterBar>
        {error ? <div className="p-3"><ErrorState message={error} onRetry={reload} /></div> :
          <DataTable columns={cols} rows={data?.items} loading={loading} onRowClick={(o) => nav(`/admin/orders/${o.id}`)} page={data?.page} pages={data?.pages} onPage={setPage} empty={{ title: "No orders match", text: "Try changing the filters." }} />}
      </Panel>
    </>
  );
}
