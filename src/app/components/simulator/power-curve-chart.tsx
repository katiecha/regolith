import type { CyclePoint } from "../../data/simulator";
import { CYCLE_HOURS, DAY_HOURS } from "../../data/simulator";

function buildPath(
  series: CyclePoint[],
  maxPowerW: number,
  select: (point: CyclePoint) => number
): string {
  if (maxPowerW === 0) return "";
  return series
    .map((point) => {
      const x = (point.hour / CYCLE_HOURS) * 100;
      const y = 100 - (select(point) / maxPowerW) * 100;
      return `${x},${y}`;
    })
    .join(" L ");
}

export function PowerCurveChart({
  series,
  currentHour,
}: {
  series: CyclePoint[];
  currentHour: number;
}) {
  const maxPowerW = Math.max(...series.map((p) => p.totalPowerW), 1);
  const solarPath = buildPath(series, maxPowerW, (p) => p.solarPowerW);
  const totalPath = buildPath(series, maxPowerW, (p) => p.totalPowerW);
  const dayFraction = (DAY_HOURS / CYCLE_HOURS) * 100;

  const currentPoint =
    series.find((p) => p.hour === Math.floor(currentHour)) ?? series[0];
  const markerX = (currentHour / CYCLE_HOURS) * 100;
  const markerY = 100 - (currentPoint.totalPowerW / maxPowerW) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-foreground opacity-60">
          Power budget
        </span>
        <span className="text-sm text-foreground">
          {(currentPoint.totalPowerW / 1000).toFixed(1)} kW
          <span className="opacity-60"> / {(maxPowerW / 1000).toFixed(1)} kW peak</span>
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-40 md:h-56 text-foreground"
        >
          <rect x={0} y={0} width={dayFraction} height={100} className="fill-foreground/5" />
          <rect
            x={dayFraction}
            y={0}
            width={100 - dayFraction}
            height={100}
            className="fill-foreground/10"
          />
          <path
            d={`M ${solarPath}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M ${totalPath}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="4,3"
            opacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
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
        </svg>
        <div
          className="absolute w-2 h-2 rounded-full bg-foreground -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${markerX}%`, top: `${markerY}%` }}
        />
      </div>
      <p className="text-xs text-foreground opacity-60 mt-2">
        Day 1 → Day {Math.round(CYCLE_HOURS / 24)}. Solid line: solar power. Dashed line: solar + battery.
      </p>
    </div>
  );
}
