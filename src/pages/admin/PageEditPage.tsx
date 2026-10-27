import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input, PageLoader, Select, Spinner, Switch, Textarea } from "@/components/common";
import { PageHeader, Panel } from "@/components/admin";
import { ImageUploader } from "@/components/admin/catalog/editors";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { CmsBlock } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TYPES: Record<string, string> = { richtext: "Rich text", cards: "Cards / feature grid", list: "Bullet list", steps: "Numbered steps", table: "Table", pricing_table: "Wholesale pricing table (live)", cta: "Call to action", legal: "Legal sections", form: "Form" };
const NEW: Record<string, CmsBlock> = {
  richtext: { type: "richtext", heading: "", body: "" }, cards: { type: "cards", heading: "", columns: 3, items: [{ icon: "ri-leaf-line", title: "", text: "" }] }, list: { type: "list", heading: "", items: [""] },
  steps: { type: "steps", heading: "", items: [{ title: "", text: "" }] }, table: { type: "table", heading: "", columns: ["Column 1", "Column 2"], rows: [["", ""]] }, pricing_table: { type: "pricing_table", heading: "Product Range & Wholesale Pricing" },
  cta: { type: "cta", heading: "", text: "", buttons: [{ label: "Shop Now", url: "/shop", variant: "primary" }] }, legal: { type: "legal", sections: [{ title: "", body: "" }] }, form: { type: "form", form: "contact", heading: "" },
};

function Rows({ items, onChange, render, blank }: { items: any[]; onChange: (v: any[]) => void; render: (it: any, set: (k: string, v: unknown) => void) => React.ReactNode; blank: any }) {
  return <>{items.map((it, i) => <div key={i} className="border rounded-3 p-2 mb-2 position-relative">
    <button type="button" className="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-1" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><i className="ri-close-line" /></button>
    {render(it, (k, v) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x))))}</div>)}
    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([...items, blank])}>+ Add</button></>;
}

function BlockForm({ b, set }: { b: CmsBlock; set: (nb: CmsBlock) => void }) {
  const u = (k: string, v: unknown) => set({ ...b, [k]: v });
  const heading = <Input label="Heading" value={(b.heading as string) ?? ""} onChange={(e) => u("heading", e.target.value)} />;
  switch (b.type) {
    case "richtext": return <>{heading}<Textarea label="Body" rows={5} value={(b.body as string) ?? ""} onChange={(e) => u("body", e.target.value)} /></>;
    case "list": return <>{heading}<Textarea label="Items (one per line)" rows={5} value={((b.items as string[]) ?? []).join("\n")} onChange={(e) => u("items", e.target.value.split("\n"))} /></>;
    case "cards": return <>{heading}<Select label="Columns" value={String(b.columns ?? 3)} onChange={(e) => u("columns", Number(e.target.value))}>{[2, 3, 4].map((n) => <option key={n}>{n}</option>)}</Select>
      <Rows items={(b.items as any[]) ?? []} onChange={(v) => u("items", v)} blank={{ icon: "ri-leaf-line", title: "", text: "" }} render={(it, s) => <div className="row g-2 pe-4"><div className="col-4"><input className="form-control form-control-sm" placeholder="icon (ri-leaf-line)" value={it.icon ?? ""} onChange={(e) => s("icon", e.target.value)} /></div>
        <div className="col-8"><input className="form-control form-control-sm" placeholder="Title" value={it.title ?? ""} onChange={(e) => s("title", e.target.value)} /></div>
        <div className="col-12"><textarea className="form-control form-control-sm" rows={2} placeholder="Text" value={it.text ?? ""} onChange={(e) => s("text", e.target.value)} /></div>
        <div className="col-12"><input className="form-control form-control-sm" placeholder="Link (optional)" value={it.link ?? ""} onChange={(e) => s("link", e.target.value)} /></div></div>} /></>;
    case "steps": return <>{heading}<Rows items={(b.items as any[]) ?? []} onChange={(v) => u("items", v)} blank={{ title: "", text: "" }} render={(it, s) => <div className="pe-4"><input className="form-control form-control-sm mb-1" placeholder="Title" value={it.title ?? ""} onChange={(e) => s("title", e.target.value)} /><input className="form-control form-control-sm" placeholder="Text" value={it.text ?? ""} onChange={(e) => s("text", e.target.value)} /></div>} /></>;
    case "legal": return <Rows items={(b.sections as any[]) ?? []} onChange={(v) => u("sections", v)} blank={{ title: "", body: "" }} render={(it, s) => <div className="pe-4"><input className="form-control form-control-sm mb-1" placeholder="Section title" value={it.title ?? ""} onChange={(e) => s("title", e.target.value)} /><textarea className="form-control form-control-sm" rows={3} placeholder="Body" value={it.body ?? ""} onChange={(e) => s("body", e.target.value)} /></div>} />;
    case "cta": return <>{heading}<Textarea label="Text" rows={2} value={(b.text as string) ?? ""} onChange={(e) => u("text", e.target.value)} />
      <Rows items={(b.buttons as any[]) ?? []} onChange={(v) => u("buttons", v)} blank={{ label: "", url: "/", variant: "primary" }} render={(it, s) => <div className="row g-2 pe-4"><div className="col-4"><input className="form-control form-control-sm" placeholder="Label" value={it.label ?? ""} onChange={(e) => s("label", e.target.value)} /></div><div className="col-5"><input className="form-control form-control-sm" placeholder="URL" value={it.url ?? ""} onChange={(e) => s("url", e.target.value)} /></div>
        <div className="col-3"><select className="form-select form-select-sm" value={it.variant ?? "primary"} onChange={(e) => s("variant", e.target.value)}><option value="primary">Solid</option><option value="outline">Outline</option></select></div></div>} /></>;
    case "form": return <>{heading}<Select label="Form" value={(b.form as string) ?? "contact"} onChange={(e) => u("form", e.target.value)}>{["contact", "wholesale", "distributor", "newsletter"].map((f) => <option key={f}>{f}</option>)}</Select></>;
    case "table": return <>{heading}<Input label="Columns (comma separated)" value={((b.columns as string[]) ?? []).join(", ")} onChange={(e) => u("columns", e.target.value.split(",").map((s) => s.trim()))} />
      <Textarea label="Rows (one per line, cells separated by |)" rows={5} value={((b.rows as string[][]) ?? []).map((r) => r.join(" | ")).join("\n")} onChange={(e) => u("rows", e.target.value.split("\n").map((l) => l.split("|").map((c) => c.trim())))} /></>;
    default: return <>{heading}<p className="text-muted fs-sm mb-0">Rendered automatically from live product pricing.</p></>;
  }
}

