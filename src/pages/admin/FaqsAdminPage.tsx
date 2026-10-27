import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";

export default function FaqsAdminPage() {
  useDocumentTitle("FAQs");
  return (
    <CrudPage title="FAQs" subtitle="Shown on the FAQ page, grouped by topic." noun="FAQ" api={adminApi.content.faqs as never} searchKeys={["question", "answer", "group"]}
      defaults={{ question: "", answer: "", group: "General", sort_order: 0, is_active: true }}
      columns={[{ key: "q", header: "Question", render: (r: any) => <div><div className="fw-semibold">{r.question}</div><div className="text-muted fs-xs text-truncate" style={{ maxWidth: 520 }}>{r.answer}</div></div> },
        { key: "g", header: "Group", render: (r: any) => r.group }, { key: "o", header: "Order", render: (r: any) => r.sort_order },
        { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.is_active ? "published" : "draft"} label={r.is_active ? "Visible" : "Hidden"} /> }]}
      fields={[{ name: "question", label: "Question", required: true }, { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "group", label: "Group", col: 5, hint: "Product, Ordering, Wholesale, Delivery…" }, { name: "sort_order", label: "Order", type: "number", col: 3 }, { name: "is_active", label: "Visible", type: "switch", col: 4 }]} />
  );
}
