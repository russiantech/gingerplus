import { Link } from "react-router-dom";
import CrudPage from "@/components/admin/CrudPage";
import { StatusBadge } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { adminApi } from "@/services/admin";
import { dateTime } from "@/utils/format";

export default function PagesPage() {
  useDocumentTitle("Pages");
  return (
    <CrudPage title="Website Pages" subtitle="About, ingredients, wholesale, legal and any new page you create. Edit content blocks inside each page." noun="Page" api={adminApi.content.pages as never} searchKeys={["title", "slug"]} modalSize="md"
      defaults={{ slug: "", title: "", subtitle: "", blocks: [], status: "published", show_in_footer: false }}
      toPayload={(f) => ({ slug: f.slug, title: f.title, subtitle: f.subtitle, status: f.status, show_in_footer: f.show_in_footer, blocks: f.blocks ?? [] })}
      columns={[{ key: "t", header: "Page", render: (r: any) => <div><Link className="fw-semibold text-decoration-none" to={`/admin/content/pages/${r.id}`}>{r.title}</Link><div className="text-muted fs-xs">/{r.slug} · {r.blocks.length} blocks</div></div> },
        { key: "u", header: "Updated", render: (r: any) => dateTime(r.updated_at) }, { key: "f", header: "Footer", render: (r: any) => (r.show_in_footer ? "Yes" : "—") }, { key: "s", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> }]}
      extraActions={(r: any) => <><Link to={`/admin/content/pages/${r.id}`} className="btn btn-sm btn-primary">Edit content</Link><a href={`/${r.slug}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-light" aria-label="View"><i className="ri-external-link-line" /></a></>}
      fields={[{ name: "title", label: "Title", required: true }, { name: "slug", label: "URL slug", required: true, hint: "e.g. about-us → /about-us" }, { name: "subtitle", label: "Subtitle" },
        { name: "status", label: "Status", type: "select", required: true, col: 6, options: [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }] }, { name: "show_in_footer", label: "Show in footer", type: "switch", col: 6 }]} />
  );
}
