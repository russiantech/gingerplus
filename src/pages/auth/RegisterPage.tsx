import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Input, Spinner } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useDocumentTitle } from "@/hooks";
import { authService, type RegisterResult } from "@/services/auth";
import { ApiError } from "@/services/http";
import "@/styles/commerce.css";

export default function RegisterPage() {
  useDocumentTitle("Create account");
  const { completeVerification } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "", marketing_opt_in: true });
  const [info, setInfo] = useState<RegisterResult | null>(null);
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const [cool, setCool] = useState(0); const [left, setLeft] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(t); }, [cool]);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft((c) => c - 1), 1000); return () => clearTimeout(t); }, [left]);
  useEffect(() => { if (info) codeRef.current?.focus(); }, [info]);

  const start = (r: RegisterResult) => { setInfo(r); setCool(r.resend_in); setLeft(r.expires_in); setCode(""); setErr(null); };
  const pwOk = f.password.length >= 8 && /[A-Za-z]/.test(f.password) && /\d/.test(f.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!pwOk) return setErr("Password needs at least 8 characters with a letter and a number.");
    setBusy(true); setErr(null);
    try { start(await authService.register({ ...f, phone: f.phone || undefined, last_name: f.last_name || undefined })); }
    catch (x) { setErr(x instanceof ApiError ? x.message : "Registration failed"); } finally { setBusy(false); }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); if (code.length !== 6) return;
    setBusy(true); setErr(null);
    try { await completeVerification(f.email, code); toast.success("Welcome to Southern Rose!"); }
    catch (x) {
      const a = x as ApiError; setErr(a.message); setBusy(false);
      if (a.code === "code_expired" || a.code === "too_many_attempts") setInfo(null);
    }
  };
  const resend = async () => {
    try { start(await authService.resend(f.email)); toast.success("A new code is on its way"); }
    catch (x) { const a = x as ApiError; setErr(a.message); const ra = Number(a.extra?.retry_after); if (ra) setCool(ra); if (a.code === "no_pending_registration") setInfo(null); }
  };
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  if (info) return (
    <div className="text-center">
      <span className="result-icon wait mb-3"><i className="ri-mail-send-line" /></span>
      <h1 className="h3 fw-bold">Verify your email</h1>
      <p className="text-muted">We sent a 6-digit code to <strong>{info.email}</strong>. Your account is created once it's verified.</p>
      <form onSubmit={verify}>
        {err && <div className="alert alert-danger py-2 fs-sm text-start" role="alert">{err}</div>}
        <input ref={codeRef} className="form-control form-control-lg code-input mb-2" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-label="Verification code" />
        <div className="fs-sm text-muted mb-3">{left > 0 ? <>Code expires in <strong>{mm}</strong></> : <span className="text-danger">Code expired — request a new one</span>}</div>
        <button className="btn btn-primary btn-lg w-100" disabled={busy || code.length !== 6}>{busy && <Spinner size="sm" className="me-2" />}Verify &amp; continue</button>
      </form>
      <div className="mt-3 fs-sm">Didn't get it? <button className="btn btn-link p-0 align-baseline" disabled={cool > 0} onClick={resend}>{cool > 0 ? `Resend in ${cool}s` : "Resend code"}</button>
        <span className="mx-2 text-muted">·</span><button className="btn btn-link p-0 align-baseline" onClick={() => { setInfo(null); setErr(null); }}>Change email</button></div>
    </div>
  );

  return (
    <div>
      <h1 className="h3 fw-bold">Create your account</h1><p className="text-muted mb-4">Track orders, save addresses and reorder in seconds.</p>
      <form onSubmit={submit}>
        {err && <div className="alert alert-danger py-2 fs-sm" role="alert">{err} {err.includes("already exists") && <Link to="/login">Sign in</Link>}</div>}
        <div className="row"><div className="col-6"><Input label="First name" required value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} autoComplete="given-name" /></div>
          <div className="col-6"><Input label="Last name" value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} autoComplete="family-name" /></div></div>
        <Input label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        <Input label="Phone / WhatsApp (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
        <Input label="Password" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" hint="At least 8 characters, with a letter and a number." error={f.password && !pwOk ? "Too weak" : undefined} />
        <div className="form-check mb-3"><input className="form-check-input" type="checkbox" id="mk" checked={f.marketing_opt_in} onChange={(e) => setF({ ...f, marketing_opt_in: e.target.checked })} /><label className="form-check-label fs-sm" htmlFor="mk">Send me recipes, offers and new product news</label></div>
        <button className="btn btn-primary btn-lg w-100" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Send verification code</button>
        <p className="text-muted fs-xs mt-3">By continuing you agree to our <Link to="/terms-and-conditions">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p>
      </form>
      <p className="text-center text-muted mb-0">Already have an account? <Link to="/login" className="fw-semibold">Sign in</Link></p>
    </div>
  );
}
