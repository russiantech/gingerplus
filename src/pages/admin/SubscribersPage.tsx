import { useState } from "react";
import { ConfirmDialog, SearchInput, StatusBadge } from "@/components/common";
import { DataTable, FilterBar, PageHeader, Panel } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { date } from "@/utils/format";
import type { Subscriber } from "@/types";

export default function SubscribersPage() {
  useDocumentTitle("Newsletter");
  const toast = useToast();
  const [q, setQ] = useState(""); const [page, setPage] = useState(1); const dq = useDebounce(q);
  const [del, setDel] = useState<Subscriber | null>(null);
  const { data, loading, reload } = useAsync(() => adminApi.subscribers.list({ q: dq, page, page_size: 25 }), [dq, page]);
  const exportCsv = async () => {
    const all = await adminApi.subscribers.list({ page_size: 100 });
    const csv = "email,name,active,joined\n" + all.items.map((s) => [s.email, s.name ?? "", s.is_active, s.created_at].join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "subscribers.csv"; a.click();
  };
  return (
    <>
      <PageHeader title="Newsletter Subscribers" subtitle={`${data?.total ?? 0} subscribers`} actions={<button className="btn btn-outline-primary" onClick={exportCsv}><i className="ri-download-2-line me-1" />Export CSV</button>} />
      <Panel flush>
        <FilterBar><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search email…" className="flex-grow-1" /></FilterBar>
        <DataTable rows={data?.items} loading={loading} page={page} pages={data?.pages} onPage={setPage} empty={{ title: "No subscribers yet" }}
          columns={[{ key: "e", header: "Email", render: (s) => <span className="fw-semibold">{s.email}</span> }, { key: "n", header: "Name", render: (s) => s.name ?? "—" },
            { key: "s", header: "Status", render: (s) => <StatusBadge status={s.is_active ? "published" : "draft"} label={s.is_active ? "Subscribed" : "Unsubscribed"} /> }, { key: "d", header: "Joined", render: (s) => date(s.created_at) },
            { key: "a", header: "", className: "text-end", render: (s) => <button className="btn btn-sm btn-light text-danger" onClick={() => setDel(s)}><i className="ri-delete-bin-line" /></button> }]} />
      </Panel>
      <ConfirmDialog show={!!del} danger message={`Remove ${del?.email}?`} confirmLabel="Remove" onClose={() => setDel(null)} onConfirm={async () => { await adminApi.subscribers.remove(del!.id); toast.success("Removed"); setDel(null); reload(); }} />
    </>
  );
}
