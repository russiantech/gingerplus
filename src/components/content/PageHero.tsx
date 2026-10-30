import type { ReactNode } from "react";
import "@/styles/storefront.css";
import { assetUrl } from "@/utils/format";

export default function PageHero({ title, subtitle, eyebrow, children, image }: { title: string; subtitle?: string | null; eyebrow?: string; children?: ReactNode; image?: string | null }) {
  return (
    <section className={`page-hero ${image ? "has-img" : ""}`} style={image ? { ["--hero-img" as string]: `url("${assetUrl(image)}")` } : undefined}><div className="container position-relative" style={{ zIndex: 1 }}>
      {eyebrow && <div className="section-eyebrow text-gold mb-2">{eyebrow}</div>}
      <h1 className="display-font mb-2">{title}</h1>{subtitle && <p className="lead mb-0">{subtitle}</p>}{children}
    </div></section>
  );
}
