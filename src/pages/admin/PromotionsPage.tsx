import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { date, money } from "@/utils/format";

export default function PromotionsPage() {
  useDocumentTitle("Promotions");
  const { data: products } = useAsync(() => adminApi.products.list({ page_size: 100 }), []);
  const { data: cats } = useAsync(() => adminApi.categories.list(), []);
  return (
    <CrudPage title="Promotions & Coupons" subtitle="Automatic promotions apply at the product level; coupon codes are entered at checkout." noun="Promotion" api={adminApi.promotions as never}
      searchKeys={["name", "code"]} modalSize="lg"
      defaults={{ name: "", code: "", description: "", discount_type: "percent", value: 10, min_subtotal: null, max_discount: null, product_ids: [], category_ids: [], starts_at: null, ends_at: null, usage_limit: null, banner_text: "", show_banner: false, is_active: true }}
      columns={[
        { key: "n", header: "Promotion", render: (r: any) => <div><div className="fw-semibold">{r.name}</div><div className="fs-xs text-muted">{r.code ? <code>{r.code}</code> : "Automatic"} · {r.description}</div></div> },
        { key: "v", header: "Discount", render: (r: any) => (r.discount_type === "percent" ? `${r.value}%` : money(r.value)) },
        { key: "u", header: "Used", render: (r: any) => `${r.used_count}${r.usage_limit ? ` / ${r.usage_limit}` : ""}` },
        { key: "d", header: "Window", render: (r: any) => (r.starts_at || r.ends_at ? `${date(r.starts_at)} → ${date(r.ends_at)}` : "Always") },
        { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.is_active ? "published" : "draft"} label={r.is_active ? "Active" : "Off"} /> }]}
      toPayload={(f) => ({ ...f, code: f.code || null })}
      fields={[
        { name: "name", label: "Name", required: true, col: 6 }, { name: "code", label: "Coupon code", hint: "Leave empty for an automatic promotion", col: 6 },
        { name: "description", label: "Description" },
        { name: "discount_type", label: "Type", type: "select", required: true, options: [{ value: "percent", label: "Percentage (%)" }, { value: "fixed", label: "Fixed amount (₦)" }], col: 4 },
        { name: "value", label: "Value", type: "number", required: true, col: 4 }, { name: "max_discount", label: "Max discount (₦)", type: "number", col: 4 },
        { name: "min_subtotal", label: "Min. order (₦)", type: "number", col: 4 }, { name: "usage_limit", label: "Usage limit", type: "number", col: 4 },
        { name: "starts_at", label: "Starts", type: "datetime", col: 6 }, { name: "ends_at", label: "Ends", type: "datetime", col: 6 },
        { name: "banner_text", label: "Storefront banner text", col: 8 }, { name: "show_banner", label: "Show banner", type: "switch", col: 4 },
        { name: "product_ids", label: "Limit to products (none = all)", type: "multi", col: 6, options: (products?.items ?? []).map((p) => ({ value: p.id, label: p.name })) },
        { name: "category_ids", label: "Limit to categories (none = all)", type: "multi", col: 6, options: (cats ?? []).map((c) => ({ value: c.id, label: c.name })) },
        { name: "is_active", label: "Active", type: "switch" },
      ]} />
  );
}
