import type { ReactNode } from "react";
import "@/styles/storefront.css";

export default function PageHero({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string | null; eyebrow?: string; children?: ReactNode }) {
  return (
    <section className="page-hero"><div className="container position-relative" style={{ zIndex: 1 }}>
      {eyebrow && <div className="section-eyebrow text-gold mb-2">{eyebrow}</div>}
      <h1 className="display-font mb-2">{title}</h1>{subtitle && <p className="lead mb-0">{subtitle}</p>}{children}
    </div></section>
  );
}
