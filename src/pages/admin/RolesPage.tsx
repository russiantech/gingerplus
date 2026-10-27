import { useEffect, useState } from "react";
import { ConfirmDialog, Input, Modal, PageLoader, Spinner, Textarea } from "@/components/common";
import { PageHeader, Panel } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { titleCase } from "@/utils/format";
import type { Role } from "@/types";

export default function RolesPage() {
  useDocumentTitle("Roles & permissions");
  const toast = useToast(); const { can } = useAuth(); const canEdit = can("roles:manage");
  const { data: roles, loading, reload } = useAsync(() => adminApi.roles.list(), []);
  const { data: perms } = useAsync(() => adminApi.roles.permissions(), []);
  const [sel, setSel] = useState<Role | null>(null); const [draft, setDraft] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  const [create, setCreate] = useState(false); const [nr, setNr] = useState({ key: "", name: "", description: "" }); const [del, setDel] = useState(false);
  useEffect(() => { if (roles && !sel) setSel(roles[0] ?? null); }, [roles, sel]);
  useEffect(() => { if (sel) setDraft(sel.permissions); }, [sel]);
  if (loading || !perms) return <PageLoader />;
  const groups = Object.entries(perms.reduce<Record<string, string[]>>((a, p) => ((a[p.group] ??= []).push(p.key), a), {}));
  const locked = sel?.key === "super_admin" || !canEdit;
  const save = async () => { if (!sel) return; setBusy(true); try { await adminApi.roles.update(sel.id, { permissions: draft }); toast.success("Permissions updated"); reload(); setSel(null); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };
  const add = async (e: React.FormEvent) => { e.preventDefault(); try { await adminApi.roles.create({ ...nr, permissions: [] }); toast.success("Role created"); setCreate(false); setNr({ key: "", name: "", description: "" }); setSel(null); reload(); } catch (er) { toast.error((er as Error).message); } };
  return (
    <>
      <PageHeader title="Roles & Permissions" subtitle="Give each team member exactly the access they need." actions={canEdit && <button className="btn btn-primary" onClick={() => setCreate(true)}><i className="ri-add-line me-1" />New role</button>} />
      <div className="row g-4">
        <div className="col-lg-4"><Panel flush><div className="list-group list-group-flush">
          {roles?.map((r) => <button key={r.id} className={`list-group-item list-group-item-action py-3 ${sel?.id === r.id ? "active-role" : ""}`} onClick={() => setSel(r)}>
            <div className="d-flex justify-content-between"><strong>{r.name}</strong>{r.is_system && <span className="badge badge-soft-secondary">System</span>}</div><div className="text-muted fs-xs">{r.description} · {r.permissions.length} permissions</div></button>)}</div></Panel></div>
        <div className="col-lg-8">{sel && <Panel title={`${sel.name} — permissions`} actions={!locked && <div className="d-flex gap-2">{!sel.is_system && <button className="btn btn-sm btn-outline-danger" onClick={() => setDel(true)}>Delete</button>}<button className="btn btn-sm btn-primary" disabled={busy} onClick={save}>{busy && <Spinner size="sm" className="me-1" />}Save changes</button></div>}>
          {sel.key === "super_admin" && <div className="alert alert-warning py-2 fs-sm">Super Admin always has full access and cannot be edited.</div>}
          <div className="row g-3">{groups.map(([g, keys]) => <div key={g} className="col-md-6"><div className="block-card h-100"><div className="fw-bold mb-2">{titleCase(g)}</div>
            {keys.map((k) => <div className="form-check" key={k}><input className="form-check-input" type="checkbox" id={k} disabled={locked} checked={sel.key === "super_admin" || draft.includes(k)} onChange={() => setDraft((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d, k]))} /><label className="form-check-label fs-sm" htmlFor={k}>{titleCase(k.split(":")[1])}</label></div>)}</div></div>)}</div></Panel>}</div>
      </div>
      <Modal show={create} onClose={() => setCreate(false)} title="New role"><form onSubmit={add}>
        <Input label="Name" required value={nr.name} onChange={(e) => setNr({ ...nr, name: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") })} />
        <Input label="Key" required hint="lowercase_with_underscores" pattern="^[a-z][a-z0-9_]{2,48}$" value={nr.key} onChange={(e) => setNr({ ...nr, key: e.target.value })} />
        <Textarea label="Description" rows={2} value={nr.description} onChange={(e) => setNr({ ...nr, description: e.target.value })} />
        <div className="text-end"><button className="btn btn-primary">Create role</button></div></form></Modal>
      <ConfirmDialog show={del} danger message="Delete this role? Users must be reassigned first." confirmLabel="Delete" onClose={() => setDel(false)}
        onConfirm={async () => { try { await adminApi.roles.remove(sel!.id); toast.success("Role deleted"); setDel(false); setSel(null); reload(); } catch (e) { toast.error((e as Error).message); setDel(false); } }} />
    </>
  );
}
