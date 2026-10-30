import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Img } from "@/components/common";
import { useSite } from "@/contexts/SiteContext";
import "@/styles/storefront.css";

const INTERVAL = 5500;
const FALLBACK = [
  { id: "f1", eyebrow: "Pursuing wellbeing", title: "Recharge Your Body with Three Powerful Varieties", subtitle: "Made with fresh Nigerian ginger, natural ingredients, and no artificial colours. Available in Turmeric, Honey, and Guarana. Choose 350ml (packed 24) or 125ml (packed 20).", primary_label: "Shop Now", primary_url: "/shop", secondary_label: "Wholesale Enquiry", secondary_url: "/wholesale", image_url: null as string | null, accent_color: "#E8A317" },
  { id: "f2", eyebrow: "Ginger Plus with Honey", title: "Smooth, soothing, made with Dark Forest Honey", subtitle: "Calms the throat and lifts your mood — hot or cold. A touch of garlic adds depth and immune support.", primary_label: "Shop Honey", primary_url: "/shop", secondary_label: "Our Ingredients", secondary_url: "/our-ingredients", image_url: null, accent_color: "#B7791F" },
  { id: "f3", eyebrow: "Ginger Plus with Guarana", title: "Clean energy. Bold ginger.", subtitle: "Focus and stamina in every bottle — natural caffeine from guarana, powered by fresh Nigerian ginger.", primary_label: "Shop Guarana", primary_url: "/shop", secondary_label: "Bars & Mixers", secondary_url: "/bars-mixers", image_url: null, accent_color: "#5B8C3A" },
];

/** Auto-sliding hero. Pauses on hover/focus and when the tab is hidden; supports swipe, arrows and dots. */
export default function HeroSlider() {
  const { hero } = useSite();
  const slides = hero && hero.length ? hero : FALLBACK;
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // bumps on resume so the progress bar and timer restart together
  const touchX = useRef<number | null>(null);
  const idx = i % n;

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [i, n, paused, tick]);
  useEffect(() => {
    const onVis = () => { setPaused(document.hidden); if (!document.hidden) setTick((t) => t + 1); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = (d: number) => { setI((x) => (x + d + n) % n); setTick((t) => t + 1); };
  const goTo = (k: number) => { setI(k); setTick((t) => t + 1); };
  const resume = () => { setPaused(false); setTick((t) => t + 1); };
  const s = slides[idx];
  const next = slides[(idx + 1) % n];
  const art = (x: typeof s, k: number) => x.image_url || `/images/hero/slide-${(k % 3) + 1}.webp`;

  return (
    <section className={`hero-soft hero-slider container ${paused ? "paused" : ""}`} aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={resume} onFocus={() => setPaused(true)} onBlur={resume}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touchX.current === null) return; const dx = e.changedTouches[0].clientX - touchX.current; touchX.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <div className="hero-stage" style={{ ["--accent" as string]: s.accent_color || "#E8A317", ["--dur" as string]: `${INTERVAL}ms` }} aria-live="polite">
        <div className="hero-copy" key={`c-${s.id}`}>
          {s.eyebrow && <span className="section-eyebrow"><i className="ri-leaf-line" />{s.eyebrow}</span>}
          <h1>{s.title}</h1>
          <p className="lead">{s.subtitle}</p>
          <div className="hero-cta">
            {s.primary_label && <Link to={s.primary_url || "/shop"} className="btn btn-primary btn-lg">{s.primary_label}</Link>}
            {s.secondary_label && <Link to={s.secondary_url || "/wholesale"} className="btn-arrow">{s.secondary_label}<span className="arr"><i className="ri-arrow-right-up-line" /></span></Link>}
          </div>
          <div className="hero-points">
            <span className="chip"><i className="ri-leaf-line" />Fresh Nigerian ginger</span>
            <span className="chip"><i className="ri-shield-check-line" />No artificial colours</span>
            <span className="chip"><i className="ri-truck-line" />Nationwide delivery</span>
          </div>
        </div>
        <div className="hero-visual" key={`v-${s.id}`}>
          <span className="hero-blob" />
          <Img src={art(s, idx)} alt="" className="hero-art" fallback="/images/hero/slide-1.webp" loading="eager" />
          <span className="float-card a"><span className="soft-icon" style={{ width: 38, height: 38, fontSize: "1.1rem", borderRadius: 13 }}><i className="ri-goblet-line" /></span><span>350ml<b>Packed 24</b></span></span>
          <span className="float-card b"><span className="soft-icon" style={{ width: 38, height: 38, fontSize: "1.1rem", borderRadius: 13 }}><i className="ri-flashlight-line" /></span><span>125ml<b>Packed 20</b></span></span>
        </div>
        {n > 1 && <>
          <div className="hero-controls">
            <button className="hero-arrow" onClick={() => go(-1)} aria-label="Previous slide"><i className="ri-arrow-left-s-line" /></button>
            <div className="hero-dots">{slides.map((x, k) => <button key={`${x.id}-${k === idx ? tick : 0}`} className={k === idx ? "active" : ""} onClick={() => goTo(k)} aria-label={`Slide ${k + 1}`} aria-current={k === idx} />)}</div>
            <button className="hero-arrow" onClick={() => go(1)} aria-label="Next slide"><i className="ri-arrow-right-s-line" /></button>
          </div>
          <button className="hero-next" onClick={() => go(1)} aria-label="Next slide"><img src={art(next, idx + 1)} alt="" /><span><small>Next</small>{next.eyebrow || next.title}</span></button>
        </>}
      </div>
    </section>
  );
}
