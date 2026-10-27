import { NewsletterForm } from "@/components/content/forms";
import PageHero from "@/components/content/PageHero";
import { useDocumentTitle } from "@/hooks";

export default function NewsletterPage() {
  useDocumentTitle("Newsletter");
  return (<>
    <PageHero title="Stay in the Loop" subtitle="Be the first to know about new products, recipes, and wholesale offers." eyebrow="Newsletter" />
    <div className="container section-sm"><div className="row g-5 align-items-center">
      <div className="col-lg-6"><h4 className="fw-bold mb-3">What You'll Get</h4><ul className="list-unstyled">{["New product launches (like our 125ml shot packs)", "Exclusive recipes and cocktail ideas", "Wholesale and bulk order offers", "Health and wellness tips"].map((t) => <li key={t} className="d-flex gap-2 mb-2"><i className="ri-checkbox-circle-fill text-success mt-1" />{t}</li>)}</ul></div>
      <div className="col-lg-6"><div className="card border-0 shadow-soft"><div className="card-body p-4"><h5 className="fw-bold mb-3">Sign Up</h5><NewsletterForm /><h6 className="fw-bold mt-4 mb-1">We Respect Your Privacy</h6><p className="text-muted fs-sm mb-0">We'll never share your email. Unsubscribe anytime.</p></div></div></div>
    </div></div></>);
}
