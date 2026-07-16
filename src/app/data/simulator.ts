// Standard-state thermodynamic reference temperature (K).
export const REFERENCE_TEMPERATURE_K = 298.15;

// Species-level thermodynamic data (CRC Handbook / NIST-JANAF, 298.15 K).
// Reaction-level ΔH°, ΔS°, ΔCp are DERIVED from these so the model stays
// internally consistent (it reproduces published ΔfG°298 to the kJ).
export type Species = {
  key: string;
  deltaHf298: number; // kJ/mol   — standard enthalpy of formation
  s298: number; // J/(mol*K) — standard molar entropy
  cp: number; // J/(mol*K) — heat capacity near 298 K, held constant (Kirchhoff approximation)
  molarMass: number; // g/mol
};

const O2: Species = { key: "O2", deltaHf298: 0, s298: 205.15, cp: 29.38, molarMass: 32.0 };
const Fe: Species = { key: "Fe", deltaHf298: 0, s298: 27.28, cp: 25.1, molarMass: 55.85 };
const Ti: Species = { key: "Ti", deltaHf298: 0, s298: 30.63, cp: 25.02, molarMass: 47.87 };
const Si: Species = { key: "Si", deltaHf298: 0, s298: 18.81, cp: 19.99, molarMass: 28.09 };
const Al: Species = { key: "Al", deltaHf298: 0, s298: 28.3, cp: 24.2, molarMass: 26.98 };
const FeO_s: Species = { key: "FeO", deltaHf298: -272.0, s298: 60.75, cp: 49.92, molarMass: 71.84 };
const TiO2_s: Species = { key: "TiO2", deltaHf298: -944.0, s298: 50.62, cp: 55.02, molarMass: 79.87 };
const SiO2_s: Species = { key: "SiO2", deltaHf298: -910.7, s298: 41.46, cp: 44.43, molarMass: 60.08 };
const Al2O3_s: Species = { key: "Al2O3", deltaHf298: -1675.7, s298: 50.92, cp: 79.04, molarMass: 101.96 };

// A reduction written as: oxide -> metal + O2, with stoichiometric coefficients.
export type ReactionTerm = { species: Species; coeff: number };
export type Reaction = {
  oxide: ReactionTerm;
  metal: ReactionTerm;
  oxygen: ReactionTerm;
};

export type Oxide = {
  id: "SiO2" | "Al2O3" | "FeO" | "TiO2";
  formula: string;
  name: string;
  metalProduced: string;
  energyPerKgMetal: number; // MJ/kg metal — empirical electrical specific energy, decoupled from T
  color: string;
  regolithMassFraction: number; // approximate mare-regolith wt% (renormalized over these four in code)
  reaction: Reaction;
};

export const OXIDES: Oxide[] = [
  {
    id: "FeO",
    formula: "FeO",
    name: "Iron(II) oxide",
    metalProduced: "Fe",
    energyPerKgMetal: 7,
    color: "#B5654A",
    regolithMassFraction: 0.15,
    reaction: {
      oxide: { species: FeO_s, coeff: 1 },
      metal: { species: Fe, coeff: 1 },
      oxygen: { species: O2, coeff: 0.5 },
    },
  },
  {
    id: "TiO2",
    formula: "TiO₂",
    name: "Titanium dioxide",
    metalProduced: "Ti",
    energyPerKgMetal: 30,
    color: "#7A8C99",
    regolithMassFraction: 0.04,
    reaction: {
      oxide: { species: TiO2_s, coeff: 1 },
      metal: { species: Ti, coeff: 1 },
      oxygen: { species: O2, coeff: 1 },
    },
  },
  {
    id: "SiO2",
    formula: "SiO₂",
    name: "Silica",
    metalProduced: "Si",
    energyPerKgMetal: 45,
    color: "#C9A227",
    regolithMassFraction: 0.45,
    reaction: {
      oxide: { species: SiO2_s, coeff: 1 },
      metal: { species: Si, coeff: 1 },
      oxygen: { species: O2, coeff: 1 },
    },
  },
  {
    id: "Al2O3",
    formula: "Al₂O₃",
    name: "Alumina",
    metalProduced: "Al",
    energyPerKgMetal: 55,
    color: "#8A6FA8",
    regolithMassFraction: 0.15,
    reaction: {
      oxide: { species: Al2O3_s, coeff: 1 },
      metal: { species: Al, coeff: 2 },
      oxygen: { species: O2, coeff: 1.5 },
    },
  },
];

