import CrudPage from "@/components/admin/CrudPage";
import { Img, StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { date } from "@/utils/format";

const CATS = ["Recipes", "Wellness", "Ingredients", "Brand Story", "Events"].map((c) => ({ value: c, label: c }));
export default function BlogAdminPage() {
  useDocumentTitle("Blog");
  return (
    <CrudPage title="Blog" subtitle="Recipes, wellness tips and brand stories." noun="Post" api={adminApi.content.blog as never} searchKeys={["title", "category"]} modalSize="xl"
      defaults={{ title: "", category: "Recipes", excerpt: "", body: "", cover_image_url: null, author: "Southern Rose Team", is_featured: false, status: "published" }}
      toPayload={(f) => ({ ...f, slug: undefined })}
      columns={[{ key: "t", header: "Post", render: (r: any) => <div className="d-flex gap-2 align-items-center"><Img src={r.cover_image_url} className="thumb" /><div><div className="fw-semibold">{r.title}{r.is_featured && <i className="ri-star-fill text-gold ms-1" />}</div><div className="text-muted fs-xs">/{r.slug}</div></div></div> },
        { key: "c", header: "Category", render: (r: any) => r.category }, { key: "d", header: "Published", render: (r: any) => date(r.published_at) }, { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> }]}
      fields={[{ name: "title", label: "Title", required: true, col: 8 }, { name: "category", label: "Category", type: "select", required: true, options: CATS, col: 4 },
        { name: "excerpt", label: "Excerpt", type: "textarea" }, { name: "body", label: "Body", type: "textarea", hint: "Use blank lines for paragraphs. **bold** is supported." },
        { name: "cover_image_url", label: "Cover image", type: "image" }, { name: "author", label: "Author", col: 4 },
        { name: "status", label: "Status", type: "select", required: true, col: 4, options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }, { name: "is_featured", label: "Featured post", type: "switch", col: 4 }]} />
  );
}
