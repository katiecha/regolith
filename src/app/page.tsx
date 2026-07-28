import { EssaysSection } from "./components/essays-section";
import { HiringSection } from "./components/hiring-section";
import { HistorySection } from "./components/history-section";
import { LandingSection } from "./components/landing-section";
import { LayersSection } from "./components/layers-section";
import { ReferencesSection } from "./components/references-section";
import { RegolithDust } from "./components/regolith-dust";
import { ScrollToTop } from "./components/scroll-to-top";
import { SiteNav } from "./components/site-nav";
import { ThesisSection } from "./components/thesis-section";

export default function Home() {
  return (
    <div id="top">
      <RegolithDust />
      <ScrollToTop />
      <SiteNav />
      <LandingSection />
      <ThesisSection />
      <LayersSection />
      <HistorySection />
      <EssaysSection />
      <ReferencesSection />
      <HiringSection />
    </div>
  );
}
