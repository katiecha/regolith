import type { Oxide } from "../../data/simulator";
import {
  rankByReducibility,
  reactionEnthalpy,
  reactionEntropy,
  reactionGibbs,
} from "../../data/simulator";
import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

function ThermoRow({
  oxide,
  temperatureK,
}: {
  oxide: Oxide;
  temperatureK: number;
}) {
  const deltaH = reactionEnthalpy(oxide, temperatureK);
  const deltaS = reactionEntropy(oxide, temperatureK);
  const deltaG = reactionGibbs(oxide, temperatureK);

  return (
    <li className="text-base text-foreground">
      <div className="flex items-baseline justify-between gap-4">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: oxide.color }}
          />
          {oxide.formula} → {oxide.metalProduced}
        </span>
        <span className="text-sm opacity-60">
          ΔG {deltaG.toFixed(0)} kJ/mol O₂
        </span>
      </div>
      <p className="text-xs mt-1 text-foreground opacity-60">
        ΔH {deltaH.toFixed(0)} kJ · ΔS {deltaS.toFixed(0)} J/K · per mol O₂
      </p>
    </li>
  );
}

export function ThermoPanel({
  oxides,
  temperatureK,
}: {
  oxides: Oxide[];
  temperatureK: number;
}) {
  const ranked = rankByReducibility(oxides, temperatureK);

  return (
    <Panel>
      <div className="flex items-baseline justify-between mb-4">
        <PanelLabel>Reduction thermodynamics</PanelLabel>
        <span className="text-sm text-foreground opacity-60">
          {Math.round(temperatureK)} K
        </span>
      </div>
      <ul className="space-y-4 md:space-y-5">
        {ranked.map((oxide) => (
          <ThermoRow key={oxide.id} oxide={oxide} temperatureK={temperatureK} />
        ))}
      </ul>
      <p className="text-xs text-foreground opacity-60 mt-4">
        ΔG &gt; 0 means reduction is non-spontaneous; electrolysis supplies the
        balance. Ordered easiest to hardest, from CRC / NIST-JANAF data with a
        constant-Cp Kirchhoff correction.
      </p>
    </Panel>
  );
}
