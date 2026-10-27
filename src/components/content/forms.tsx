import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Input, Select, Spinner, Textarea } from "@/components/common";
import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/http";
import { publicService } from "@/services/public";
import { SUBJECTS } from "@/utils/constants";

function useSubmit(onDone?: () => void) {
  const toast = useToast();
  const [busy, setBusy] = useState(false); const [done, setDone] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<{ detail: string }>) => {
    setBusy(true); setError(null);
    try { const r = await fn(); setDone(r.detail); toast.success(r.detail); onDone?.(); }
    catch (e) { const m = e instanceof ApiError ? e.message : "Something went wrong. Please try again."; setError(m); toast.error(m); } finally { setBusy(false); }
  };
  return { busy, done, error, run, reset: () => setDone(null) };
}
const Success = ({ text, onReset }: { text: string; onReset: () => void }) => (
  <div className="text-center py-4"><i className="ri-checkbox-circle-fill display-4 text-success" /><h5 className="mt-2">{text}</h5><button className="btn btn-link" onClick={onReset}>Send another</button></div>
);
const SubmitBtn = ({ busy, children }: { busy: boolean; children: ReactNode }) => <button className="btn btn-primary btn-lg px-4" disabled={busy}>{busy && <Spinner size="sm" className="me-2" />}{children}</button>;
const Err = ({ m }: { m: string | null }) => (m ? <div className="alert alert-danger py-2 fs-sm">{m}</div> : null);

const PRODUCTS_OF_INTEREST = ["Turmeric 350ml", "Honey 350ml", "Guarana 350ml", "Turmeric 125ml", "Honey 125ml", "Guarana 125ml"];

export function ContactForm({ defaultSubject = "general", title }: { defaultSubject?: string; title?: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: defaultSubject, message: "", website: "", business: "", location: "", volume: "", products: "" });
  useEffect(() => setF((s) => ({ ...s, subject: defaultSubject })), [defaultSubject]);
  const { busy, done, error, run, reset } = useSubmit(() => setF((s) => ({ ...s, message: "", business: "", location: "", volume: "", products: "" })));
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const biz = ["wholesale", "distribution", "event"].includes(f.subject);
  const submit = (e: FormEvent) => { e.preventDefault();
    run(() => publicService.contact({ name: f.name, email: f.email, phone: f.phone || undefined, subject: f.subject, message: f.message, website: f.website,
      extra: biz ? Object.fromEntries(Object.entries({ business_name: f.business, location: f.location, expected_monthly_volume: f.volume, products_of_interest: f.products }).filter(([, v]) => v)) : undefined })); };
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={submit}>
      {title && <h4 className="fw-bold mb-3">{title}</h4>}
      <div className="row g-3">
        <div className="col-md-6"><Input label="Name" required value={f.name} onChange={set("name")} minLength={2} autoComplete="name" /></div>
        <div className="col-md-6"><Input label="Email" type="email" required value={f.email} onChange={set("email")} autoComplete="email" /></div>
        <div className="col-md-6"><Input label="Phone" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></div>
        <div className="col-md-6"><Select label="Subject" value={f.subject} onChange={set("subject")}>{SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></div>
        {biz && <>
          <div className="col-12"><div className="alert alert-warning py-2 fs-sm mb-0"><i className="ri-information-line me-1" />For wholesale &amp; distribution please include your business details — we respond within 24 hours.</div></div>
          <div className="col-md-6"><Input label="Business name" value={f.business} onChange={set("business")} /></div>
          <div className="col-md-6"><Input label="Location" value={f.location} onChange={set("location")} /></div>
          <div className="col-md-6"><Input label="Expected monthly volume (packs)" inputMode="numeric" value={f.volume} onChange={set("volume")} /></div>
          <div className="col-md-6"><Input label="Products of interest" placeholder="e.g. Turmeric 350ml, Honey 125ml" value={f.products} onChange={set("products")} /></div></>}
        <div className="col-12"><Textarea label="Message" required minLength={5} value={f.message} onChange={set("message")} /></div>
        <input type="text" name="website" value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }} />
      </div>
      <Err m={error} /><SubmitBtn busy={busy}>Send message</SubmitBtn>
    </form>
  );
}

