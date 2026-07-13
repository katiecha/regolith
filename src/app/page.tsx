import { EssaysSection } from "./components/essays-section";
import { HiringSection } from "./components/hiring-section";
import { LandingSection } from "./components/landing-section";
import { ReferencesSection } from "./components/references-section";
import { ScrollToTop } from "./components/scroll-to-top";
import { SiteNav } from "./components/site-nav";
import { ThesisSection } from "./components/thesis-section";

export default function Home() {
  return (
    <div id="top" className="bg-background">
      <ScrollToTop />
      <SiteNav />
      <LandingSection />
      <ThesisSection />
      <EssaysSection />
      <ReferencesSection />
      <HiringSection />
    </div>
  );
}
