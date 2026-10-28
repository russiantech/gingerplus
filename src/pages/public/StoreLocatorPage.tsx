import { useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState, Select, Skeleton, Spinner } from "@/components/common";
import PageHero from "@/components/content/PageHero";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import type { StorePublic } from "@/types";
import { waLink } from "@/utils/format";
import "@/styles/storefront.css";

export default function StoreLocatorPage() {
  useDocumentTitle("Find a Store"); const toast = useToast(); const { settings } = useSite();
  const [state, setState] = useState(""); const [near, setNear] = useState<{ store: StorePublic | null; reason: string } | null>(null); const [locating, setLocating] = useState(false);
  const states = useAsync(() => publicService.states(), []);
  const { data, loading, error, reload } = useAsync(() => publicService.stores(state || undefined), [state]);
  const locate = () => {
    if (!navigator.geolocation) return toast.error("Location isn't supported on this device.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try { setNear(await publicService.nearest({ lat: pos.coords.latitude, lng: pos.coords.longitude, state: state || undefined })); } catch { toast.error("Couldn't find a dealer. Try selecting your state."); } finally { setLocating(false); }
    }, () => { setLocating(false); toast.error("Location permission denied. Pick your state instead."); }, { timeout: 10000 });
  };
  const findByState = async () => { if (!state) return; setLocating(true); try { setNear(await publicService.nearest({ state })); } finally { setLocating(false); } };
  const Card = ({ s }: { s: StorePublic }) => (
    <div className="store-card"><div className="d-flex justify-content-between align-items-start"><h5 className="fw-bold mb-1">{s.name}</h5><span className="badge badge-soft-primary text-capitalize">{s.store_type}</span></div>
      <p className="text-muted fs-sm mb-2"><i className="ri-map-pin-line me-1" />{s.address}{s.city ? `, ${s.city}` : ""}, {s.state}</p>
      {s.opening_hours && <p className="fs-sm mb-2"><i className="ri-time-line me-1" />{s.opening_hours}</p>}
      {s.distance_km != null && <p className="fs-sm text-success mb-2"><i className="ri-route-line me-1" />{s.distance_km} km away</p>}
      <div className="d-flex gap-2 flex-wrap">{s.phone && <a className="btn btn-sm btn-outline-primary btn-pill" href={`tel:${s.phone}`}><i className="ri-phone-line me-1" />Call</a>}
        {(s.whatsapp || s.phone) && <a className="btn btn-sm btn-primary btn-pill" target="_blank" rel="noreferrer" href={waLink(s.whatsapp || s.phone!, `Hello ${s.name}, I'd like to buy Southern Rose Ginger Plus.`)}><i className="ri-whatsapp-line me-1" />WhatsApp</a>}</div></div>);
  return (<>
    <PageHero title="Find a Store or Dealer" subtitle="Buy from your closest Southern Rose store or distributor — or order online for nationwide delivery." eyebrow="Store locator" />
    <div className="container section-sm">
      <div className="alert alert-warning d-flex gap-2"><i className="ri-information-line fs-5" /><div className="fs-sm">Some orders are fulfilled by the dealer closest to you for faster delivery. Share your location and we'll match you with a nearby seller — our team confirms every match.</div></div>
      <div className="row g-3 align-items-end mb-4"><div className="col-md-5"><Select label="Your state" value={state} onChange={(e) => { setState(e.target.value); setNear(null); }} className="mb-0"><option value="">All states</option>{states.data?.map((s) => <option key={s}>{s}</option>)}</Select></div>
        <div className="col-md-7 d-flex gap-2 flex-wrap"><button className="btn btn-primary" onClick={locate} disabled={locating}>{locating ? <Spinner size="sm" className="me-2" /> : <i className="ri-crosshair-2-line me-2" />}Use my location</button>
          <button className="btn btn-outline-primary" onClick={findByState} disabled={!state || locating}>Nearest dealer in {state || "state"}</button></div></div>
      {near && <div className="mb-4"><h5 className="fw-bold">Closest to you</h5>{near.store ? <div className="row"><div className="col-md-6 col-lg-4"><Card s={near.store} /></div></div> :
        <div className="alert alert-info">{near.reason} <a href={waLink(settings.contact.whatsapp_numbers?.[0] ?? "")} target="_blank" rel="noreferrer">Chat on WhatsApp</a> or <Link to="/shop">order online</Link>.</div>}</div>}
      {error && <ErrorState message={error} onRetry={reload} />}
      <h5 className="fw-bold">{state ? `Stores in ${state}` : "All stores & dealers"}</h5>
      <div className="row g-4">{loading ? [0, 1, 2].map((i) => <div key={i} className="col-md-4"><Skeleton h={170} /></div>) : data?.map((s) => <div key={s.id} className="col-md-6 col-lg-4"><Card s={s} /></div>)}</div>
      {!loading && !data?.length && <div className="text-center text-muted py-4">No dealers listed in this state yet. <Link to="/shop">Order online</Link> for nationwide delivery, or <Link to="/become-a-distributor">become a distributor</Link>.</div>}
    </div></>);
}
