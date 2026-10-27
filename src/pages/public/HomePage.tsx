import { Link } from "react-router-dom";
import { NewsletterForm } from "@/components/content/forms";
import { Img, Skeleton } from "@/components/common";
import HeroSlider from "@/components/shop/HeroSlider";
import { useSite } from "@/contexts/SiteContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import { shopService } from "@/services/shop";
import "@/styles/storefront.css";

const FLAVORS = [
  { key: "turmeric", name: "Turmeric", color: "#CF8F0C", text: "Golden turmeric meets fiery ginger, with a touch of garlic for depth. Daily wellness for recovery, immunity, and glow." },
  { key: "honey", name: "Honey", color: "#9A6516", text: "Smooth, soothing, made with Dark Forest Honey and a touch of garlic. Calms the throat and lifts your mood — hot or cold." },
  { key: "guarana", name: "Guarana", color: "#4A7A2C", text: "Clean energy from Amazonian guarana, powered by Nigerian ginger. Focus and stamina in every bottle." },
];
const WHY = [
  ["ri-seedling-line", "Fresh Nigerian Ginger", "Not extract. Real ginger, crushed daily."],
  ["ri-palette-line", "No Artificial Colours", "Colour comes from turmeric, Dark Forest Honey, and guarana."],
  ["ri-heart-pulse-line", "Three Benefits, One Brand", "Wellness. Soothing. Energy."],
  ["ri-stack-line", "Two Sizes", "350ml and 125ml."],
  ["ri-goblet-line", "Trusted by Bars & Beer Lovers", "A favourite mixer for cocktails."],
];

