import CrudPage from "@/components/admin/CrudPage";
import { Img, StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { useSite } from "@/contexts/SiteContext";

export default function HeroSlidesPage() {
  useDocumentTitle("Hero slides");
  const { reload } = useSite();
  const api = { ...adminApi.content.hero, create: async (d: unknown) => { const r = await adminApi.content.hero.create(d as never); reload(); return r; }, update: async (id: string, d: unknown) => { const r = await adminApi.content.hero.update(id, d as never); reload(); return r; } };
  return (
    <CrudPage title="Hero Slides" subtitle="The sliding hero on the homepage. Leave the image empty to use the default Ginger Plus artwork." noun="Slide" api={api as never}
      defaults={{ eyebrow: "", title: "", subtitle: "", image_url: null, accent_color: "#E8A317", primary_label: "Shop Now", primary_url: "/shop", secondary_label: "", secondary_url: "", sort_order: 0, is_active: true }}
      columns={[{ key: "i", header: "Slide", render: (r: any) => <div className="d-flex gap-2 align-items-center"><Img src={r.image_url || `/images/hero/slide-1.svg`} className="thumb" style={{ width: 70 }} /><div><div className="fw-semibold">{r.title}</div><div className="text-muted fs-xs">{r.eyebrow}</div></div></div> },
        { key: "b", header: "Buttons", render: (r: any) => [r.primary_label, r.secondary_label].filter(Boolean).join(" · ") }, { key: "o", header: "Order", render: (r: any) => r.sort_order },
        { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.is_active ? "published" : "draft"} label={r.is_active ? "Live" : "Hidden"} /> }]}
      fields={[{ name: "eyebrow", label: "Eyebrow text", col: 8 }, { name: "accent_color", label: "Accent colour", col: 4, placeholder: "#E8A317" }, { name: "title", label: "Headline", required: true },
        { name: "subtitle", label: "Sub-headline", type: "textarea" }, { name: "primary_label", label: "Primary button", col: 3 }, { name: "primary_url", label: "Primary link", col: 3 },
        { name: "secondary_label", label: "Secondary button", col: 3 }, { name: "secondary_url", label: "Secondary link", col: 3 }, { name: "image_url", label: "Slide image (transparent PNG/SVG works best)", type: "image" },
        { name: "sort_order", label: "Order", type: "number", col: 4 }, { name: "is_active", label: "Active", type: "switch", col: 8 }]} />
  );
}
