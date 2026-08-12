// TEMPORARY preview page for comparing diagram treatments. Delete after choosing.
import { MermaidDiagram } from "../components/mermaid-diagram";
import { OperatingLoop } from "../components/operating-loop";
import { LAYER_FIGURES } from "../data/layers";

const CLEANED_CHART = `stateDiagram-v2
    Physical_System --> Signals
    Signals --> Trust
    Trust --> Estimate
    Estimate --> Memory
    Memory --> Prediction
    Prediction --> Control
    Control --> Physical_System
    state "Physical System" as Physical_System
    state "Observable Signals" as Signals
    state "Trust Layer" as Trust
    state "State Estimation" as Estimate
    state "Industrial Memory" as Memory
    state "Prediction" as Prediction
    state "Planning & Control" as Control`;

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-background px-8 py-20 space-y-24">
      <section className="max-w-2xl mx-auto w-full">
        <h2 className="text-xs uppercase tracking-widest text-foreground mb-8">
          Option A — decluttered diagram
        </h2>
        <MermaidDiagram chart={CLEANED_CHART} hoverMap={LAYER_FIGURES[0].hoverMap} />
      </section>
      <section className="max-w-2xl mx-auto w-full">
        <h2 className="text-xs uppercase tracking-widest text-foreground mb-8">
          Option C — typographic loop
        </h2>
        <OperatingLoop />
      </section>
    </div>
  );
}
