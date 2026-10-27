import { Link } from "react-router-dom";
import { PageLoader } from "@/components/common";
import { Money } from "@/components/common";
import { useAsync } from "@/hooks";
import { shopService } from "@/services/shop";
import type { CmsBlock } from "@/types";
import "@/styles/storefront.css";
import { ContactForm, DistributorForm, NewsletterForm, WholesaleQuoteForm } from "./forms";

interface Item { icon?: string; title?: string; text?: string; link?: string; meta?: { label: string; value: string }[] }
interface Btn { label: string; url: string; variant?: string }
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function Heading({ b }: { b: CmsBlock }) {
  return b.heading ? <h2 className="section-title display-font mb-3">{b.heading}</h2> : null;
}
function SmartLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return /^(https?:|mailto:|tel:|#)/.test(to) ? <a href={to} className={className} target={to.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a> : <Link to={to} className={className}>{children}</Link>;
}

function PricingTable({ b }: { b: CmsBlock }) {
  const { data, loading } = useAsync(() => shopService.products(), []);
  const rows = (data ?? []).flatMap((p) => p.variants.map((v) => ({ p, v })))
    .sort((a, b2) => (a.v.size_label === b2.v.size_label ? 0 : a.v.size_label === "350ml" ? -1 : 1));
  return (
    <div><Heading b={b} />{loading ? <PageLoader /> : (
      <div className="table-responsive shadow-soft rounded-xl"><table className="table table-hover align-middle mb-0">
        <thead className="table-light"><tr><th>Product</th><th>Size</th><th>Pack size</th><th>Retail price</th><th>Wholesale price</th></tr></thead>
        <tbody>{rows.map(({ p, v }) => { const t = v.tiers[v.tiers.length - 1]; return (
          <tr key={v.id}><td className="fw-semibold">{p.flavor ? p.flavor.charAt(0).toUpperCase() + p.flavor.slice(1) : p.name}</td><td>{v.size_label}</td><td>{v.unit_count} pcs</td>
            <td><Money value={v.price} /></td><td>{t ? <><Money value={t.price} /> <span className="text-muted fs-xs">({t.min_qty}+ packs)</span></> : <span className="text-muted">On request</span>}</td></tr>); })}</tbody>
      </table></div>)}</div>
  );
}

export function Block({ b }: { b: CmsBlock }) {
  switch (b.type) {
    case "richtext":
      return <div><Heading b={b} /><div className="prose">{str(b.body)}</div></div>;
    case "cards": {
      const items = arr<Item>(b.items); const cols = Number(b.columns) || 3;
      const span = cols >= 4 ? "col-sm-6 col-lg-3" : cols === 2 ? "col-md-6" : "col-md-6 col-lg-4";
      return <div><Heading b={b} /><div className="row g-4">{items.map((it, i) => {
        const body = (<div className="feature-card">
          {it.icon && <span className="feature-icon"><i className={it.icon} /></span>}
          <h5 className="fw-bold">{it.title}</h5>{it.text && <p className="text-muted mb-2">{it.text}</p>}
          {arr<{ label: string; value: string }>(it.meta).map((m) => <div key={m.label} className="fs-sm mt-2"><span className="fw-semibold text-brown">{m.label}: </span><span className="text-muted">{m.value}</span></div>)}
          {it.link && it.link !== "#" && <span className="d-inline-block mt-3 fw-semibold text-brown">Learn more <i className="ri-arrow-right-line" /></span>}</div>);
        return <div key={i} className={span}>{it.link && it.link !== "#" ? <SmartLink to={it.link} className="text-decoration-none text-body d-block h-100">{body}</SmartLink> : body}</div>; })}</div></div>;
    }
    case "list":
      return <div><Heading b={b} /><ul className="list-unstyled row g-2">{arr<string>(b.items).map((t, i) => <li key={i} className="col-md-6 d-flex gap-2"><i className="ri-checkbox-circle-fill text-success mt-1" /><span>{t}</span></li>)}</ul></div>;
    case "steps":
      return <div><Heading b={b} /><div className="row g-4">{arr<Item>(b.items).map((s, i) => <div key={i} className="col-md-6 col-lg-3"><div className="d-flex gap-3"><span className="step-circle">{i + 1}</span><div><h6 className="fw-bold mb-1">{s.title}</h6><p className="text-muted fs-sm mb-0">{s.text}</p></div></div></div>)}</div></div>;
    case "table": {
      const cols = arr<string>(b.columns); const rows = arr<string[]>(b.rows);
      return <div><Heading b={b} /><div className="table-responsive"><table className="table"><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div></div>;
    }
    case "pricing_table":
      return <PricingTable b={b} />;
    case "cta":
      return <div className="cta-band text-center">{b.heading && <h3 className="display-font fw-bold">{b.heading}</h3>}{str(b.text) && <p className="mb-3">{str(b.text)}</p>}
        <div className="d-flex gap-2 justify-content-center flex-wrap">{arr<Btn>(b.buttons).map((x) => <SmartLink key={x.label} to={x.url} className={`btn btn-lg btn-pill px-4 ${x.variant === "outline" ? "btn-outline-dark" : "btn-dark"}`}>{x.label}</SmartLink>)}</div></div>;
    case "legal":
      return <div className="prose">{arr<{ title: string; body: string }>(b.sections).map((s) => <div key={s.title} className="legal-section mb-4"><h5 className="fw-bold">{s.title}</h5><p>{s.body}</p></div>)}</div>;
    case "form": {
      const kind = str(b.form);
      return <div id={kind}>{kind === "distributor" ? <DistributorForm heading={b.heading} /> : kind === "wholesale" ? <WholesaleQuoteForm heading={b.heading} />
        : kind === "newsletter" ? <><Heading b={b} /><NewsletterForm /></> : <ContactForm title={b.heading} />}</div>;
    }
    default:
      return b.body ? <div className="prose">{str(b.body)}</div> : null;
  }
}

export default function BlockRenderer({ blocks }: { blocks: CmsBlock[] }) {
  return <>{blocks.map((b, i) => <section key={i} className={i % 2 ? "section-sm bg-cream" : "section-sm"}><div className="container">{b.type === "legal" || b.type === "richtext" ? <div className="mx-auto" style={{ maxWidth: 800 }}><Block b={b} /></div> : <Block b={b} />}</div></section>)}</>;
}
