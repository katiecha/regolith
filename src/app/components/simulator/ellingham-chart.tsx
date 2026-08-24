import type { Oxide } from "../../data/simulator";
import {
  MAX_TEMPERATURE_K,
  MIN_TEMPERATURE_K,
  reactionGibbs,
} from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

const SAMPLES = 40;
// Vertical headroom (in the 0-100 viewBox unit space) so lines don't clip.
const VERTICAL_PADDING = 8;

function tempToX(tempK: number): number {
  return (
    ((tempK - MIN_TEMPERATURE_K) / (MAX_TEMPERATURE_K - MIN_TEMPERATURE_K)) * 100
  );
}

export function EllinghamChart({
  oxides,
  temperatureK,
}: {
  oxides: Oxide[];
  temperatureK: number;
}) {
  const temps = Array.from(
    { length: SAMPLES + 1 },
    (_, i) =>
      MIN_TEMPERATURE_K +
      (i / SAMPLES) * (MAX_TEMPERATURE_K - MIN_TEMPERATURE_K)
  );

  const curves = oxides.map((oxide) => ({
    oxide,
    points: temps.map((tempK) => ({ tempK, gibbs: reactionGibbs(oxide, tempK) })),
  }));

  const allGibbs = curves.flatMap((curve) => curve.points.map((p) => p.gibbs));
  const minGibbs = Math.min(...allGibbs);
  const maxGibbs = Math.max(...allGibbs);

  const gibbsToY = (gibbs: number): number => {
    const fraction =
      maxGibbs === minGibbs ? 0.5 : (gibbs - minGibbs) / (maxGibbs - minGibbs);
    return VERTICAL_PADDING + (1 - fraction) * (100 - 2 * VERTICAL_PADDING);
  };

  const markerX = tempToX(temperatureK);

  return (
    <Panel>
      <div className="flex items-baseline justify-between mb-4">
        <PanelLabel>Ellingham ΔG–T</PanelLabel>
        <span className="text-sm text-foreground opacity-60">
          {Math.round(minGibbs)}–{Math.round(maxGibbs)} kJ/mol O₂
        </span>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-40 md:h-56 text-foreground"
      >
        <line
          x1={markerX}
          y1={0}
          x2={markerX}
          y2={100}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.3}
          vectorEffect="non-scaling-stroke"
        />
        {curves.map((curve) => {
          const path = curve.points
            .map((p) => `${tempToX(p.tempK)},${gibbsToY(p.gibbs)}`)
            .join(" L ");
          return (
            <path
              key={curve.oxide.id}
              d={`M ${path}`}
              fill="none"
              stroke={curve.oxide.color}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {oxides.map((oxide) => (
          <span
            key={oxide.id}
            className="flex items-center gap-2 text-xs text-foreground opacity-70"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: oxide.color }}
            />
            {oxide.formula}
          </span>
        ))}
      </div>
      <p className="text-xs text-foreground opacity-60 mt-2">
        Reduction ΔG per mole O₂ (sign-inverted Ellingham). Lower = easier;
        every curve stays positive, so heat alone never frees the oxygen;
        electrolysis does. Marker at {Math.round(temperatureK)} K.
      </p>
    </Panel>
  );
}
