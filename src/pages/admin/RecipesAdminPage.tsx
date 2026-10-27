import CrudPage from "@/components/admin/CrudPage";
import { Img, StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { titleCase } from "@/utils/format";

export default function RecipesAdminPage() {
  useDocumentTitle("Recipes");
  return (
    <CrudPage title="Recipes & Cocktails" subtitle="Public submissions arrive as drafts — review and publish." noun="Recipe" api={adminApi.content.recipes as never} searchKeys={["title", "summary", "submitted_by"]}
      filter={{ label: "All categories", key: "category", options: ["cocktail", "warm_drink", "shot", "mocktail"].map((c) => ({ value: c, label: titleCase(c) })) }}
      defaults={{ title: "", category: "cocktail", summary: "", ingredients: [], steps: [], image_url: null, featured_flavor: "", status: "published", sort_order: 0 }}
      toPayload={(f) => ({ ...f, slug: undefined, featured_flavor: f.featured_flavor || null })}
      extraActions={(r: any, reload) => r.status === "draft" ? <button className="btn btn-sm btn-success" onClick={async () => { await adminApi.content.recipes.update(r.id, { status: "published" } as never); reload(); }}>Publish</button> : null}
      columns={[{ key: "t", header: "Recipe", render: (r: any) => <div className="d-flex gap-2 align-items-center"><Img src={r.image_url} className="thumb" /><div><div className="fw-semibold">{r.title}</div><div className="text-muted fs-xs">{r.submitted_by ? `Submitted by ${r.submitted_by}` : r.summary}</div></div></div> },
        { key: "c", header: "Category", render: (r: any) => titleCase(r.category) }, { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> }]}
      fields={[{ name: "title", label: "Title", required: true, col: 6 }, { name: "category", label: "Category", type: "select", required: true, col: 3, options: ["cocktail", "warm_drink", "shot", "mocktail"].map((c) => ({ value: c, label: titleCase(c) })) },
        { name: "featured_flavor", label: "Flavour", type: "select", col: 3, options: ["turmeric", "honey", "guarana"].map((c) => ({ value: c, label: titleCase(c) })) },
        { name: "summary", label: "Summary" }, { name: "ingredients", label: "Ingredients", type: "list", col: 6 }, { name: "steps", label: "Steps", type: "list", col: 6 }, { name: "image_url", label: "Image", type: "image" },
        { name: "status", label: "Status", type: "select", required: true, col: 6, options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }, { name: "sort_order", label: "Order", type: "number", col: 6 }]} />
  );
}
