import { useParams } from "react-router-dom";
import BlockRenderer from "@/components/content/BlockRenderer";
import PageHero from "@/components/content/PageHero";
import { ErrorState, PageLoader } from "@/components/common";
import { useAsync, useDocumentTitle } from "@/hooks";
import { publicService } from "@/services/public";
import NotFoundPage from "./NotFoundPage";

export default function CmsPage() {
  const { slug = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => publicService.page(slug), [slug]);
  useDocumentTitle(data?.meta_title || data?.title);
  if (loading) return <PageLoader />;
  if (error && !/not found/i.test(error)) return <div className="container section"><ErrorState message="We couldn't load this page right now. Please check your connection and try again." onRetry={reload} /></div>;
  if (error || !data) return <NotFoundPage />;
  return (<><PageHero title={data.title} subtitle={data.subtitle} image={data.banner_image_url} /><BlockRenderer blocks={data.blocks} />
    {data.meta_description && <meta name="description" content={data.meta_description} />}</>);
}
