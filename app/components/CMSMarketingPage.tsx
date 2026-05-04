import { notFound } from "next/navigation";
import Footer from "@/app/components/Footer";
import MarketingNav from "@/app/components/MarketingNav";
import SectionRenderer from "@/app/components/sections/SectionRenderer";
import { getPageBySlug, getPublishedPosts, mapCMSPageSections } from "@/lib/cms";

type CMSMarketingPageProps = {
  slug: string;
};

export default async function CMSMarketingPage({ slug }: CMSMarketingPageProps) {
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const sections = mapCMSPageSections(page);
  const posts = slug === "blog" ? await getPublishedPosts(12) : undefined;

  return (
    <main>
      <MarketingNav />
      <SectionRenderer sections={sections} posts={posts} />
      <Footer />
    </main>
  );
}
