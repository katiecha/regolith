import {
  CYCLE_HOURS,
  MAX_COLLECTOR_AREA_M2,
  MAX_EFFICIENCY,
  MAX_STORAGE_CAPACITY_KWH,
  MIN_COLLECTOR_AREA_M2,
  MIN_EFFICIENCY,
  MIN_STORAGE_CAPACITY_KWH,
} from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <PanelLabel>{label}</PanelLabel>
        <span className="text-sm text-foreground opacity-60">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full mt-2 accent-accent"
      />
    </label>
  );
}

export function SimulatorControls({
  timeHours,
  collectorArea,
  efficiency,
  storageCapacityKWh,
  isPlaying,
  onTimeChange,
  onCollectorAreaChange,
  onEfficiencyChange,
  onStorageCapacityChange,
  onTogglePlay,
}: {
  timeHours: number;
  collectorArea: number;
  efficiency: number;
  storageCapacityKWh: number;
  isPlaying: boolean;
  onTimeChange: (value: number) => void;
  onCollectorAreaChange: (value: number) => void;
  onEfficiencyChange: (value: number) => void;
  onStorageCapacityChange: (value: number) => void;
  onTogglePlay: () => void;
}) {
  return (
    <Panel>
      <PanelLabel>Simulation controls</PanelLabel>
      <div className="space-y-6 md:space-y-8 mt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className="text-xs uppercase tracking-widest px-3 py-1 border border-foreground/20 rounded-full cursor-pointer hover:bg-foreground/5 transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={CYCLE_HOURS}
            step={1}
            value={timeHours}
            onChange={(event) => onTimeChange(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </div>
        <SliderField
          label="Collector area"
          value={collectorArea}
          displayValue={`${collectorArea} m²`}
          min={MIN_COLLECTOR_AREA_M2}
          max={MAX_COLLECTOR_AREA_M2}
          step={10}
          onChange={onCollectorAreaChange}
        />
        <SliderField
          label="System efficiency"
          value={efficiency}
          displayValue={`${Math.round(efficiency * 100)}%`}
          min={MIN_EFFICIENCY}
          max={MAX_EFFICIENCY}
          step={0.01}
          onChange={onEfficiencyChange}
        />
        <SliderField
          label="Battery capacity"
          value={storageCapacityKWh}
          displayValue={`${storageCapacityKWh} kWh`}
          min={MIN_STORAGE_CAPACITY_KWH}
          max={MAX_STORAGE_CAPACITY_KWH}
          step={50}
          onChange={onStorageCapacityChange}
        />
      </div>
    </Panel>
  );
}
