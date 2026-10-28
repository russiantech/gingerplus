export const money = (n: number | string | null | undefined, opts: { decimals?: boolean } = {}) =>
  "₦" + Number(n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: opts.decimals ? 2 : 0, maximumFractionDigits: opts.decimals ? 2 : 0 });

export const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
export const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const dateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date(iso);
};
export const pct = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 100) : cur ? 100 : 0);
export const titleCase = (s: string) => s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const initials = (name: string) => (name ?? "").split(" ").map((p) => p?.[0] ?? "").slice(0, 2).join("").toUpperCase();
export const waLink = (num: string, text = "") => `https://wa.me/${num.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const assetUrl = (u?: string | null) => (!u ? "" : u.startsWith("http") || u.startsWith("/images") ? u : (import.meta.env.VITE_API_URL ?? "") + u);
