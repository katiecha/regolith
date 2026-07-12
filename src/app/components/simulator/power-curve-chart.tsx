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
  const markerX = (currentHour / CYCLE_HOURS) * 100;
  const dayFraction = (DAY_HOURS / CYCLE_HOURS) * 100;

  return (
    <div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-40 text-foreground"
      >
        <rect x={0} y={0} width={dayFraction} height={100} className="fill-foreground/5" />
        <rect
          x={dayFraction}
          y={0}
          width={100 - dayFraction}
          height={100}
          className="fill-foreground/10"
        />
        <path d={`M ${solarPath}`} fill="none" stroke="currentColor" strokeWidth={0.6} />
        <path
          d={`M ${totalPath}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray="2,1.5"
          opacity={0.6}
        />
        <line x1={markerX} y1={0} x2={markerX} y2={100} stroke="currentColor" strokeWidth={0.4} />
        <circle cx={markerX} cy={100 - (series.find((p) => p.hour === Math.floor(currentHour))?.totalPowerW ?? 0) / maxPowerW * 100} r={1.2} fill="currentColor" />
      </svg>
      <p className="text-xs text-foreground opacity-60 mt-2">
        Day 1 → Day {Math.round(CYCLE_HOURS / 24)}. Solid line: solar power. Dashed line: solar + battery.
      </p>
    </div>
  );
}
