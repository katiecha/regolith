const ASSUMPTIONS = [
  "ΔH° and ΔS° values are illustrative, order-of-magnitude estimates for demonstration — not handbook-precision thermodynamic data.",
  "The solar curve is an idealized smooth day/night sinusoid: no incidence-angle losses, libration, or polar/permanently-shadowed-region effects, and a symmetric 14/14-day cycle.",
  "A single fixed process temperature is assumed for all four oxides; real Ellingham comparisons depend on the reduction pathway and vary by process.",
  "The battery model ignores charge/discharge efficiency losses and mass or cost tradeoffs.",
  "The reducibility ranking reflects relative thermodynamic ordering (Ellingham-style), not a hard affordability cutoff.",
];

export function ModelAssumptions() {
  return (
    <div className="border border-foreground/20 rounded-md p-6 bg-foreground/[0.03]">
      <p className="text-xs uppercase tracking-widest text-foreground mb-4">
        Model assumptions
      </p>
      <ul className="space-y-2 list-disc pl-4">
        {ASSUMPTIONS.map((assumption) => (
          <li key={assumption} className="text-sm text-foreground opacity-70">
            {assumption}
          </li>
        ))}
      </ul>
    </div>
  );
}
