import { clamp } from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

export function BatteryMeter({
  levelKWh,
  capacityKWh,
}: {
  levelKWh: number;
  capacityKWh: number;
}) {
  if (capacityKWh <= 0) {
    return (
      <Panel>
        <div className="flex items-baseline justify-between">
          <PanelLabel>Battery charge</PanelLabel>
          <span className="text-sm text-foreground opacity-60">
            No battery: process idle at night
          </span>
        </div>
      </Panel>
    );
  }

  const percent = clamp((levelKWh / capacityKWh) * 100, 0, 100);

  return (
    <Panel>
      <div className="flex items-baseline justify-between mb-4">
        <PanelLabel>Battery charge</PanelLabel>
        <span className="text-sm text-foreground">
          {levelKWh.toFixed(0)} kWh
          <span className="opacity-60">
            {" "}
            / {capacityKWh.toFixed(0)} kWh ({Math.round(percent)}%)
          </span>
        </span>
      </div>
      <div className="h-1 bg-foreground/10">
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>
    </Panel>
  );
}