export default function PageEditPage() {
  const { id } = useParams(); const toast = useToast(); const { reload } = useSite();
  const { data: page, loading } = useAsync(() => adminApi.content.pages.get(id!), [id]);
  const [f, setF] = useState<any>(null); const [busy, setBusy] = useState(false); const [raw, setRaw] = useState(false); const [rawText, setRawText] = useState(""); const [add, setAdd] = useState("richtext");
  useDocumentTitle(page ? `Edit ${page.title}` : "Edit page");
  useEffect(() => { if (page) { setF({ ...page }); setRawText(JSON.stringify(page.blocks, null, 2)); } }, [page]);
  if (loading || !f) return <PageLoader />;
  const set = (k: string, v: unknown) => setF((s: any) => ({ ...s, [k]: v }));
  const blocks: CmsBlock[] = f.blocks;
  const move = (i: number, d: number) => { const n = [...blocks]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set("blocks", n); };
  const save = async () => {
    let finalBlocks = blocks;
    if (raw) { try { finalBlocks = JSON.parse(rawText); } catch { toast.error("Blocks JSON is invalid"); return; } }
    setBusy(true);
    try { await adminApi.content.pages.update(f.id, { title: f.title, subtitle: f.subtitle, banner_image_url: f.banner_image_url, blocks: finalBlocks, status: f.status, meta_title: f.meta_title, meta_description: f.meta_description, show_in_footer: f.show_in_footer } as never); set("blocks", finalBlocks); toast.success("Page saved"); reload(); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader back={{ to: "/admin/content/pages", label: "Pages" }} title={f.title} subtitle={`/${f.slug}`}
        actions={<><a className="btn btn-light" href={`/${f.slug}`} target="_blank" rel="noreferrer"><i className="ri-external-link-line me-1" />View</a><button className="btn btn-primary" disabled={busy} onClick={save}>{busy && <Spinner size="sm" className="me-2" />}Save page</button></>} />
      <div className="row g-4">
        <div className="col-xl-8">
          <Panel title="Content blocks" actions={<button className="btn btn-sm btn-outline-secondary" onClick={() => { if (!raw) setRawText(JSON.stringify(blocks, null, 2)); else { try { set("blocks", JSON.parse(rawText)); } catch { toast.error("Invalid JSON"); return; } } setRaw(!raw); }}>{raw ? "Visual editor" : "Edit as JSON"}</button>}>
            {raw ? <Textarea rows={26} value={rawText} onChange={(e) => setRawText(e.target.value)} className="font-monospace" /> : <>
              {blocks.map((b, i) => (
                <div className="block-card mb-3" key={i}>
                  <div className="d-flex align-items-center justify-content-between mb-2"><span className="badge badge-soft-primary rounded-pill">{i + 1} · {TYPES[b.type] ?? b.type}</span>
                    <div className="btn-group btn-group-sm"><button className="btn btn-light" onClick={() => move(i, -1)} aria-label="Up"><i className="ri-arrow-up-line" /></button><button className="btn btn-light" onClick={() => move(i, 1)} aria-label="Down"><i className="ri-arrow-down-line" /></button>
                      <button className="btn btn-light text-danger" onClick={() => set("blocks", blocks.filter((_, j) => j !== i))} aria-label="Delete"><i className="ri-delete-bin-line" /></button></div></div>
                  <BlockForm b={b} set={(nb) => set("blocks", blocks.map((x, j) => (j === i ? nb : x)))} /></div>))}
              <div className="d-flex gap-2"><select className="form-select w-auto" value={add} onChange={(e) => setAdd(e.target.value)}>{Object.entries(TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <button className="btn btn-outline-primary" onClick={() => set("blocks", [...blocks, JSON.parse(JSON.stringify(NEW[add]))])}>Add block</button></div></>}
          </Panel>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Page settings"><Input label="Title" value={f.title} onChange={(e) => set("title", e.target.value)} /><Textarea label="Subtitle" rows={2} value={f.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
            <Select label="Status" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="published">Published</option><option value="draft">Draft</option></Select><Switch label="Show in footer" checked={f.show_in_footer} onChange={(v) => set("show_in_footer", v)} /></Panel>
          <Panel title="Banner image"><ImageUploader label="" single value={f.banner_image_url ? [f.banner_image_url] : []} onChange={(v) => set("banner_image_url", v[0] ?? null)} /></Panel>
          <Panel title="SEO"><Input label="Meta title" value={f.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} /><Textarea label="Meta description" rows={3} value={f.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} /></Panel>
        </div>
      </div>
    </>
  );
}
