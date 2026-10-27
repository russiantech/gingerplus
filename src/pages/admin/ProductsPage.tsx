import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog, Img, SearchInput, StatusBadge } from "@/components/common";
import { DataTable, FilterBar, PageHeader, Panel } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { money } from "@/utils/format";
import type { Product } from "@/types";

export default function ProductsPage() {
  useDocumentTitle("Products");
  const nav = useNavigate(); const toast = useToast();
  const [q, setQ] = useState(""); const [page, setPage] = useState(1); const [cat, setCat] = useState(""); const [active, setActive] = useState("");
  const dq = useDebounce(q); const [del, setDel] = useState<Product | null>(null);
  const { data: cats } = useAsync(() => adminApi.categories.list(), []);
  const { data, loading, reload } = useAsync(() => adminApi.products.list({ q: dq, page, page_size: 20, category_id: cat, active: active === "" ? undefined : active === "1" }), [dq, page, cat, active]);
  const quickStock = async (id: string, cur: number) => {
    const v = window.prompt("Set stock level", String(cur)); if (v === null) return;
    try { await adminApi.products.setStock(id, Math.max(0, parseInt(v, 10) || 0)); toast.success("Stock updated"); reload(); } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHeader title="Products" subtitle="Manage product lines, pack sizes, prices and wholesale tiers." actions={<Link to="/admin/products/new" className="btn btn-primary"><i className="ri-add-line me-1" />Add product</Link>} />
      <Panel flush>
        <FilterBar>
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search products…" className="flex-grow-1" />
          <select className="form-select w-auto" value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }}><option value="">All categories</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="form-select w-auto" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}><option value="">Any status</option><option value="1">Active</option><option value="0">Archived</option></select>
        </FilterBar>
        <DataTable rows={data?.items} loading={loading} page={page} pages={data?.pages} onPage={setPage} onRowClick={(p) => nav(`/admin/products/${p.id}`)} empty={{ title: "No products found" }}
          columns={[
            { key: "p", header: "Product", render: (p) => <div className="d-flex align-items-center gap-2"><Img src={p.images[0]} className="thumb" /><div><div className="fw-semibold">{p.name}</div><div className="text-muted fs-xs">{p.category?.name ?? "Uncategorised"} · {p.flavor ?? "—"}</div></div></div> },
            { key: "v", header: "Variants & prices", render: (p) => <div className="d-flex flex-column gap-1">{p.variants.map((v) => <div key={v.id} className="fs-sm d-flex align-items-center gap-2"><span className="text-muted">{v.label}</span><strong>{money(v.price)}</strong>
              <button className={`btn btn-sm py-0 ${v.stock <= 20 ? "btn-outline-danger" : "btn-outline-secondary"}`} title="Edit stock" onClick={(e) => { e.stopPropagation(); quickStock(v.id, v.stock); }}>{v.stock} in stock</button></div>)}</div> },
            { key: "s", header: "Status", render: (p) => <div className="d-flex gap-1"><StatusBadge status={p.is_active ? "published" : "draft"} label={p.is_active ? "Active" : "Archived"} />{p.is_featured && <span className="badge badge-soft-warning rounded-pill">Featured</span>}</div> },
            { key: "a", header: "", className: "text-end", render: (p) => <button className="btn btn-sm btn-light text-danger" onClick={(e) => { e.stopPropagation(); setDel(p); }}><i className="ri-delete-bin-line" /></button> }]} />
      </Panel>
      <ConfirmDialog show={!!del} danger title="Delete product" message={`Delete “${del?.name}”? Products with order history are archived instead.`} confirmLabel="Delete" onClose={() => setDel(null)}
        onConfirm={async () => { try { toast.success((await adminApi.products.remove(del!.id)).detail); setDel(null); reload(); } catch (e) { toast.error((e as Error).message); } }} />
    </>
  );
}
