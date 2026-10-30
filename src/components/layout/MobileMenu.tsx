import BrandLogo from "@/components/common/BrandLogo";
import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export interface MenuItem { to: string; label: string; icon: string; tint?: string; ink?: string; end?: boolean }

/** Full grid menu: a bottom sheet of soft icon tiles (replaces the plain hamburger drawer). */
export default function MobileMenu({ open, onClose, primary, more, account, cartCount, onCart, phone, waUrl }:
  { open: boolean; onClose: () => void; primary: MenuItem[]; more: MenuItem[]; account: MenuItem; cartCount: number; onCart: () => void; phone: string; waUrl: string }) {
  const { pathname } = useLocation();
  useEffect(() => { onClose(); /* close on navigation */ }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [open, onClose]);
  if (!open) return null;
  const tile = (m: MenuItem) => (
    <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `menu-tile ${isActive ? "active" : ""}`}>
      <span className="ic" style={{ ["--tint" as string]: m.tint, ["--ink" as string]: m.ink }}><i className={m.icon} /></span>{m.label}</NavLink>
  );
  return (
    <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="scrim" onClick={onClose} />
      <div className="menu-panel">
        <div className="menu-grip" />
        <div className="d-flex align-items-center justify-content-between mb-3 px-1">
          <BrandLogo size={38} />
          <button className="circle-btn light" onClick={onClose} aria-label="Close menu"><i className="ri-close-line" /></button>
        </div>
        <div className="menu-grid">
          {primary.map(tile)}
          {tile(account)}
          <button className="menu-tile" onClick={() => { onClose(); onCart(); }}><span className="ic" style={{ ["--tint" as string]: "#fdf0cf" }}><i className="ri-shopping-basket-2-line" /></span>Cart{cartCount > 0 && <span className="count">{cartCount}</span>}</button>
        </div>
        <div className="menu-label">Explore</div>
        <div className="menu-grid">{more.map(tile)}</div>
        <div className="menu-label">Talk to us</div>
        <div className="d-flex gap-2">
          <a className="btn btn-dark flex-grow-1" href={`tel:${phone}`}><i className="ri-phone-line me-1" />Call</a>
          <a className="btn btn-primary flex-grow-1" href={waUrl} target="_blank" rel="noreferrer"><i className="ri-whatsapp-line me-1" />WhatsApp</a>
          <Link className="btn btn-light" to="/track-order" aria-label="Track order"><i className="ri-truck-line" /></Link>
        </div>
      </div>
    </div>
  );
}
