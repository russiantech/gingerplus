import { useEffect, useRef, useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { assetUrl, money, titleCase } from "@/utils/format";
import { STATUS_COLOR } from "@/utils/constants";

/* ---------- Img with branded placeholder fallback ---------- */
export function Img({ src, alt = "", className, ratio, fallback = "/images/placeholders/image.svg", ...rest }:
  { src?: string | null; alt?: string; className?: string; ratio?: string; fallback?: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const [bad, setBad] = useState<string | null>(null);  // remembers WHICH src failed, so a new src (re-upload, gallery switch) is tried afresh
  const s = !src || bad === src ? fallback : assetUrl(src);
  const img = <img src={s} alt={alt} className={className} loading="lazy" onError={() => setBad(src ?? null)} {...rest} />;
  return ratio ? <div className="ratio" style={{ ["--bs-aspect-ratio" as string]: ratio }}>{img}</div> : img;
}

export const Money = ({ value, strike }: { value: number | string; strike?: boolean }) => <span className={strike ? "text-decoration-line-through text-muted" : ""}>{money(value)}</span>;

export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={`badge rounded-pill badge-soft-${STATUS_COLOR[status] ?? "secondary"} fw-semibold`}>{label ?? titleCase(status)}</span>
);

export const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) => (
  <span className={`spinner-border ${size === "sm" ? "spinner-border-sm" : ""} text-warning ${className}`} role="status"><span className="visually-hidden">Loading…</span></span>
);
export const PageLoader = ({ text = "Loading…" }: { text?: string }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2 min-vh-40"><Spinner /><span className="text-muted fs-sm">{text}</span></div>
);
export const Skeleton = ({ h = 16, w = "100%", className = "" }: { h?: number; w?: string | number; className?: string }) => <div className={`skeleton ${className}`} style={{ height: h, width: w }} />;

export function EmptyState({ icon = "ri-inbox-line", title, text, action }: { icon?: string; title: string; text?: string; action?: ReactNode }) {
  return <div className="text-center py-5 px-3"><i className={`${icon} display-4 text-brown opacity-50`} /><h5 className="mt-2 mb-1 fw-semibold">{title}</h5>{text && <p className="text-muted mb-3">{text}</p>}{action}</div>;
}
export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="alert alert-danger d-flex align-items-center gap-2 my-3" role="alert"><i className="ri-error-warning-line fs-5" /><div className="flex-grow-1">{message}</div>
    {onRetry && <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>Retry</button>}</div>
);

/* ---------- Modal (Bootstrap look, React-controlled) ---------- */
export function Modal({ show, onClose, title, children, footer, size = "md", scroll = true }:
  { show: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" | "xl"; scroll?: boolean }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey); document.body.classList.add("modal-open"); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.classList.remove("modal-open"); document.body.style.overflow = ""; };
  }, [show, onClose]);
  if (!show) return null;
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`modal-dialog modal-dialog-centered ${scroll ? "modal-dialog-scrollable" : ""} ${size !== "md" ? `modal-${size}` : ""}`}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "var(--sr-radius)" }}>
            {title && <div className="modal-header border-0 pb-0"><h5 className="modal-title fw-bold">{title}</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Close" /></div>}
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer border-0 pt-0">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export function ConfirmDialog({ show, title = "Are you sure?", message, confirmLabel = "Confirm", danger, busy, onConfirm, onClose }:
  { show: boolean; title?: string; message: ReactNode; confirmLabel?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal show={show} onClose={onClose} title={title} size="sm"
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button><button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} disabled={busy} onClick={onConfirm}>{busy && <Spinner size="sm" className="me-2" />}{confirmLabel}</button></>}>
      <div className="text-muted">{message}</div>
    </Modal>
  );
}

