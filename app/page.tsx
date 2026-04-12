import Footer from "./components/Footer";
import MarketingNav from "./components/MarketingNav";
import SectionRenderer from "@/app/components/sections/SectionRenderer";
import { homeSections } from "@/app/content/marketingSections";

export default function Home() {
  return (
    <main>
      <MarketingNav />
      <SectionRenderer sections={homeSections} />

      <Footer />
    </main>
  );
}
