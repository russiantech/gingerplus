import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import CartDrawer from "@/components/shop/CartDrawer";
import { Dropdown } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSite } from "@/contexts/SiteContext";
import { usePageTracking, useScrollTop } from "@/hooks";
import { waLink } from "@/utils/format";
import Footer from "@/components/layout/Footer";

const NAV = [
  { to: "/", label: "Home", end: true }, { to: "/shop", label: "Shop" }, { to: "/about-us", label: "About" },
  { to: "/wholesale", label: "Wholesale" }, { to: "/recipes", label: "Recipes" }, { to: "/blog", label: "Blog" }, { to: "/contact", label: "Contact" },
];
const MORE = [
  ["/our-ingredients", "Our Ingredients"], ["/health-benefits", "Health Benefits"], ["/bars-mixers", "Bars & Mixers"], ["/events-gifting", "Events & Gifting"],
  ["/become-a-distributor", "Become a Distributor"], ["/find-a-store", "Find a Store"], ["/testimonials", "Testimonials"], ["/faq", "FAQ"], ["/media-press", "Media & Press"], ["/pay", "Pay Now"],
];

export default function PublicLayout() {
  usePageTracking(); useScrollTop();
  const { settings, banners } = useSite();
  const { user } = useAuth();
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  const wa = settings.contact.whatsapp_numbers[0] ?? "";
  const promo = settings.announcement.enabled ? settings.announcement.text : banners[0]?.text;

  return (
    <div className="public-shell d-flex flex-column min-vh-100">
      <div className="topbar text-white small">
        <div className="container d-flex justify-content-between align-items-center py-2 gap-3">
          <span className="text-truncate"><i className="ri-leaf-line text-gold me-1" />{promo || settings.brand.slogan}</span>
          <span className="d-none d-md-flex gap-3">
            <a href={`tel:${settings.contact.phone}`}><i className="ri-phone-line me-1" />{settings.contact.phone}</a>
            <a href={waLink(wa)} target="_blank" rel="noreferrer"><i className="ri-whatsapp-line me-1" />WhatsApp</a>
            <Link to="/track-order"><i className="ri-truck-line me-1" />Track order</Link>
          </span>
        </div>
      </div>
      <header className="site-header sticky-top bg-body shadow-sm">
        <div className="container d-flex align-items-center gap-3 py-2">
          <button className="btn btn-link d-lg-none p-0 fs-3 text-body" aria-label="Menu" onClick={() => setMobile(true)}><i className="ri-menu-line" /></button>
          <Link to="/" className="me-lg-4"><img src="/images/logo.svg" alt="Southern Rose Ginger Plus" height={44} className="logo-img" /></Link>
          <nav className="d-none d-lg-flex gap-1 flex-grow-1 align-items-center">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className="nav-item-link">{n.label}</NavLink>)}
            <Dropdown toggle={(o) => <span className={`nav-item-link cursor-pointer ${o ? "active" : ""}`}>More <i className="ri-arrow-down-s-line" /></span>}>
              {MORE.map(([to, label]) => <Link key={to} to={to} className="dropdown-item py-2">{label}</Link>)}
            </Dropdown>
          </nav>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Link to={user ? (user.user_type === "staff" ? "/admin" : user.user_type === "partner" ? "/partner" : "/account") : "/login"} className="btn btn-light btn-pill d-none d-sm-inline-flex align-items-center gap-1">
              <i className="ri-user-line" />{user ? user.first_name : "Sign in"}</Link>
            <button className="btn btn-primary btn-pill position-relative" onClick={() => setOpen(true)} aria-label="Open cart"><i className="ri-shopping-bag-3-line me-1" /><span className="d-none d-sm-inline">Cart</span>
              {count > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-brown">{count}</span>}</button>
          </div>
        </div>
      </header>

      {mobile && <>
        <div className="offcanvas-backdrop fade show" onClick={() => setMobile(false)} />
        <div className="offcanvas offcanvas-start show" style={{ visibility: "visible" }} role="dialog">
          <div className="offcanvas-header"><img src="/images/logo.svg" alt="Southern Rose" height={38} /><button className="btn-close" onClick={() => setMobile(false)} aria-label="Close" /></div>
          <div className="offcanvas-body d-flex flex-column gap-1" onClick={() => setMobile(false)}>
            {[...NAV.map((n) => [n.to, n.label]), ...MORE].map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className="mobile-link">{label}</NavLink>)}
            <hr /><Link to={user ? "/account" : "/login"} className="mobile-link"><i className="ri-user-line me-2" />{user ? "My account" : "Sign in / Register"}</Link>
            <Link to="/track-order" className="mobile-link"><i className="ri-truck-line me-2" />Track order</Link>
          </div>
        </div></>}

      <main className="flex-grow-1"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <a className="wa-fab" href={waLink(wa, "Hello Southern Rose, I'd like to place an order.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><i className="ri-whatsapp-line" /></a>
    </div>
  );
}
