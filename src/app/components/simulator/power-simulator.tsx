"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCycleSeries,
  clamp,
  computeOxideRuntimes,
  CYCLE_HOURS,
  DEFAULT_TEMPERATURE_K,
  MAX_COLLECTOR_AREA_M2,
  MAX_EFFICIENCY,
  MAX_STORAGE_CAPACITY_KWH,
  MAX_TEMPERATURE_K,
  MIN_COLLECTOR_AREA_M2,
  MIN_EFFICIENCY,
  MIN_STORAGE_CAPACITY_KWH,
  MIN_TEMPERATURE_K,
  OXIDES,
} from "../../data/simulator";
import { useIsMounted } from "../../hooks/use-is-mounted";
import { BatteryMeter } from "./battery-meter";
import { EllinghamChart } from "./ellingham-chart";
import { OxidePanel } from "./oxide-panel";
import { OxygenPanel } from "./oxygen-panel";
import { PowerCurveChart } from "./power-curve-chart";
import { SimulatorControls } from "./simulator-controls";
import { ThermoPanel } from "./thermo-panel";

const HOURS_PER_SECOND = 8;

export function PowerSimulator() {
  const [timeHours, setTimeHours] = useState(0);
  const [collectorArea, setCollectorArea] = useState(100);
  const [efficiency, setEfficiency] = useState(0.2);
  const [storageCapacityKWh, setStorageCapacityKWh] = useState(1000);
  const [temperatureK, setTemperatureK] = useState(DEFAULT_TEMPERATURE_K);
  const [isPlaying, setIsPlaying] = useState(false);
  const mounted = useIsMounted();

  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let frameId: number;

    const tick = (timestamp: number) => {
      if (lastFrameRef.current !== null) {
        const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
        setTimeHours(
          (previous) =>
            (previous + deltaSeconds * HOURS_PER_SECOND) % CYCLE_HOURS
        );
      }
      lastFrameRef.current = timestamp;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Power/battery trajectory is temperature-independent, so it is not a memo
  // dependency here — only the chemistry (oxideRuntimes / thermo panels) reacts
  // to the temperature slider.
  const series = useMemo(
    () => buildCycleSeries(collectorArea, efficiency, storageCapacityKWh),
    [collectorArea, efficiency, storageCapacityKWh]
  );

  const currentHour = Math.floor(timeHours);
  const oxideRuntimes = useMemo(
    () => computeOxideRuntimes(series, currentHour, temperatureK),
    [series, currentHour, temperatureK]
  );

  const currentPoint =
    series.find((point) => point.hour === currentHour) ?? series[0];

  if (!mounted) {
    return <div className="h-[600px]" />;
  }

  return (
    <div className="space-y-10">
      <PowerCurveChart series={series} currentHour={timeHours} />
      <BatteryMeter
        levelKWh={currentPoint.batteryLevelKWh}
        capacityKWh={storageCapacityKWh}
      />
      <SimulatorControls
        timeHours={timeHours}
        collectorArea={collectorArea}
        efficiency={efficiency}
        storageCapacityKWh={storageCapacityKWh}
        temperatureK={temperatureK}
        isPlaying={isPlaying}
        onTimeChange={(value) => {
          setIsPlaying(false);
          setTimeHours(clamp(value, 0, CYCLE_HOURS));
        }}
        onCollectorAreaChange={(value) =>
          setCollectorArea(
            clamp(value, MIN_COLLECTOR_AREA_M2, MAX_COLLECTOR_AREA_M2)
          )
        }
        onEfficiencyChange={(value) =>
          setEfficiency(clamp(value, MIN_EFFICIENCY, MAX_EFFICIENCY))
        }
        onStorageCapacityChange={(value) =>
          setStorageCapacityKWh(
            clamp(value, MIN_STORAGE_CAPACITY_KWH, MAX_STORAGE_CAPACITY_KWH)
          )
        }
        onTemperatureChange={(value) =>
          setTemperatureK(clamp(value, MIN_TEMPERATURE_K, MAX_TEMPERATURE_K))
        }
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
      <ThermoPanel oxides={OXIDES} temperatureK={temperatureK} />
      <EllinghamChart oxides={OXIDES} temperatureK={temperatureK} />
      <OxidePanel oxides={oxideRuntimes} />
      <OxygenPanel oxides={oxideRuntimes} />
    </div>
  );
}