// Molten regolith electrolysis process temperature (K). Now user-adjustable.
export const DEFAULT_TEMPERATURE_K = 1873;
export const MIN_TEMPERATURE_K = 300;
export const MAX_TEMPERATURE_K = 2500;

// Battery round-trip (store -> deliver) efficiency.
export const ROUND_TRIP_EFFICIENCY = 0.9;

export const SOLAR_IRRADIANCE_W_M2 = 1361;

export const DAY_HOURS = 14 * 24;
export const NIGHT_HOURS = 14 * 24;
export const CYCLE_HOURS = DAY_HOURS + NIGHT_HOURS;

export const MIN_COLLECTOR_AREA_M2 = 10;
export const MAX_COLLECTOR_AREA_M2 = 1000;
export const MIN_EFFICIENCY = 0.05;
export const MAX_EFFICIENCY = 0.4;
export const MIN_STORAGE_CAPACITY_KWH = 0;
export const MAX_STORAGE_CAPACITY_KWH = 5000;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// --- Thermodynamics (Kirchhoff, constant-Cp) ---------------------------------
// Standard reaction quantities as written (per mole of oxide), derived from the
// species table: sum over products minus sum over reactants.

function reactionDeltaH298(reaction: Reaction): number {
  return (
    reaction.metal.coeff * reaction.metal.species.deltaHf298 +
    reaction.oxygen.coeff * reaction.oxygen.species.deltaHf298 -
    reaction.oxide.coeff * reaction.oxide.species.deltaHf298
  );
}

function reactionDeltaS298(reaction: Reaction): number {
  return (
    reaction.metal.coeff * reaction.metal.species.s298 +
    reaction.oxygen.coeff * reaction.oxygen.species.s298 -
    reaction.oxide.coeff * reaction.oxide.species.s298
  );
}

function reactionDeltaCp(reaction: Reaction): number {
  return (
    reaction.metal.coeff * reaction.metal.species.cp +
    reaction.oxygen.coeff * reaction.oxygen.species.cp -
    reaction.oxide.coeff * reaction.oxide.species.cp
  );
}

// All three are reported per mole of O2 (Ellingham convention) so the four
// reductions share one energy axis.

// ΔH(T) in kJ per mole O2. ΔrCp is J/K, converted to kJ.
export function reactionEnthalpy(oxide: Oxide, tempK: number): number {
  const r = oxide.reaction;
  const deltaH =
    reactionDeltaH298(r) +
    (reactionDeltaCp(r) / 1000) * (tempK - REFERENCE_TEMPERATURE_K);
  return deltaH / r.oxygen.coeff;
}

// ΔS(T) in J per (mole O2 * K).
export function reactionEntropy(oxide: Oxide, tempK: number): number {
  const r = oxide.reaction;
  const deltaS =
    reactionDeltaS298(r) +
    reactionDeltaCp(r) * Math.log(tempK / REFERENCE_TEMPERATURE_K);
  return deltaS / r.oxygen.coeff;
}

// ΔG(T) = ΔH(T) - T*ΔS(T) in kJ per mole O2. T*ΔS is J -> kJ.
export function reactionGibbs(oxide: Oxide, tempK: number): number {
  return (
    reactionEnthalpy(oxide, tempK) -
    (tempK * reactionEntropy(oxide, tempK)) / 1000
  );
}

// Reduction ΔG is POSITIVE (reduction is non-spontaneous — electrolysis
// supplies the rest). Least positive = least stable oxide = easiest to reduce,
// so sort ASCENDING. (Ellingham-style ordering; opposite sign to the old
// formation-ΔG comparator.)
export function rankByReducibility(oxides: Oxide[], tempK: number): Oxide[] {
  return [...oxides].sort(
    (a, b) => reactionGibbs(a, tempK) - reactionGibbs(b, tempK)
  );
}

