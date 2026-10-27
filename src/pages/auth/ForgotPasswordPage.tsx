import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Spinner } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { useDocumentTitle } from "@/hooks";
import { authService } from "@/services/auth";
import { ApiError } from "@/services/http";

export default function ForgotPasswordPage() {
  useDocumentTitle("Reset password");
  const nav = useNavigate(); const toast = useToast();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);

  const request = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await authService.forgot(email.trim()); setSent(true); } catch (x) { setErr(x instanceof ApiError ? x.message : "Request failed"); } finally { setBusy(false); }
  };
  const reset = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await authService.reset(email.trim(), code, pw); toast.success("Password updated — please sign in"); nav("/login"); }
    catch (x) { setErr(x instanceof ApiError ? x.message : "Reset failed"); setBusy(false); }
  };
  return (
    <div>
      <h1 className="h3 fw-bold">{sent ? "Enter your code" : "Forgot password?"}</h1>
      <p className="text-muted mb-4">{sent ? `If an account exists for ${email}, a 6-digit code is on its way.` : "We'll email you a code to reset it."}</p>
      {err && <div className="alert alert-danger py-2 fs-sm">{err}</div>}
      {!sent ? (
        <form onSubmit={request}><Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary btn-lg w-100" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Send reset code</button></form>
      ) : (
        <form onSubmit={reset}>
          <input className="form-control form-control-lg code-input mb-3" inputMode="numeric" maxLength={6} placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="Reset code" />
          <Input label="New password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" hint="At least 8 characters, with a letter and a number." />
          <button className="btn btn-primary btn-lg w-100" disabled={busy || code.length !== 6}>{busy && <Spinner size="sm" className="me-2" />}Update password</button>
          <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setSent(false)}>Use a different email</button></form>)}
      <p className="text-center mt-4 mb-0"><Link to="/login">Back to sign in</Link></p>
    </div>
  );
}
