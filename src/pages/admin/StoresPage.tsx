import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { publicService } from "@/services/public";
import { titleCase } from "@/utils/format";

export default function StoresPage() {
  useDocumentTitle("Stores & dealers");
  const { data: states } = useAsync(() => publicService.states(), []);
  const api = {
    list: async () => (await adminApi.stores.list({ page_size: 100 })).items,
    create: (d: unknown) => adminApi.stores.create(d as never), update: (id: string, d: unknown) => adminApi.stores.update(id, d as never), remove: (id: string) => adminApi.stores.remove(id),
  };
  const st = (states ?? []).map((s) => ({ value: s, label: s }));
  return (
    <CrudPage title="Stores & Dealers" subtitle="Approved + public stores appear on the Find a Store page and can be matched to customers and orders." noun="Store" api={api as never}
      searchKeys={["name", "city", "state", "address"]} modalSize="xl"
      filter={{ label: "All types", key: "store_type", options: ["store", "distributor", "dealer"].map((v) => ({ value: v, label: titleCase(v) })) }}
      defaults={{ name: "", store_type: "store", status: "approved", is_public: true, contact_person: "", phone: "", whatsapp: "", email: null, address: "", city: "", state: "Lagos", lga: "", latitude: null, longitude: null, coverage_states: [], opening_hours: "", notes: "" }}
      toPayload={(f) => ({ ...f, email: f.email || null })}
      columns={[{ key: "n", header: "Store", render: (r: any) => <div><div className="fw-semibold">{r.name}</div><div className="text-muted fs-xs">{r.address}</div></div> },
        { key: "t", header: "Type", render: (r: any) => titleCase(r.store_type) }, { key: "l", header: "Location", render: (r: any) => [r.city, r.state].filter(Boolean).join(", ") },
        { key: "c", header: "Contact", render: (r: any) => <div className="fs-sm">{r.phone}<div className="text-muted fs-xs">{r.contact_person}</div></div> },
        { key: "s", header: "Status", render: (r: any) => <div className="d-flex gap-1"><StatusBadge status={r.status} />{r.is_public && <span className="badge badge-soft-info rounded-pill">Public</span>}</div> }]}
      fields={[
        { name: "name", label: "Business name", required: true, col: 6 }, { name: "store_type", label: "Type", type: "select", required: true, col: 3, options: ["store", "distributor", "dealer"].map((v) => ({ value: v, label: titleCase(v) })) },
        { name: "status", label: "Status", type: "select", required: true, col: 3, options: ["pending", "approved", "suspended", "rejected"].map((v) => ({ value: v, label: titleCase(v) })) },
        { name: "contact_person", label: "Contact person", col: 4 }, { name: "phone", label: "Phone", type: "tel", col: 4 }, { name: "whatsapp", label: "WhatsApp", type: "tel", col: 4 },
        { name: "email", label: "Email", type: "email", col: 6 }, { name: "opening_hours", label: "Opening hours", col: 6 },
        { name: "address", label: "Street address", required: true, col: 6 }, { name: "city", label: "City", col: 3 }, { name: "state", label: "State", type: "select", required: true, col: 3, options: st },
        { name: "latitude", label: "Latitude", type: "number", step: "any", col: 3, hint: "Enables nearest-store by distance" }, { name: "longitude", label: "Longitude", type: "number", step: "any", col: 3 },
        { name: "coverage_states", label: "Also serves states", type: "multi", col: 6, options: st },
        { name: "notes", label: "Internal notes", type: "textarea", col: 12 }, { name: "is_public", label: "Show publicly on the website", type: "switch", hint: "Only approved stores are ever shown." }]} />
  );
}
