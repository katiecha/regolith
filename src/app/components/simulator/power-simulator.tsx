"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
import { OxidePanel } from "./oxide-panel";
import { PowerCurveChart } from "./power-curve-chart";
import { SimulatorControls } from "./simulator-controls";

const HOURS_PER_SECOND = 8;

function subscribeNever() {
  return () => {};
}

// Math.sin can differ in its last bit(s) between the server's JS engine and
// the browser's, which would otherwise produce a hydration mismatch on the
// chart's computed SVG path. This is a purely client-interactive, animated
// widget with no SEO value in its default frame, so it renders only after
// mount rather than being server-rendered at all.
function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

export function PowerSimulator() {
  const [timeHours, setTimeHours] = useState(0);
  const [collectorArea, setCollectorArea] = useState(100);
  const [efficiency, setEfficiency] = useState(0.2);
  const [storageCapacityKWh, setStorageCapacityKWh] = useState(0);
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
      <PowerCurveChart series={series} currentHour={timeHours} />
      <SimulatorControls
        timeHours={timeHours}
        collectorArea={collectorArea}
        efficiency={efficiency}
        storageCapacityKWh={storageCapacityKWh}
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
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
      <OxidePanel oxides={oxideRuntimes} />
    </div>
  );
}
