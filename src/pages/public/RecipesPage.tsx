import { Img } from "@/components/common";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState, Skeleton } from "@/components/common";
import { RecipeSubmitForm } from "@/components/content/forms";
import PageHero from "@/components/content/PageHero";
import FlavorChip from "@/components/shop/FlavorChip";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import "@/styles/storefront.css";

const GROUPS = [["", "All"], ["cocktail", "Cocktails"], ["warm_drink", "Warm Drinks"], ["shot", "Shots"], ["mocktail", "Mocktails"]];

export default function RecipesPage() {
  useDocumentTitle("Recipes & Cocktails"); const [cat, setCat] = useState("");
  const { data, loading, error, reload } = useAsync(() => publicService.recipes(cat || undefined), [cat]);
  return (<>
    <PageHero title="Recipes & Cocktails" subtitle="From bold cocktails to soothing warm tonics — discover how to enjoy Southern Rose Ginger Plus." eyebrow="Recipes" />
    <div className="container section-sm">
      <div className="d-flex flex-wrap gap-2 mb-4">{GROUPS.map(([v, l]) => <button key={v} className={`btn btn-sm recipe-chip ${cat === v ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCat(v)}>{l}</button>)}</div>
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="row g-4">{loading ? [0, 1, 2].map((i) => <div key={i} className="col-md-4"><Skeleton h={240} /></div>) : data?.map((r) => (
        <div key={r.id} className="col-sm-6 col-lg-4"><Link to={`/recipes/${r.slug}`} className="text-decoration-none text-body"><div className="product-card"><div className="post-cover position-relative"><FlavorChip flavor={r.featured_flavor} />{r.image_url ? <Img src={r.image_url} alt={r.title} className="post-img" /> : <i className="ri-goblet-line" />}</div>
          <div className="p-3"><span className="badge badge-soft-primary mb-2">{r.category.replace("_", " ")}</span><h5 className="fw-bold">{r.title}</h5><p className="text-muted fs-sm">{r.summary}</p><span className="fw-semibold text-brown">View Recipe →</span></div></div></Link></div>))}</div>
      <div className="row justify-content-center mt-5"><div className="col-lg-8"><div className="card border-0 shadow-soft"><div className="card-body p-4"><h4 className="display-font fw-bold">Submit Your Recipe</h4><p className="text-muted">Created something with Southern Rose? Share it with us.</p><RecipeSubmitForm /></div></div></div></div>
    </div></>);
}
