import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState, Pagination, Skeleton } from "@/components/common";
import { pct } from "@/utils/format";

export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: ReactNode; back?: { to: string; label: string } }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>{back && <Link to={back.to} className="text-muted fs-sm text-decoration-none d-inline-flex align-items-center gap-1 mb-1"><i className="ri-arrow-left-line" />{back.label}</Link>}
        <h1 className="h4 fw-bold mb-0 admin-title">{title}</h1>{subtitle && <p className="text-muted mb-0 fs-sm">{subtitle}</p>}</div>
      {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className = "", flush }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <div className={`card admin-card border-0 shadow-soft ${className}`}>
      {(title || actions) && <div className="card-header bg-transparent border-0 d-flex align-items-center justify-content-between pt-3 pb-0"><h6 className="fw-bold mb-0">{title}</h6><div>{actions}</div></div>}
      <div className={flush ? "p-0" : "card-body"}>{children}</div>
    </div>
  );
}

export function StatCard({ label, value, icon, prev, current, color = "gold", loading, suffix }:
  { label: string; value: ReactNode; icon: string; prev?: number; current?: number; color?: "gold" | "brown" | "green" | "blue" | "red"; loading?: boolean; suffix?: string }) {
  const delta = prev !== undefined && current !== undefined ? pct(current, prev) : null;
  return (
    <div className="card admin-card stat-card border-0 shadow-soft h-100"><div className="card-body d-flex gap-3 align-items-center">
      <span className={`stat-icon stat-${color}`}><i className={icon} /></span>
      <div className="flex-grow-1 min-w-0">
        <div className="text-muted fs-sm">{label}</div>
        {loading ? <Skeleton h={28} w={110} className="mt-1" /> : <div className="h4 fw-bold mb-0 text-truncate">{value}{suffix && <small className="fs-sm text-muted ms-1">{suffix}</small>}</div>}
        {delta !== null && !loading && <div className={`fs-xs mt-1 ${delta >= 0 ? "text-success" : "text-danger"}`}><i className={delta >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"} />{Math.abs(delta)}% vs previous period</div>}
      </div>
    </div></div>
  );
}

export interface Column<T> { key: string; header: ReactNode; render: (row: T) => ReactNode; className?: string; width?: number | string }
export function DataTable<T extends { id?: string }>({ columns, rows, loading, empty, onRowClick, page, pages, onPage, rowKey }:
  { columns: Column<T>[]; rows: T[] | undefined; loading?: boolean; empty?: { title: string; text?: string; action?: ReactNode }; onRowClick?: (r: T) => void; page?: number; pages?: number; onPage?: (p: number) => void; rowKey?: (r: T) => string }) {
  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle admin-table mb-0">
          <thead><tr>{columns.map((c) => <th key={c.key} className={c.className} style={{ width: c.width }}>{c.header}</th>)}</tr></thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => <tr key={i}>{columns.map((c) => <td key={c.key}><Skeleton h={14} /></td>)}</tr>)}
            {!loading && rows?.map((r, i) => (
              <tr key={rowKey?.(r) ?? r.id ?? i} className={onRowClick ? "cursor-pointer" : ""} onClick={() => onRowClick?.(r)}>{columns.map((c) => <td key={c.key} className={c.className}>{c.render(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows?.length === 0 && <EmptyState title={empty?.title ?? "Nothing here yet"} text={empty?.text} action={empty?.action} />}
      {page && pages && onPage && <div className="p-3"><Pagination page={page} pages={pages} onChange={onPage} /></div>}
    </>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="d-flex flex-wrap gap-2 align-items-center p-3 border-bottom">{children}</div>;
}
