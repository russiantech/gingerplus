/** Minimal fetch wrapper: JSON, bearer auth, single-flight token refresh, typed errors. */
const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "") + "/api/v1";
const KEY = "sr.auth";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

interface Stored { access: string; refresh: string }
export const tokenStore = {
  get(): Stored | null { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
  set(t: Stored | null) { try { t ? localStorage.setItem(KEY, JSON.stringify(t)) : localStorage.removeItem(KEY); } catch { /* ignore */ } },
};
let onAuthLost: (() => void) | null = null;
export const setAuthLostHandler = (fn: () => void) => { onAuthLost = fn; };

let refreshing: Promise<boolean> | null = null;
async function refresh(): Promise<boolean> {
  const t = tokenStore.get();
  if (!t) return false;
  refreshing ??= (async () => {
    try {
      const r = await fetch(`${BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: t.refresh }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      tokenStore.set({ access: d.tokens.access_token, refresh: d.tokens.refresh_token });
      return true;
    } catch { tokenStore.set(null); onAuthLost?.(); return false; } finally { setTimeout(() => (refreshing = null), 0); }
  })();
  return refreshing;
}

// ---- offline resilience: last-good cache for public GETs + connectivity flag ----
const CK = "sr.cache:";
function readCache<T>(url: string): T | undefined { try { const v = localStorage.getItem(CK + url); return v ? (JSON.parse(v) as T) : undefined; } catch { return undefined; } }
function writeCache(url: string, data: unknown) { try { const j = JSON.stringify(data); if (j.length < 400_000) localStorage.setItem(CK + url, j); } catch { /* quota/private mode */ } }
let offline = false; const subs = new Set<(v: boolean) => void>();
function setOffline(v: boolean) { if (offline !== v) { offline = v; subs.forEach((f) => f(v)); } }
export const connectivity = { get: () => offline, subscribe: (f: (v: boolean) => void) => { subs.add(f); return () => { subs.delete(f); }; } };
if (typeof window !== "undefined") { window.addEventListener("offline", () => setOffline(true)); window.addEventListener("online", () => setOffline(false)); }

type Query = Record<string, string | number | boolean | null | undefined>;
export interface ReqOptions { method?: string; body?: unknown; query?: Query; auth?: boolean; signal?: AbortSignal; form?: FormData }

export async function request<T>(path: string, opts: ReqOptions = {}, retried = false): Promise<T> {
  const qs = new URLSearchParams();
  Object.entries(opts.query ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && qs.set(k, String(v)));
  const url = BASE + path + (qs.toString() ? `?${qs}` : "");
  const headers: Record<string, string> = {};
  const tok = tokenStore.get();
  if (tok && opts.auth !== false) headers.Authorization = `Bearer ${tok.access}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const method = opts.method ?? (opts.body || opts.form ? "POST" : "GET");
  const publicGet = method === "GET" && opts.auth !== false && !tok;
  let res: Response | null = null;
  // Network failures never crash the app: GETs retry with backoff, then fall back to the last good copy.
  for (let attempt = 0; attempt < (method === "GET" ? 3 : 1); attempt++) {
    try {
      res = await fetch(url, { method, headers, signal: opts.signal, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
      if (res.status < 502 || res.status > 504) break;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") throw e;
      res = null;
    }
    if (attempt < 2 && method === "GET") await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  if (!res || res.status === 502 || res.status === 503 || res.status === 504) {
    const cached = method === "GET" ? readCache<T>(url) : undefined;
    if (cached !== undefined) { setOffline(true); return cached; }
    setOffline(true);
    throw new ApiError(res?.status ?? 0, "network", res ? "Our service is temporarily unavailable. Please try again shortly." : "You appear to be offline. Check your connection and try again.");
  }
  setOffline(false);
  if (res.status === 401 && tok && !retried && opts.auth !== false && (await refresh())) return request<T>(path, opts, true);
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.slice(-1)[0] ?? ""}: ${d.msg}`).join("; ") : data.detail;
    throw new ApiError(res.status, data.code ?? "error", detail ?? "Something went wrong", data);
  }
  if (publicGet || (method === "GET" && !tok)) writeCache(url, data);
  return data as T;
}

export const api = {
  get: <T>(p: string, query?: Query, o?: ReqOptions) => request<T>(p, { ...o, query }),
  post: <T>(p: string, body?: unknown, o?: ReqOptions) => request<T>(p, { ...o, method: "POST", body: body ?? {} }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body }),
  put: <T>(p: string, body?: unknown) => request<T>(p, { method: "PUT", body }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
  upload: <T>(p: string, file: File) => { const f = new FormData(); f.append("file", file); return request<T>(p, { form: f }); },
};
