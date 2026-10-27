import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import { adminApi } from "@/services/admin";
import { money } from "@/utils/format";

export default function ShippingPage() {
  useDocumentTitle("Shipping rates");
  const { data: states } = useAsync(() => publicService.states(), []);
  return (
    <CrudPage title="Shipping Rates" subtitle="Delivery fee and ETA per state. States without a rate use the default fee in Settings." noun="Rate" api={adminApi.shippingRates as never}
      searchKeys={["state"]} modalSize="md" defaults={{ state: "", fee: 3500, eta_min_days: 2, eta_max_days: 5, is_active: true }}
      columns={[
        { key: "s", header: "State", render: (r: any) => <span className="fw-semibold">{r.state}</span> }, { key: "f", header: "Fee", render: (r: any) => money(r.fee) },
        { key: "e", header: "ETA", render: (r: any) => `${r.eta_min_days}–${r.eta_max_days} working days` },
        { key: "a", header: "Status", render: (r: any) => <StatusBadge status={r.is_active ? "published" : "draft"} label={r.is_active ? "Active" : "Off"} /> }]}
      fields={[
        { name: "state", label: "State", type: "select", required: true, options: (states ?? []).map((s) => ({ value: s, label: s })) },
        { name: "fee", label: "Fee (₦)", type: "number", required: true, col: 4 }, { name: "eta_min_days", label: "Min days", type: "number", col: 4 }, { name: "eta_max_days", label: "Max days", type: "number", col: 4 },
        { name: "is_active", label: "Active", type: "switch" }]} />
  );
}
