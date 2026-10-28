import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Spinner } from "@/components/common";
import { ApiError } from "@/services/http";
import { shopService, type InitPayment, type PaymentStatusOut } from "@/services/shop";
import { goToGateway } from "@/utils/gateway";
import { money } from "@/utils/format";
import { loadScript } from "@/utils/loadScript";
import "@/styles/commerce.css";

/**
 * In-app payments. The flow is always:
 *   browser → our API (creates the transaction at the provider) → browser opens the provider's popup with the returned
 *   access code → provider reports back to the popup → browser asks OUR API to verify → API asks the provider → API settles.
 * The page is never redirected (a hosted-page redirect is only offered as a last resort if the popup script cannot load).
 */
export interface PayOutcome { status: "paid" | "failed" | "cancelled" | "pending"; result?: PaymentStatusOut }
type Phase = "opening" | "awaiting" | "mock" | "confirming" | "paid" | "failed" | "cancelled" | "pending" | "fallback";
interface Session { init: InitPayment; phase: Phase; error?: string; result?: PaymentStatusOut }

interface Ctx { pay: (init: InitPayment) => Promise<PayOutcome> }
const PayCtx = createContext<Ctx>({ pay: async () => ({ status: "failed" }) });
export const usePayment = () => useContext(PayCtx);

