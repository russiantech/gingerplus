import { Img } from "@/components/common";
import { Link, useParams } from "react-router-dom";
import { PageLoader } from "@/components/common";
import PageHero from "@/components/content/PageHero";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import NotFoundPage from "./NotFoundPage";

export default function RecipeDetailPage() {
  const { slug = "" } = useParams();
  const { data: r, loading } = useAsync(() => publicService.recipe(slug), [slug]);
  useDocumentTitle(r?.title);
  if (loading) return <PageLoader />;
  if (!r) return <NotFoundPage />;
  return (<>
    <PageHero title={r.title} subtitle={r.summary} eyebrow={r.category.replace("_", " ")} />
    <div className="container section-sm">{r.image_url && <Img src={r.image_url} alt={r.title} className="w-100 rounded-xl mb-5 recipe-cover" />}<div className="row g-5">
      <div className="col-md-5"><div className="feature-card"><h5 className="fw-bold mb-3"><i className="ri-shopping-basket-line me-2 text-brown" />Ingredients</h5><ul className="list-unstyled mb-0">{r.ingredients.map((i) => <li key={i} className="d-flex gap-2 mb-2"><i className="ri-checkbox-blank-circle-fill text-gold fs-xs mt-2" />{i}</li>)}</ul></div></div>
      <div className="col-md-7"><h5 className="fw-bold mb-3"><i className="ri-list-ordered me-2 text-brown" />Method</h5>{r.steps.map((s, i) => <div key={i} className="d-flex gap-3 mb-3"><span className="step-circle">{i + 1}</span><p className="mb-0 pt-2">{s}</p></div>)}
        <div className="d-flex gap-2 mt-4"><Link to="/shop" className="btn btn-primary btn-pill px-4">Shop Ginger Plus</Link><Link to="/recipes" className="btn btn-outline-primary btn-pill px-4">More recipes</Link></div></div>
    </div></div></>);
}
