import { useState } from "react";
import { Modal, Select, Spinner, StatusBadge, Switch, Textarea } from "@/components/common";
import { DataTable, FilterBar, PageHeader, Panel } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { date } from "@/utils/format";
import type { Application } from "@/types";

export default function ApplicationsPage() {
  useDocumentTitle("Applications");
  const toast = useToast();
  const [status, setStatus] = useState(""); const [page, setPage] = useState(1); const [sel, setSel] = useState<Application | null>(null); const [notes, setNotes] = useState(""); const [busy, setBusy] = useState(false);
  const [ap, setAp] = useState({ store_type: "distributor", is_public: false, create_partner_account: true });
  const { data, loading, reload } = useAsync(() => adminApi.applications.list({ status, page, page_size: 20 }), [status, page]);
  const open = (a: Application) => { setSel(a); setNotes(a.admin_notes ?? ""); };
  const run = async (fn: () => Promise<unknown>, msg: string) => { setBusy(true); try { await fn(); toast.success(msg); setSel(null); reload(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };
  return (
    <>
      <PageHeader title="Distributor & Store Applications" subtitle="Review applicants, then approve them as a store, distributor or dealer. You decide whether they appear publicly." />
      <Panel flush>
        <FilterBar><select className="form-select w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{["new", "reviewing", "approved", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}</select></FilterBar>
        <DataTable rows={data?.items} loading={loading} page={page} pages={data?.pages} onPage={setPage} onRowClick={open} empty={{ title: "No applications" }}
          columns={[{ key: "b", header: "Business", render: (a) => <div><div className="fw-semibold">{a.business_name}</div><div className="text-muted fs-xs">{a.contact_person}</div></div> }, { key: "l", header: "Location", render: (a) => a.location },
            { key: "v", header: "Monthly volume", render: (a) => (a.expected_monthly_volume ? `${a.expected_monthly_volume} packs` : "—") }, { key: "s", header: "Status", render: (a) => <StatusBadge status={a.status} /> }, { key: "d", header: "Applied", render: (a) => date(a.created_at) }]} />
      </Panel>
      <Modal show={!!sel} onClose={() => setSel(null)} size="lg" title={sel?.business_name}>
        {sel && <>
          <dl className="kv mb-3"><dt>Contact</dt><dd>{sel.contact_person} · {sel.phone} · {sel.email}</dd><dt>Location</dt><dd>{sel.location} {sel.state && `(${sel.state})`}</dd><dt>Experience</dt><dd>{sel.years_in_distribution ?? "—"} years</dd>
            <dt>Currently distributes</dt><dd>{sel.current_products || "—"}</dd><dt>Expected volume</dt><dd>{sel.expected_monthly_volume ?? "—"} packs / month</dd><dt>Motivation</dt><dd style={{ whiteSpace: "pre-line" }}>{sel.motivation || "—"}</dd></dl>
          <Textarea label="Internal notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {sel.status !== "approved" && <div className="block-card mb-3"><div className="fw-bold mb-2">Approve as partner</div><div className="row g-0 gx-3"><div className="col-md-4"><Select label="Type" value={ap.store_type} onChange={(e) => setAp({ ...ap, store_type: e.target.value })}><option value="store">Store</option><option value="distributor">Distributor</option><option value="dealer">Dealer</option></Select></div></div>
            <Switch label="Show publicly on Find a Store" checked={ap.is_public} onChange={(v) => setAp({ ...ap, is_public: v })} /><Switch label="Create partner portal login (emails temporary password)" checked={ap.create_partner_account} onChange={(v) => setAp({ ...ap, create_partner_account: v })} /></div>}
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button className="btn btn-light" disabled={busy} onClick={() => run(() => adminApi.applications.update(sel.id, { admin_notes: notes, status: "reviewing" }), "Marked as reviewing")}>Mark reviewing</button>
            {sel.status !== "approved" && <><button className="btn btn-outline-danger" disabled={busy} onClick={() => run(() => adminApi.applications.update(sel.id, { admin_notes: notes, status: "rejected" }), "Application rejected")}>Reject</button>
              <button className="btn btn-primary" disabled={busy} onClick={() => run(() => adminApi.applications.approve(sel.id, { ...ap, state: sel.state ?? undefined }), "Approved — store created")}>{busy && <Spinner size="sm" className="me-2" />}Approve</button></>}
          </div>
        </>}
      </Modal>
    </>
  );
}
