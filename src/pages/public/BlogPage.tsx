import { useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState, Img, Skeleton } from "@/components/common";
import { NewsletterForm } from "@/components/content/forms";
import PageHero from "@/components/content/PageHero";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import { date } from "@/utils/format";
import "@/styles/storefront.css";

const CATS = ["Recipes", "Wellness", "Ingredients", "Brand Story", "Events"];

export default function BlogPage() {
  useDocumentTitle("Blog"); const [cat, setCat] = useState("");
  const { data, loading, error, reload } = useAsync(() => publicService.blog(cat || undefined), [cat]);
  const [featured, ...rest] = data ?? [];
  const Cover = ({ src, icon }: { src?: string | null; icon: string }) => src ? <Img src={src} alt="" /> : <div className="post-cover"><i className={icon} /></div>;
  return (<>
    <PageHero title="Southern Rose Blog" subtitle="Recipes, wellness tips, and stories from the world of bold Nigerian ginger." eyebrow="Blog" />
    <div className="container section-sm">
      <div className="d-flex flex-wrap gap-2 mb-4">{["", ...CATS].map((c) => <button key={c} className={`btn btn-sm recipe-chip ${cat === c ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCat(c)}>{c || "All posts"}</button>)}</div>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading ? <Skeleton h={300} /> : <>
        {featured && !cat && <Link to={`/blog/${featured.slug}`} className="text-decoration-none text-body"><div className="product-card mb-4"><div className="row g-0 align-items-center"><div className="col-md-6"><Cover src={featured.cover_image_url} icon="ri-article-line" /></div>
          <div className="col-md-6 p-4"><span className="badge bg-warning text-dark mb-2">Featured Post</span><h3 className="display-font fw-bold">{featured.title}</h3><p className="text-muted">{featured.excerpt}</p><span className="fw-semibold text-brown">Read More →</span></div></div></div></Link>}
        <div className="row g-4">{(cat ? data ?? [] : rest).map((b) => <div key={b.id} className="col-md-6 col-lg-4"><Link to={`/blog/${b.slug}`} className="text-decoration-none text-body"><div className="product-card post-card"><Cover src={b.cover_image_url} icon="ri-article-line" /><div className="p-3"><span className="badge badge-soft-warning mb-2">{b.category}</span><h5 className="fw-bold">{b.title}</h5><p className="text-muted fs-sm">{b.excerpt}</p><div className="d-flex justify-content-between fs-xs text-muted"><span>{date(b.published_at)}</span><span className="fw-semibold text-brown">Read More →</span></div></div></div></Link></div>)}</div>
        {!data?.length && <div className="text-center text-muted py-5">No posts yet.</div>}</>}
      <div className="cta-band mt-5"><h4 className="display-font fw-bold">Subscribe</h4><p>Get new posts delivered to your inbox.</p><NewsletterForm dark /></div>
    </div></>);
}