declare global {
  interface Window {
    PaystackPop?: new () => { resumeTransaction: (code: string, cb?: { onSuccess?: (t: unknown) => void; onCancel?: () => void; onError?: (e: { message?: string }) => void }) => void };
    FlutterwaveCheckout?: (o: Record<string, unknown>) => { close?: () => void } | void;
  }
}
const PAYSTACK_JS = "https://js.paystack.co/v2/inline.js";
const FLUTTERWAVE_JS = "https://checkout.flutterwave.com/v3.js";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Something went wrong");

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session | null>(null);
  const resolver = useRef<((o: PayOutcome) => void) | null>(null);
  const settled = useRef(false); // popup callbacks can fire twice (success then close)

  const finish = useCallback((o: PayOutcome) => { resolver.current?.(o); resolver.current = null; setS(null); }, []);

  /** Ask OUR backend to verify (it asks the provider). Retries a few times because providers can lag a moment. */
  const confirm = useCallback(async (init: InitPayment) => {
    if (settled.current) return; settled.current = true;
    setS({ init, phase: "confirming" });
    let last: PaymentStatusOut | undefined;
    for (let i = 0; i < 5; i++) {
      try { last = await shopService.confirmPayment(init.reference); }
      catch (e) { setS({ init, phase: "failed", error: errMsg(e) }); return; }
      if (last.status === "paid") { setS({ init, phase: "paid", result: last }); await wait(1100); finish({ status: "paid", result: last }); return; }
      if (last.status === "failed") break;
      await wait(1200 * (i + 1));
    }
    setS({ init, phase: last?.status === "failed" ? "failed" : "pending", result: last, error: last?.status === "failed" ? last.message ?? "The payment was declined." : undefined });
  }, [finish]);

  const launch = useCallback(async (init: InitPayment) => {
    settled.current = false;
    setS({ init, phase: "opening" });
    try {
      if (init.mock) { setS({ init, phase: "mock" }); return; }
      if (init.provider === "paystack") {
        if (!init.access_code) throw new Error("Missing access code");
        await loadScript(PAYSTACK_JS);
        if (!window.PaystackPop) throw new Error("Paystack unavailable");
        setS({ init, phase: "awaiting" });
        new window.PaystackPop().resumeTransaction(init.access_code, {
          onSuccess: () => { void confirm(init); },
          onCancel: () => { if (!settled.current) setS({ init, phase: "cancelled" }); },
          onError: (e) => setS({ init, phase: "failed", error: e?.message ?? "The payment window reported an error." }),
        });
        return;
      }
      if (init.provider === "flutterwave") {
        if (!init.public_key) throw new Error("Missing public key");
        await loadScript(FLUTTERWAVE_JS);
        if (!window.FlutterwaveCheckout) throw new Error("Flutterwave unavailable");
        setS({ init, phase: "awaiting" });
        const modal = window.FlutterwaveCheckout({
          public_key: init.public_key, tx_ref: init.reference, amount: init.amount, currency: init.currency, payment_options: "card,banktransfer,ussd",
          customer: { email: init.email, name: init.name ?? init.email, phone_number: init.phone ?? "" },
          customizations: { title: "Southern Rose", description: init.description ?? "Payment" },
          callback: (r: { status?: string }) => { if (["successful", "completed"].includes((r?.status ?? "").toLowerCase())) { modal?.close?.(); void confirm(init); } else setS({ init, phase: "failed", error: "The payment was not completed." }); },
          onclose: () => { if (!settled.current) setS((cur) => (cur && cur.phase === "awaiting" ? { init, phase: "cancelled" } : cur)); },
        });
        return;
      }
      throw new Error("Unsupported provider");
    } catch {
      setS({ init, phase: init.authorization_url ? "fallback" : "failed", error: init.authorization_url ? undefined : "We couldn't open the secure payment window. Please try again." });
    }
  }, [confirm]);

  const pay = useCallback((init: InitPayment) => new Promise<PayOutcome>((resolve) => { resolver.current = resolve; void launch(init); }), [launch]);
  useEffect(() => () => { resolver.current?.({ status: "cancelled" }); }, []);

  const mock = async (outcome: "success" | "failed") => {
    if (!s) return;
    try { await shopService.mockComplete(s.init.reference, outcome); await confirm(s.init); }
    catch (e) { setS({ init: s.init, phase: "failed", error: errMsg(e) }); }
  };
  const close = () => { if (!s) return; finish({ status: s.phase === "pending" ? "pending" : s.phase === "failed" ? "failed" : "cancelled", result: s.result }); };

  return (
    <PayCtx.Provider value={{ pay }}>
      {children}
      {s && (
        <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Secure payment">
          <div className="pay-sheet">
            <div className="pay-amount"><span className="soft-icon"><i className="ri-lock-2-line" /></span><div><div className="fs-xs text-muted">Secure payment</div><div className="fw-bold">{money(s.init.amount)}</div></div>
              {s.init.mock && <span className="badge badge-soft-warning ms-auto">Test mode</span>}</div>

            {s.phase === "opening" && <div className="pay-body"><Spinner /><p className="mb-0 mt-3">Opening secure payment…</p></div>}
            {s.phase === "awaiting" && <div className="pay-body"><span className="result-icon wait"><i className="ri-secure-payment-line" /></span><h2 className="h5 fw-bold mt-3">Complete your payment</h2>
              <p className="text-muted fs-sm">Use the secure window that just opened. We'll confirm automatically once you're done — please don't close this page.</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-outline-primary btn-sm" onClick={() => void launch(s.init)}>Window not showing? Reopen</button><button className="btn btn-light btn-sm" onClick={close}>Cancel</button></div></div>}
            {s.phase === "mock" && <div className="pay-body"><span className="result-icon wait"><i className="ri-flask-line" /></span><h2 className="h5 fw-bold mt-3">Test gateway</h2>
              <p className="text-muted fs-sm">No payment provider keys are configured, so this simulated window stands in for Paystack/Flutterwave (development only). Add keys in Admin → Payment settings.</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-primary" onClick={() => void mock("success")}>Pay {money(s.init.amount)} (test)</button><button className="btn btn-light" onClick={() => void mock("failed")}>Decline</button></div>
              <button className="btn btn-link btn-sm mt-2" onClick={close}>Cancel</button></div>}
            {s.phase === "confirming" && <div className="pay-body"><Spinner /><p className="mb-0 mt-3 fw-semibold">Confirming your payment…</p><p className="text-muted fs-sm">This only takes a moment.</p></div>}
            {s.phase === "paid" && <div className="pay-body"><span className="result-icon ok"><i className="ri-check-line" /></span><h2 className="h5 fw-bold mt-3">Payment successful</h2><p className="text-muted fs-sm mb-0">Thank you! A receipt is on its way to your email.</p></div>}
            {s.phase === "failed" && <div className="pay-body"><span className="result-icon bad"><i className="ri-close-line" /></span><h2 className="h5 fw-bold mt-3">Payment not completed</h2><p className="text-muted fs-sm">{s.error ?? "The payment was declined."}</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-primary" onClick={() => void launch(s.init)}>Try again</button><button className="btn btn-light" onClick={close}>Close</button></div></div>}
            {s.phase === "cancelled" && <div className="pay-body"><span className="result-icon wait"><i className="ri-arrow-go-back-line" /></span><h2 className="h5 fw-bold mt-3">Payment cancelled</h2><p className="text-muted fs-sm">No money was taken. You can try again now or pay later from your order.</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-primary" onClick={() => void launch(s.init)}>Try again</button><button className="btn btn-light" onClick={close}>Pay later</button></div></div>}
            {s.phase === "pending" && <div className="pay-body"><span className="result-icon wait"><i className="ri-time-line" /></span><h2 className="h5 fw-bold mt-3">Still processing</h2><p className="text-muted fs-sm">If you were debited, we'll confirm automatically — no need to pay again.</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-primary" onClick={() => { settled.current = false; void confirm(s.init); }}>Check again</button><button className="btn btn-light" onClick={close}>Close</button></div></div>}
            {s.phase === "fallback" && <div className="pay-body"><span className="result-icon bad"><i className="ri-wifi-off-line" /></span><h2 className="h5 fw-bold mt-3">Couldn't open the secure window</h2><p className="text-muted fs-sm">An ad-blocker or network issue stopped it. You can continue on the provider's secure page instead and you'll be brought back here.</p>
              <div className="d-flex gap-2 justify-content-center"><button className="btn btn-primary" onClick={() => s.init.authorization_url && goToGateway(s.init.authorization_url)}>Continue securely</button><button className="btn btn-light" onClick={close}>Close</button></div></div>}
          </div>
        </div>
      )}
    </PayCtx.Provider>
  );
}
