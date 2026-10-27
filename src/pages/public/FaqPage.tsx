import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState, SearchInput, Skeleton } from "@/components/common";
import PageHero from "@/components/content/PageHero";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import "@/styles/storefront.css";

export default function FaqPage() {
  useDocumentTitle("FAQ"); const [q, setQ] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => publicService.faqs(), []);
  const groups = useMemo(() => {
    const m = new Map<string, NonNullable<typeof data>>();
    (data ?? []).filter((f) => !q || (f.question + f.answer).toLowerCase().includes(q.toLowerCase())).forEach((f) => m.set(f.group, [...(m.get(f.group) ?? []), f]));
    return [...m.entries()];
  }, [data, q]);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (data ?? []).map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
  return (<>
    <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know about Southern Rose Ginger Plus." eyebrow="FAQ" />
    {data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
    <div className="container section-sm"><div className="mx-auto" style={{ maxWidth: 820 }}>
      <SearchInput value={q} onChange={setQ} placeholder="Search questions…" className="mb-4" />
      {error && <ErrorState message={error} onRetry={reload} />}{loading && <Skeleton h={220} />}
      {groups.map(([g, items]) => <div key={g} className="mb-4"><h5 className="display-font fw-bold mb-3">{g}</h5><div className="accordion accordion-sr shadow-soft rounded-xl overflow-hidden">
        {items.map((f) => <div className="accordion-item border-0 border-bottom" key={f.id}><h2 className="accordion-header"><button className={`accordion-button ${open === f.id ? "" : "collapsed"} fw-semibold`} onClick={() => setOpen(open === f.id ? null : f.id)} aria-expanded={open === f.id}>{f.question}</button></h2>
          {open === f.id && <div className="accordion-body text-muted">{f.answer}</div>}</div>)}</div></div>)}
      {!loading && !groups.length && <p className="text-center text-muted py-4">No questions match "{q}".</p>}
      <div className="text-center mt-4"><p className="text-muted">Still have questions?</p><Link to="/contact" className="btn btn-primary btn-pill px-4">Contact us</Link></div>
    </div></div></>);
}
