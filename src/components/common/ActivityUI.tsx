import { useEffect, useState } from "react";
import { activity } from "@/services/http";

/**
 * Global loading feedback:
 *  - a slim progress bar while any API request is in flight (debounced so quick calls don't flicker)
 *  - automatic spinners on the button that was just clicked while its request runs (see .btn[data-loading] in base.css)
 */
export default function ActivityUI() {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let timer: number | undefined; let marked: HTMLElement | null = null;
    const clear = () => { if (marked) { marked.removeAttribute("data-loading"); marked.removeAttribute("aria-busy"); marked = null; } };
    const off = activity.subscribe((n) => {
      window.clearTimeout(timer);
      if (n > 0) timer = window.setTimeout(() => setBusy(true), 150);
      else { setBusy(false); clear(); }
    });
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest?.("button.btn, button.circle-btn") as HTMLButtonElement | null;
      if (!btn || btn.disabled || btn.hasAttribute("data-no-spinner")) return;
      // the click handler has run synchronously by the next tick; if it started a request, show the spinner on this button
      window.setTimeout(() => {
        if (activity.get() > 0 && btn.isConnected) { clear(); marked = btn; btn.setAttribute("data-loading", "1"); btn.setAttribute("aria-busy", "true"); }
      }, 0);
    };
    document.addEventListener("click", onClick, true);
    return () => { off(); window.clearTimeout(timer); document.removeEventListener("click", onClick, true); clear(); };
  }, []);
  return <div className={`top-progress ${busy ? "on" : ""}`} aria-hidden="true"><span /></div>;
}
