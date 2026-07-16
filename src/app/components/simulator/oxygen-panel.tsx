import type { OxideRuntime } from "../../data/simulator";
import { oxygenPerMetalMassRatio } from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

function OxygenRow({
  oxide,
  maxOxygenKgPerHr,
}: {
  oxide: OxideRuntime;
  maxOxygenKgPerHr: number;
}) {
  const barWidth =
    maxOxygenKgPerHr > 0
      ? (oxide.currentOxygenKgPerHr / maxOxygenKgPerHr) * 100
      : 0;

  return (
    <li className="text-base text-foreground">
      <div className="flex items-baseline justify-between gap-4">
        <span>{oxide.formula} → O₂</span>
        <span className="text-sm opacity-60">
          {oxide.currentOxygenKgPerHr.toFixed(2)} kg/hr
        </span>
      </div>
      <div className="h-1 mt-1 bg-foreground/10">
        <div
          className="h-full"
          style={{ width: `${barWidth}%`, backgroundColor: oxide.color }}
        />
      </div>
      <p className="text-xs mt-1 text-foreground opacity-60">
        {oxide.cumulativeOxygenKg.toFixed(1)} kg O₂ this cycle ·{" "}
        {oxygenPerMetalMassRatio(oxide).toFixed(2)} kg O₂/kg {oxide.metalProduced}
      </p>
    </li>
  );
}

export function OxygenPanel({ oxides }: { oxides: OxideRuntime[] }) {
  const totalCurrentKgPerHr = oxides.reduce(
    (sum, oxide) => sum + oxide.currentOxygenKgPerHr,
    0
  );
  const totalCumulativeKg = oxides.reduce(
    (sum, oxide) => sum + oxide.cumulativeOxygenKg,
    0
  );
  const maxOxygenKgPerHr = Math.max(
    ...oxides.map((oxide) => oxide.currentOxygenKgPerHr),
    0
  );

  return (
    <Panel>
      <div className="flex items-baseline justify-between mb-4">
        <PanelLabel>Oxygen produced</PanelLabel>
        <span className="text-sm text-foreground">
          {totalCurrentKgPerHr.toFixed(2)} kg/hr
          <span className="opacity-60">
            {" "}
            / {totalCumulativeKg.toFixed(0)} kg this cycle
          </span>
        </span>
      </div>
      <ul className="space-y-5 md:space-y-6">
        {oxides.map((oxide) => (
          <OxygenRow
            key={oxide.id}
            oxide={oxide}
            maxOxygenKgPerHr={maxOxygenKgPerHr}
          />
        ))}
      </ul>
    </Panel>
  );
}
