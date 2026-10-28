import { useEffect, useState } from "react";
import { ConfirmDialog, Input, PageLoader, Spinner, Switch, Textarea } from "@/components/common";
import { PageHeader } from "@/components/admin";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import type { PaymentProviderInfo } from "@/types";

const SOURCE: Record<string, [string, string]> = { database: ["Using admin-saved keys", "success"], environment: ["Using environment keys", "info"], none: ["Not configured", "secondary"] };
const ICON: Record<string, string> = { paystack: "ri-bank-card-line", flutterwave: "ri-flashlight-line", bank_transfer: "ri-bank-line" };

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="btn btn-sm btn-light" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); } catch { /* ignore */ } }}><i className={ok ? "ri-check-line" : "ri-file-copy-line"} /></button>;
}

function ProviderCard({ p, reload }: { p: PaymentProviderInfo; reload: () => void }) {
  const toast = useToast();
  const online = p.kind === "online";
  const [f, setF] = useState({ is_enabled: p.is_enabled, mode: p.mode, public_key: p.public_key ?? "", secret_key: "", webhook_secret: "", extra: { ...p.extra } as Record<string, string> });
  const [busy, setBusy] = useState<string | null>(null); const [confirm, setConfirm] = useState<null | "remove" | "clear">(null);
  useEffect(() => { setF({ is_enabled: p.is_enabled, mode: p.mode, public_key: p.public_key ?? "", secret_key: "", webhook_secret: "", extra: { ...p.extra } }); }, [p]);
  const run = async (k: string, fn: () => Promise<unknown>, ok: string) => { setBusy(k); try { await fn(); toast.success(ok); reload(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); } };
  const save = () => run("save", () => adminApi.paymentProviders.update(p.provider, {
    is_enabled: f.is_enabled, mode: f.mode, public_key: f.public_key || null, extra: f.extra, clear_secret: false, clear_webhook_secret: false,
    ...(f.secret_key ? { secret_key: f.secret_key } : {}), ...(f.webhook_secret ? { webhook_secret: f.webhook_secret } : {}),
  }), `${p.display_name} saved`);
  const test = async () => { setBusy("test"); try { const r = await adminApi.paymentProviders.test(p.provider); r.ok ? toast.success(r.message) : toast.error(r.message); } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); } };
  const ex = (k: string, label: string, ph?: string) => <Input label={label} placeholder={ph} value={f.extra[k] ?? ""} onChange={(e) => setF({ ...f, extra: { ...f.extra, [k]: e.target.value } })} />;
  const [srcLabel, srcTone] = SOURCE[p.source] ?? SOURCE.none;
  return (
    <div className="card admin-card border-0 shadow-soft mb-4"><div className="card-body p-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <span className="soft-icon" style={{ width: 48, height: 48, fontSize: "1.4rem" }}><i className={ICON[p.provider] ?? "ri-wallet-line"} /></span>
        <div className="flex-grow-1"><h5 className="fw-bold mb-0">{p.display_name} {p.active && <span className="badge badge-soft-success ms-1">Live on checkout</span>}{p.is_default && <span className="badge badge-soft-warning ms-1">Default</span>}</h5><div className="text-muted fs-sm">{p.blurb}</div></div>
        {online && <span className={`badge text-bg-${srcTone}`}>{srcLabel}</span>}
        <Switch label="" checked={f.is_enabled} onChange={(x) => setF({ ...f, is_enabled: x })} />
      </div>
      {p.needs_reentry && <div className="alert alert-warning fs-sm"><i className="ri-alert-line me-1" />The stored secret can't be decrypted (the encryption key changed). Re-enter it below.</div>}
      {online ? <>
        <div className="row g-0 gx-3">
          <div className="col-md-4"><label className="form-label">Mode</label><select className="form-select mb-3" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option value="test">Test</option><option value="live">Live</option></select></div>
          <div className="col-md-8"><Input label="Public key" placeholder={p.provider === "paystack" ? "pk_test_…" : "FLWPUBK_TEST-…"} value={f.public_key} onChange={(e) => setF({ ...f, public_key: e.target.value })} /></div>
          <div className="col-md-6"><Input type="password" autoComplete="new-password" label="Secret key" placeholder={p.has_secret ? `${p.secret_masked ?? "••••••••"} (saved — leave blank to keep)` : p.provider === "paystack" ? "sk_test_…" : "FLWSECK_TEST-…"} hint="Stored encrypted. Never shown again." value={f.secret_key} onChange={(e) => setF({ ...f, secret_key: e.target.value })} /></div>
          <div className="col-md-6"><Input type="password" autoComplete="new-password" label={p.provider === "flutterwave" ? "Webhook secret hash" : "Webhook secret (optional)"} placeholder={p.has_webhook_secret ? "•••••••• (saved — leave blank to keep)" : ""} hint={p.provider === "paystack" ? "Paystack signs webhooks with your secret key; no extra value needed." : "Must match the hash set in your Flutterwave dashboard."} value={f.webhook_secret} onChange={(e) => setF({ ...f, webhook_secret: e.target.value })} /></div>
        </div>
        {p.webhook_url && <div className="bg-cream rounded-3 p-3 mb-3 fs-sm d-flex align-items-center gap-2"><div className="flex-grow-1 text-break"><div className="fw-semibold">Webhook URL — add this in your {p.display_name} dashboard</div><code>{p.webhook_url}</code></div><Copy text={p.webhook_url} /></div>}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button className="btn btn-primary" disabled={!!busy} onClick={save}>{busy === "save" && <Spinner size="sm" className="me-2" />}Save</button>
          <button className="btn btn-outline-primary" disabled={!!busy} onClick={test}>{busy === "test" && <Spinner size="sm" className="me-2" />}<i className="ri-pulse-line me-1" />Test connection</button>
          {!p.is_default && <button className="btn btn-light" disabled={!!busy} onClick={() => run("def", () => adminApi.paymentProviders.makeDefault(p.provider), `${p.display_name} is now the default`)}>Make default</button>}
          {p.has_secret && <button className="btn btn-link text-danger ms-auto" onClick={() => setConfirm("remove")}>Remove saved keys</button>}
        </div>
        <div className="text-muted fs-xs mt-3"><i className="ri-lock-2-line me-1" />Saved secrets are encrypted at rest and only decrypted on the server when calling {p.display_name}.{p.secret_fingerprint && <> Fingerprint <code>{p.secret_fingerprint}</code>.</>}{p.env_available && " Environment keys exist and are used as a fallback when nothing is saved here."}</div>
      </> : <>
        <div className="row g-0 gx-3"><div className="col-md-6">{ex("bank_name", "Bank name", "e.g. GTBank")}</div><div className="col-md-6">{ex("account_name", "Account name")}</div><div className="col-md-6">{ex("account_number", "Account number")}</div></div>
        <Textarea label="Instructions" rows={2} value={f.extra.instructions ?? ""} hint="Shown with the account details, e.g. “Use your order number as reference.”" onChange={(e) => setF({ ...f, extra: { ...f.extra, instructions: e.target.value } })} />
        <button className="btn btn-primary" disabled={!!busy} onClick={save}>{busy === "save" && <Spinner size="sm" className="me-2" />}Save</button>
      </>}
      <ConfirmDialog show={confirm === "remove"} danger title="Remove saved keys?" message={`${p.display_name} will fall back to environment variables if they exist; otherwise it stops being available.`} confirmLabel="Remove" busy={busy === "rm"} onClose={() => setConfirm(null)} onConfirm={() => { setConfirm(null); void run("rm", () => adminApi.paymentProviders.remove(p.provider), "Saved keys removed"); }} />
    </div></div>
  );
}

export default function PaymentSettingsPage() {
  useDocumentTitle("Payment settings");
  const { data, loading, reload } = useAsync(() => adminApi.paymentProviders.list(), []);
  if (loading && !data) return <PageLoader />;
  return (
    <>
      <PageHeader title="Payment settings" subtitle="API keys for each provider. Keys saved here are used first; environment variables are the fallback." />
      <div className="alert bg-cream border-0 fs-sm"><i className="ri-information-line me-1" /><strong>How it works:</strong> the storefront talks only to our server. The server starts the transaction with the provider, the customer pays in a pop-up, and the server verifies the result with the provider before marking anything paid.</div>
      {(data ?? []).map((p) => <ProviderCard key={p.provider} p={p} reload={reload} />)}
    </>
  );
}
