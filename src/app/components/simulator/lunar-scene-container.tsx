"use client";

import { useIsMounted } from "../../hooks/use-is-mounted";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";
import { LunarSolarScene } from "./lunar-solar-scene";

export function LunarSceneContainer({
  timeHoursRef,
}: {
  timeHoursRef: React.RefObject<number>;
}) {
  const mounted = useIsMounted();

  return (
    <Panel>
      <PanelLabel>Lunar day/night cycle</PanelLabel>
      <div className="relative w-full aspect-square md:aspect-[4/3] mt-4 border border-foreground/20 overflow-hidden">
        {mounted ? (
          <LunarSolarScene timeHoursRef={timeHoursRef} />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
    </Panel>
  );
}
