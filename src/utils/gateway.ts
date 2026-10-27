/** Redirect to the payment gateway. In dev's mock mode the API returns its configured SITE_URL; keep the user on the current origin. */
export function goToGateway(url: string) {
  try {
    const u = new URL(url);
    if (u.searchParams.get("mock") === "1" && u.origin !== window.location.origin) { window.location.href = window.location.origin + u.pathname + u.search; return; }
  } catch { /* fall through */ }
  window.location.href = url;
}
