import CrudPage from "@/components/admin/CrudPage";
import { Img, StatusBadge } from "@/components/common";
import { useAsync } from "@/hooks";
import { adminApi } from "@/services/admin";
import { useDocumentTitle } from "@/hooks";

export default function CategoriesPage() {
  useDocumentTitle("Categories");
  const { data: cats } = useAsync(() => adminApi.categories.list(), []);
  return (
    <CrudPage title="Categories" subtitle="Organise products into multiple categories (parent/child supported)." noun="Category" api={adminApi.categories as never}
      searchKeys={["name", "slug"]} defaults={{ name: "", description: "", image_url: null, parent_id: null, sort_order: 0, is_active: true }}
      columns={[
        { key: "n", header: "Category", render: (r: any) => <div className="d-flex align-items-center gap-2"><Img src={r.image_url} className="thumb" /><div><div className="fw-semibold">{r.name}</div><div className="text-muted fs-xs">/{r.slug}</div></div></div> },
        { key: "p", header: "Parent", render: (r: any) => cats?.find((c) => c.id === r.parent_id)?.name ?? "—" },
        { key: "o", header: "Order", render: (r: any) => r.sort_order },
        { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.is_active ? "published" : "draft"} label={r.is_active ? "Active" : "Hidden"} /> },
      ]}
      fields={[
        { name: "name", label: "Name", required: true, col: 8 }, { name: "sort_order", label: "Sort order", type: "number", col: 4 },
        { name: "description", label: "Description", type: "textarea" },
        { name: "parent_id", label: "Parent category", type: "select", options: (cats ?? []).map((c) => ({ value: c.id, label: c.name })), col: 6 },
        { name: "is_active", label: "Visible in store", type: "switch", col: 6 }, { name: "image_url", label: "Image", type: "image" },
      ]} />
  );
}
