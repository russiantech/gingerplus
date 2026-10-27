import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddressForm, { emptyAddress, validateAddress } from "@/components/account/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { EmptyState, Input, Modal, Spinner, Switch, Textarea } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { useQuote } from "@/hooks/useQuote";
import { accountService } from "@/services/account";
import { ApiError } from "@/services/http";
import { shopService } from "@/services/shop";
import type { Address, AddressInput, PaymentMethod } from "@/types";
import { goToGateway } from "@/utils/gateway";
import "@/styles/commerce.css";

const STEPS = ["Contact", "Delivery", "Payment"];
type Method = Extract<PaymentMethod, "paystack" | "bank_transfer" | "whatsapp">;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  useDocumentTitle("Checkout");
  const { user } = useAuth(); const { lines, clear } = useCart(); const { settings } = useSite();
  const toast = useToast(); const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addrId, setAddrId] = useState<string | null>(null);
  const [adhoc, setAdhoc] = useState<AddressInput>(emptyAddress());   // guest inline form or one-off address
  const [modal, setModal] = useState(false);
  const [modalAddr, setModalAddr] = useState<AddressInput>(emptyAddress());
  const [modalSave, setModalSave] = useState(true);
  const [coupon, setCoupon] = useState(""); const [appliedCoupon, setAppliedCoupon] = useState("");
  const [notes, setNotes] = useState(""); const [matchStore, setMatchStore] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);
  const [busy, setBusy] = useState(false);

  const addresses = useAsync<Address[]>(() => (user ? accountService.addresses() : Promise.resolve([])), [user?.id]);
  const saved = addresses.data ?? [];
  const chosen = saved.find((a) => a.id === addrId) ?? null;

  useEffect(() => { if (user) setContact((c) => ({ name: c.name || user.full_name, email: c.email || user.email, phone: c.phone || user.phone || "" })); }, [user]);
  useEffect(() => { if (user && !addrId && saved.length && !adhoc.line1) setAddrId((saved.find((a) => a.is_default) ?? saved[0]).id); }, [saved, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const state = chosen?.state ?? adhoc.state;
  const { quote, loading, error } = useQuote(lines, state, appliedCoupon);
  const max = quote?.online_payment_max_packs ?? settings.commerce.online_payment_max_packs;
  const wholesale = !!quote?.is_wholesale;
  const onlineOk = quote ? quote.online_payment_allowed : true;

  // default / re-validate payment method as the cart changes
  useEffect(() => {
    if (!quote) return;
    setMethod((m) => {
      if (m === "paystack" && !quote.online_payment_allowed) return "whatsapp";
      if (m) return m;
      return quote.is_wholesale ? "whatsapp" : "paystack";
    });
  }, [quote]);

  const addressInput = useMemo<AddressInput | null>(() => (chosen ? null : { ...adhoc, recipient_name: adhoc.recipient_name || contact.name, phone: adhoc.phone || contact.phone }), [chosen, adhoc, contact]);

  const nextFromContact = () => {
    const e: Record<string, string> = {};
    if (contact.name.trim().length < 2) e.name = "Enter your full name";
    if (!EMAIL_RE.test(contact.email)) e.email = "Enter a valid email";
    if (!/^[+\d][\d\s-]{7,}$/.test(contact.phone.trim())) e.phone = "Enter a valid phone number";
    setErrors(e); if (!Object.keys(e).length) setStep(1);
  };
  const nextFromDelivery = () => {
    if (chosen) return setStep(2);
    const e = validateAddress(addressInput!); setErrors(e);
    if (!Object.keys(e).length) setStep(2); else toast.error("Please complete your delivery address");
  };

  const saveModal = async () => {
    const e = validateAddress(modalAddr); setErrors(e); if (Object.keys(e).length) return;
    try {
      if (user && modalSave) { const a = await accountService.addAddress({ ...modalAddr, is_default: !saved.length }); addresses.reload(); setAddrId(a.id); }
      else { setAdhoc(modalAddr); setAddrId(null); }
      setModal(false); setErrors({});
    } catch (err) { toast.error(err instanceof ApiError ? err.message : "Could not save address"); }
  };

  const applyCoupon = () => setAppliedCoupon(coupon.trim().toUpperCase());

  const place = async () => {
    if (!method) return;
    setBusy(true);
    try {
      const res = await shopService.checkout({
        items: lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })),
        name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim(),
        address_id: chosen?.id ?? null, address: chosen ? null : addressInput, save_address: false,
        coupon_code: quote?.coupon_code || undefined, notes: notes || undefined, payment_method: method,
        channel: method === "whatsapp" ? "whatsapp" : "web", request_store_match: matchStore,
      });
      clear();
      if (res.next_step === "pay_online" && res.authorization_url) { goToGateway(res.authorization_url); return; }
      if (res.next_step === "whatsapp" && res.whatsapp_url) window.open(res.whatsapp_url, "_blank", "noopener");
      nav("/order-confirmation", { state: { order: res.order, next_step: res.next_step, whatsapp_url: res.whatsapp_url }, replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not place your order. Please try again."); setBusy(false);
    }
  };

  if (!lines.length) return <div className="container py-5"><EmptyState icon="ri-shopping-basket-line" title="Your cart is empty" text="Add something delicious before checking out." action={<Link to="/shop" className="btn btn-primary btn-pill">Shop Ginger Plus</Link>} /></div>;

  const couponBox = (
    <div className="input-group input-group-sm my-3">
      <input className="form-control" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} aria-label="Coupon code" />
      <button className="btn btn-outline-primary" type="button" onClick={applyCoupon} disabled={!coupon.trim()}>Apply</button>
      {quote?.coupon_error && appliedCoupon && <div className="invalid-feedback d-block">{quote.coupon_error}</div>}
    </div>
  );

  const payOpts: { key: Method; icon: string; title: string; text: string; show: boolean; primary?: boolean }[] = [
    { key: "paystack", icon: "ri-bank-card-line", title: "Pay securely online", text: "Card, bank transfer or USSD via Paystack — instant confirmation.", show: onlineOk, primary: !wholesale },
    { key: "whatsapp", icon: "ri-whatsapp-line", title: "Order via WhatsApp", text: "We create your order now and continue the conversation on WhatsApp for wholesale confirmation.", show: wholesale, primary: wholesale },
    { key: "bank_transfer", icon: "ri-bank-line", title: "Bank transfer", text: "Place the order and pay by transfer. We'll email the account details and confirm on receipt.", show: wholesale || true },
  ];

  return (
    <div className="container py-4 py-md-5">
      <h1 className="h2 fw-bold mb-3">Checkout</h1>
      <div className="stepper mb-4">{STEPS.map((s, i) => (
        <div key={s} className={`checkout-step ${i === step ? "active" : ""} ${i < step ? "done clickable" : ""}`} onClick={() => i < step && setStep(i)}>
          <span className="dot">{i < step ? <i className="ri-check-line" /> : i + 1}</span>{s}{i < STEPS.length - 1 && <i className="ri-arrow-right-s-line text-muted d-none d-sm-inline" />}</div>))}</div>

      <div className="row g-4">
        <div className="col-lg-7 col-xl-8">
          {step === 0 && (
            <div className="card border-0 shadow-soft step-panel"><div className="card-body p-4">
              <h5 className="fw-bold mb-1">Contact details</h5>
              {!user && <p className="text-muted fs-sm mb-3">Checking out as a guest — no account needed. <Link to="/login" state={{ from: "/checkout" }}>Sign in</Link> to use saved addresses.</p>}
              <div className="row"><div className="col-12"><Input label="Full name" required value={contact.name} error={errors.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" /></div>
                <div className="col-md-6"><Input label="Email" type="email" required value={contact.email} error={errors.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" hint="We'll send your receipt and tracking updates here." /></div>
                <div className="col-md-6"><Input label="Phone / WhatsApp" required value={contact.phone} error={errors.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" inputMode="tel" /></div></div>
              <button className="btn btn-primary btn-lg" onClick={nextFromContact}>Continue to delivery <i className="ri-arrow-right-line" /></button>
            </div></div>)}

          {step === 1 && (
            <div className="card border-0 shadow-soft step-panel"><div className="card-body p-4">
              <h5 className="fw-bold mb-3">Delivery address</h5>
              {user ? (<>
                {addresses.loading ? <Spinner /> : (
                  <div className="row g-3 mb-3">
                    {saved.map((a) => (<div className="col-md-6" key={a.id}><label className={`addr-card ${addrId === a.id ? "active" : ""}`} onClick={() => setAddrId(a.id)}>
                      <div className="d-flex justify-content-between"><strong>{a.label}</strong>{a.is_default && <span className="badge badge-soft-primary">Default</span>}</div>
                      <div className="fs-sm">{a.recipient_name} · {a.phone}</div><div className="text-muted fs-sm">{a.line1}, {a.city}, {a.state}</div></label></div>))}
                    {!chosen && adhoc.line1 && <div className="col-md-6"><label className="addr-card active"><strong>New address</strong><div className="text-muted fs-sm">{adhoc.line1}, {adhoc.city}, {adhoc.state}</div></label></div>}
                    <div className="col-md-6"><button type="button" className="addr-card text-start w-100 bg-transparent d-flex align-items-center gap-2 text-brown fw-semibold" style={{ borderStyle: "dashed" }}
                      onClick={() => { setModalAddr(emptyAddress(contact.name, contact.phone)); setErrors({}); setModal(true); }}><i className="ri-add-circle-line fs-4" />Add new address</button></div>
                  </div>)}
              </>) : <AddressForm value={{ ...adhoc, recipient_name: adhoc.recipient_name || contact.name, phone: adhoc.phone || contact.phone }} onChange={setAdhoc} errors={errors} showLabel={false} />}
              <Textarea label="Delivery notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Landmark, preferred delivery time…" />
              <Switch label="Match me with my nearest dealer" checked={matchStore} onChange={setMatchStore} hint="We'll suggest the closest Southern Rose dealer for faster delivery — confirmed by our team." />
              <div className="d-flex gap-2"><button className="btn btn-light" onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={nextFromDelivery} disabled={user ? !chosen && !adhoc.line1 : false}>Continue to payment <i className="ri-arrow-right-line" /></button></div>
            </div></div>)}

          {step === 2 && (
            <div className="card border-0 shadow-soft step-panel"><div className="card-body p-4">
              <h5 className="fw-bold mb-3">Payment</h5>
              {wholesale && <div className="wholesale-banner mb-3"><div className="fw-bold"><i className="ri-store-2-line me-1" />Wholesale order ({quote?.total_packs} packs)</div>
                <div className="fs-sm opacity-75">Orders of {max}+ packs get wholesale pricing and are confirmed by our team. Choose how you'd like to complete it.</div></div>}
              <div className="d-grid gap-3 mb-3">
                {payOpts.filter((o) => o.show).map((o) => (
                  <label key={o.key} className={`option-card pay-option d-flex gap-3 align-items-center ${method === o.key ? "active" : ""}`}>
                    <input type="radio" className="form-check-input mt-0" name="pay" checked={method === o.key} onChange={() => setMethod(o.key)} />
                    <span className="icon"><i className={o.icon} /></span>
                    <span className="flex-grow-1"><span className="fw-semibold d-block">{o.title}{o.primary && <span className="badge badge-soft-success ms-2">Recommended</span>}</span><span className="text-muted fs-sm">{o.text}</span></span>
                  </label>))}
              </div>
              {!wholesale && <p className="text-muted fs-xs"><i className="ri-information-line" /> Orders under {max} packs are paid online. Buying {max}+ packs? Add more to unlock wholesale pricing and WhatsApp ordering.</p>}
              <div className="alert bg-cream border-0 fs-sm"><strong>Delivering to:</strong> {chosen ? `${chosen.line1}, ${chosen.city}, ${chosen.state}` : `${adhoc.line1}, ${adhoc.city}, ${adhoc.state}`}<br /><strong>Contact:</strong> {contact.name} · {contact.email} · {contact.phone}</div>
              <div className="d-flex gap-2 flex-wrap"><button className="btn btn-light" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary btn-lg flex-grow-1" disabled={busy || loading || !method || !quote} onClick={place}>
                  {busy ? <Spinner size="sm" className="me-2" /> : <i className={`${method === "whatsapp" ? "ri-whatsapp-line" : method === "paystack" ? "ri-lock-line" : "ri-check-line"} me-2`} />}
                  {method === "paystack" ? `Pay ₦${quote?.total.toLocaleString() ?? ""} securely` : method === "whatsapp" ? "Place order & continue on WhatsApp" : "Place order"}</button></div>
              <p className="text-muted fs-xs mt-3 mb-0">By placing your order you agree to our <Link to="/terms-and-conditions">Terms</Link> and <Link to="/shipping-returns">Shipping &amp; Returns</Link>.</p>
            </div></div>)}
        </div>
        <div className="col-lg-5 col-xl-4"><OrderSummary quote={quote} loading={loading} error={error} coupon={couponBox} /></div>
      </div>

      <Modal show={modal} onClose={() => setModal(false)} title="Add a delivery address" size="lg"
        footer={<><button className="btn btn-light" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={saveModal}>Use this address</button></>}>
        <AddressForm value={modalAddr} onChange={setModalAddr} errors={errors} />
        <div className="form-check"><input className="form-check-input" type="checkbox" id="saveAddr" checked={modalSave} onChange={(e) => setModalSave(e.target.checked)} /><label className="form-check-label fs-sm" htmlFor="saveAddr">Save to my address book for next time</label></div>
      </Modal>
    </div>
  );
}
