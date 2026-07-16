import { Panel } from "../ui/panel";
import { PanelLabel } from "../ui/panel-label";

const ASSUMPTIONS = [
  "ΔH°, ΔS°, and ΔG(T) use standard 298 K formation data (CRC Handbook / NIST-JANAF) with a constant-Cp Kirchhoff correction. Phase transitions and melting enthalpies are ignored — at 1873 K several species are actually molten, so real Ellingham lines kink where these do not.",
  "FeO data are the least certain: wüstite is non-stoichiometric (≈Fe₀.₉₄₇O), so its reported enthalpy and entropy vary between sources.",
  "Energy-per-kg-metal is an empirical electrical specific energy (cell voltage, overpotential, Faradaic efficiency), intentionally decoupled from the thermal ΔG(T); the two answer different questions.",
  "The battery models a 90% round-trip efficiency, starts empty at each dawn, and does not carry its charge across the cycle wrap.",
  "All four oxides are assumed to reduce simultaneously, sharing power by their share of the regolith feedstock (≈ SiO₂ 45%, Al₂O₃ 15%, FeO 15%, TiO₂ 4%; MgO and CaO excluded). Real molten-regolith electrolysis gates by cell voltage, reducing FeO before Al₂O₃.",
  "The solar curve is an idealized smooth day/night sinusoid: no incidence-angle losses, libration, or polar/permanently-shadowed-region effects, and a symmetric 14/14-day cycle.",
];

export function ModelAssumptions() {
  return (
    <Panel>
      <PanelLabel>Model assumptions</PanelLabel>
      <ul className="space-y-2 list-disc pl-4 mt-4">
        {ASSUMPTIONS.map((assumption) => (
          <li key={assumption} className="text-sm text-foreground opacity-70">
            {assumption}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
