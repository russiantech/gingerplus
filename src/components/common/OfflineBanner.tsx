import { useEffect, useState } from "react";
import { connectivity } from "@/services/http";

/** Slim, non-blocking notice shown when the network or API is unreachable. The app keeps working from cached content. */
export default function OfflineBanner() {
  const [off, setOff] = useState(connectivity.get() || (typeof navigator !== "undefined" && navigator.onLine === false));
  useEffect(() => connectivity.subscribe(setOff), []);
  if (!off) return null;
  return (
    <div className="offline-banner" role="status"><i className="ri-wifi-off-line" /> You're offline or we can't reach the server — showing saved content. <button type="button" className="btn btn-sm btn-light ms-2" onClick={() => window.location.reload()}>Retry</button></div>
  );
}
