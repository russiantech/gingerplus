import { useState } from "react";
import { Input, Spinner, Textarea } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import { shopService } from "@/services/shop";
import { goToGateway } from "@/utils/gateway";
import "@/styles/commerce.css";

export default function DirectPaymentPage() {
  useDocumentTitle("Pay now");
  const { user } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ name: user?.full_name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", amount: "", order_number: "", description: "" });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(f.amount.replace(/,/g, ""));
    const er: Record<string, string> = {};
    if (!(amount > 0)) er.amount = "Enter a valid amount";
    if (amount > 50000000) er.amount = "Amount is too large — contact us for large payments";
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const r = await shopService.payDirect({ name: f.name, email: f.email, phone: f.phone || undefined, amount, order_number: f.order_number.trim().toUpperCase() || undefined, description: f.description || undefined });
      goToGateway(r.authorization_url);
    } catch (x) { toast.error(x instanceof ApiError ? x.message : "Could not start payment"); setBusy(false); }
  };

  return (
    <div className="container py-4 py-md-5"><div className="row justify-content-center g-4">
      <div className="col-lg-6"><div className="card border-0 shadow-soft"><div className="card-body p-4">
        <h1 className="h3 fw-bold mb-1"><i className="ri-secure-payment-line text-gold me-2" />Pay now</h1>
        <p className="text-muted">Settle an order, invoice or agreed amount securely online with Paystack.</p>
        <form onSubmit={submit}>
          <Input label="Full name" required value={f.name} onChange={set("name")} />
          <div className="row"><div className="col-md-6"><Input label="Email" type="email" required value={f.email} onChange={set("email")} hint="Your receipt is sent here." /></div>
            <div className="col-md-6"><Input label="Phone (optional)" value={f.phone} onChange={set("phone")} inputMode="tel" /></div></div>
          <Input label="Amount (₦)" required inputMode="decimal" value={f.amount} onChange={set("amount")} error={err.amount} placeholder="e.g. 50000" />
          <Input label="Order number (optional)" value={f.order_number} onChange={set("order_number")} placeholder="SR-261025-12345" hint="Paying for an existing order? Enter its number — must match the email above." />
          <Textarea label="Note (optional)" rows={2} value={f.description} onChange={set("description")} />
          <button className="btn btn-primary btn-lg w-100" disabled={busy}>{busy ? <Spinner size="sm" className="me-2" /> : <i className="ri-lock-line me-2" />}Continue to secure payment</button>
        </form></div></div></div>
      <div className="col-lg-4"><div className="card border-0 bg-cream h-100"><div className="card-body p-4">
        <h6 className="fw-bold">How it works</h6>
        <ol className="ps-3 fs-sm text-muted mb-3"><li className="mb-2">Enter the amount and your details.</li><li className="mb-2">Pay with card, bank transfer or USSD on Paystack.</li><li>You're returned here and receive an email receipt.</li></ol>
        <p className="fs-sm mb-0"><i className="ri-shield-check-line text-success me-1" />Payments are processed by Paystack. We never see your card details.</p></div></div></div>
    </div></div>
  );
}
