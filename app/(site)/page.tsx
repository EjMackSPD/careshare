import CMSMarketingPage from "@/app/components/CMSMarketingPage";
import { getPageBySlug, pageMetadata } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getPageBySlug("home"));
}

export default function Home() {
  return <CMSMarketingPage slug="home" />;
}
