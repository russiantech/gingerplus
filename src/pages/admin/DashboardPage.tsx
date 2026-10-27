import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/admin";
import { ErrorState, StatusBadge } from "@/components/common";
import { PALETTE, RangeTabs, RankList, shortDate, useChartTheme } from "@/components/admin/sales/charts";
import { useAuth } from "@/contexts/AuthContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { compact, money, timeAgo, titleCase } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function DashboardPage() {
  useDocumentTitle("Dashboard");
  const [days, setDays] = useState(30);
  const { user, can } = useAuth();
  const t = useChartTheme();
  const { data: d, loading, error, reload } = useAsync(() => adminApi.dashboard(days), [days]);
  const k = d?.kpis;
  return (
    <>
      <PageHeader title={`Welcome back, ${user?.first_name} 👋`} subtitle="Here's how Southern Rose is performing."
        actions={<>
          <RangeTabs value={days} onChange={setDays} />
          {can("orders:manage") && <Link to="/admin/orders/new" className="btn btn-primary btn-sm"><i className="ri-add-line me-1" />New order</Link>}
          {can("products:manage") && <Link to="/admin/products/new" className="btn btn-outline-primary btn-sm"><i className="ri-goblet-line me-1" />Add product</Link>}
        </>} />
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-3"><StatCard label="Revenue (paid)" icon="ri-money-dollar-circle-line" loading={loading} value={money(k?.revenue)} current={k?.revenue} prev={k?.revenue_prev} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Orders" icon="ri-shopping-bag-3-line" color="brown" loading={loading} value={k?.orders} current={k?.orders} prev={k?.orders_prev} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="New customers" icon="ri-user-add-line" color="green" loading={loading} value={k?.new_customers} current={k?.new_customers} prev={k?.new_customers_prev} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Avg. order value" icon="ri-line-chart-line" color="blue" loading={loading} value={money(k?.avg_order_value)} /></div>
        <div className="col-sm-6 col-xl-4"><Link to="/admin/orders?status=pending" className="text-decoration-none"><StatCard label="Pending orders" icon="ri-time-line" loading={loading} value={k?.pending_orders} /></Link></div>
        <div className="col-sm-6 col-xl-4"><Link to="/admin/payments?status=pending" className="text-decoration-none"><StatCard label="Awaiting payment" icon="ri-bank-card-line" color="red" loading={loading} value={k?.unpaid_orders} /></Link></div>
        <div className="col-sm-12 col-xl-4"><Link to="/admin/orders?needs_store_approval=1" className="text-decoration-none"><StatCard label="Store matches to approve" icon="ri-store-2-line" color="brown" loading={loading} value={k?.pending_store_approvals} /></Link></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-xl-8"><Panel title="Revenue & orders"><div className="chart-box"><ResponsiveContainer>
          <AreaChart data={d?.series ?? []}>
            <defs><linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e8a317" stopOpacity={0.45} /><stop offset="95%" stopColor="#e8a317" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke={t.grid} vertical={false} /><XAxis dataKey="date" tickFormatter={shortDate} stroke={t.text} fontSize={11} minTickGap={24} />
            <YAxis yAxisId="l" stroke={t.text} fontSize={11} tickFormatter={compact} width={48} /><YAxis yAxisId="r" orientation="right" stroke={t.text} fontSize={11} allowDecimals={false} width={32} />
            <Tooltip contentStyle={t.tooltip} labelFormatter={(l) => shortDate(String(l))} formatter={(v: number, n: string) => [n === "Revenue" ? money(v) : v, n]} /><Legend />
            <Area yAxisId="l" name="Revenue" type="monotone" dataKey="revenue" stroke="#e8a317" strokeWidth={2.5} fill="url(#gRev)" />
            <Area yAxisId="r" name="Orders" type="monotone" dataKey="orders" stroke="#7f4e1a" strokeWidth={2} fill="none" />
          </AreaChart></ResponsiveContainer></div></Panel></div>
        <div className="col-xl-4"><Panel title="Orders by status"><div className="chart-box"><ResponsiveContainer>
          <PieChart><Pie data={(d?.orders_by_status ?? []).map((s) => ({ name: titleCase(s.status), value: s.count }))} dataKey="value" innerRadius={62} outerRadius={95} paddingAngle={2} stroke="none">
            {(d?.orders_by_status ?? []).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie><Tooltip contentStyle={t.tooltip} /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div></Panel></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-4"><Panel title="Sales channels"><div style={{ height: 240 }}><ResponsiveContainer>
          <BarChart data={d?.orders_by_channel ?? []} layout="vertical" margin={{ left: 8 }}><CartesianGrid stroke={t.grid} horizontal={false} /><XAxis type="number" stroke={t.text} fontSize={11} allowDecimals={false} />
            <YAxis dataKey="channel" type="category" stroke={t.text} fontSize={11} width={70} tickFormatter={titleCase} /><Tooltip contentStyle={t.tooltip} formatter={(v: number, n: string) => [n === "total" ? money(v) : v, n]} />
            <Bar dataKey="count" name="Orders" fill="#e8a317" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div></Panel></div>
        <div className="col-lg-4"><Panel title="Top states"><RankList rows={(d?.sales_by_state ?? []).map((s) => ({ label: s.state, value: s.total, sub: `${s.orders} orders` }))} fmt={money} /></Panel></div>
        <div className="col-lg-4"><Panel title="Top products"><RankList rows={(d?.top_products ?? []).map((p) => ({ label: p.name.replace("Southern Rose ", ""), sub: p.variant, value: p.revenue }))} fmt={money} /></Panel></div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8"><Panel title="Recent orders" actions={<Link to="/admin/orders" className="fs-sm">View all</Link>} flush>
          <div className="table-responsive"><table className="table table-hover align-middle admin-table mb-0"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>When</th></tr></thead><tbody>
            {d?.recent_orders.map((o) => <tr key={o.id}><td><Link to={`/admin/orders/${o.id}`} className="fw-semibold">{o.number}</Link></td><td>{o.customer}</td><td>{money(o.total)}</td>
              <td><StatusBadge status={o.status} /></td><td><StatusBadge status={o.payment_status} /></td><td className="text-muted fs-sm">{timeAgo(o.created_at)}</td></tr>)}
            {!loading && !d?.recent_orders.length && <tr><td colSpan={6} className="text-center text-muted py-4">No orders yet</td></tr>}</tbody></table></div></Panel></div>
        <div className="col-xl-4"><Panel title="Low stock"><div className="d-flex flex-column gap-2">
          {d?.low_stock.map((s) => <div key={s.sku} className="d-flex justify-content-between align-items-center fs-sm"><span>{s.label}<small className="text-muted d-block">{s.sku}</small></span>
            <span className={`badge ${s.stock <= 5 ? "badge-soft-danger" : "badge-soft-warning"}`}>{s.stock} left</span></div>)}
          {!loading && !d?.low_stock.length && <div className="text-muted text-center py-3 fs-sm">All stocked up ✔</div>}</div></Panel></div>
      </div>
    </>
  );
}
