import { useSearchParams } from "react-router-dom";
import { ContactForm } from "@/components/content/forms";
import PageHero from "@/components/content/PageHero";
import { useSite } from "@/contexts/SiteContext";
import { useDocumentTitle } from "@/hooks";
import { waLink } from "@/utils/format";
import "@/styles/storefront.css";

export default function ContactPage() {
  useDocumentTitle("Contact"); const [sp] = useSearchParams(); const { settings } = useSite(); const c = settings.contact; const s = settings.social;
  const opts = [
    ["ri-whatsapp-line", "WhatsApp (Fastest)", c.whatsapp_numbers.join(" · "), waLink(c.whatsapp_numbers?.[0] ?? "", "Hello Southern Rose")],
    ["ri-phone-line", "Phone", `${c.phone} · ${c.phone_hours}`, `tel:${c.phone}`],
    ["ri-mail-line", "Email", c.email, `mailto:${c.email}`],
    ["ri-map-pin-line", "Visit Us", c.address, c.maps_url],
  ];
  return (
    <>
      <PageHero title="Get in Touch with Southern Rose" subtitle="Questions, orders, or wholesale enquiries? We'd love to hear from you." eyebrow="Contact" />
      <div className="container section-sm"><div className="row g-5">
        <div className="col-lg-5"><div className="d-grid gap-3">
          {opts.map(([i, t, d, h]) => <a key={t} className="contact-option" href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span className="feature-icon mb-0 flex-shrink-0"><i className={i} /></span><div><div className="fw-bold">{t}</div><div className="text-muted fs-sm">{d}</div></div></a>)}</div>
          <div className="mt-4"><h6 className="fw-bold">For wholesale &amp; distribution</h6><p className="text-muted fs-sm">If you're a bar, retailer, or distributor, please include your business name, location, expected monthly volume and products of interest. We'll respond within 24 hours.</p></div>
          <div className="d-flex gap-2 align-items-center"><span className="fw-semibold fs-sm">Follow us</span><a className="icon-btn" href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><i className="ri-instagram-line" /></a><a className="icon-btn" href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><i className="ri-facebook-fill" /></a><a className="icon-btn" href={s.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><i className="ri-tiktok-fill" /></a><span className="text-muted fs-sm">{s.handle}</span></div></div>
        <div className="col-lg-7"><div className="card border-0 shadow-soft"><div className="card-body p-4"><ContactForm title="Send Us a Message" defaultSubject={sp.get("subject") ?? "general"} /></div></div></div>
      </div></div>
    </>
  );
}
