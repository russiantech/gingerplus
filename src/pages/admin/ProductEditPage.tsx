import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input, PageLoader, Select, Spinner, Switch, Textarea } from "@/components/common";
import { PageHeader, Panel } from "@/components/admin";
import { ImageUploader, KeyValueEditor, ListEditor } from "@/components/admin/catalog/editors";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { ProductInput, VariantInput } from "@/types";

type VForm = Omit<VariantInput, "price" | "pack_equivalent" | "compare_at_price" | "tiers"> & { price: number | string; pack_equivalent: number | string; compare_at_price: number | string | null; tiers: { min_qty: number | string; price: number | string; label?: string | null }[] };
const blankVariant = (n: number): VForm => ({ sku: "", label: "", size_label: "", unit_count: 1, pack_equivalent: 1, price: 0, compare_at_price: null, stock: 0, track_stock: true, is_active: true, sort_order: n, image_url: null, tiers: [] });
const blank = { name: "", slug: "", category_id: null as string | null, flavor: "", tagline: "", short_description: "", description: "", benefits: [] as string[], ingredients: "", nutrition: {} as Record<string, string>, how_to_enjoy: [] as string[], storage: "", accent_color: "#E8A317", images: [] as string[], is_featured: false, is_active: true, sort_order: 0, meta_title: "", meta_description: "" };

