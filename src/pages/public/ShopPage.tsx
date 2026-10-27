import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState, Skeleton } from "@/components/common";
import PageHero from "@/components/content/PageHero";
import ProductCard from "@/components/shop/ProductCard";
import { useAsync, useDocumentTitle } from "@/hooks";
import { shopService } from "@/services/shop";
import { FLAVOR_COLOR } from "@/utils/constants";
import "@/styles/storefront.css";

export default function ShopPage() {
  useDocumentTitle("Our Drinks");
  const [category, setCategory] = useState(""); const [flavor, setFlavor] = useState(""); const [size, setSize] = useState("");
  const cats = useAsync(() => shopService.categories(), []);
  const { data, loading, error, reload } = useAsync(() => shopService.products({ category: category || undefined, flavor: flavor || undefined }), [category, flavor]);
  const rows = useMemo(() => (data ?? []).flatMap((p) => p.variants.filter((v) => v.is_active && (!size || v.size_label === size)).map((v) => ({ p, v })))
    .sort((a, b) => (a.v.size_label === b.v.size_label ? 0 : a.v.size_label === "350ml" ? -1 : 1)), [data, size]);
  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) =>
    <button className={`btn btn-sm recipe-chip ${active ? "btn-primary" : "btn-outline-secondary"}`} onClick={onClick}>{children}</button>;
  return (
    <>
      <PageHero title="Our Drinks" subtitle="Three varieties. Two sizes. One bold ginger." eyebrow="Shop" />
      <div className="container section-sm">
        <div className="d-flex flex-wrap gap-4 mb-4 align-items-center">
          <div className="d-flex flex-wrap gap-2 align-items-center"><span className="fs-sm fw-semibold text-muted">Flavour</span>
            <Pill active={!flavor} onClick={() => setFlavor("")}>All</Pill>
            {Object.keys(FLAVOR_COLOR).map((f) => <Pill key={f} active={flavor === f} onClick={() => setFlavor(f)}><span className="d-inline-block rounded-circle me-1" style={{ width: 8, height: 8, background: FLAVOR_COLOR[f] }} />{f[0].toUpperCase() + f.slice(1)}</Pill>)}</div>
          <div className="d-flex flex-wrap gap-2 align-items-center"><span className="fs-sm fw-semibold text-muted">Size</span>
            <Pill active={!size} onClick={() => setSize("")}>All</Pill><Pill active={size === "350ml"} onClick={() => setSize("350ml")}>350ml · 24</Pill><Pill active={size === "125ml"} onClick={() => setSize("125ml")}>125ml · 20</Pill></div>
          {(cats.data?.length ?? 0) > 1 && <div className="d-flex flex-wrap gap-2 align-items-center"><span className="fs-sm fw-semibold text-muted">Category</span>
            <Pill active={!category} onClick={() => setCategory("")}>All</Pill>{cats.data!.map((c) => <Pill key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</Pill>)}</div>}
        </div>
        {error && <ErrorState message={error} onRetry={reload} />}
        <div className="row g-4">
          {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="col-sm-6 col-lg-4"><Skeleton h={420} /></div>)}
          {!loading && rows.map(({ p, v }) => <div key={v.id} className="col-sm-6 col-lg-4"><ProductCard product={p} variant={v} /></div>)}
        </div>
        {!loading && !rows.length && !error && <div className="text-center py-5 text-muted">No products match your filters.</div>}
        <div className="cta-band mt-5 d-md-flex align-items-center justify-content-between gap-3">
          <div><h4 className="display-font fw-bold mb-1">Buying for your bar, store, or event?</h4><p className="mb-0">Wholesale pricing on 350ml packs of 24 and 125ml packs of 20.</p></div>
          <Link to="/wholesale" className="btn btn-dark btn-lg btn-pill px-4 mt-3 mt-md-0">Request Wholesale Price List</Link></div>
      </div>
    </>
  );
}
