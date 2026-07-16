import type { OxideRuntime } from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

function OxideRow({
  oxide,
  maxThroughputKgPerHr,
}: {
  oxide: OxideRuntime;
  maxThroughputKgPerHr: number;
}) {
  const barWidth =
    maxThroughputKgPerHr > 0
      ? (oxide.currentThroughputKgPerHr / maxThroughputKgPerHr) * 100
      : 0;

  return (
    <li className="text-base text-foreground">
      <div className="flex items-baseline justify-between gap-4">
        <span>
          {oxide.formula} → {oxide.metalProduced}
        </span>
        <span className="text-sm opacity-60">
          {oxide.currentThroughputKgPerHr.toFixed(2)} kg/hr
        </span>
      </div>
      <div className="h-1 mt-1 bg-foreground/10">
        <div
          className="h-full"
          style={{ width: `${barWidth}%`, backgroundColor: oxide.color }}
        />
      </div>
      <p className="text-xs mt-1 text-foreground opacity-60">
        {oxide.cumulativeKg.toFixed(1)} kg produced this cycle
      </p>
    </li>
  );
}

export function OxidePanel({ oxides }: { oxides: OxideRuntime[] }) {
  const maxThroughputKgPerHr = Math.max(
    ...oxides.map((o) => o.currentThroughputKgPerHr),
    0
  );

  return (
    <Panel>
      <PanelLabel>Metal throughput</PanelLabel>
      <ul className="space-y-5 md:space-y-6 mt-4">
        {oxides.map((oxide) => (
          <OxideRow
            key={oxide.id}
            oxide={oxide}
            maxThroughputKgPerHr={maxThroughputKgPerHr}
          />
        ))}
      </ul>
      <p className="text-xs text-foreground opacity-60 mt-4">
        All four oxides reduce simultaneously, sharing the power budget in
        proportion to their share of the regolith feedstock.
      </p>
    </Panel>
  );
}
