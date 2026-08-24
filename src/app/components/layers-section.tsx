import { LAYER_FIGURES } from "../data/layers";
import { MermaidDiagram } from "./mermaid-diagram";

export function LayersSection() {
  return (
    <section id="layers" className="px-5 py-24 md:px-8 md:py-32">
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        <div className="space-y-16">
          {LAYER_FIGURES.map((figure, index) => (
            <figure key={figure.id} className="space-y-3">
              <MermaidDiagram chart={figure.chart} />
              <figcaption className="text-sm text-foreground opacity-60 text-center">
                Figure {index + 1}: {figure.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
