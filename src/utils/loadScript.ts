const cache = new Map<string, Promise<void>>();

/** Loads an external script once. Rejects on network/CSP/ad-blocker failure so callers can show a fallback. */
export function loadScript(src: string, timeoutMs = 12000): Promise<void> {
  const hit = cache.get(src);
  if (hit) return hit;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src; el.async = true;
    const t = setTimeout(() => { el.remove(); reject(new Error("Payment script timed out")); }, timeoutMs);
    el.onload = () => { clearTimeout(t); resolve(); };
    el.onerror = () => { clearTimeout(t); el.remove(); reject(new Error("Payment script failed to load")); };
    document.head.appendChild(el);
  });
  p.catch(() => cache.delete(src)); // allow a retry after failure
  cache.set(src, p);
  return p;
}
