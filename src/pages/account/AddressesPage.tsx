import { useState } from "react";
import AddressForm, { emptyAddress, validateAddress } from "@/components/account/AddressForm";
import { ConfirmDialog, EmptyState, ErrorState, Modal, Skeleton, Spinner } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { accountService } from "@/services/account";
import { ApiError } from "@/services/http";
import type { Address, AddressInput } from "@/types";

export default function AddressesPage() {
  useDocumentTitle("Addresses");
  const { user } = useAuth(); const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => accountService.addresses(), []);
  const [edit, setEdit] = useState<{ id?: string; v: AddressInput } | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [del, setDel] = useState<Address | null>(null); const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!edit) return; const e = validateAddress(edit.v); setErrs(e); if (Object.keys(e).length) return;
    setBusy(true);
    try { edit.id ? await accountService.updateAddress(edit.id, edit.v) : await accountService.addAddress(edit.v); toast.success("Address saved"); setEdit(null); reload(); }
    catch (x) { toast.error(x instanceof ApiError ? x.message : "Could not save"); } finally { setBusy(false); }
  };
  const remove = async () => { if (!del) return; setBusy(true); try { await accountService.deleteAddress(del.id); setDel(null); reload(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); } };
  const makeDefault = async (a: Address) => { await accountService.updateAddress(a.id, { is_default: true }).catch((x) => toast.error((x as Error).message)); reload(); };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3"><h1 className="h3 fw-bold mb-0">Address book</h1>
        <button className="btn btn-primary" onClick={() => { setErrs({}); setEdit({ v: emptyAddress(user?.full_name, user?.phone ?? "") }); }}><i className="ri-add-line me-1" />Add address</button></div>
      {error && <ErrorState message={error} onRetry={reload} />}{loading && <Skeleton h={110} />}
      {!loading && !data?.length && !error && <EmptyState icon="ri-map-pin-line" title="No saved addresses" text="Add one to speed up checkout." />}
      <div className="row g-3">{data?.map((a) => (
        <div className="col-md-6" key={a.id}><div className={`addr-card ${a.is_default ? "active" : ""}`} style={{ cursor: "default" }}>
          <div className="d-flex justify-content-between"><strong>{a.label}</strong>{a.is_default && <span className="badge badge-soft-primary">Default</span>}</div>
          <div className="fs-sm mt-1">{a.recipient_name} · {a.phone}</div><div className="text-muted fs-sm">{[a.line1, a.line2, a.city, a.state].filter(Boolean).join(", ")}</div>
          <div className="mt-2 d-flex gap-3 fs-sm"><button className="btn btn-link p-0" onClick={() => { setErrs({}); setEdit({ id: a.id, v: a }); }}>Edit</button>
            {!a.is_default && <button className="btn btn-link p-0" onClick={() => makeDefault(a)}>Make default</button>}<button className="btn btn-link p-0 text-danger" onClick={() => setDel(a)}>Delete</button></div></div></div>))}</div>
      <Modal show={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit address" : "New address"} size="lg"
        footer={<><button className="btn btn-light" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" disabled={busy} onClick={save}>{busy && <Spinner size="sm" className="me-2" />}Save address</button></>}>
        {edit && <><AddressForm value={edit.v} onChange={(v) => setEdit({ ...edit, v })} errors={errs} />
          <div className="form-check"><input className="form-check-input" type="checkbox" id="def" checked={!!edit.v.is_default} onChange={(e) => setEdit({ ...edit, v: { ...edit.v, is_default: e.target.checked } })} /><label htmlFor="def" className="form-check-label fs-sm">Make this my default address</label></div></>}
      </Modal>
      <ConfirmDialog show={!!del} danger busy={busy} message="Delete this address?" confirmLabel="Delete" onConfirm={remove} onClose={() => setDel(null)} />
    </div>
  );
}
