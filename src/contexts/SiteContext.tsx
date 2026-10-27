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
interface Ctx extends Bootstrap { loading: boolean; reload: () => void }
const SiteCtx = createContext<Ctx>({ settings: FALLBACK, hero: [], footer_pages: [], banners: [], loading: true, reload: () => undefined });
export const useSite = () => useContext(SiteCtx);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Bootstrap>({ settings: FALLBACK, hero: [], footer_pages: [], banners: [] });
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    publicService.bootstrap().then((b) => setData({ ...b, settings: { ...FALLBACK, ...b.settings } })).catch(() => undefined).finally(() => setLoading(false));
  }, [n]);
  return <SiteCtx.Provider value={{ ...data, loading, reload: () => setN((x) => x + 1) }}>{children}</SiteCtx.Provider>;
}
