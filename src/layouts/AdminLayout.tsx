import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Dropdown } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/admin";
import { initials } from "@/utils/format";
import { safeGet, safeSet } from "@/utils/storage";

interface Item { to: string; label: string; icon: string; perm?: string; end?: boolean; badge?: "mail" }
const MENU: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: "ri-dashboard-3-line", perm: "dashboard:view", end: true }, { to: "/admin/analytics", label: "Traffic & Analytics", icon: "ri-bar-chart-grouped-line", perm: "analytics:view" }] },
  { title: "Sales", items: [
    { to: "/admin/orders", label: "Orders", icon: "ri-shopping-bag-3-line", perm: "orders:view" }, { to: "/admin/payments", label: "Payments", icon: "ri-bank-card-line", perm: "payments:view" },
    { to: "/admin/customers", label: "Customers", icon: "ri-group-line", perm: "customers:view" }, { to: "/admin/shipping", label: "Shipping Rates", icon: "ri-truck-line", perm: "orders:manage" }] },
  { title: "Catalogue", items: [
    { to: "/admin/products", label: "Products", icon: "ri-goblet-line", perm: "products:view" }, { to: "/admin/categories", label: "Categories", icon: "ri-price-tag-3-line", perm: "products:view" },
    { to: "/admin/promotions", label: "Promotions", icon: "ri-coupon-3-line", perm: "promotions:manage" }] },
  { title: "Network", items: [{ to: "/admin/stores", label: "Stores & Dealers", icon: "ri-store-2-line", perm: "stores:view" }, { to: "/admin/applications", label: "Applications", icon: "ri-file-user-line", perm: "stores:view" }] },
  { title: "Communication", items: [
    { to: "/admin/inbox", label: "Inbox", icon: "ri-mail-line", perm: "emails:manage", badge: "mail" }, { to: "/admin/contacts", label: "Contact Forms", icon: "ri-chat-1-line", perm: "contacts:manage" },
    { to: "/admin/subscribers", label: "Newsletter", icon: "ri-mail-send-line", perm: "contacts:manage" }] },
  { title: "Website", items: [
    { to: "/admin/content/hero", label: "Hero Slides", icon: "ri-slideshow-line", perm: "content:manage" }, { to: "/admin/content/pages", label: "Pages", icon: "ri-pages-line", perm: "content:manage" },
    { to: "/admin/content/blog", label: "Blog", icon: "ri-article-line", perm: "content:manage" }, { to: "/admin/content/recipes", label: "Recipes", icon: "ri-restaurant-line", perm: "content:manage" },
    { to: "/admin/content/testimonials", label: "Testimonials", icon: "ri-chat-quote-line", perm: "content:manage" }, { to: "/admin/content/faqs", label: "FAQs", icon: "ri-question-line", perm: "content:manage" }] },
  { title: "System", items: [{ to: "/admin/users", label: "Team Members", icon: "ri-user-settings-line", perm: "users:manage" }, { to: "/admin/roles", label: "Roles & Permissions", icon: "ri-shield-keyhole-line", perm: "users:manage" }, { to: "/admin/settings", label: "Settings", icon: "ri-settings-3-line", perm: "settings:manage" }] },
];

export default function AdminLayout() {
  const { user, can, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => safeGet("sr.admin.collapsed", false));
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState<boolean>(() => safeGet("sr.admin.dark", false));
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => { document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light"); safeSet("sr.admin.dark", dark); return () => document.documentElement.setAttribute("data-bs-theme", "light"); }, [dark]);
  useEffect(() => safeSet("sr.admin.collapsed", collapsed), [collapsed]);
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    if (!can("emails:manage")) return;
    const load = () => adminApi.emails.unread().then((r) => setUnread(r.unread)).catch(() => undefined);
    load(); const t = setInterval(load, 60000); return () => clearInterval(t);
  }, [can]);

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""} ${mobile ? "is-mobile-open" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-brand"><Link to="/admin"><img src="/images/logo-light.svg" alt="Southern Rose" height={38} className="brand-full" /><img src="/favicon.svg" alt="" height={34} className="brand-mini" /></Link></div>
        <nav className="sidebar-nav">
          {MENU.map((g) => {
            const items = g.items.filter((i) => !i.perm || can(i.perm));
            if (!items.length) return null;
            return <div key={g.title}><div className="sidebar-group">{g.title}</div>
              {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className="sidebar-link" title={i.label}><i className={i.icon} /><span>{i.label}</span>
                {i.badge === "mail" && unread > 0 && <span className="badge rounded-pill bg-warning text-dark ms-auto">{unread}</span>}</NavLink>)}</div>;
          })}
        </nav>
      </aside>
      {mobile && <div className="admin-backdrop" onClick={() => setMobile(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="icon-btn" onClick={() => (window.innerWidth < 992 ? setMobile(true) : setCollapsed((c) => !c))} aria-label="Toggle sidebar"><i className="ri-menu-2-line" /></button>
          <span className="text-muted d-none d-md-inline fs-sm">Pursuing wellbeing · Admin</span>
          <div className="ms-auto d-flex align-items-center gap-2">
            <Link to="/" target="_blank" className="btn btn-sm btn-light d-none d-sm-inline-flex align-items-center gap-1"><i className="ri-external-link-line" />View site</Link>
            {can("emails:manage") && <Link to="/admin/inbox" className="icon-btn position-relative" aria-label="Inbox"><i className="ri-mail-line" />{unread > 0 && <span className="notif-dot">{unread > 9 ? "9+" : unread}</span>}</Link>}
            <button className="icon-btn" onClick={() => setDark((d) => !d)} aria-label="Toggle theme"><i className={dark ? "ri-sun-line" : "ri-moon-line"} /></button>
            <Dropdown align="end" toggle={() => <button className="d-flex align-items-center gap-2 btn btn-link text-body text-decoration-none p-0"><span className="avatar-circle sm">{initials(user?.full_name ?? "A")}</span><span className="d-none d-md-block text-start lh-tight"><span className="d-block fw-semibold fs-sm">{user?.full_name}</span><span className="d-block text-muted fs-xs">{user?.role_key?.replace("_", " ")}</span></span></button>}>
              <Link className="dropdown-item" to="/account/profile"><i className="ri-user-line me-2" />My profile</Link>
              <button className="dropdown-item text-danger" onClick={logout}><i className="ri-logout-box-r-line me-2" />Sign out</button>
            </Dropdown>
          </div>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
