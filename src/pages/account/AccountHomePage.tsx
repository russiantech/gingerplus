import { Link } from "react-router-dom";
import { EmptyState, ErrorState, Skeleton, StatusBadge } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks";
import { accountService } from "@/services/account";
import { date, money } from "@/utils/format";
import "@/styles/commerce.css";

export default function AccountHomePage() {
  const { user } = useAuth();
  const orders = useAsync(() => accountService.orders(), []);
  const store = useAsync(() => accountService.myStore(), []);
  const list = orders.data ?? [];
  const spent = list.filter((o) => o.payment_status === "paid").reduce((n, o) => n + Number(o.total), 0);
  const open = list.filter((o) => !["completed", "delivered", "cancelled", "refunded"].includes(o.status)).length;
  return (
    <div>
      <h1 className="h3 fw-bold mb-1">Hello, {user?.first_name} 👋</h1><p className="text-muted">Here's what's happening with your orders.</p>
      <div className="row g-3 mb-4">
        {[["Orders", list.length, "ri-shopping-bag-3-line"], ["In progress", open, "ri-truck-line"], ["Total paid", money(spent), "ri-wallet-3-line"]].map(([l, v, i]) => (
          <div className="col-md-4" key={l as string}><div className="stat-mini d-flex align-items-center gap-3"><i className={`${i} fs-2 text-brown`} /><div><div className="text-muted fs-sm">{l}</div>{orders.loading ? <Skeleton h={22} w={60} /> : <div className="h5 fw-bold mb-0">{v}</div>}</div></div></div>))}
      </div>
      {store.data && <div className="card border-0 shadow-soft mb-4"><div className="card-body d-flex flex-wrap gap-3 align-items-center"><i className="ri-store-2-line fs-2 text-gold" />
        <div className="flex-grow-1"><div className="text-muted fs-sm">Your Southern Rose dealer</div><div className="fw-bold">{store.data.name}</div><div className="fs-sm text-muted">{store.data.address}, {store.data.state}</div></div>
        {store.data.phone && <a href={`tel:${store.data.phone}`} className="btn btn-outline-primary btn-sm"><i className="ri-phone-line me-1" />Call</a>}</div></div>}
      <div className="card border-0 shadow-soft"><div className="card-body">
        <div className="d-flex justify-content-between mb-2"><h6 className="fw-bold mb-0">Recent orders</h6><Link to="/account/orders" className="fs-sm">View all</Link></div>
        {orders.error && <ErrorState message={orders.error} onRetry={orders.reload} />}
        {!orders.loading && !list.length && <EmptyState icon="ri-shopping-bag-3-line" title="No orders yet" text="Your orders will show up here." action={<Link to="/shop" className="btn btn-primary btn-pill">Start shopping</Link>} />}
        {list.slice(0, 4).map((o) => (<Link key={o.id} to={`/account/orders/${o.id}`} className="d-flex align-items-center gap-3 py-3 border-top text-body text-decoration-none">
          <div className="flex-grow-1"><div className="fw-semibold">{o.number}</div><div className="text-muted fs-sm">{date(o.created_at)} · {o.items.length} item(s)</div></div>
          <StatusBadge status={o.status} /><strong>{money(o.total)}</strong></Link>))}
      </div></div>
    </div>
  );
}
