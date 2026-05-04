import CMSMarketingPage from "@/app/components/CMSMarketingPage";
import { getPageBySlug, pageMetadata } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getPageBySlug("partnerships"));
}

export default function PartnershipsPage() {
  return <CMSMarketingPage slug="partnerships" />;
}