/* ---------- Dropdown (state-based; no bootstrap JS needed) ---------- */
export function Dropdown({ toggle, children, align = "start", className = "" }: { toggle: (open: boolean) => ReactNode; children: ReactNode | ((close: () => void) => ReactNode); align?: "start" | "end"; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className={`position-relative ${className}`} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{toggle(open)}</div>
      <div className={`dropdown-menu shadow border-0 mt-2 ${open ? "show" : ""} ${align === "end" ? "dropdown-menu-end" : ""}`} style={{ borderRadius: 12, minWidth: 200, ...(align === "end" ? { right: 0 } : {}) }} onClick={() => setOpen(false)}>
        {typeof children === "function" ? children(() => setOpen(false)) : children}
      </div>
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="pagination"><ul className="pagination pagination-sm mb-0 justify-content-center">
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => onChange(page - 1)}>‹</button></li>
      {nums.map((p, i) => (<span key={p} className="d-flex">{i > 0 && p - nums[i - 1] > 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
        <li className={`page-item ${p === page ? "active" : ""}`}><button className="page-link" onClick={() => onChange(p)}>{p}</button></li></span>))}
      <li className={`page-item ${page === pages ? "disabled" : ""}`}><button className="page-link" onClick={() => onChange(page + 1)}>›</button></li>
    </ul></nav>
  );
}

/* ---------- Form fields (label + control + error) ---------- */
interface FieldProps { label?: string; error?: string; hint?: string; className?: string; required?: boolean }
const wrap = (p: FieldProps, id: string, control: ReactNode) => (
  <div className={`mb-3 ${p.className ?? ""}`}>
    {p.label && <label htmlFor={id} className="form-label fw-medium fs-sm mb-1">{p.label}{p.required && <span className="text-danger"> *</span>}</label>}
    {control}{p.hint && !p.error && <div className="form-text">{p.hint}</div>}{p.error && <div className="invalid-feedback d-block">{p.error}</div>}
  </div>
);
export function Input({ label, error, hint, className, required, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = rest.id ?? `f-${rest.name ?? label}`;
  return wrap({ label, error, hint, className, required }, id, <input id={id} required={required} className={`form-control ${error ? "is-invalid" : ""}`} {...rest} />);
}
export function Select({ label, error, hint, className, required, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = rest.id ?? `f-${rest.name ?? label}`;
  return wrap({ label, error, hint, className, required }, id, <select id={id} required={required} className={`form-select ${error ? "is-invalid" : ""}`} {...rest}>{children}</select>);
}
export function Textarea({ label, error, hint, className, required, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = rest.id ?? `f-${rest.name ?? label}`;
  return wrap({ label, error, hint, className, required }, id, <textarea id={id} required={required} rows={4} className={`form-control ${error ? "is-invalid" : ""}`} {...rest} />);
}
export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" role="switch" id={`sw-${label}`} checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <label className="form-check-label fw-medium fs-sm" htmlFor={`sw-${label}`}>{label}</label>{hint && <div className="form-text mt-0">{hint}</div>}</div>;
}
export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <div className={`position-relative ${className}`}><i className="ri-search-line position-absolute top-50 translate-middle-y ms-3 text-muted" />
    <input className="form-control ps-5" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></div>;
}
export function QtyStepper({ value, onChange, min = 1, max = 10000, size = "md" }: { value: number; onChange: (n: number) => void; min?: number; max?: number; size?: "sm" | "md" }) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
  return (
    <div className={`input-group ${size === "sm" ? "input-group-sm" : ""} flex-nowrap`} style={{ width: size === "sm" ? 110 : 132 }}>
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(clamp(value - 1))} aria-label="Decrease"><i className="ri-subtract-line" /></button>
      <input className="form-control text-center px-1" inputMode="numeric" value={value} onChange={(e) => onChange(clamp(parseInt(e.target.value || "0", 10)))} aria-label="Quantity" />
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(clamp(value + 1))} aria-label="Increase"><i className="ri-add-line" /></button>
    </div>
  );
}
