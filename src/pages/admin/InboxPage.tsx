import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, Input, Modal, PageLoader, SearchInput, Spinner, Textarea } from "@/components/common";
import { PageHeader } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { dateTime, timeAgo } from "@/utils/format";
import type { EmailMessage } from "@/types";

const FOLDERS = [["inbox", "Inbox", "ri-inbox-line"], ["sent", "Sent", "ri-send-plane-line"], ["starred", "Starred", "ri-star-line"], ["system", "Automated", "ri-robot-2-line"], ["archived", "Archived", "ri-archive-line"]] as const;

export default function InboxPage() {
  useDocumentTitle("Inbox");
  const toast = useToast(); const [sp, setSp] = useSearchParams();
  const [folder, setFolder] = useState("inbox"); const [q, setQ] = useState(""); const [unread, setUnread] = useState(false); const [custOnly, setCustOnly] = useState(false);
  const [page, setPage] = useState(1); const dq = useDebounce(q);
  const [sel, setSel] = useState<EmailMessage | null>(null); const [thread, setThread] = useState<EmailMessage[]>([]); const [tLoading, setTLoading] = useState(false);
  const [reply, setReply] = useState(""); const [busy, setBusy] = useState(false);
  const [compose, setCompose] = useState<{ to: string; subject: string; body: string; thread_id?: string; contact_message_id?: string } | null>(null);
  const { data, loading, reload } = useAsync(() => adminApi.emails.list({ folder, q: dq, unread: unread || undefined, customer_only: custOnly || undefined, page, page_size: 25 }), [folder, dq, unread, custOnly, page]);

  useEffect(() => { // deep link from Contact Forms: ?compose=1&to=..&subject=..&contact=..&thread=..
    if (sp.get("compose")) { setCompose({ to: sp.get("to") ?? "", subject: sp.get("subject") ?? "", body: "", thread_id: sp.get("thread") ?? undefined, contact_message_id: sp.get("contact") ?? undefined }); setSp({}, { replace: true }); }
  }, [sp, setSp]);

  const open = async (m: EmailMessage) => {
    setSel(m); setTLoading(true);
    try { setThread(await adminApi.emails.thread(m.thread_id)); if (!m.is_read) { reload(); } } catch (e) { toast.error((e as Error).message); } finally { setTLoading(false); }
  };
  const flag = async (m: EmailMessage, d: { is_read?: boolean; is_starred?: boolean; is_archived?: boolean }) => { const u = await adminApi.emails.flag(m.id, d); if (sel?.id === m.id) setSel(u); reload(); };
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (compose) { await adminApi.emails.send({ to_email: compose.to, subject: compose.subject, body: compose.body, thread_id: compose.thread_id, contact_message_id: compose.contact_message_id }); setCompose(null); }
      else if (sel) { const other = sel.direction === "inbound" ? sel.from_email : sel.to_email; await adminApi.emails.send({ to_email: other, subject: sel.subject.startsWith("Re:") ? sel.subject : `Re: ${sel.subject}`, body: reply, thread_id: sel.thread_id, contact_message_id: sel.contact_message_id ?? undefined }); setReply(""); setThread(await adminApi.emails.thread(sel.thread_id)); }
      toast.success("Email sent"); reload();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Inbox" subtitle="Website enquiries and every email the system sends. Messages link to a customer only when the address matches an existing account."
        actions={<button className="btn btn-primary" onClick={() => setCompose({ to: "", subject: "", body: "" })}><i className="ri-edit-line me-1" />Compose</button>} />
      <div className="card admin-card border-0 shadow-soft overflow-hidden"><div className="row g-0" style={{ minHeight: 600 }}>
        <div className="col-lg-2 border-end p-2 d-flex flex-lg-column gap-1 overflow-auto">
          {FOLDERS.map(([k, l, i]) => <button key={k} className={`btn text-start ${folder === k ? "btn-primary" : "btn-light"} text-nowrap`} onClick={() => { setFolder(k); setPage(1); setSel(null); }}><i className={`${i} me-2`} />{l}</button>)}
          <hr className="d-none d-lg-block" />
          <div className="form-check ms-2 d-none d-lg-block"><input className="form-check-input" type="checkbox" id="un" checked={unread} onChange={(e) => setUnread(e.target.checked)} /><label htmlFor="un" className="form-check-label fs-sm">Unread only</label></div>
          <div className="form-check ms-2 d-none d-lg-block"><input className="form-check-input" type="checkbox" id="cu" checked={custOnly} onChange={(e) => setCustOnly(e.target.checked)} /><label htmlFor="cu" className="form-check-label fs-sm">Customers only</label></div>
        </div>
        <div className="col-lg-4 border-end" style={{ maxHeight: 700, overflowY: "auto" }}>
          <div className="p-2 border-bottom"><SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search mail…" /></div>
          {loading ? <PageLoader /> : data?.items.length === 0 ? <EmptyState icon="ri-mail-open-line" title="Nothing here" /> :
            data?.items.map((m) => (
              <div key={m.id} className={`mail-item p-3 border-bottom ${!m.is_read && m.direction === "inbound" ? "unread" : ""} ${sel?.id === m.id ? "active" : ""}`} onClick={() => open(m)}>
                <div className="d-flex justify-content-between gap-2"><span className="text-truncate">{m.direction === "inbound" ? m.from_name || m.from_email : `To: ${m.to_email}`}{m.user_name && <span className="badge badge-soft-info ms-2">Customer</span>}</span><span className="text-muted fs-xs text-nowrap">{timeAgo(m.created_at)}</span></div>
                <div className="text-truncate fs-sm">{m.is_starred && <i className="ri-star-fill text-gold me-1" />}{m.subject}</div><div className="text-muted fs-xs text-truncate">{m.body_text}</div>
              </div>))}
          {data && data.pages > 1 && <div className="d-flex justify-content-between p-2"><button className="btn btn-sm btn-light" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span className="fs-xs align-self-center">{page}/{data.pages}</span><button className="btn btn-sm btn-light" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
        </div>
        <div className="col-lg-6 d-flex flex-column" style={{ maxHeight: 700 }}>
          {!sel ? <EmptyState icon="ri-mail-line" title="Select a message" text="Choose an email to read the conversation and reply." /> : <>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-start gap-2"><div className="min-w-0"><h6 className="fw-bold mb-0 text-truncate">{sel.subject}</h6>
              <div className="text-muted fs-xs">{sel.user_name ? `Customer: ${sel.user_name}` : "Not a registered customer"}</div></div>
              <div className="d-flex gap-1"><button className="icon-btn" title="Star" onClick={() => flag(sel, { is_starred: !sel.is_starred })}><i className={sel.is_starred ? "ri-star-fill text-gold" : "ri-star-line"} /></button>
                <button className="icon-btn" title="Archive" onClick={() => flag(sel, { is_archived: !sel.is_archived })}><i className="ri-archive-line" /></button></div></div>
            <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3">
              {tLoading ? <PageLoader /> : thread.map((m) => (
                <div key={m.id} className={`p-3 rounded-3 ${m.direction === "outbound" ? "bg-gold-soft align-self-end" : "bg-body-tertiary"}`} style={{ maxWidth: "92%" }}>
                  <div className="fs-xs text-muted mb-1">{m.direction === "inbound" ? m.from_name || m.from_email : "Southern Rose"} · {dateTime(m.created_at)}{m.send_status === "failed" && <span className="text-danger ms-1">· failed to send</span>}{m.send_status === "skipped" && <span className="ms-1">· logged (email disabled)</span>}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.body_text}</div></div>))}
            </div>
            {!sel.is_system && <form onSubmit={send} className="p-3 border-top"><Textarea rows={3} placeholder="Write a reply…" required value={reply} onChange={(e) => setReply(e.target.value)} className="mb-2" />
              <div className="text-end"><button className="btn btn-primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Send reply</button></div></form>}
          </>}
        </div>
      </div></div>
      <Modal show={!!compose} onClose={() => setCompose(null)} title="New email">
        {compose && <form onSubmit={send}><Input label="To" type="email" required value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} /><Input label="Subject" required value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} />
          <Textarea label="Message" rows={7} required value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
          <div className="text-end"><button className="btn btn-primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Send</button></div></form>}
      </Modal>
    </>
  );
}
