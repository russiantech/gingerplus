import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <PageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
}
export function RequireStaff({ perm }: { perm?: string }) {
  const { user, loading, can } = useAuth(); const loc = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (user.user_type !== "staff") return <Navigate to="/" replace />;
  if (perm && !can(perm)) return <div className="text-center py-5"><i className="ri-lock-2-line display-4 text-brown" /><h5 className="mt-2">Access restricted</h5><p className="text-muted">Your role doesn't include this area. Ask a Super Admin for access.</p></div>;
  return <Outlet />;
}
export function RequirePartner() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user && (user.user_type === "partner" || user.user_type === "staff") ? <Outlet /> : <Navigate to="/login" replace />;
}
export function GuestOnly() {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <PageLoader />;
  const from = (loc.state as { from?: string } | null)?.from;
  return user ? <Navigate to={from ?? (user.user_type === "staff" ? "/admin" : user.user_type === "partner" ? "/partner" : "/account")} replace /> : <Outlet />;
}
