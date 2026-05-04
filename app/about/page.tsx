import CMSMarketingPage from "@/app/components/CMSMarketingPage";
import { getPageBySlug, pageMetadata } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getPageBySlug("about"));
}

export default function AboutPage() {
  return <CMSMarketingPage slug="about" />;
}
