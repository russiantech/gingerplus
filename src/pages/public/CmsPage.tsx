import { useParams } from "react-router-dom";
import BlockRenderer from "@/components/content/BlockRenderer";
import PageHero from "@/components/content/PageHero";
import { PageLoader } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { ApiError } from "@/services/http";
import { publicService } from "@/services/public";
import NotFoundPage from "./NotFoundPage";

export default function CmsPage() {
  const { slug = "" } = useParams();
  const { data, loading, error } = useAsync(() => publicService.page(slug), [slug]);
  useDocumentTitle(data?.meta_title || data?.title);
  if (loading) return <PageLoader />;
  if (error || !data) return <NotFoundPage />;
  void ApiError;
  return (<><PageHero title={data.title} subtitle={data.subtitle} /><BlockRenderer blocks={data.blocks} />
    {data.meta_description && <meta name="description" content={data.meta_description} />}</>);
}
