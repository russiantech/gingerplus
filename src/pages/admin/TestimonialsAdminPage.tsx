import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";

export default function TestimonialsAdminPage() {
  useDocumentTitle("Testimonials");
  return (
    <CrudPage title="Testimonials" subtitle="Customer reviews submitted on the site arrive as drafts — publish to approve." noun="Testimonial" api={adminApi.content.testimonials as never} searchKeys={["author_name", "quote", "business"]}
      filter={{ label: "All statuses", key: "status", options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft (pending)" }] }}
      defaults={{ author_name: "", author_role: "", business: "", quote: "", rating: 5, image_url: null, status: "published", sort_order: 0 }}
      extraActions={(r: any, reload) => r.status === "draft" ? <button className="btn btn-sm btn-success" onClick={async () => { await adminApi.content.testimonials.update(r.id, { status: "published" } as never); reload(); }}>Approve</button> : null}
      columns={[{ key: "a", header: "Author", render: (r: any) => <div><div className="fw-semibold">{r.author_name}</div><div className="text-muted fs-xs">{[r.author_role, r.business].filter(Boolean).join(" · ")}</div></div> },
        { key: "q", header: "Quote", render: (r: any) => <span className="text-truncate d-inline-block" style={{ maxWidth: 420 }}>{r.quote}</span> },
        { key: "r", header: "Rating", render: (r: any) => "★".repeat(r.rating) }, { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> }]}
      fields={[{ name: "author_name", label: "Name", required: true, col: 4 }, { name: "author_role", label: "Role — City", col: 4 }, { name: "business", label: "Business", col: 4 },
        { name: "quote", label: "Quote", type: "textarea", required: true }, { name: "rating", label: "Rating (1–5)", type: "number", col: 4 }, { name: "sort_order", label: "Order", type: "number", col: 4 },
        { name: "status", label: "Status", type: "select", required: true, col: 4, options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }]} />
  );
}
