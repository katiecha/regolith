"use client";

import { useEffect, useRef, useState } from "react";

// Module-level counter guarantees a unique render id per diagram, avoiding
// collisions when several diagrams (or a Strict Mode double-invoke) render at once.
let diagramCounter = 0;

const FONT_STACK = '"EB Garamond", Georgia, serif';

type FigureBlock = { state: string; note: string };

const TOOLTIP_WIDTH = 220;
const TOOLTIP_GAP = 10;

function normalizeLabel(value: string | null) {
  return (value ?? "").replace(/\s+/g, "").toLowerCase();
}

function enhanceSvg(rendered: string, hoverMap?: Record<string, FigureBlock>) {
  if (!hoverMap) return rendered;

  const template = document.createElement("template");
  template.innerHTML = rendered;
  const lookup = new Map(
    Object.entries(hoverMap).map(([label, block]) => [normalizeLabel(label), block])
  );
  const matched = Array.from(template.content.querySelectorAll<SVGGElement>("g")).filter(
    (group) => lookup.has(normalizeLabel(group.textContent))
  );
  const nodes = matched.filter(
    (group) => !matched.some((other) => other !== group && other.contains(group))
  );

  nodes.forEach((node) => {
    const block = lookup.get(normalizeLabel(node.textContent));
    if (!block) return;
    node.classList.add("regolith-diagram-node");
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", `${block.state}: ${block.note}`);
    node.setAttribute("data-regolith-hover-state", block.state);
    node.setAttribute("data-regolith-hover-note", block.note);
  });

  return template.innerHTML;
}

export function MermaidDiagram({
  chart,
  hoverMap,
}: {
  chart: string;
  hoverMap?: Record<string, FigureBlock>;
}) {
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const root = getComputedStyle(document.documentElement);
        const ink = root.getPropertyValue("--foreground").trim() || "#1A1A1A";
        const paper = root.getPropertyValue("--background").trim() || "#FAF9F6";
        const isCompact = window.matchMedia("(max-width: 767px)").matches;

        // Theme from the site's own tokens so diagrams read as ink on paper,
        // not mermaid's default palette.
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: FONT_STACK,
          themeVariables: {
            fontFamily: FONT_STACK,
            fontSize: isCompact ? "10px" : "12px",
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
          setSvg(enhanceSvg(rendered, hoverMap));
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
  }, [chart, hoverMap]);

  // Wire hover tooltips: match each mapped block to its rendered state node (by
  // label text, whitespace-insensitive) and reveal the equivalent question-loop
  // block on hover.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    if (!hoverMap || !svg || !wrapper || !tooltip) return;

    const blocks = new Map<SVGGElement, FigureBlock>();
    wrapper.querySelectorAll<SVGGElement>(".regolith-diagram-node").forEach((node) => {
      const state = node.getAttribute("data-regolith-hover-state");
      const note = node.getAttribute("data-regolith-hover-note");
      if (!state || !note) return;
      const block = { state, note };
      blocks.set(node, block);
    });
    if (blocks.size === 0) return;

    // Delegate pointer/focus handling so hover remains stable across Mermaid's
    // nested SVG groups and keyboard users can reveal the same state hints.
    let currentNode: SVGGElement | null = null;
    const nodeUnder = (
      target: EventTarget | null,
      point?: { x: number; y: number }
    ): SVGGElement | null => {
      if (!(target instanceof Node)) return null;
      for (const node of blocks.keys()) if (node.contains(target)) return node;
      if (point) {
        for (const node of blocks.keys()) {
          const rect = node.getBoundingClientRect();
          if (
            point.x >= rect.left &&
            point.x <= rect.right &&
            point.y >= rect.top &&
            point.y <= rect.bottom
          ) {
            return node;
          }
        }
      }
      return null;
    };

    const showTooltip = (node: SVGGElement | null) => {
      if (node === currentNode) return;
      currentNode?.classList.remove("is-hovered");
      currentNode = node;
      const block = node ? blocks.get(node) : undefined;
      if (!node || !block) {
        tooltip.classList.add("hidden");
        tooltip.setAttribute("aria-hidden", "true");
        return;
      }
      node.classList.add("is-hovered");
      const wrapperRect = wrapper.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const centerX = nodeRect.left - wrapperRect.left + nodeRect.width / 2;
      const margin = Math.min(TOOLTIP_WIDTH / 2, wrapperRect.width / 2);
      const x = Math.max(margin, Math.min(centerX, wrapperRect.width - margin));
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${nodeRect.top - wrapperRect.top - TOOLTIP_GAP}px`;
      tooltip.querySelector("[data-regolith-tooltip-state]")?.replaceChildren(block.state);
      tooltip.querySelector("[data-regolith-tooltip-note]")?.replaceChildren(block.note);
      tooltip.classList.remove("hidden");
      tooltip.setAttribute("aria-hidden", "false");
    };

    const hideTooltip = () => {
      currentNode?.classList.remove("is-hovered");
      currentNode = null;
      tooltip.classList.add("hidden");
      tooltip.setAttribute("aria-hidden", "true");
    };

    const onPointerMove = (event: PointerEvent) =>
      showTooltip(nodeUnder(event.target, { x: event.clientX, y: event.clientY }));
    const onPointerLeave = () => hideTooltip();
    const onFocusIn = (event: FocusEvent) => showTooltip(nodeUnder(event.target));
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget)) {
        showTooltip(nodeUnder(event.relatedTarget));
        return;
      }
      hideTooltip();
    };

    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerleave", onPointerLeave);
    wrapper.addEventListener("focusin", onFocusIn);
    wrapper.addEventListener("focusout", onFocusOut);
    return () => {
      hideTooltip();
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      wrapper.removeEventListener("focusin", onFocusIn);
      wrapper.removeEventListener("focusout", onFocusOut);
    };
  }, [svg, hoverMap]);

  if (failed) {
    return (
      <pre className="text-xs text-foreground opacity-60 overflow-x-auto whitespace-pre">
        {chart}
      </pre>
    );
  }

  return (
    <div ref={wrapperRef} className="relative max-md:-mx-5" data-regolith-diagram>
      <style>
        {`
          [data-regolith-diagram] .regolith-diagram-node {
            cursor: help;
            outline: none;
          }

          [data-regolith-diagram] .regolith-diagram-node * {
            transition: fill 150ms ease, stroke 150ms ease;
          }

          [data-regolith-diagram] .regolith-diagram-node.is-hovered rect,
          [data-regolith-diagram] .regolith-diagram-node:hover rect,
          [data-regolith-diagram] .regolith-diagram-node:focus-visible rect {
            fill: color-mix(in srgb, var(--accent) 10%, var(--background)) !important;
            stroke: var(--accent) !important;
          }
        `}
      </style>
      <div
        className="flex justify-start overflow-x-auto overscroll-x-contain px-5 pb-1 md:justify-center md:px-0 [&_svg]:h-auto [&_svg]:max-w-none md:[&_svg]:max-w-full"
        // Trusted, first-party diagram source rendered by mermaid (securityLevel: strict).
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div
        ref={tooltipRef}
        data-regolith-tooltip
        aria-hidden="true"
        className="pointer-events-none absolute z-20 hidden w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-full rounded-md border border-foreground/30 bg-background px-3 py-2 shadow-sm md:max-w-[220px]"
      >
        <p
          className="text-xs uppercase tracking-widest text-foreground"
          data-regolith-tooltip-state
        />
        <p
          className="mt-1 text-sm text-foreground opacity-70"
          data-regolith-tooltip-note
        />
      </div>
    </div>
  );
}
