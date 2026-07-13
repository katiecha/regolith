"use client";

import { useIsMounted } from "../../hooks/use-is-mounted";
import { LunarSolarScene } from "./lunar-solar-scene";

export function LunarSceneContainer({
  timeHoursRef,
}: {
  timeHoursRef: React.RefObject<number>;
}) {
  const mounted = useIsMounted();

  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-foreground opacity-60">
        Lunar day/night cycle
      </span>
      <div className="relative w-full aspect-square md:aspect-[4/3] mt-2 border border-foreground/20">
        {mounted ? (
          <LunarSolarScene timeHoursRef={timeHoursRef} />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
