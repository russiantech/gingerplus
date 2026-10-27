import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import OrderView from "@/components/account/OrderView";
import { ErrorState, PageLoader } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import { shopService } from "@/services/shop";
import type { CheckoutResponse, Order } from "@/types";
import { money } from "@/utils/format";
import "@/styles/commerce.css";

interface NavState { order?: Order; next_step?: CheckoutResponse["next_step"]; whatsapp_url?: string | null }

export default function OrderConfirmationPage() {
  useDocumentTitle("Order confirmed");
  const st = (useLocation().state ?? {}) as NavState;
  const [sp] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(st.order ?? null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (order) return;
    const n = sp.get("number"), e = sp.get("email");
    if (!n || !e) { setErr("We couldn't find that order. Use Track Order with your order number and email."); return; }
    shopService.track(n, e).then(setOrder).catch((x) => setErr(x instanceof ApiError ? x.message : "Could not load order"));
  }, [order, sp]);

  if (err) return <div className="container py-5"><ErrorState message={err} /><Link to="/track-order" className="btn btn-primary">Track an order</Link></div>;
  if (!order) return <PageLoader />;
  const step = st.next_step;
  return (
    <div className="container py-4 py-md-5">
      <div className="text-center mb-4">
        <span className={`result-icon ${order.payment_status === "paid" ? "ok" : "wait"} mb-3`}><i className={order.payment_status === "paid" ? "ri-check-double-line" : "ri-time-line"} /></span>
        <h1 className="h2 fw-bold">Thank you, {order.customer_name.split(" ")[0]}!</h1>
        <p className="text-muted mb-0">Order <strong>{order.number}</strong> · {money(order.total)} · confirmation sent to {order.customer_email}</p>
      </div>
      <div className="row justify-content-center mb-4"><div className="col-lg-8">
        {step === "whatsapp" && <div className="alert alert-success d-flex gap-3 align-items-center"><i className="ri-whatsapp-line fs-1" /><div><strong>Continue on WhatsApp</strong><div className="fs-sm">Send us the pre-filled message so our team can confirm your wholesale order.</div></div>
          {st.whatsapp_url && <a href={st.whatsapp_url} target="_blank" rel="noreferrer" className="btn btn-success ms-auto text-nowrap">Open WhatsApp</a>}</div>}
        {step === "bank_transfer" && <div className="alert alert-warning"><strong><i className="ri-bank-line me-1" />Pay by bank transfer</strong><div className="fs-sm">We've emailed the account details to {order.customer_email}. Use <strong>{order.number}</strong> as the payment reference and send proof on WhatsApp for faster confirmation. Your order is confirmed once payment is received.</div></div>}
        {step === "retry_payment" && <div className="alert alert-warning"><strong>Your order is saved, but payment didn't start.</strong><div className="fs-sm">Use the “Pay now” button below to complete payment.</div></div>}
        {(!step || step === "pay_online") && order.payment_status !== "paid" && <div className="alert alert-info fs-sm mb-0">Payment is not yet confirmed. You can pay any time from the button below.</div>}
      </div></div>
      <OrderView order={order} actions={<><Link to={`/track-order?number=${order.number}`} className="btn btn-outline-primary">Track order</Link><Link to="/shop" className="btn btn-light">Keep shopping</Link></>} />
    </div>
  );
}
