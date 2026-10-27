import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrderView from "@/components/account/OrderView";
import { Input, Spinner } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import { shopService } from "@/services/shop";
import type { Order } from "@/types";
import "@/styles/commerce.css";

export default function TrackOrderPage() {
  useDocumentTitle("Track your order");
  const [sp] = useSearchParams(); const { user } = useAuth();
  const [number, setNumber] = useState(sp.get("number") ?? "");
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (user && !email) setEmail(user.email); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault(); setBusy(true); setErr(null);
    try { setOrder(await shopService.track(number.trim().toUpperCase(), email.trim())); }
    catch (x) { setOrder(null); setErr(x instanceof ApiError ? x.message : "Lookup failed"); } finally { setBusy(false); }
  };
  useEffect(() => { if (number && email) void lookup(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container py-4 py-md-5">
      <div className="text-center mb-4"><h1 className="h2 fw-bold">Track your order</h1><p className="text-muted">Enter your order number and the email used at checkout.</p></div>
      <form onSubmit={lookup} className="card border-0 shadow-soft mx-auto mb-4" style={{ maxWidth: 640 }}><div className="card-body p-4">
        <div className="row"><div className="col-md-6"><Input label="Order number" required placeholder="SR-261025-12345" value={number} onChange={(e) => setNumber(e.target.value)} /></div>
          <div className="col-md-6"><Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        {err && <div className="alert alert-danger py-2 fs-sm">{err}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? <Spinner size="sm" className="me-2" /> : <i className="ri-search-line me-1" />}Track order</button></div></form>
      {order && <OrderView order={order} />}
    </div>
  );
}
