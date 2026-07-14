import { PronunciationButton } from "./pronunciation-button";

export function LandingSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0">
      <div className="relative z-10 max-w-xl w-full">
        <h1 className="text-3xl font-bold text-foreground mb-4">regolith</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xl text-foreground">reg·o·lith</span>
          <PronunciationButton />
        </div>
        <p className="text-base text-foreground">
          : material shaped by constant impact; fragmented, recombined, and
          refined over time into something stronger than its origins.
        </p>
      </div>
    </section>
  );
}