export default function ProductEditPage() {
  const { id } = useParams(); const nav = useNavigate(); const toast = useToast();
  const isNew = !id; useDocumentTitle(isNew ? "New product" : "Edit product");
  const [f, setF] = useState({ ...blank }); const [variants, setVariants] = useState<VForm[]>([blankVariant(1)]); const [busy, setBusy] = useState(false);
  const { data: cats } = useAsync(() => adminApi.categories.list(), []);
  const { data: product, loading } = useAsync(() => (id ? adminApi.products.get(id) : Promise.resolve(null)), [id]);
  useEffect(() => {
    if (!product) return;
    setF({ ...blank, ...product, flavor: product.flavor ?? "", tagline: product.tagline ?? "", short_description: product.short_description ?? "", description: product.description ?? "", ingredients: product.ingredients ?? "", storage: product.storage ?? "", accent_color: product.accent_color ?? "", meta_title: product.meta_title ?? "", meta_description: product.meta_description ?? "" });
    setVariants(product.variants.map((v) => ({ ...v, compare_at_price: v.compare_at_price ?? null, tiers: v.tiers.map((t) => ({ min_qty: t.min_qty, price: t.price, label: t.label })) } as VForm)));
  }, [product]);
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  const setV = (i: number, k: string, v: unknown) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { ...f, slug: f.slug || undefined, flavor: f.flavor || null, category_id: f.category_id || null,
        variants: variants.map((v, i) => ({ ...v, sort_order: i + 1, price: Number(v.price), pack_equivalent: Number(v.pack_equivalent) || 1, compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
          tiers: v.tiers.filter((t) => t.min_qty && t.price !== "").map((t) => ({ min_qty: Number(t.min_qty), price: Number(t.price), label: t.label || null })) })) } as unknown as ProductInput;
      const saved = isNew ? await adminApi.products.create(payload) : await adminApi.products.update(id!, payload);
      toast.success("Product saved"); if (isNew) nav(`/admin/products/${saved.id}`, { replace: true });
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  if (!isNew && loading) return <PageLoader />;

  return (
    <form onSubmit={save}>
      <PageHeader back={{ to: "/admin/products", label: "Products" }} title={isNew ? "New product" : f.name || "Edit product"}
        actions={<button className="btn btn-primary" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Save product</button>} />
      <div className="row g-4">
        <div className="col-xl-8 d-flex flex-column gap-4">
          <Panel title="General">
            <div className="row g-0 gx-3"><div className="col-md-8"><Input label="Product name" required value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="col-md-4"><Input label="Slug" hint="Auto-generated if empty" value={f.slug} onChange={(e) => set("slug", e.target.value)} /></div></div>
            <Input label="Tagline" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} />
            <Textarea label="Short description" value={f.short_description} rows={3} onChange={(e) => set("short_description", e.target.value)} />
            <Textarea label="Full description" value={f.description} rows={4} onChange={(e) => set("description", e.target.value)} />
            <Textarea label="Ingredients" value={f.ingredients} rows={2} onChange={(e) => set("ingredients", e.target.value)} />
            <Textarea label="Storage" value={f.storage} rows={2} onChange={(e) => set("storage", e.target.value)} />
          </Panel>
          <Panel title="Benefits & usage"><div className="row"><div className="col-md-6"><ListEditor label="Key benefits" value={f.benefits} onChange={(v) => set("benefits", v)} /></div>
            <div className="col-md-6"><ListEditor label="How to enjoy" value={f.how_to_enjoy} onChange={(v) => set("how_to_enjoy", v)} /></div></div>
            <KeyValueEditor label="Nutritional information (per bottle)" value={f.nutrition} onChange={(v) => set("nutrition", v)} /></Panel>
          <Panel title="Pack sizes, prices & stock" actions={<button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setVariants((v) => [...v, blankVariant(v.length + 1)])}><i className="ri-add-line" /> Add variant</button>}>
            {variants.map((v, i) => (
              <div className="block-card mb-3" key={i}>
                <div className="d-flex justify-content-between mb-2"><strong>Variant {i + 1}</strong>{variants.length > 1 && <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}><i className="ri-delete-bin-line" /></button>}</div>
                <div className="row g-0 gx-3">
                  <div className="col-md-5"><Input label="Label" required placeholder="350ml · Pack of 24" value={v.label} onChange={(e) => setV(i, "label", e.target.value)} /></div>
                  <div className="col-md-3"><Input label="SKU" required value={v.sku} onChange={(e) => setV(i, "sku", e.target.value)} /></div>
                  <div className="col-md-2"><Input label="Size" placeholder="350ml" value={v.size_label ?? ""} onChange={(e) => setV(i, "size_label", e.target.value)} /></div>
                  <div className="col-md-2"><Input label="Bottles / pack" type="number" value={v.unit_count} onChange={(e) => setV(i, "unit_count", Number(e.target.value))} /></div>
                  <div className="col-md-3"><Input label="Price (₦)" type="number" required value={v.price} onChange={(e) => setV(i, "price", e.target.value)} /></div>
                  <div className="col-md-3"><Input label="Compare-at (₦)" type="number" value={v.compare_at_price ?? ""} onChange={(e) => setV(i, "compare_at_price", e.target.value)} /></div>
                  <div className="col-md-3"><Input label="Counts as packs" type="number" step="0.01" hint="For the online-payment pack limit" value={v.pack_equivalent} onChange={(e) => setV(i, "pack_equivalent", e.target.value)} /></div>
                  <div className="col-md-3"><Input label="Stock" type="number" value={v.stock} onChange={(e) => setV(i, "stock", Number(e.target.value))} /></div>
                </div>
                <div className="d-flex gap-4 flex-wrap"><Switch label="Track stock" checked={v.track_stock} onChange={(x) => setV(i, "track_stock", x)} /><Switch label="Active" checked={v.is_active} onChange={(x) => setV(i, "is_active", x)} /></div>
                <div className="fw-medium fs-sm mb-1">Wholesale / volume price tiers</div>
                {v.tiers.map((t, k) => (
                  <div className="row g-2 mb-2 align-items-end" key={k}>
                    <div className="col-4"><input className="form-control form-control-sm" type="number" placeholder="From qty (packs)" value={t.min_qty} onChange={(e) => setV(i, "tiers", v.tiers.map((x, j) => (j === k ? { ...x, min_qty: e.target.value } : x)))} /></div>
                    <div className="col-4"><input className="form-control form-control-sm" type="number" placeholder="Unit price ₦" value={t.price} onChange={(e) => setV(i, "tiers", v.tiers.map((x, j) => (j === k ? { ...x, price: e.target.value } : x)))} /></div>
                    <div className="col-3"><input className="form-control form-control-sm" placeholder="Label" value={t.label ?? ""} onChange={(e) => setV(i, "tiers", v.tiers.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)))} /></div>
                    <div className="col-1"><button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setV(i, "tiers", v.tiers.filter((_, j) => j !== k))}>×</button></div>
                  </div>))}
                <button type="button" className="btn btn-sm btn-link p-0" onClick={() => setV(i, "tiers", [...v.tiers, { min_qty: 20, price: "", label: "Wholesale" }])}>+ Add price tier</button>
              </div>))}
          </Panel>
        </div>
        <div className="col-xl-4 d-flex flex-column gap-4">
          <Panel title="Status"><Switch label="Active (visible in store)" checked={f.is_active} onChange={(v) => set("is_active", v)} /><Switch label="Featured on homepage" checked={f.is_featured} onChange={(v) => set("is_featured", v)} />
            <Input label="Sort order" type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></Panel>
          <Panel title="Organisation">
            <Select label="Category" value={f.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}><option value="">Uncategorised</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            <Select label="Flavour" value={f.flavor} onChange={(e) => set("flavor", e.target.value)}><option value="">—</option><option value="turmeric">Turmeric</option><option value="honey">Honey</option><option value="guarana">Guarana</option></Select>
            <Input label="Accent colour" value={f.accent_color} onChange={(e) => set("accent_color", e.target.value)} /></Panel>
          <Panel title="Images"><ImageUploader label="" value={f.images} onChange={(v) => set("images", v)} /></Panel>
          <Panel title="SEO"><Input label="Meta title" value={f.meta_title} onChange={(e) => set("meta_title", e.target.value)} /><Textarea label="Meta description" rows={3} value={f.meta_description} onChange={(e) => set("meta_description", e.target.value)} /></Panel>
        </div>
      </div>
    </form>
  );
}
