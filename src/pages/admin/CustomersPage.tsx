import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, FilterBar, PageHeader, Panel, type Column } from "@/components/admin";
import { ErrorState, SearchInput, Select, StatusBadge } from "@/components/common";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { CustomerListItem } from "@/types";
import { date, initials, money } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function CustomersPage() {
  useDocumentTitle("Customers");
  const nav = useNavigate();
  const [q, setQ] = useState(""); const dq = useDebounce(q);
  const [store, setStore] = useState("");
  const [page, setPage] = useState(1);
  const stores = useAsync(() => adminApi.stores.list({ page_size: 100 }).catch(() => null), []);
  const { data, loading, error, reload } = useAsync(() => adminApi.customers.list({ page, page_size: 20, q: dq, store_id: store }), [page, dq, store]);
  const cols: Column<CustomerListItem>[] = [
    { key: "n", header: "Customer", render: (c) => <div className="d-flex align-items-center gap-2"><span className="avatar-circle sm">{initials(c.full_name)}</span><div><div className="fw-semibold">{c.full_name}</div><small className="text-muted">{c.email}</small></div></div> },
    { key: "p", header: "Phone", render: (c) => c.phone ?? "—" },
    { key: "o", header: "Orders", render: (c) => c.order_count },
    { key: "s", header: "Total spent", render: (c) => <strong>{money(c.total_spent)}</strong> },
    { key: "st", header: "Status", render: (c) => <StatusBadge status={c.is_active ? "approved" : "suspended"} label={c.is_active ? "Active" : "Disabled"} /> },
    { key: "j", header: "Joined", render: (c) => <span className="text-muted fs-sm">{date(c.created_at)}</span> },
  ];
  return (
    <>
      <PageHeader title="Customers" subtitle={data ? `${data.total} registered customers` : undefined} />
      <Panel flush>
        <FilterBar>
          <SearchInput className="flex-grow-1" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, email, phone…" />
          <Select className="mb-0" value={store} onChange={(e) => { setStore(e.target.value); setPage(1); }}><option value="">All linked stores</option>{stores.data?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
        </FilterBar>
        {error ? <div className="p-3"><ErrorState message={error} onRetry={reload} /></div> : <DataTable columns={cols} rows={data?.items} loading={loading} onRowClick={(c) => nav(`/admin/customers/${c.id}`)} page={data?.page} pages={data?.pages} onPage={setPage} empty={{ title: "No customers yet", text: "Customers appear after they register and verify their email." }} />}
      </Panel>
    </>
  );
}