export default function HomePage() {
  useDocumentTitle("Pursuing wellbeing");
  const { settings } = useSite();
  const products = useAsync(() => shopService.products(), []);
  const tests = useAsync(() => publicService.testimonials(), []);
  const recipes = useAsync(() => publicService.recipes(), []);
  const posts = useAsync(() => publicService.blog(), []);
  const variantOf = (flavor: string, size: string) => products.data?.find((p) => p.flavor === flavor)?.variants.find((v) => v.size_label === size);
  const shopLink = (flavor: string, size: string) => { const p = products.data?.find((x) => x.flavor === flavor); const v = variantOf(flavor, size); return p ? `/products/${p.slug}${v ? `?variant=${v.id}` : ""}` : "/shop"; };

  return (
    <>
      <HeroSlider />
      <section className="section"><div className="container">
        <div className="text-center mb-5"><div className="section-eyebrow">{settings.brand.taglines[0] ?? "Bold Ginger. Three Powerful Blends."}</div><h2 className="section-title display-font">Choose your blend</h2></div>
        <div className="row g-4">{FLAVORS.map((f) => (
          <div key={f.key} className="col-md-4"><div className="flavor-card" style={{ background: `linear-gradient(145deg, ${f.color}, ${f.color}dd)` }}>
            <h3 className="display-font fw-bold">{f.name}</h3><p className="pe-5 me-4 opacity-90" style={{ minHeight: 120 }}>{f.text}</p>
            <div className="d-flex flex-wrap gap-2 pb-3" style={{ maxWidth: "65%" }}>
              <Link to={shopLink(f.key, "350ml")} className="btn btn-light btn-sm btn-pill fw-semibold">Shop 350ml</Link><Link to={shopLink(f.key, "125ml")} className="btn btn-light btn-sm btn-pill fw-semibold">Shop 125ml</Link></div>
            <img src={`/images/products/${f.key}-350ml.svg`} alt="" /></div></div>))}</div>
      </div></section>

      <section className="section bg-cream"><div className="container">
        <div className="text-center mb-5"><div className="section-eyebrow">Bold Ginger. Perfect Plus.</div><h2 className="section-title display-font">Now in Two Sizes</h2></div>
        <div className="row g-4 justify-content-center">
          <div className="col-md-5"><div className="size-card text-center"><img src="/images/products/honey-350ml.svg" height={170} alt="" className="mb-3" /><div className="stat-pill">350ml</div><p className="fw-semibold mb-1">Packed 24</p><p className="text-muted mb-3">Perfect for sharing, retail, and bars.</p><Link to="/shop" className="btn btn-primary btn-pill px-4">Shop 350ml</Link></div></div>
          <div className="col-md-5"><div className="size-card text-center"><img src="/images/products/honey-125ml.svg" height={170} alt="" className="mb-3" /><div className="stat-pill">125ml</div><p className="fw-semibold mb-1">Packed 20</p><p className="text-muted mb-3">Perfect for shots, events, and on-the-go.</p><Link to="/shop" className="btn btn-primary btn-pill px-4">Shop 125ml</Link></div></div>
        </div>
      </div></section>

      <section className="section"><div className="container">
        <div className="text-center mb-5"><div className="section-eyebrow">Real Ingredients. Real Benefits.</div><h2 className="section-title display-font">Why Southern Rose?</h2></div>
        <div className="row g-4 justify-content-center">{WHY.map(([icon, t, d]) => <div key={t} className="col-sm-6 col-lg-4 col-xl"><div className="feature-card text-center"><span className="feature-icon"><i className={icon} /></span><h6 className="fw-bold">{t}</h6><p className="text-muted fs-sm mb-0">{d}</p></div></div>)}</div>
      </div></section>

      <section className="container"><div className="cta-band d-md-flex align-items-center justify-content-between gap-4">
        <div><h3 className="display-font fw-bold">Buying for your bar, store, or event?</h3><p className="mb-0">We supply 350ml packs of 24 and 125ml packs of 20 at wholesale prices.</p></div>
        <Link to="/wholesale" className="btn btn-dark btn-lg btn-pill px-4 mt-3 mt-md-0 flex-shrink-0">Request Wholesale Price List</Link></div></section>

      <section className="section"><div className="container">
        <div className="text-center mb-5"><div className="section-eyebrow">Testimonials</div><h2 className="section-title display-font">What Our Customers Say</h2></div>
        <div className="row g-4">{tests.loading ? [0, 1, 2].map((i) => <div key={i} className="col-md-4"><Skeleton h={160} /></div>) : (tests.data ?? []).slice(0, 3).map((t) => (
          <div key={t.id} className="col-md-4"><div className="testimonial-card"><div className="text-gold mb-2">{"★".repeat(t.rating)}</div><p>{t.quote}</p><div className="fw-bold">{t.author_name}{t.business ? `, ${t.business}` : ""}</div><div className="text-muted fs-sm">{t.author_role}</div></div></div>))}</div>
        <div className="text-center mt-4"><Link to="/testimonials" className="btn btn-outline-primary btn-pill px-4">Read more reviews</Link></div>
      </div></section>

      <section className="section bg-cream"><div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4"><div><div className="section-eyebrow">Recipes & stories</div><h2 className="section-title display-font mb-0">Sip, mix, read</h2></div><Link to="/recipes" className="fw-semibold d-none d-sm-block">All recipes →</Link></div>
        <div className="row g-4">
          {(recipes.data ?? []).slice(0, 3).map((r) => <div key={r.id} className="col-md-4"><Link to={`/recipes/${r.slug}`} className="text-decoration-none text-body"><div className="product-card post-card"><div className="post-cover"><i className="ri-goblet-line" /></div><div className="p-3"><span className="badge badge-soft-primary mb-2">{r.category.replace("_", " ")}</span><h5 className="fw-bold">{r.title}</h5><p className="text-muted fs-sm mb-0">{r.summary}</p></div></div></Link></div>)}
          {(posts.data ?? []).slice(0, 3).map((b) => <div key={b.id} className="col-md-4"><Link to={`/blog/${b.slug}`} className="text-decoration-none text-body"><div className="product-card post-card">{b.cover_image_url ? <Img src={b.cover_image_url} alt="" /> : <div className="post-cover"><i className="ri-article-line" /></div>}<div className="p-3"><span className="badge badge-soft-warning mb-2">{b.category}</span><h6 className="fw-bold">{b.title}</h6><p className="text-muted fs-sm mb-0">{b.excerpt}</p></div></div></Link></div>)}
        </div>
      </div></section>

      <section className="section"><div className="container"><div className="row justify-content-center"><div className="col-lg-9 text-center">
        <h2 className="section-title display-font">Stay in the Loop</h2><p className="text-muted mb-4">Be the first to know about new products, recipes, and wholesale offers.</p><NewsletterForm /><p className="fs-xs text-muted mt-2">We'll never share your email. Unsubscribe anytime.</p></div></div></div></section>
    </>
  );
}
