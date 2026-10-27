import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, SearchInput, StatusBadge } from "@/components/common";
import { DataTable, FilterBar, PageHeader, Panel } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { dateTime, titleCase, waLink } from "@/utils/format";
import type { ContactMessage } from "@/types";

export default function ContactsPage() {
  useDocumentTitle("Contact forms");
  const toast = useToast(); const nav = useNavigate();
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [subject, setSubject] = useState(""); const [page, setPage] = useState(1); const [sel, setSel] = useState<ContactMessage | null>(null);
  const dq = useDebounce(q);
  const { data, loading, reload } = useAsync(() => adminApi.contacts.list({ q: dq, status, subject, page, page_size: 20 }), [dq, status, subject, page]);
  const setSt = async (c: ContactMessage, st: string) => { try { const u = await adminApi.contacts.update(c.id, { status: st }); setSel(u); toast.success("Status updated"); reload(); } catch (e) { toast.error((e as Error).message); } };
  return (
    <>
      <PageHeader title="Contact Form Submissions" subtitle="Enquiries from the website (general, wholesale, distribution, events, complaints)." />
      <Panel flush>
        <FilterBar><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} className="flex-grow-1" />
          <select className="form-select w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["new", "in_progress", "resolved", "spam"].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
          <select className="form-select w-auto" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">All subjects</option>{["general", "wholesale", "distribution", "event", "complaint"].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></FilterBar>
        <DataTable rows={data?.items} loading={loading} page={page} pages={data?.pages} onPage={setPage} onRowClick={setSel} empty={{ title: "No messages" }}
          columns={[{ key: "n", header: "From", render: (c) => <div><div className="fw-semibold">{c.name}{c.user_id && <span className="badge badge-soft-info ms-2">Customer</span>}</div><div className="text-muted fs-xs">{c.email}</div></div> },
            { key: "s", header: "Subject", render: (c) => titleCase(c.subject) }, { key: "m", header: "Message", render: (c) => <span className="d-inline-block text-truncate" style={{ maxWidth: 320 }}>{c.message}</span> },
            { key: "st", header: "Status", render: (c) => <StatusBadge status={c.status} /> }, { key: "d", header: "Received", render: (c) => dateTime(c.created_at) }]} />
      </Panel>
      <Modal show={!!sel} onClose={() => setSel(null)} title={sel && `${titleCase(sel.subject)} — ${sel.name}`} size="lg">
        {sel && <>
          <dl className="kv mb-3"><dt>Email</dt><dd>{sel.email}</dd><dt>Phone</dt><dd>{sel.phone ?? "—"}</dd><dt>Received</dt><dd>{dateTime(sel.created_at)}</dd>
            {Object.entries(sel.extra ?? {}).map(([k, v]) => <><dt key={k}>{titleCase(k)}</dt><dd>{String(v)}</dd></>)}</dl>
          <div className="block-card mb-3" style={{ whiteSpace: "pre-line" }}>{sel.message}</div>
          <div className="d-flex flex-wrap gap-2 justify-content-between">
            <div className="d-flex gap-2"><button className="btn btn-primary" onClick={() => nav(`/admin/inbox?compose=1&to=${encodeURIComponent(sel.email)}&subject=${encodeURIComponent("Re: " + titleCase(sel.subject))}&contact=${sel.id}${sel.email_thread_id ? `&thread=${sel.email_thread_id}` : ""}`)}><i className="ri-reply-line me-1" />Reply by email</button>
              {sel.phone && <a className="btn btn-outline-success" target="_blank" rel="noreferrer" href={waLink(sel.phone, `Hello ${sel.name}, this is Southern Rose.`)}><i className="ri-whatsapp-line me-1" />WhatsApp</a>}</div>
            <select className="form-select w-auto" value={sel.status} onChange={(e) => setSt(sel, e.target.value)}>{["new", "in_progress", "resolved", "spam"].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></div>
        </>}
      </Modal>
    </>
  );
}