// --- Stoichiometry -----------------------------------------------------------

// kg of metal produced per kg of oxide consumed.
export function metalMassPerOxideMass(oxide: Oxide): number {
  const r = oxide.reaction;
  return (
    (r.metal.coeff * r.metal.species.molarMass) /
    (r.oxide.coeff * r.oxide.species.molarMass)
  );
}

// kg of O2 co-produced per kg of metal reduced.
export function oxygenPerMetalMassRatio(oxide: Oxide): number {
  const r = oxide.reaction;
  return (
    (r.oxygen.coeff * r.oxygen.species.molarMass) /
    (r.metal.coeff * r.metal.species.molarMass)
  );
}

// Electrical energy to reduce 1 kg of this oxide (J/kg).
function energyPerKgOxide(oxide: Oxide): number {
  return oxide.energyPerKgMetal * 1e6 * metalMassPerOxideMass(oxide);
}

// --- Solar generation --------------------------------------------------------

// Fraction of peak solar irradiance at a given hour within the cycle,
// modeled as a smooth sinusoidal ramp during the day and zero at night.
export function solarFraction(hourInCycle: number): number {
  const h = ((hourInCycle % CYCLE_HOURS) + CYCLE_HOURS) % CYCLE_HOURS;
  if (h >= DAY_HOURS) return 0;
  return Math.max(0, Math.sin((Math.PI * h) / DAY_HOURS));
}

export function solarPowerW(
  hourInCycle: number,
  collectorAreaM2: number,
  efficiency: number
): number {
  const irradiance = SOLAR_IRRADIANCE_W_M2 * solarFraction(hourInCycle);
  return irradiance * collectorAreaM2 * efficiency;
}

export type CyclePoint = {
  hour: number;
  solarPowerW: number;
  batteryLevelKWh: number;
  totalPowerW: number; // process power delivered this hour
};

// Precomputes the full-cycle power/battery trajectory at 1-hour resolution.
//
// The battery starts EMPTY at dawn (hour 0) and time-shifts solar energy into
// the night. We pick a flat baseload the battery can sustain, run the process
// at that baseload wherever possible, bank daytime surplus above it (stored
// 1:1), and discharge overnight (delivering ROUND_TRIP_EFFICIENCY of the energy
// drawn). Solar is never counted twice: totalPowerW is the actual process draw.
export function buildCycleSeries(
  collectorAreaM2: number,
  efficiency: number,
  storageCapacityKWh: number
): CyclePoint[] {
  const dtHours = 1;

  // Total solar energy collected over the cycle (kWh).
  let solarEnergyKWh = 0;
  for (let hour = 0; hour < CYCLE_HOURS; hour += dtHours) {
    solarEnergyKWh += (solarPowerW(hour, collectorAreaM2, efficiency) * dtHours) / 1000;
  }

  // Flat baseload target: the lesser of what the collected energy can sustain
  // round-the-clock (night shifted through the battery at ROUND_TRIP_EFFICIENCY)
  // and what the battery can physically deliver across the night.
  let targetPowerW = 0;
  if (storageCapacityKWh > 0) {
    const energyLimitedW =
      (solarEnergyKWh * 1000) / (DAY_HOURS + NIGHT_HOURS / ROUND_TRIP_EFFICIENCY);
    const capacityLimitedW =
      (ROUND_TRIP_EFFICIENCY * storageCapacityKWh * 1000) / NIGHT_HOURS;
    targetPowerW = Math.min(energyLimitedW, capacityLimitedW);
  }

  const series: CyclePoint[] = [];
  let batteryLevelKWh = 0;

  for (let hour = 0; hour < CYCLE_HOURS; hour += dtHours) {
    const solar = solarPowerW(hour, collectorAreaM2, efficiency);
    let processW: number;

    if (storageCapacityKWh <= 0) {
      // No battery: the process runs on instantaneous solar only (0 at night).
      processW = solar;
    } else if (solar >= targetPowerW) {
      // Surplus above the baseload charges the battery (1:1), capped by room.
      const surplusW = solar - targetPowerW;
      const roomKWh = storageCapacityKWh - batteryLevelKWh;
      const acceptedKWh = Math.min((surplusW * dtHours) / 1000, roomKWh);
      batteryLevelKWh += acceptedKWh;
      // Surplus that doesn't fit runs the process now (no curtailment).
      const unstoredW = surplusW - (acceptedKWh * 1000) / dtHours;
      processW = targetPowerW + unstoredW;
    } else {
      // Deficit (dawn/dusk/night): discharge to hold the baseload if we can.
      const deficitW = targetPowerW - solar;
      const drawKWh = Math.min(
        (deficitW * dtHours) / 1000 / ROUND_TRIP_EFFICIENCY,
        batteryLevelKWh
      );
      batteryLevelKWh -= drawKWh;
      const deliveredW = (drawKWh * ROUND_TRIP_EFFICIENCY * 1000) / dtHours;
      processW = solar + deliveredW;
    }

    batteryLevelKWh = clamp(batteryLevelKWh, 0, storageCapacityKWh);

    series.push({
      hour,
      solarPowerW: solar,
      batteryLevelKWh,
      totalPowerW: processW,
    });
  }

  return series;
}

