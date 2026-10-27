import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Img } from "@/components/common";
import { useSite } from "@/contexts/SiteContext";
import "@/styles/storefront.css";

const FALLBACK = [
  { id: "f1", eyebrow: "Pursuing wellbeing", title: "Recharge Your Body with Three Powerful Varieties", subtitle: "Made with fresh Nigerian ginger, natural ingredients, and no artificial colours. Available in Turmeric, Honey, and Guarana. Choose 350ml (packed 24) or 125ml (packed 20).", primary_label: "Shop Now", primary_url: "/shop", secondary_label: "Wholesale Enquiry", secondary_url: "/wholesale", image_url: null as string | null, accent_color: "#E8A317" },
];

export default function HeroSlider() {
  const { hero } = useSite();
  const slides = hero.length ? hero : FALLBACK;
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false);
  useEffect(() => { if (slides.length < 2 || paused) return; const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6500); return () => clearInterval(t); }, [slides.length, paused]);
  const s = slides[i % slides.length];
  const art = s.image_url || `/images/hero/slide-${(i % 3) + 1}.svg`;
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);
  return (
    <section className="hero-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
      <div className="container"><div className="hero-slide row align-items-center py-5 g-4 fade-slide" key={s.id}>
        <div className="col-lg-6 order-2 order-lg-1">
          {s.eyebrow && <div className="section-eyebrow mb-2">{s.eyebrow}</div>}
          <h1 className="mb-3">{s.title}</h1>
          <p className="lead text-muted mb-4">{s.subtitle}</p>
          <div className="d-flex flex-wrap gap-2">
            {s.primary_label && <Link to={s.primary_url || "/shop"} className="btn btn-primary btn-lg btn-pill px-4">{s.primary_label}</Link>}
            {s.secondary_label && <Link to={s.secondary_url || "/wholesale"} className="btn btn-outline-primary btn-lg btn-pill px-4">{s.secondary_label}</Link>}
          </div>
          <div className="d-flex gap-4 mt-4 text-muted fs-sm flex-wrap"><span><i className="ri-leaf-line text-success me-1" />Fresh Nigerian ginger</span><span><i className="ri-shield-check-line text-success me-1" />No artificial colours</span><span><i className="ri-truck-line text-success me-1" />Nationwide delivery</span></div>
        </div>
        <div className="col-lg-6 order-1 order-lg-2 text-center"><Img src={art} alt="" className="hero-art sf-hero-media" fallback="/images/hero/slide-1.svg" loading="eager" /></div>
      </div></div>
      {slides.length > 1 && <>
        <button className="hero-arrow prev d-none d-md-block" onClick={() => go(-1)} aria-label="Previous slide"><i className="ri-arrow-left-s-line" /></button>
        <button className="hero-arrow next d-none d-md-block" onClick={() => go(1)} aria-label="Next slide"><i className="ri-arrow-right-s-line" /></button>
        <div className="hero-dots">{slides.map((_, n) => <button key={n} className={n === i ? "active" : ""} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />)}</div></>}
    </section>
  );
}
