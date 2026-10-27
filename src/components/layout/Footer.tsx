import { useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/http";
import { publicService } from "@/services/public";
import { waLink } from "@/utils/format";

export default function Footer() {
  const { settings, footer_pages } = useSite();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const c = settings.contact, s = settings.social;

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { toast.success((await publicService.subscribe(email)).detail); setEmail(""); }
    catch (err) { toast.error(err instanceof ApiError ? err.message : "Could not subscribe"); } finally { setBusy(false); }
  };
  return (
    <footer className="site-footer text-white mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <img src="/images/logo-light.svg" alt="Southern Rose" height={46} className="mb-3" />
            <p className="text-white-50 mb-3">{settings.brand.slogan}. Bold Nigerian ginger drinks made with real ingredients — Turmeric, Honey and Guarana.</p>
            <div className="d-flex gap-2">
              {[["ri-instagram-line", s.instagram], ["ri-facebook-fill", s.facebook], ["ri-tiktok-fill", s.tiktok]].map(([i, h]) => <a key={i} href={h} target="_blank" rel="noreferrer" className="social-btn" aria-label={i}><i className={i} /></a>)}
            </div>
          </div>
          <div className="col-6 col-lg-2"><h6 className="text-gold mb-3">Company</h6><ul className="list-unstyled footer-links">
            <li><Link to="/about-us">About Us</Link></li><li><Link to="/shop">Products</Link></li><li><Link to="/wholesale">Wholesale</Link></li><li><Link to="/recipes">Recipes</Link></li><li><Link to="/contact">Contact</Link></li><li><Link to="/faq">FAQ</Link></li></ul></div>
          <div className="col-6 col-lg-2"><h6 className="text-gold mb-3">Help</h6><ul className="list-unstyled footer-links">
            <li><Link to="/track-order">Track Order</Link></li><li><Link to="/pay">Pay Now</Link></li><li><Link to="/find-a-store">Find a Store</Link></li>
            {footer_pages.filter((p) => ["shipping-returns", "privacy-policy", "terms-and-conditions"].includes(p.slug)).map((p) => <li key={p.slug}><Link to={`/${p.slug}`}>{p.title}</Link></li>)}</ul></div>
          <div className="col-lg-4"><h6 className="text-gold mb-3">Stay in the loop</h6>
            <form onSubmit={subscribe} className="input-group mb-3"><input type="email" required className="form-control" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button className="btn btn-primary" disabled={busy}>Subscribe</button></form>
            <ul className="list-unstyled small text-white-50 mb-0">
              <li className="mb-1"><i className="ri-whatsapp-line text-gold me-2" /><a href={waLink(c.whatsapp_numbers[0] ?? "")} target="_blank" rel="noreferrer">WhatsApp: {c.whatsapp_numbers.join(" · ")}</a></li>
              <li className="mb-1"><i className="ri-mail-line text-gold me-2" /><a href={`mailto:${c.email}`}>{c.email}</a></li>
              <li><i className="ri-map-pin-line text-gold me-2" />{c.address}</li></ul></div>
        </div>
      </div>
      <div className="border-top border-white border-opacity-10 py-3 text-center small text-white-50">© {new Date().getFullYear()} Southern Rose. All rights reserved. · Real Ingredients. Real Benefits.</div>
    </footer>
  );
}
