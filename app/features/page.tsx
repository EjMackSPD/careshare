import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import SectionRenderer from "@/app/components/sections/SectionRenderer";
import { featureSections } from "@/app/content/marketingSections";

export default function Features() {
  return (
    <div>
      <MarketingNav />

      <main>
        <SectionRenderer sections={featureSections} />
      </main>

      <Footer />
    </div>
  );
}
