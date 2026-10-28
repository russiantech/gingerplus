import DotsIcon from "@/components/common/DotsIcon";
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
import MobileMenu from "@/components/layout/MobileMenu";

const NAV = [
  { to: "/", label: "Home", end: true, icon: "ri-home-5-line", tint: "#fdf0cf", ink: "#9a6a0a" },
  { to: "/shop", label: "Shop", icon: "ri-shopping-basket-2-line", tint: "#fde4d0", ink: "#b0561a" },
  { to: "/about-us", label: "About", icon: "ri-seedling-line", tint: "#e3f0d8", ink: "#4a7a2c" },
  { to: "/wholesale", label: "Wholesale", icon: "ri-store-3-line", tint: "#e6ecfb", ink: "#3b5bb5" },
  { to: "/recipes", label: "Recipes", icon: "ri-cup-line", tint: "#fbe3ea", ink: "#b03a60" },
  { to: "/blog", label: "Blog", icon: "ri-quill-pen-line", tint: "#ece4f7", ink: "#6a46a8" },
  { to: "/contact", label: "Contact", icon: "ri-chat-smile-3-line", tint: "#dff3f1", ink: "#1f8a80" },
];
const MORE = [
  { to: "/our-ingredients", label: "Ingredients", icon: "ri-plant-line", tint: "#e3f0d8", ink: "#4a7a2c" },
  { to: "/health-benefits", label: "Health Benefits", icon: "ri-heart-pulse-line", tint: "#fbe3ea", ink: "#b03a60" },
  { to: "/bars-mixers", label: "Bars & Mixers", icon: "ri-goblet-line", tint: "#fdf0cf", ink: "#9a6a0a" },
  { to: "/events-gifting", label: "Events & Gifting", icon: "ri-gift-2-line", tint: "#fde4d0", ink: "#b0561a" },
  { to: "/become-a-distributor", label: "Distributor", icon: "ri-hand-coin-line", tint: "#e6ecfb", ink: "#3b5bb5" },
  { to: "/find-a-store", label: "Find a Store", icon: "ri-map-pin-2-line", tint: "#dff3f1", ink: "#1f8a80" },
  { to: "/testimonials", label: "Reviews", icon: "ri-star-smile-line", tint: "#fdf0cf", ink: "#9a6a0a" },
  { to: "/faq", label: "FAQ", icon: "ri-question-answer-line", tint: "#ece4f7", ink: "#6a46a8" },
  { to: "/media-press", label: "Media & Press", icon: "ri-newspaper-line", tint: "#e6ecfb", ink: "#3b5bb5" },
  { to: "/pay", label: "Pay Now", icon: "ri-secure-payment-line", tint: "#e3f0d8", ink: "#4a7a2c" },
  { to: "/track-order", label: "Track Order", icon: "ri-truck-line", tint: "#fde4d0", ink: "#b0561a" },
];

export default function PublicLayout() {
  usePageTracking(); useScrollTop();
  const { settings, banners } = useSite();
  const { user } = useAuth();
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);
  const wa = settings.contact.whatsapp_numbers?.[0] ?? "";
  const promo = settings.announcement.enabled ? settings.announcement.text : banners[0]?.text;

  const home = user ? (user.user_type === "staff" ? "/admin" : user.user_type === "partner" ? "/partner" : "/account") : "/login";
  const account = { to: home, label: user ? user.first_name : "Sign in", icon: "ri-user-smile-line", tint: "#ece4f7", ink: "#6a46a8" };

  return (
    <div className="public-shell d-flex flex-column min-vh-100">
      <div className="topline">
        <div className="container d-flex justify-content-between align-items-center py-2 gap-3">
          <span className="text-truncate"><i className="ri-leaf-line text-gold me-1" />{promo || settings.brand.slogan}</span>
          <span className="d-none d-md-flex gap-3">
            <a href={`tel:${settings.contact.phone}`}><i className="ri-phone-line me-1" />{settings.contact.phone}</a>
            <a href={waLink(wa)} target="_blank" rel="noreferrer"><i className="ri-whatsapp-line me-1" />WhatsApp</a>
            <Link to="/track-order"><i className="ri-truck-line me-1" />Track order</Link>
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container"><div className="dock">
          <button className="dock-menu-btn d-lg-none" aria-label="Open menu" onClick={() => setMobile(true)}><DotsIcon /></button>
          <Link to="/" className="me-lg-3 mx-auto mx-lg-0" aria-label="Southern Rose home"><img src="/images/logo.svg" alt="Southern Rose Ginger Plus" className="logo-img" /></Link>
          <nav className="d-none d-lg-flex gap-1 flex-grow-1 align-items-center justify-content-center">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className="nav-item-link">{n.label}</NavLink>)}
            <Dropdown toggle={(o) => <span className={`nav-item-link cursor-pointer ${o ? "active" : ""}`}>More <i className="ri-arrow-down-s-line" /></span>}>
              {MORE.map((m) => <Link key={m.to} to={m.to} className="dropdown-item py-2 d-flex align-items-center gap-2"><i className={`${m.icon} text-brown`} />{m.label}</Link>)}
            </Dropdown>
          </nav>
          <div className="d-flex align-items-center gap-2 ms-lg-0">
            <Link to={home} className="dock-btn d-none d-md-inline-flex"><i className="ri-user-smile-line" />{user ? user.first_name : "Sign in"}</Link>
            <button className="cart-btn" onClick={() => setOpen(true)} aria-label="Open cart"><span className="d-none d-sm-inline">Cart</span><span className="bag"><i className="ri-shopping-basket-2-line" />{count > 0 && <span className="count">{count}</span>}</span></button>
          </div>
        </div></div>
      </header>

      <MobileMenu open={mobile} onClose={() => setMobile(false)} primary={NAV} more={MORE.filter((m) => m.to !== "/track-order")} account={account} cartCount={count} onCart={() => setOpen(true)} phone={settings.contact.phone} waUrl={waLink(wa)} />

      <main className="flex-grow-1"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <a className="wa-fab" href={waLink(wa, "Hello Southern Rose, I'd like to place an order.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><i className="ri-whatsapp-line" /></a>
    </div>
  );
}
