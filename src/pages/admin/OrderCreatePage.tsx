import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Panel } from "@/components/admin";
import { Input, QtyStepper, Select, Spinner, Switch, Textarea, SearchInput } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDebounce, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { publicService } from "@/services/public";
import { shopService } from "@/services/shop";
import type { Address, CustomerListItem, Quote } from "@/types";
import { CHANNELS } from "@/utils/constants";
import { money, titleCase } from "@/utils/format";
import "@/styles/admin-sales.css";

const EMPTY_ADDR = { recipient_name: "", phone: "", line1: "", city: "", state: "Lagos", label: "Home" };

export default function OrderCreatePage() {
  useDocumentTitle("New order");
  const nav = useNavigate(); const toast = useToast();
  const [cq, setCq] = useState(""); const dcq = useDebounce(cq);
  const [customer, setCustomer] = useState<CustomerListItem | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [addrId, setAddrId] = useState("");
  const [addr, setAddr] = useState({ ...EMPTY_ADDR });
  const [lines, setLines] = useState<Record<string, number>>({});
  const [opts, setOpts] = useState({ channel: "phone", method: "bank_transfer", paid: false, fee: "", coupon: "", notes: "" });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [qerr, setQerr] = useState("");
  const [busy, setBusy] = useState(false);

  const found = useAsync(() => (dcq.length > 1 ? adminApi.customers.list({ q: dcq, page_size: 6 }) : Promise.resolve(null)), [dcq]);
  const products = useAsync(() => shopService.products(), []);
  const states = useAsync(() => publicService.states(), []);
  const variants = (products.data ?? []).flatMap((p) => p.variants.map((v) => ({ ...v, pname: p.name.replace("Southern Rose ", "") })));

  const pick = async (c: CustomerListItem) => {
    setCustomer(c); setCq(""); setContact({ name: c.full_name, email: c.email, phone: c.phone ?? "" });
    const d = await adminApi.customers.get(c.id); setAddrs(d.addresses); setAddrId(d.addresses.find((a) => a.is_default)?.id ?? d.addresses[0]?.id ?? "");
  };
  const items = Object.entries(lines).filter(([, q]) => q > 0).map(([variant_id, quantity]) => ({ variant_id, quantity }));
  const state = addrId ? addrs.find((a) => a.id === addrId)?.state : addr.state;
  const key = JSON.stringify([items, state, opts.coupon]);
  useEffect(() => {
    if (!items.length) { setQuote(null); setQerr(""); return; }
    const t = setTimeout(() => shopService.quote(items, state, opts.coupon || undefined).then((q) => { setQuote(q); setQerr(""); }).catch((e) => setQerr(e.message)), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const submit = async () => {
    if (!items.length) return toast.error("Add at least one product");
    if (!contact.name || !contact.email || !contact.phone) return toast.error("Customer name, email and phone are required");
    setBusy(true);
    try {
      const body: Record<string, unknown> = { items, ...contact, channel: opts.channel, payment_method: opts.method, mark_paid: opts.paid, notes: opts.notes || undefined, coupon_code: opts.coupon || undefined,
        user_id: customer?.id, delivery_fee_override: opts.fee !== "" ? Number(opts.fee) : undefined };
      if (addrId) body.address_id = addrId; else body.address = { ...addr, recipient_name: addr.recipient_name || contact.name, phone: addr.phone || contact.phone };
      const r = await adminApi.orders.create(body);
      toast.success(`Order ${r.order.number} created`); nav(`/admin/orders/${r.order.id}`);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader back={{ to: "/admin/orders", label: "Orders" }} title="New order" subtitle="Create an order taken by phone, WhatsApp, email or walk-in" />
      <div className="row g-3">
        <div className="col-xl-8 d-flex flex-column gap-3">
          <Panel title="1 · Customer">
            {customer ? <div className="d-flex justify-content-between align-items-center bg-gold-soft rounded p-2 mb-3"><span><strong>{customer.full_name}</strong> · {customer.email}</span><button className="btn btn-sm btn-link" onClick={() => { setCustomer(null); setAddrs([]); setAddrId(""); }}>Change</button></div> : (
              <div className="mb-3"><SearchInput value={cq} onChange={setCq} placeholder="Find existing customer by name, email or phone…" />
                {found.data?.items.length ? <div className="list-group mt-1 shadow-sm">{found.data.items.map((c) => <button key={c.id} className="list-group-item list-group-item-action" onClick={() => pick(c)}>{c.full_name} <small className="text-muted">{c.email} · {c.phone}</small></button>)}</div> : dcq.length > 1 && !found.loading && <div className="text-muted fs-sm mt-1">No match — enter details below for a guest order.</div>}</div>)}
            <div className="row"><Input className="col-md-4" label="Name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              <Input className="col-md-4" label="Email" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              <Input className="col-md-4" label="Phone" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
          </Panel>
          <Panel title="2 · Products">
            {products.loading ? <Spinner /> : <div className="d-flex flex-column gap-2">{variants.map((v) => (
              <div key={v.id} className="d-flex align-items-center gap-3 border rounded-3 p-2"><img src={v.image_url ?? "/images/placeholders/image.svg"} alt="" className="thumb" />
                <div className="flex-grow-1 min-w-0"><div className="fw-semibold text-truncate">{v.pname}</div><small className="text-muted">{v.label} · {money(v.effective_price ?? v.price)} · {v.stock} in stock</small></div>
                <QtyStepper size="sm" min={0} value={lines[v.id] ?? 0} onChange={(n) => setLines({ ...lines, [v.id]: n })} /></div>))}</div>}
          </Panel>
          <Panel title="3 · Delivery address">
            {addrs.length > 0 && <Select label="Saved address" value={addrId} onChange={(e) => setAddrId(e.target.value)}>{addrs.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.line1}, {a.city}, {a.state}</option>)}<option value="">+ Enter a new address</option></Select>}
            {!addrId && <div className="row"><Input className="col-md-6" label="Recipient" value={addr.recipient_name} onChange={(e) => setAddr({ ...addr, recipient_name: e.target.value })} />
              <Input className="col-md-6" label="Phone" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
              <Input className="col-12" label="Address" required value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
              <Input className="col-md-6" label="City" required value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
              <Select className="col-md-6" label="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })}>{(states.data ?? ["Lagos"]).map((s) => <option key={s}>{s}</option>)}</Select></div>}
          </Panel>
        </div>
        <div className="col-xl-4"><div className="position-sticky" style={{ top: 86 }}>
          <Panel title="4 · Payment & summary">
            <Select label="Channel" value={opts.channel} onChange={(e) => setOpts({ ...opts, channel: e.target.value })}>{CHANNELS.filter((c) => c !== "web").map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}</Select>
            <Select label="Payment method" value={opts.method} onChange={(e) => setOpts({ ...opts, method: e.target.value })}><option value="bank_transfer">Bank transfer</option><option value="paystack">Online (customer pays from their order link)</option><option value="cash">Cash</option><option value="whatsapp">WhatsApp / invoice</option></Select>
            <div className="row"><Input className="col-6" label="Coupon" value={opts.coupon} onChange={(e) => setOpts({ ...opts, coupon: e.target.value })} /><Input className="col-6" label="Delivery fee override" type="number" min={0} value={opts.fee} onChange={(e) => setOpts({ ...opts, fee: e.target.value })} /></div>
            <Textarea label="Order note" rows={2} value={opts.notes} onChange={(e) => setOpts({ ...opts, notes: e.target.value })} />
            <Switch label="Mark as paid" hint="Records a manual payment for the full total" checked={opts.paid} onChange={(v) => setOpts({ ...opts, paid: v })} />
            <hr />
            {qerr && <div className="alert alert-danger py-2 fs-sm">{qerr}</div>}
            {quote ? <dl className="kv mb-3" style={{ gridTemplateColumns: "1fr auto" }}>
              {quote.lines.map((l) => <><dt key={l.variant_id + "a"}>{l.quantity}× {l.product_name.replace("Southern Rose ", "")} <small>{l.variant_label}</small></dt><dd key={l.variant_id + "b"} className="text-end">{money(l.line_total)}</dd></>)}
              <dt>Subtotal</dt><dd className="text-end">{money(quote.subtotal)}</dd>{quote.discount_total > 0 && <><dt>Discount</dt><dd className="text-end text-success">-{money(quote.discount_total)}</dd></>}
              <dt>Delivery</dt><dd className="text-end">{money(opts.fee !== "" ? Number(opts.fee) : quote.delivery_fee)}</dd>
              <dt className="fw-bold text-body">Total</dt><dd className="text-end fw-bold fs-5">{money(quote.total - quote.delivery_fee + (opts.fee !== "" ? Number(opts.fee) : quote.delivery_fee))}</dd></dl> : <p className="text-muted fs-sm">Add products to see the live quote.</p>}
            {quote?.coupon_error && <div className="text-danger fs-sm mb-2">{quote.coupon_error}</div>}
            {quote?.is_wholesale && <div className="badge badge-soft-primary mb-2">Wholesale order · {quote.total_packs} packs</div>}
            <button className="btn btn-primary w-100" disabled={busy || !items.length} onClick={submit}>{busy && <Spinner size="sm" className="me-2" />}Create order</button>
          </Panel></div></div>
      </div>
    </>
  );
}
