import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/admin";
import { ErrorState } from "@/components/common";
import { PALETTE, RangeTabs, RankList, shortDate, useChartTheme } from "@/components/admin/sales/charts";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { compact } from "@/utils/format";
import "@/styles/admin-sales.css";

export default function AnalyticsPage() {
  useDocumentTitle("Traffic & Analytics");
  const [days, setDays] = useState(30);
  const t = useChartTheme();
  const { data: d, loading, error, reload } = useAsync(() => adminApi.traffic(days), [days]);
  const donut = (rows: { label: string; count: number }[] = []) => (
    <div style={{ height: 220 }}><ResponsiveContainer><PieChart><Pie data={rows.map((r) => ({ name: r.label, value: r.count }))} dataKey="value" innerRadius={50} outerRadius={80} stroke="none" paddingAngle={2}>
      {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie><Tooltip contentStyle={t.tooltip} /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div>
  );
  return (
    <>
      <PageHeader title="Traffic & Analytics" subtitle="First-party website visits (bots excluded)" actions={<RangeTabs value={days} onChange={setDays} />} />
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="row g-3 mb-3">
        <div className="col-md-4"><StatCard label="Visitors (sessions)" icon="ri-user-line" loading={loading} value={compact(d?.visitors ?? 0)} /></div>
        <div className="col-md-4"><StatCard label="Page views" icon="ri-eye-line" color="brown" loading={loading} value={compact(d?.page_views ?? 0)} /></div>
        <div className="col-md-4"><StatCard label="Bounce rate" icon="ri-logout-circle-r-line" color="red" loading={loading} value={`${d?.bounce_rate ?? 0}%`} /></div>
      </div>
      <Panel title="Visitors & page views" className="mb-3"><div className="chart-box"><ResponsiveContainer><AreaChart data={d?.series ?? []}>
        <defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e8a317" stopOpacity={0.4} /><stop offset="95%" stopColor="#e8a317" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={t.grid} vertical={false} /><XAxis dataKey="date" tickFormatter={shortDate} stroke={t.text} fontSize={11} minTickGap={24} /><YAxis stroke={t.text} fontSize={11} allowDecimals={false} width={36} />
        <Tooltip contentStyle={t.tooltip} labelFormatter={(l) => shortDate(String(l))} /><Legend />
        <Area name="Page views" type="monotone" dataKey="views" stroke="#e8a317" strokeWidth={2.5} fill="url(#gv)" /><Area name="Visitors" type="monotone" dataKey="visitors" stroke="#7f4e1a" strokeWidth={2} fill="none" />
      </AreaChart></ResponsiveContainer></div></Panel>
      <div className="row g-3">
        <div className="col-lg-4"><Panel title="Top pages"><RankList rows={(d?.top_pages ?? []).map((r) => ({ label: r.label, value: r.count }))} /></Panel></div>
        <div className="col-lg-4"><Panel title="Top referrers"><RankList rows={(d?.referrers ?? []).map((r) => ({ label: r.label, value: r.count }))} /></Panel></div>
        <div className="col-lg-2 col-md-6"><Panel title="Devices">{donut(d?.devices)}</Panel></div>
        <div className="col-lg-2 col-md-6"><Panel title="Browsers">{donut(d?.browsers)}</Panel></div>
      </div>
    </>
  );
}
