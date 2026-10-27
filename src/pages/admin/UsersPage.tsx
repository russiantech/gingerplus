import { useState } from "react";
import { Input, Modal, Select, Spinner, StatusBadge, Switch } from "@/components/common";
import { DataTable, PageHeader, Panel } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { date, initials, titleCase } from "@/utils/format";
import type { User } from "@/types";

export default function UsersPage() {
  useDocumentTitle("Team members");
  const toast = useToast(); const { user: me } = useAuth();
  const [page, setPage] = useState(1); const [edit, setEdit] = useState<Partial<User> & { password?: string } | null>(null); const [busy, setBusy] = useState(false);
  const { data, loading, reload } = useAsync(() => adminApi.users.list({ page, page_size: 20 }), [page]);
  const { data: roles } = useAsync(() => adminApi.roles.list(), []);
  const isNew = edit && !edit.id;
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return; setBusy(true);
    try {
      if (isNew) await adminApi.users.create({ email: edit.email, password: edit.password, first_name: edit.first_name, last_name: edit.last_name ?? "", phone: edit.phone, role_key: edit.role_key, user_type: edit.role_key === "store_partner" ? "partner" : "staff" });
      else await adminApi.users.update(edit.id!, { first_name: edit.first_name, last_name: edit.last_name, phone: edit.phone, role_key: edit.role_key, is_active: edit.is_active, ...(edit.password ? { password: edit.password } : {}) });
      toast.success("Saved"); setEdit(null); reload();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Team Members" subtitle="Staff and partner accounts. Assign roles to control what each person can do."
        actions={<button className="btn btn-primary" onClick={() => setEdit({ first_name: "", last_name: "", email: "", role_key: "sales_manager", is_active: true, password: "" })}><i className="ri-user-add-line me-1" />Add member</button>} />
      <Panel flush>
        <DataTable rows={data?.items} loading={loading} page={page} pages={data?.pages} onPage={setPage} onRowClick={(u) => setEdit({ ...u, password: "" })}
          columns={[{ key: "n", header: "Member", render: (u) => <div className="d-flex align-items-center gap-2"><span className="avatar-circle sm">{initials(u.full_name)}</span><div><div className="fw-semibold">{u.full_name}{u.id === me?.id && <span className="badge badge-soft-info ms-2">You</span>}</div><div className="text-muted fs-xs">{u.email}</div></div></div> },
            { key: "r", header: "Role", render: (u) => <span className="badge badge-soft-primary rounded-pill">{titleCase(u.role_key ?? "none")}</span> }, { key: "t", header: "Type", render: (u) => titleCase(u.user_type) },
            { key: "s", header: "Status", render: (u) => <StatusBadge status={u.is_active ? "published" : "draft"} label={u.is_active ? "Active" : "Disabled"} /> }, { key: "d", header: "Added", render: (u) => date(u.created_at) }]} />
      </Panel>
      <Modal show={!!edit} onClose={() => setEdit(null)} title={isNew ? "Add team member" : "Edit member"}>
        {edit && <form onSubmit={save}>
          <div className="row g-0 gx-3"><div className="col-6"><Input label="First name" required value={edit.first_name ?? ""} onChange={(e) => setEdit({ ...edit, first_name: e.target.value })} /></div>
            <div className="col-6"><Input label="Last name" value={edit.last_name ?? ""} onChange={(e) => setEdit({ ...edit, last_name: e.target.value })} /></div></div>
          <Input label="Email" type="email" required disabled={!isNew} value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
          <Input label="Phone" value={edit.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
          <Select label="Role" required value={edit.role_key ?? ""} onChange={(e) => setEdit({ ...edit, role_key: e.target.value })}>{roles?.filter((r) => r.key !== "customer").map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</Select>
          <Input label={isNew ? "Password" : "New password (optional)"} type="password" required={!!isNew} minLength={8} value={edit.password ?? ""} onChange={(e) => setEdit({ ...edit, password: e.target.value })} />
          {!isNew && <Switch label="Account active" checked={!!edit.is_active} onChange={(v) => setEdit({ ...edit, is_active: v })} />}
          <div className="d-flex justify-content-end gap-2"><button type="button" className="btn btn-light" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Save</button></div>
        </form>}
      </Modal>
    </>
  );
}
