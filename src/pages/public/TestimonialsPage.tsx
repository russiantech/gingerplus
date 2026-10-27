import { ErrorState, Skeleton } from "@/components/common";
import { ReviewForm } from "@/components/content/forms";
import PageHero from "@/components/content/PageHero";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import "@/styles/storefront.css";

export default function TestimonialsPage() {
  useDocumentTitle("Testimonials");
  const { data, loading, error, reload } = useAsync(() => publicService.testimonials(), []);
  return (<>
    <PageHero title="What Our Customers Say" subtitle="Real reviews from real customers — bars, retailers, and individuals across Nigeria." eyebrow="Testimonials" />
    <div className="container section-sm">
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="row g-4">{loading ? [0, 1, 2].map((i) => <div key={i} className="col-md-4"><Skeleton h={170} /></div>) : data?.map((t) => (
        <div key={t.id} className="col-md-6 col-lg-4"><div className="testimonial-card"><div className="text-gold mb-2">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div><p>"{t.quote}"</p>
          <div className="fw-bold">— {t.author_name}{t.business ? `, ${t.business}` : ""}</div><div className="text-muted fs-sm">{t.author_role}</div></div></div>))}</div>
      <div className="row justify-content-center mt-5"><div className="col-lg-7"><div className="card border-0 shadow-soft"><div className="card-body p-4"><h4 className="display-font fw-bold">Share Your Experience</h4><p className="text-muted">Tried Southern Rose? We'd love to hear from you.</p><ReviewForm /></div></div></div></div>
    </div></>);
}
