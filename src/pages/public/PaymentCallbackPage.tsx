import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageLoader } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import { shopService, type PaymentStatusOut } from "@/services/shop";
import { dateTime, money } from "@/utils/format";
import "@/styles/commerce.css";

export default function PaymentCallbackPage() {
  useDocumentTitle("Payment status");
  const [sp] = useSearchParams(); const { user } = useAuth();
  const ref = sp.get("reference") || sp.get("trxref");
  const [res, setRes] = useState<PaymentStatusOut | null>(null);
  const [err, setErr] = useState<string | null>(ref ? null : "Missing payment reference.");
  const [tries, setTries] = useState(0);
  const started = useRef(0);

  useEffect(() => {
    if (!ref) return;
    let alive = true;
    shopService.verifyPayment(ref).then((r) => alive && (setRes(r), setErr(null)))
      .catch((e) => alive && setErr(e instanceof ApiError ? e.message : "We couldn't verify this payment yet."));
    started.current++;
    return () => { alive = false; };
  }, [ref, tries]);

  if (!res && !err) return <PageLoader text="Confirming your payment…" />;
  const paid = res?.status === "paid", failed = res?.status === "failed" || (!res && !!err);
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 560 }}>
      <span className={`result-icon mb-3 ${paid ? "ok" : failed ? "bad" : "wait"}`}><i className={paid ? "ri-check-line" : failed ? "ri-close-line" : "ri-time-line"} /></span>
      <h1 className="h3 fw-bold">{paid ? "Payment successful" : failed ? "We couldn't confirm your payment" : "Payment pending"}</h1>
      <p className="text-muted">{paid ? "Thank you! A receipt has been emailed to you." : err ?? "Your payment is still processing. This can take a minute."}</p>
      {res && <div className="card border-0 shadow-soft text-start mb-4"><div className="card-body">
        <div className="summary-line"><span className="text-muted">Reference</span><strong>{res.reference}</strong></div>
        <div className="summary-line"><span className="text-muted">Amount</span><strong>{money(res.amount)}</strong></div>
        {res.order_number && <div className="summary-line"><span className="text-muted">Order</span><strong>{res.order_number}</strong></div>}
        {res.paid_at && <div className="summary-line"><span className="text-muted">Paid</span><span>{dateTime(res.paid_at)}</span></div>}</div></div>}
      <div className="d-flex gap-2 justify-content-center flex-wrap">
        {!paid && <button className="btn btn-primary" onClick={() => { setRes(null); setErr(null); setTries((t) => t + 1); }}>Check again</button>}
        {res?.order_number && <Link to={user ? "/account/orders" : `/track-order?number=${res.order_number}`} className={`btn ${paid ? "btn-primary" : "btn-outline-primary"}`}>{paid ? "Track my order" : "View order & retry payment"}</Link>}
        <Link to="/shop" className="btn btn-light">Continue shopping</Link>
      </div>
      {!paid && <p className="text-muted fs-xs mt-4">If you were debited, don't worry — we reconcile automatically. Contact us with your reference and we'll confirm it.</p>}
    </div>
  );
}
