"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCycleSeries,
  clamp,
  computeOxideRuntimes,
  CYCLE_HOURS,
  MAX_COLLECTOR_AREA_M2,
  MAX_EFFICIENCY,
  MAX_STORAGE_CAPACITY_KWH,
  MIN_COLLECTOR_AREA_M2,
  MIN_EFFICIENCY,
  MIN_STORAGE_CAPACITY_KWH,
} from "../../data/simulator";
import { useIsMounted } from "../../hooks/use-is-mounted";
import { LunarSceneContainer } from "./lunar-scene-container";
import { OxidePanel } from "./oxide-panel";
import { PowerCurveChart } from "./power-curve-chart";
import { SimulatorControls } from "./simulator-controls";

const HOURS_PER_SECOND = 8;

export function PowerSimulator() {
  const [timeHours, setTimeHours] = useState(0);
  const [collectorArea, setCollectorArea] = useState(100);
  const [efficiency, setEfficiency] = useState(0.2);
  const [storageCapacityKWh, setStorageCapacityKWh] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mounted = useIsMounted();

  const lastFrameRef = useRef<number | null>(null);
  // Mirrors timeHours for the 3D scene's per-frame reads, so the Canvas
  // never re-renders React state 60x/sec — it's written on every RAF tick
  // and on manual scrubbing, but only ever read inside useFrame.
  const timeHoursRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let frameId: number;

    const tick = (timestamp: number) => {
      if (lastFrameRef.current !== null) {
        const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
        setTimeHours((previous) => {
          const next = (previous + deltaSeconds * HOURS_PER_SECOND) % CYCLE_HOURS;
          timeHoursRef.current = next;
          return next;
        });
      }
      lastFrameRef.current = timestamp;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  const series = useMemo(
    () => buildCycleSeries(collectorArea, efficiency, storageCapacityKWh),
    [collectorArea, efficiency, storageCapacityKWh]
  );

  const currentHour = Math.floor(timeHours);
  const oxideRuntimes = useMemo(
    () => computeOxideRuntimes(series, currentHour),
    [series, currentHour]
  );

  if (!mounted) {
    return <div className="h-[600px]" />;
  }

  return (
    <div className="space-y-10">
      <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start space-y-10 md:space-y-0">
        <PowerCurveChart series={series} currentHour={timeHours} />
        <LunarSceneContainer timeHoursRef={timeHoursRef} />
      </div>
      <SimulatorControls
        timeHours={timeHours}
        collectorArea={collectorArea}
        efficiency={efficiency}
        storageCapacityKWh={storageCapacityKWh}
        isPlaying={isPlaying}
        onTimeChange={(value) => {
          setIsPlaying(false);
          const next = clamp(value, 0, CYCLE_HOURS);
          timeHoursRef.current = next;
          setTimeHours(next);
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
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
      <OxidePanel oxides={oxideRuntimes} />
    </div>
  );
}
