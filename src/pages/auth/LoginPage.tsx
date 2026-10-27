import { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Spinner } from "@/components/common";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import "@/styles/commerce.css";

export default function LoginPage() {
  useDocumentTitle("Sign in");
  const { login } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await login(email.trim(), password); } // GuestOnly guard redirects by user type / previous page
    catch (x) { setErr(x instanceof ApiError ? x.message : "Sign in failed"); setBusy(false); }
  };
  return (
    <div>
      <h1 className="h3 fw-bold">Welcome back</h1><p className="text-muted mb-4">Sign in to track orders and checkout faster.</p>
      <form onSubmit={submit}>
        {err && <div className="alert alert-danger py-2 fs-sm" role="alert">{err}</div>}
        <Input label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="position-relative"><Input label="Password" type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="btn btn-link position-absolute end-0 text-muted" style={{ top: 26 }} onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility"><i className={show ? "ri-eye-off-line" : "ri-eye-line"} /></button></div>
        <div className="text-end mb-3"><Link to="/forgot-password" className="fs-sm">Forgot password?</Link></div>
        <button className="btn btn-primary btn-lg w-100" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}Sign in</button>
      </form>
      <p className="text-center text-muted mt-4 mb-0">New here? <Link to="/register" className="fw-semibold">Create an account</Link></p>
      <p className="text-center mt-2 mb-0"><Link to="/track-order" className="fs-sm">Track an order without signing in</Link></p>
    </div>
  );
}
