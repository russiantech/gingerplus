import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ApiError } from "@/services/http";
import { publicService } from "@/services/public";
import { sessionId } from "@/utils/storage";

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn); fnRef.current = fn;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fnRef.current().then((d) => alive && (setData(d), setError(null))).catch((e) => alive && setError(e instanceof ApiError ? e.message : "Something went wrong"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, setData, loading, error, reload };
}

export function useDebounce<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function useDocumentTitle(title?: string) {
  useEffect(() => { if (title) document.title = `${title} · Southern Rose`; }, [title]);
}

/** First-party page-view tracking for the admin traffic dashboard (skips /admin). */
let trackingDisabled = false;
export function usePageTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (trackingDisabled || pathname.startsWith("/admin") || pathname.startsWith("/partner")) return;
    try {
      const p = new URLSearchParams(window.location.search);
      // Analytics is best-effort: any failure (API down, 405 from a static host…) silently disables it for this session.
      publicService.track({ session_id: sessionId(), path: pathname, referrer: document.referrer || null, utm_source: p.get("utm_source") }).catch(() => { trackingDisabled = true; });
    } catch { trackingDisabled = true; }
  }, [pathname]);
}

export function useScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
}

export function useQueryState<T extends Record<string, string>>(initial: T) {
  const [state, setState] = useState<T>(initial);
  return [state, (patch: Partial<T>) => setState((s) => ({ ...s, ...patch })), setState] as const;
}

export function useCopy() {
  const [copied, setCopied] = useState(false);
  return [copied, (text: string) => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }] as const;
}
