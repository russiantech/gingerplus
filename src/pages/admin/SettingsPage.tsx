import { useEffect, useState } from "react";
import { Input, PageLoader, Spinner, Switch, Textarea } from "@/components/common";
import { PageHeader, Panel } from "@/components/admin";
import { useSite } from "@/contexts/SiteContext";
import { useToast } from "@/contexts/ToastContext";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TABS = [["commerce", "Commerce", "ri-shopping-bag-3-line"], ["contact", "Contact", "ri-phone-line"], ["social", "Social", "ri-share-line"], ["brand", "Brand", "ri-leaf-line"], ["announcement", "Announcement bar", "ri-megaphone-line"]] as const;

export default function SettingsPage() {
  useDocumentTitle("Settings");
  const toast = useToast(); const { reload } = useSite();
  const { data, loading } = useAsync(() => adminApi.content.settings(), []);
  const [tab, setTab] = useState<string>("commerce"); const [v, setV] = useState<Record<string, any>>({}); const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setV(JSON.parse(JSON.stringify(data))); }, [data]);
  if (loading || !data) return <PageLoader />;
  const g = v[tab] ?? {}; const set = (k: string, val: unknown) => setV((s) => ({ ...s, [tab]: { ...s[tab], [k]: val } }));
  const save = async () => { setBusy(true); try { await adminApi.content.saveSetting(tab, v[tab], tab !== "commerce" ? true : true); toast.success("Settings saved"); reload(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };
  const num = (k: string, label: string, hint?: string) => <Input type="number" label={label} hint={hint} value={g[k] ?? ""} onChange={(e) => set(k, e.target.value === "" ? null : Number(e.target.value))} />;
  const txt = (k: string, label: string, hint?: string) => <Input label={label} hint={hint} value={g[k] ?? ""} onChange={(e) => set(k, e.target.value)} />;
  return (
    <>
      <PageHeader title="Settings" subtitle="Brand, contact details and how ordering behaves." actions={<button className="btn btn-primary" disabled={busy} onClick={save}>{busy && <Spinner size="sm" className="me-2" />}Save {tab}</button>} />
      <div className="row g-4">
        <div className="col-lg-3"><div className="card admin-card border-0 shadow-soft p-2"><div className="nav nav-pills flex-column">
          {TABS.map(([k, l, i]) => <button key={k} className={`nav-link text-start ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}><i className={`${i} me-2`} />{l}</button>)}</div></div></div>
        <div className="col-lg-9"><Panel>
          {tab === "commerce" && <>
            <h6 className="fw-bold">Online payment vs wholesale</h6>
            <div className="row g-0 gx-3"><div className="col-md-6">{num("online_payment_max_packs", "Pay-online limit (packs)", "Orders with fewer packs go straight to online payment. At or above this they are treated as wholesale (WhatsApp first).")}</div>
              <div className="col-md-6">{num("wholesale_min_packs", "Wholesale minimum (packs)", "Shown on the wholesale page.")}</div></div>
            <Switch label="Allow full online payment for wholesale orders" hint="Lets bulk buyers pay online instead of only WhatsApp / bank transfer." checked={!!g.allow_online_wholesale} onChange={(x) => set("allow_online_wholesale", x)} />
            <h6 className="fw-bold mt-4">Store matching</h6>
            <Switch label="Auto-suggest the closest store for new orders" hint="The system locates the buyer (state / coordinates) and proposes a store. Nothing is assigned until an admin approves it on the order." checked={!!g.auto_suggest_store} onChange={(x) => set("auto_suggest_store", x)} />
            <h6 className="fw-bold mt-4">Delivery & payment</h6>
            <div className="row g-0 gx-3"><div className="col-md-6">{num("default_delivery_fee", "Default delivery fee (₦)", "Used when a state has no specific rate.")}</div><div className="col-md-6">{num("free_delivery_over", "Free delivery over (₦)", "Leave empty to disable.")}</div></div>
            <Textarea label="Legacy bank transfer note" rows={3} value={g.bank_details ?? ""} hint="Prefer structured bank details under Payment settings. This is only a fallback note." onChange={(e) => set("bank_details", e.target.value)} />
          </>}
          {tab === "contact" && <><div className="row g-0 gx-3"><div className="col-md-6">{txt("email", "Contact email")}</div><div className="col-md-6">{txt("press_email", "Press email")}</div><div className="col-md-6">{txt("phone", "Phone")}</div><div className="col-md-6">{txt("phone_hours", "Phone hours")}</div></div>
            <Input label="WhatsApp numbers" hint="Comma separated, international format" value={(g.whatsapp_numbers ?? []).join(", ")} onChange={(e) => set("whatsapp_numbers", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />{txt("address", "Address")}{txt("maps_url", "Google Maps link")}</>}
          {tab === "social" && <>{txt("instagram", "Instagram URL")}{txt("facebook", "Facebook URL")}{txt("tiktok", "TikTok URL")}{txt("handle", "Handle")}</>}
          {tab === "brand" && <>{txt("name", "Brand name")}{txt("product_line", "Product line")}{txt("slogan", "Slogan")}
            <Textarea label="Taglines (one per line)" rows={4} value={(g.taglines ?? []).join("\n")} onChange={(e) => set("taglines", e.target.value.split("\n").filter(Boolean))} /></>}
          {tab === "announcement" && <><Switch label="Show announcement in the top bar" checked={!!g.enabled} onChange={(x) => set("enabled", x)} />{txt("text", "Message", "e.g. Free delivery in Lagos on orders above ₦50,000")}</>}
        </Panel></div>
      </div>
    </>
  );
}