export type OxideRuntime = Oxide & {
  currentThroughputKgPerHr: number; // kg metal / hr, right now
  cumulativeKg: number; // kg metal produced this cycle
  currentOxygenKgPerHr: number; // kg O2 / hr, right now
  cumulativeOxygenKg: number; // kg O2 produced this cycle
  reactionGibbsPerO2: number; // kJ / mol O2, at the current temperature
};

// Composition-weighted simultaneous reduction: molten-regolith electrolysis
// reduces all four oxides at once. A single feedstock mass-flow is processed,
// and each oxide's share of the power is its share of that feedstock's total
// reduction energy — so per-oxide metal and O2 sum to a true total (no
// double-counting of the power budget).
export function computeOxideRuntimes(
  series: CyclePoint[],
  currentHour: number,
  tempK: number
): OxideRuntime[] {
  const ranked = rankByReducibility(OXIDES, tempK);
  const totalFraction = OXIDES.reduce(
    (sum, oxide) => sum + oxide.regolithMassFraction,
    0
  );

  // Electrical energy to reduce 1 kg of the feedstock mix (J/kg).
  const energyPerKgRegolith = OXIDES.reduce((sum, oxide) => {
    const massFraction = oxide.regolithMassFraction / totalFraction;
    return sum + massFraction * energyPerKgOxide(oxide);
  }, 0);

  // Feedstock processed per hour (kg) scales linearly with process power.
  const regolithKgPerHr = (powerW: number) =>
    (powerW / energyPerKgRegolith) * 3600;

  const currentPoint =
    series.find((p) => p.hour === Math.floor(currentHour)) ?? series[0];
  const currentRegolithKgPerHr = regolithKgPerHr(currentPoint.totalPowerW);
  const cumulativeRegolithKg = series.reduce(
    (sum, point) => sum + regolithKgPerHr(point.totalPowerW),
    0
  );

  return ranked.map((oxide) => {
    const massFraction = oxide.regolithMassFraction / totalFraction;
    const metalPerOxide = metalMassPerOxideMass(oxide);
    const oxygenRatio = oxygenPerMetalMassRatio(oxide);

    const currentMetalKgPerHr =
      massFraction * currentRegolithKgPerHr * metalPerOxide;
    const cumulativeMetalKg =
      massFraction * cumulativeRegolithKg * metalPerOxide;

    return {
      ...oxide,
      currentThroughputKgPerHr: currentMetalKgPerHr,
      cumulativeKg: cumulativeMetalKg,
      currentOxygenKgPerHr: currentMetalKgPerHr * oxygenRatio,
      cumulativeOxygenKg: cumulativeMetalKg * oxygenRatio,
      reactionGibbsPerO2: reactionGibbs(oxide, tempK),
    };
  });
}
