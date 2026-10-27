import { Link, useParams } from "react-router-dom";
import { Img, PageLoader } from "@/components/common";
import PageHero from "@/components/content/PageHero";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import { date } from "@/utils/format";
import NotFoundPage from "./NotFoundPage";

const inline = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((s, i) => (s.startsWith("**") ? <strong key={i}>{s.slice(2, -2)}</strong> : s));

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const { data: p, loading } = useAsync(() => publicService.post(slug), [slug]);
  useDocumentTitle(p?.title);
  if (loading) return <PageLoader />;
  if (!p) return <NotFoundPage />;
  return (<>
    <PageHero title={p.title} eyebrow={p.category} subtitle={`${p.author ?? "Southern Rose Team"} · ${date(p.published_at)}`} />
    <article className="container section-sm"><div className="mx-auto" style={{ maxWidth: 760 }}>
      {p.cover_image_url && <Img src={p.cover_image_url} alt="" className="rounded-xl w-100 mb-4" />}
      {p.body.split(/\n{2,}/).map((para, i) => <p key={i} className="fs-5" style={{ lineHeight: 1.8 }}>{inline(para)}</p>)}
      <div className="d-flex gap-2 mt-4"><Link to="/blog" className="btn btn-outline-primary btn-pill px-4">← All posts</Link><Link to="/shop" className="btn btn-primary btn-pill px-4">Shop Ginger Plus</Link></div>
    </div></article></>);
}
