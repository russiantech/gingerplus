import { useEffect, useState } from "react";

export const PALETTE = ["#e8a317", "#7f4e1a", "#5b8c3a", "#b7791f", "#ad884d", "#3d7ea6", "#c0563a"];
export const useChartTheme = () => {
  const get = () => document.documentElement.getAttribute("data-bs-theme") === "dark";
  const [dark, setDark] = useState(get());
  useEffect(() => { const o = new MutationObserver(() => setDark(get())); o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] }); return () => o.disconnect(); }, []);
  return { dark, grid: dark ? "#3b2f1c" : "#eee3cc", text: dark ? "#bfae8e" : "#7a6a52", tooltip: { background: dark ? "#251d11" : "#fff", border: "1px solid " + (dark ? "#3b2f1c" : "#eee3cc"), borderRadius: 10, color: dark ? "#f3e9d6" : "#2b2112" } };
};
export const shortDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
export function RankList({ rows, fmt = (n: number) => String(n) }: { rows: { label: string; value: number; sub?: string }[]; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <div className="text-muted fs-sm py-3 text-center">No data yet</div>;
  return <div className="d-flex flex-column gap-3">{rows.map((r) => (
    <div key={r.label}><div className="d-flex justify-content-between fs-sm"><span className="text-truncate me-2">{r.label}{r.sub && <small className="text-muted ms-1">{r.sub}</small>}</span><strong>{fmt(r.value)}</strong></div>
      <div className="rank-bar mt-1"><span style={{ width: `${(r.value / max) * 100}%` }} /></div></div>))}</div>;
}
export function RangeTabs({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return <div className="btn-group range-tabs">{[7, 30, 90].map((d) => <button key={d} className={`btn btn-sm ${value === d ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => onChange(d)}>{d}d</button>)}</div>;
}
