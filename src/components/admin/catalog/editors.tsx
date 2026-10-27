import { useRef, useState } from "react";
import "@/styles/admin-catalog.css";
import { Img, Spinner } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { adminApi } from "@/services/admin";

/** Image list: upload (to /admin/media) or paste URL; reorder + remove. Single mode keeps one image. */
export function ImageUploader({ value, onChange, single, label = "Images" }: { value: string[]; onChange: (v: string[]) => void; single?: boolean; label?: string }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const add = (u: string) => onChange(single ? [u] : [...value, u]);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true);
    try { const urls: string[] = []; for (const f of Array.from(files)) urls.push((await adminApi.media.upload(f)).url); onChange(single ? [urls[0]] : [...value, ...urls]); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  const move = (i: number, d: number) => { const n = [...value]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="mb-3">
      <label className="form-label fw-medium fs-sm mb-1">{label}</label>
      <div className="d-flex flex-wrap gap-2 mb-2">
        {value.map((u, i) => (
          <div className="img-tile" key={u + i}><Img src={u} alt="" />
            <div className="tile-actions">{!single && <button type="button" onClick={() => move(i, -1)} aria-label="Move left"><i className="ri-arrow-left-s-line" /></button>}
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove"><i className="ri-delete-bin-line" /></button>
              {!single && <button type="button" onClick={() => move(i, 1)} aria-label="Move right"><i className="ri-arrow-right-s-line" /></button>}</div></div>
        ))}
        <button type="button" className="img-tile d-flex flex-column align-items-center justify-content-center text-muted border-dashed" onClick={() => ref.current?.click()} disabled={busy} style={{ borderStyle: "dashed" }}>
          {busy ? <Spinner size="sm" /> : <><i className="ri-upload-2-line fs-4" /><span className="fs-xs">Upload</span></>}</button>
      </div>
      <input ref={ref} type="file" hidden multiple={!single} accept="image/*" onChange={(e) => upload(e.target.files)} />
      <div className="input-group input-group-sm"><input className="form-control" placeholder="…or paste an image URL / path (e.g. /images/products/honey-350ml.svg)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" className="btn btn-outline-secondary" disabled={!url.trim()} onClick={() => { add(url.trim()); setUrl(""); }}>Add</button></div>
    </div>
  );
}

/** Editable list of strings (benefits, steps, ingredients...). */
export function ListEditor({ label, value, onChange, placeholder = "Add item", multiline }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; multiline?: boolean }) {
  const set = (i: number, v: string) => onChange(value.map((x, k) => (k === i ? v : x)));
  return (
    <div className="mb-3"><label className="form-label fw-medium fs-sm mb-1">{label}</label>
      {value.map((v, i) => (
        <div className="input-group input-group-sm mb-1" key={i}>
          {multiline ? <textarea className="form-control" rows={2} value={v} onChange={(e) => set(i, e.target.value)} /> : <input className="form-control" value={v} onChange={(e) => set(i, e.target.value)} />}
          <button type="button" className="btn btn-outline-secondary" onClick={() => { if (i > 0) { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); } }} aria-label="Up"><i className="ri-arrow-up-s-line" /></button>
          <button type="button" className="btn btn-outline-danger" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove"><i className="ri-close-line" /></button>
        </div>))}
      <button type="button" className="btn btn-sm btn-light" onClick={() => onChange([...value, ""])}><i className="ri-add-line" /> {placeholder}</button>
    </div>
  );
}

export function KeyValueEditor({ label, value, onChange }: { label: string; value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const rows = Object.entries(value);
  const commit = (r: [string, string][]) => onChange(Object.fromEntries(r.filter(([k]) => k !== "")));
  return (
    <div className="mb-3"><label className="form-label fw-medium fs-sm mb-1">{label}</label>
      {rows.map(([k, v], i) => (
        <div className="input-group input-group-sm mb-1" key={i}>
          <input className="form-control" value={k} placeholder="e.g. Energy" onChange={(e) => commit(rows.map((r, n) => (n === i ? [e.target.value || " ", r[1]] : r)) as [string, string][])} />
          <input className="form-control" value={v} placeholder="e.g. 48 kcal" onChange={(e) => commit(rows.map((r, n) => (n === i ? [r[0], e.target.value] : r)) as [string, string][])} />
          <button type="button" className="btn btn-outline-danger" onClick={() => commit(rows.filter((_, n) => n !== i))}><i className="ri-close-line" /></button>
        </div>))}
      <button type="button" className="btn btn-sm btn-light" onClick={() => onChange({ ...value, [`Item ${rows.length + 1}`]: "" })}><i className="ri-add-line" /> Add row</button>
    </div>
  );
}
