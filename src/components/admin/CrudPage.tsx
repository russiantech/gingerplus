import { useMemo, useState, type ReactNode } from "react";
import { ConfirmDialog, Input, Modal, Select, SearchInput, Spinner, Switch, Textarea, ErrorState } from "@/components/common";
import { DataTable, PageHeader, Panel, FilterBar, type Column } from "@/components/admin";
import { ImageUploader, ListEditor } from "@/components/admin/catalog/editors";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldDef {
  name: string; label: string; type?: "text" | "textarea" | "number" | "select" | "switch" | "list" | "image" | "multi" | "datetime" | "email" | "tel" | "csv";
  options?: { value: string; label: string }[]; required?: boolean; hint?: string; col?: number; placeholder?: string; step?: string;
}
export interface CrudApi<T> { list: (q?: any) => Promise<T[]>; create: (d: any) => Promise<unknown>; update: (id: string, d: any) => Promise<unknown>; remove: (id: string) => Promise<unknown> }

export function FieldInputs({ fields, value, set }: { fields: FieldDef[]; value: Record<string, any>; set: (name: string, v: any) => void }) {
  return (
    <div className="row g-0 gx-3">
      {fields.map((f) => {
        const v = value[f.name]; const col = `col-md-${f.col ?? 12}`;
        let ctl: ReactNode;
        switch (f.type) {
          case "textarea": ctl = <Textarea label={f.label} hint={f.hint} value={v ?? ""} required={f.required} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />; break;
          case "select": ctl = <Select label={f.label} hint={f.hint} value={v ?? ""} required={f.required} onChange={(e) => set(f.name, e.target.value)}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>; break;
          case "switch": ctl = <Switch label={f.label} hint={f.hint} checked={!!v} onChange={(x) => set(f.name, x)} />; break;
          case "list": ctl = <ListEditor label={f.label} value={v ?? []} onChange={(x) => set(f.name, x)} multiline />; break;
          case "image": ctl = <ImageUploader label={f.label} single value={v ? [v] : []} onChange={(x) => set(f.name, x[0] ?? null)} />; break;
          case "multi": ctl = <div className="mb-3"><label className="form-label fw-medium fs-sm mb-1">{f.label}</label><div className="border rounded-3 p-2" style={{ maxHeight: 130, overflowY: "auto" }}>
            {f.options?.map((o) => <div className="form-check" key={o.value}><input className="form-check-input" type="checkbox" id={`${f.name}-${o.value}`} checked={(v ?? []).includes(o.value)} onChange={() => set(f.name, (v ?? []).includes(o.value) ? (v ?? []).filter((x: string) => x !== o.value) : [...(v ?? []), o.value])} /><label className="form-check-label fs-sm" htmlFor={`${f.name}-${o.value}`}>{o.label}</label></div>)}</div>{f.hint && <div className="form-text">{f.hint}</div>}</div>; break;
          case "csv": ctl = <Input label={f.label} hint={f.hint ?? "Comma separated"} value={(v ?? []).join(", ")} onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />; break;
          case "datetime": ctl = <Input type="datetime-local" label={f.label} hint={f.hint} value={v ? String(v).slice(0, 16) : ""} onChange={(e) => set(f.name, e.target.value ? new Date(e.target.value).toISOString() : null)} />; break;
          case "number": ctl = <Input type="number" step={f.step} label={f.label} hint={f.hint} value={v ?? ""} required={f.required} onChange={(e) => set(f.name, e.target.value === "" ? null : Number(e.target.value))} />; break;
          default: ctl = <Input type={f.type ?? "text"} label={f.label} hint={f.hint} value={v ?? ""} required={f.required} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />;
        }
        return <div key={f.name} className={col}>{ctl}</div>;
      })}
    </div>
  );
}

interface Props<T> {
  title: string; subtitle?: string; noun: string; api: CrudApi<T>; columns: Column<T>[]; fields: FieldDef[]; defaults: Record<string, any>;
  searchKeys?: string[]; extraActions?: (row: T, reload: () => void) => ReactNode; filter?: { label: string; options: { value: string; label: string }[]; key: string };
  modalSize?: "md" | "lg" | "xl"; canCreate?: boolean; toPayload?: (form: any) => any; fromRow?: (row: T) => any; headerExtra?: ReactNode;
}

export default function CrudPage<T extends { id: string }>({ title, subtitle, noun, api, columns, fields, defaults, searchKeys = [], extraActions, filter, modalSize = "lg", canCreate = true, toPayload, fromRow, headerExtra }: Props<T>) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api.list(), []);
  const [q, setQ] = useState(""); const [f, setF] = useState("");
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<T | null>(null);

  const rows = useMemo(() => (data ?? []).filter((r: any) =>
    (!q || searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase()))) && (!filter || !f || String(r[filter.key]) === f)), [data, q, f, searchKeys, filter]);

  const open = (r: T | "new") => { setEditing(r); setForm(r === "new" ? { ...defaults } : fromRow ? fromRow(r) : { ...(r as any) }); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = toPayload ? toPayload(form) : Object.fromEntries(fields.map((fd) => [fd.name, form[fd.name]]));
      if (editing === "new") await api.create(payload); else await api.update((editing as T).id, payload);
      toast.success(`${noun} saved`); setEditing(null); reload();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!del) return; setBusy(true);
    try { await api.remove(del.id); toast.success(`${noun} deleted`); setDel(null); reload(); } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  const cols: Column<T>[] = [...columns, { key: "_a", header: "", className: "text-end", width: 130, render: (r) => (
    <div className="d-flex gap-1 justify-content-end" onClick={(e) => e.stopPropagation()}>{extraActions?.(r, reload)}
      <button className="btn btn-sm btn-light" onClick={() => open(r)} aria-label="Edit"><i className="ri-pencil-line" /></button>
      <button className="btn btn-sm btn-light text-danger" onClick={() => setDel(r)} aria-label="Delete"><i className="ri-delete-bin-line" /></button></div>) }];

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<>{headerExtra}{canCreate && <button className="btn btn-primary" onClick={() => open("new")}><i className="ri-add-line me-1" />Add {noun}</button>}</>} />
      {error && <ErrorState message={error} onRetry={reload} />}
      <Panel flush>
        {(searchKeys.length > 0 || filter) && <FilterBar>
          {searchKeys.length > 0 && <SearchInput value={q} onChange={setQ} placeholder={`Search ${title.toLowerCase()}…`} className="flex-grow-1" />}
          {filter && <select className="form-select w-auto" value={f} onChange={(e) => setF(e.target.value)} aria-label={filter.label}><option value="">{filter.label}</option>{filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
        </FilterBar>}
        <DataTable columns={cols} rows={rows} loading={loading} empty={{ title: `No ${title.toLowerCase()} yet`, action: canCreate ? <button className="btn btn-primary" onClick={() => open("new")}>Add {noun}</button> : undefined }} />
      </Panel>
      <Modal show={!!editing} onClose={() => setEditing(null)} size={modalSize} title={editing === "new" ? `Add ${noun}` : `Edit ${noun}`}>
        <form onSubmit={save}>
          <FieldInputs fields={fields} value={form} set={(n, v) => setForm((s) => ({ ...s, [n]: v }))} />
          <div className="d-flex justify-content-end gap-2 mt-2"><button type="button" className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Save</button></div>
        </form>
      </Modal>
      <ConfirmDialog show={!!del} danger busy={busy} confirmLabel="Delete" message={`Delete this ${noun.toLowerCase()}? This cannot be undone.`} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
