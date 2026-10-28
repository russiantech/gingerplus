import { useState } from "react";
import { useAsync } from "@/hooks";
import { shopService } from "@/services/shop";

/** Bank-transfer account details entered by the admin (Admin → Payment settings). Renders nothing if not enabled. */
export default function BankDetailsCard({ reference, className = "" }: { reference?: string; className?: string }) {
  const { data } = useAsync(() => shopService.paymentConfig().catch(() => null), []);
  const [copied, setCopied] = useState(false);
  const b = data?.bank_transfer;
  if (!b || !b.account_number) return null;
  const copy = async () => { try { await navigator.clipboard.writeText(b.account_number); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };
  return (
    <div className={`bank-card ${className}`}>
      <div className="d-flex align-items-center gap-2 mb-2"><span className="soft-icon" style={{ width: 40, height: 40, fontSize: "1.2rem" }}><i className="ri-bank-line" /></span><strong>Pay by bank transfer</strong></div>
      <dl className="kv mb-2">
        {b.bank_name && <><dt>Bank</dt><dd>{b.bank_name}</dd></>}
        {b.account_name && <><dt>Account name</dt><dd>{b.account_name}</dd></>}
        <dt>Account number</dt><dd><strong className="fs-5">{b.account_number}</strong> <button type="button" className="btn btn-sm btn-light ms-1" onClick={copy}><i className={copied ? "ri-check-line" : "ri-file-copy-line"} /> {copied ? "Copied" : "Copy"}</button></dd>
        {reference && <><dt>Reference</dt><dd><strong>{reference}</strong></dd></>}
      </dl>
      {b.instructions && <p className="fs-sm text-muted mb-0">{b.instructions}</p>}
    </div>
  );
}