export function WholesaleQuoteForm({ heading }: { heading?: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", business: "", location: "", volume: "", message: "" });
  const [picked, setPicked] = useState<string[]>([]);
  const { busy, done, error, run, reset } = useSubmit();
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = (e: FormEvent) => { e.preventDefault();
    run(() => publicService.contact({ name: f.name, email: f.email, phone: f.phone, subject: "wholesale",
      message: f.message || "Please send me your wholesale price list.", extra: { business_name: f.business, location: f.location, expected_monthly_volume: f.volume, products_of_interest: picked.join(", ") } })); };
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={submit} className="card border-0 shadow-soft"><div className="card-body p-4">
      <h4 className="fw-bold mb-1">{heading ?? "Request Wholesale Price List"}</h4><p className="text-muted fs-sm">We'll respond within 24 hours.</p>
      <div className="row g-3">
        <div className="col-md-6"><Input label="Your name" required value={f.name} onChange={set("name")} /></div>
        <div className="col-md-6"><Input label="Business name" required value={f.business} onChange={set("business")} /></div>
        <div className="col-md-6"><Input label="Email" type="email" required value={f.email} onChange={set("email")} /></div>
        <div className="col-md-6"><Input label="Phone / WhatsApp" required value={f.phone} onChange={set("phone")} /></div>
        <div className="col-md-6"><Input label="Location" required value={f.location} onChange={set("location")} /></div>
        <div className="col-md-6"><Input label="Expected monthly volume (packs)" inputMode="numeric" value={f.volume} onChange={set("volume")} /></div>
        <div className="col-12"><label className="form-label fw-medium fs-sm">Products of interest</label><div className="d-flex flex-wrap gap-2">
          {PRODUCTS_OF_INTEREST.map((p) => <button type="button" key={p} className={`btn btn-sm recipe-chip ${picked.includes(p) ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPicked((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))}>{p}</button>)}</div></div>
        <div className="col-12"><Textarea label="Anything else?" rows={3} value={f.message} onChange={set("message")} /></div>
      </div><Err m={error} /><SubmitBtn busy={busy}>Request price list</SubmitBtn></div></form>
  );
}

export function DistributorForm({ heading }: { heading?: string }) {
  const [f, setF] = useState({ business_name: "", contact_person: "", phone: "", email: "", location: "", state: "", years: "", current_products: "", volume: "", motivation: "" });
  const [states, setStates] = useState<string[]>([]);
  useEffect(() => { publicService.states().then(setStates).catch(() => undefined); }, []);
  const { busy, done, error, run, reset } = useSubmit();
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = (e: FormEvent) => { e.preventDefault();
    run(() => publicService.distributorApply({ business_name: f.business_name, contact_person: f.contact_person, phone: f.phone, email: f.email, location: f.location, state: f.state || undefined,
      years_in_distribution: f.years ? Number(f.years) : undefined, current_products: f.current_products || undefined, expected_monthly_volume: f.volume ? Number(f.volume) : undefined, motivation: f.motivation || undefined })); };
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={submit} className="card border-0 shadow-soft"><div className="card-body p-4">
      <h4 className="fw-bold mb-3">{heading ?? "Distributor Application"}</h4>
      <div className="row g-3">
        <div className="col-md-6"><Input label="Business name" required value={f.business_name} onChange={set("business_name")} /></div>
        <div className="col-md-6"><Input label="Contact person" required value={f.contact_person} onChange={set("contact_person")} /></div>
        <div className="col-md-6"><Input label="Phone" required type="tel" value={f.phone} onChange={set("phone")} /></div>
        <div className="col-md-6"><Input label="Email" required type="email" value={f.email} onChange={set("email")} /></div>
        <div className="col-md-6"><Input label="Location / Region" required value={f.location} onChange={set("location")} /></div>
        <div className="col-md-6"><Select label="State" value={f.state} onChange={set("state")}><option value="">Select state…</option>{states.map((s) => <option key={s}>{s}</option>)}</Select></div>
        <div className="col-md-6"><Input label="Years in distribution" type="number" min={0} max={80} value={f.years} onChange={set("years")} /></div>
        <div className="col-md-6"><Input label="Expected monthly volume (packs)" type="number" min={0} value={f.volume} onChange={set("volume")} /></div>
        <div className="col-12"><Input label="Current products distributed" value={f.current_products} onChange={set("current_products")} /></div>
        <div className="col-12"><Textarea label="Why do you want to distribute Southern Rose?" value={f.motivation} onChange={set("motivation")} /></div>
      </div><Err m={error} /><SubmitBtn busy={busy}>Submit Application</SubmitBtn></div></form>
  );
}

export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [f, setF] = useState({ name: "", email: "" });
  const { busy, done, error, run, reset } = useSubmit(() => setF({ name: "", email: "" }));
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); run(() => publicService.subscribe(f.email, f.name || undefined)); }}>
      <div className="row g-2"><div className="col-md-4"><input className="form-control form-control-lg" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Name" /></div>
        <div className="col-md-5"><input type="email" required className="form-control form-control-lg" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" /></div>
        <div className="col-md-3 d-grid"><button className={`btn btn-lg ${dark ? "btn-dark" : "btn-primary"}`} disabled={busy}>{busy ? <Spinner size="sm" /> : "Subscribe"}</button></div></div>
      <Err m={error} />
    </form>
  );
}

export function ReviewForm() {
  const [f, setF] = useState({ author_name: "", author_role: "", quote: "", rating: 5 });
  const { busy, done, error, run, reset } = useSubmit(() => setF({ author_name: "", author_role: "", quote: "", rating: 5 }));
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); run(() => publicService.submitReview({ ...f, author_role: f.author_role || undefined })); }}>
      <div className="row g-3"><div className="col-md-6"><Input label="Your name" required value={f.author_name} onChange={(e) => setF({ ...f, author_name: e.target.value })} /></div>
        <div className="col-md-6"><Input label="Who are you?" placeholder="e.g. Bar owner — Lagos" value={f.author_role} onChange={(e) => setF({ ...f, author_role: e.target.value })} /></div>
        <div className="col-12"><label className="form-label fw-medium fs-sm">Rating</label><div className="fs-3">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className="btn btn-link p-0 me-1 text-gold" onClick={() => setF({ ...f, rating: n })} aria-label={`${n} stars`}><i className={n <= f.rating ? "ri-star-fill" : "ri-star-line"} /></button>)}</div></div>
        <div className="col-12"><Textarea label="Your experience" required minLength={10} value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} /></div></div>
      <Err m={error} /><SubmitBtn busy={busy}>Submit a Review</SubmitBtn>
    </form>
  );
}

export function RecipeSubmitForm() {
  const [f, setF] = useState({ submitted_by: "", email: "", title: "", category: "cocktail", ingredients: "", steps: "" });
  const { busy, done, error, run, reset } = useSubmit(() => setF({ submitted_by: "", email: "", title: "", category: "cocktail", ingredients: "", steps: "" }));
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  if (done) return <Success text={done} onReset={reset} />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); run(() => publicService.submitRecipe({ ...f, ingredients: lines(f.ingredients), steps: lines(f.steps) })); }}>
      <div className="row g-3"><div className="col-md-6"><Input label="Your name" required value={f.submitted_by} onChange={set("submitted_by")} /></div>
        <div className="col-md-6"><Input label="Email" type="email" required value={f.email} onChange={set("email")} /></div>
        <div className="col-md-8"><Input label="Recipe name" required minLength={3} value={f.title} onChange={set("title")} /></div>
        <div className="col-md-4"><Select label="Type" value={f.category} onChange={set("category")}><option value="cocktail">Cocktail</option><option value="warm_drink">Warm drink</option><option value="shot">Shot</option><option value="mocktail">Mocktail</option></Select></div>
        <div className="col-md-6"><Textarea label="Ingredients (one per line)" required value={f.ingredients} onChange={set("ingredients")} /></div>
        <div className="col-md-6"><Textarea label="Steps (one per line)" required value={f.steps} onChange={set("steps")} /></div></div>
      <Err m={error} /><SubmitBtn busy={busy}>Submit Recipe</SubmitBtn>
    </form>
  );
}
