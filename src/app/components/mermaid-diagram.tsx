"use client";

import { useEffect, useRef, useState } from "react";

// Module-level counter guarantees a unique render id per diagram, avoiding
// collisions when several diagrams (or a Strict Mode double-invoke) render at once.
let diagramCounter = 0;

const FONT_STACK = '"EB Garamond", Georgia, serif';

type FigureBlock = { state: string; note: string };
type Tooltip = { state: string; note: string; x: number; y: number };

export function MermaidDiagram({
  chart,
  hoverMap,
}: {
  chart: string;
  hoverMap?: Record<string, FigureBlock>;
}) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const root = getComputedStyle(document.documentElement);
        const ink = root.getPropertyValue("--foreground").trim() || "#1A1A1A";
        const paper = root.getPropertyValue("--background").trim() || "#FAF9F6";

        // Theme from the site's own tokens so diagrams read as ink on paper,
        // not mermaid's default palette.
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: FONT_STACK,
          themeVariables: {
            fontFamily: FONT_STACK,
            fontSize: "12px",
            background: paper,
            primaryColor: paper,
            primaryBorderColor: ink,
            primaryTextColor: ink,
            secondaryColor: paper,
            tertiaryColor: paper,
            lineColor: ink,
            textColor: ink,
            noteBkgColor: paper,
            noteTextColor: ink,
            noteBorderColor: ink,
          },
          flowchart: { curve: "basis", useMaxWidth: true },
          state: { useMaxWidth: true },
        });

        const { svg: rendered } = await mermaid.render(
          `mermaid-diagram-${diagramCounter++}`,
          chart
        );
        if (active) {
          setSvg(rendered);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    }

    render();
    return () => {
      active = false;
    };
  }, [chart]);

  // After the SVG renders, wire hover on each mapped state node: reveal the
  // equivalent question-loop block. The tooltip is anchored above the block's
  // center and clamped inside the wrapper so it can never overflow and shift the
  // page. Matching is by label text (whitespace-insensitive), keeping only the
  // outermost group per state.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!hoverMap || !svg || !wrapper) return;

    const strip = (value: string | null) =>
      (value ?? "").replace(/\s+/g, "").toLowerCase();
    const lookup = new Map(
      Object.entries(hoverMap).map(([label, block]) => [strip(label), block])
    );
    const matched = Array.from(
      wrapper.querySelectorAll<SVGGElement>("g")
    ).filter((group) => lookup.has(strip(group.textContent)));
    const nodes = matched.filter(
      (group) => !matched.some((other) => other !== group && other.contains(group))
    );

    const cleanups: Array<() => void> = [];
    const hide = () => setTooltip(null);

    nodes.forEach((node) => {
      const block = lookup.get(strip(node.textContent));
      if (!block) return;
      node.style.cursor = "help";

      const show = () => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const centerX = nodeRect.left - wrapperRect.left + nodeRect.width / 2;
        const margin = 120;
        setTooltip({
          state: block.state,
          note: block.note,
          x: Math.max(margin, Math.min(centerX, wrapperRect.width - margin)),
          y: nodeRect.top - wrapperRect.top,
        });
      };

      node.addEventListener("mouseenter", show);
      node.addEventListener("mouseleave", hide);
      cleanups.push(() => {
        node.removeEventListener("mouseenter", show);
        node.removeEventListener("mouseleave", hide);
      });
    });

    // Backstop: leaving the diagram entirely always clears the tooltip.
    wrapper.addEventListener("mouseleave", hide);
    cleanups.push(() => wrapper.removeEventListener("mouseleave", hide));

    return () => cleanups.forEach((fn) => fn());
  }, [svg, hoverMap]);

  if (failed) {
    return (
      <pre className="text-xs text-foreground opacity-60 overflow-x-auto whitespace-pre">
        {chart}
      </pre>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto"
        // Trusted, first-party diagram source rendered by mermaid (securityLevel: strict).
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 w-max max-w-[220px] -translate-x-1/2 -translate-y-full rounded-md border border-foreground/30 bg-background px-3 py-2 shadow-sm"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="text-xs uppercase tracking-widest text-foreground">
            {tooltip.state}
          </p>
          <p className="mt-1 text-sm text-foreground opacity-70">{tooltip.note}</p>
        </div>
      )}
    </div>
  );
}
