// Mermaid diagram source for the "Layers" section on the home page.
// Kept as editable mermaid text so the diagram can be revised in place.

export const LAYER_FIGURES: {
  id: string;
  title: string;
  chart: string;
}[] = [
  {
    id: "operating-system",
    title: "The operating system",
    chart: `flowchart TD
    ps[Physical System] --> os[Observable Signals]
    os --> tl[Trust Layer]
    tl --> se[State Estimation]
    se --> im[Industrial Memory]
    im --> pr[Prediction]
    pr --> pc[Planning & Control]
    pc --> ps`,
  },
];
