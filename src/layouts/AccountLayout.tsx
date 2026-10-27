import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks";

const ITEMS = [["/account", "Overview", "ri-dashboard-line", true], ["/account/orders", "My Orders", "ri-shopping-bag-3-line", false], ["/account/addresses", "Addresses", "ri-map-pin-line", false], ["/account/profile", "Profile & Security", "ri-user-settings-line", false]] as const;

export default function AccountLayout() {
  const { user, logout } = useAuth();
  useDocumentTitle("My Account");
  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        <aside className="col-lg-3"><div className="card border-0 shadow-soft"><div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3"><span className="avatar-circle">{user?.first_name[0]}</span><div className="min-w-0"><div className="fw-bold text-truncate">{user?.full_name}</div><div className="text-muted fs-sm text-truncate">{user?.email}</div></div></div>
          <nav className="nav flex-lg-column nav-pills gap-1 account-nav">
            {ITEMS.map(([to, label, icon, end]) => <NavLink key={to} to={to} end={end} className="nav-link"><i className={`${icon} me-2`} />{label}</NavLink>)}
            <button className="nav-link text-start text-danger" onClick={logout}><i className="ri-logout-box-r-line me-2" />Sign out</button>
          </nav></div></div></aside>
        <section className="col-lg-9"><Outlet /></section>
      </div>
    </div>
  );
}
