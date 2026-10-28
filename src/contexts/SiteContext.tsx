import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { publicService } from "@/services/public";
import type { Bootstrap, SiteSettings } from "@/types";

const FALLBACK: SiteSettings = {
  brand: { name: "Southern Rose", product_line: "Ginger Plus", slogan: "Pursuing wellbeing", taglines: ["Bold Ginger. Perfect Plus."] },
  contact: { email: "southernrose.enueshike@gmail.com", press_email: "", phone: "+2349035483698", phone_hours: "Mon–Fri, 8am–6pm", whatsapp_numbers: ["+2348027724193"], address: "29, Losoro Dr. Fish, Lakowe School Gate, Ibeju Lekki, Lagos", maps_url: "#" },
  social: { instagram: "#", facebook: "#", tiktok: "#", handle: "@gingerplus_biorefinery" },
  commerce: { online_payment_max_packs: 5, allow_online_wholesale: true, wholesale_min_packs: 20, auto_suggest_store: false, default_delivery_fee: 3500, free_delivery_over: null, currency: "NGN" },
  announcement: { enabled: false, text: "" },
};
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
/** Deep-merge server settings over the fallback so a partial/stale payload can never leave a key undefined. */
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || over === null || (Array.isArray(base) && !Array.isArray(over)) ? base : over) as T;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(over)) out[k] = k in base ? merge((base as Record<string, unknown>)[k], over[k]) : over[k];
  return out as T;
}
interface Ctx extends Bootstrap { loading: boolean; reload: () => void }
const SiteCtx = createContext<Ctx>({ settings: FALLBACK, hero: [], footer_pages: [], banners: [], loading: true, reload: () => undefined });
export const useSite = () => useContext(SiteCtx);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Bootstrap>({ settings: FALLBACK, hero: [], footer_pages: [], banners: [] });
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    publicService.bootstrap().then((b) => setData({ settings: merge(FALLBACK, b?.settings), hero: Array.isArray(b?.hero) ? b.hero : [], footer_pages: Array.isArray(b?.footer_pages) ? b.footer_pages : [], banners: Array.isArray(b?.banners) ? b.banners : [] })).catch(() => undefined).finally(() => setLoading(false));
  }, [n]);
  return <SiteCtx.Provider value={{ ...data, loading, reload: () => setN((x) => x + 1) }}>{children}</SiteCtx.Provider>;
}
