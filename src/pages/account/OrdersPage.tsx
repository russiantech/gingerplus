import { Link } from "react-router-dom";
import { EmptyState, ErrorState, Skeleton, StatusBadge } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { accountService } from "@/services/account";
import { date, money } from "@/utils/format";

export default function OrdersPage() {
  useDocumentTitle("My orders");
  const { data, loading, error, reload } = useAsync(() => accountService.orders(), []);
  return (
    <div><h1 className="h3 fw-bold mb-3">My orders</h1>
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && <Skeleton h={90} className="mb-2" />}
      {!loading && !data?.length && !error && <EmptyState icon="ri-shopping-bag-3-line" title="No orders yet" action={<Link to="/shop" className="btn btn-primary btn-pill">Shop now</Link>} />}
      {data?.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="card border-0 shadow-soft mb-3 text-body text-decoration-none"><div className="card-body d-flex flex-wrap gap-3 align-items-center">
          <div className="flex-grow-1"><div className="fw-bold">{o.number}</div><div className="text-muted fs-sm">{date(o.created_at)} · {o.items.map((i) => `${i.quantity}× ${i.product_name}`).join(", ")}</div></div>
          <div className="d-flex gap-2"><StatusBadge status={o.status} /><StatusBadge status={o.payment_status} /></div><strong>{money(o.total)}</strong><i className="ri-arrow-right-s-line text-muted" /></div></Link>))}
    </div>
  );
}
