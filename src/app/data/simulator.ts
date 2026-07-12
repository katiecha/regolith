export type Oxide = {
  id: "SiO2" | "Al2O3" | "FeO" | "TiO2";
  formula: string;
  name: string;
  metalProduced: string;
  deltaH0: number; // kJ/mol, illustrative formation enthalpy
  deltaS0: number; // J/(mol*K), illustrative formation entropy
  energyPerKgMetal: number; // MJ/kg, illustrative energy required per kg of metal produced
  color: string;
};

// Illustrative, order-of-magnitude thermodynamic values loosely following
// Ellingham-diagram ordering. Not handbook-precision data — see the
// "Model assumptions" note on the simulator page.
export const OXIDES: Oxide[] = [
  {
    id: "FeO",
    formula: "FeO",
    name: "Iron(II) oxide",
    metalProduced: "Fe",
    deltaH0: -272,
    deltaS0: -60,
    energyPerKgMetal: 7,
    color: "#B5654A",
  },
  {
    id: "TiO2",
    formula: "TiO₂",
    name: "Titanium dioxide",
    metalProduced: "Ti",
    deltaH0: -945,
    deltaS0: -90,
    energyPerKgMetal: 30,
    color: "#7A8C99",
  },
  {
    id: "SiO2",
    formula: "SiO₂",
    name: "Silica",
    metalProduced: "Si",
    deltaH0: -911,
    deltaS0: -103,
    energyPerKgMetal: 45,
    color: "#C9A227",
  },
  {
    id: "Al2O3",
    formula: "Al₂O₃",
    name: "Alumina",
    metalProduced: "Al",
    deltaH0: -1676,
    deltaS0: -180,
    energyPerKgMetal: 55,
    color: "#8A6FA8",
  },
];

// Fixed illustrative process temperature (K), in the molten regolith
// electrolysis range. Not user-adjustable — see "Model assumptions".
export const PROCESS_TEMP_K = 1873;

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

// Delta-G in kJ/mol, using the essays' Delta-G = Delta-H - T*Delta-S.
export function gibbsFreeEnergy(oxide: Oxide, tempK: number): number {
  return oxide.deltaH0 - (tempK * oxide.deltaS0) / 1000;
}

// Ellingham-style priority ordering: least stable oxide (highest / least
// negative Delta-G) is easiest to reduce and should be prioritized first
// when power is scarce.
export function rankByReducibility(oxides: Oxide[], tempK: number): Oxide[] {
  return [...oxides].sort(
    (a, b) => gibbsFreeEnergy(b, tempK) - gibbsFreeEnergy(a, tempK)
  );
}

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

// Throughput for a given oxide at a given power draw, in kg/hr.
export function throughputKgPerHr(oxide: Oxide, powerW: number): number {
  const kgPerSec = powerW / (oxide.energyPerKgMetal * 1e6);
  return kgPerSec * 3600;
}

export type CyclePoint = {
  hour: number;
  solarPowerW: number;
  batteryLevelKWh: number;
  totalPowerW: number;
};

// Precomputes the full-cycle power/battery trajectory at 1-hour resolution.
// Battery level is path-dependent, so it must be computed as a whole series
// rather than derived independently at each hour.
export function buildCycleSeries(
  collectorAreaM2: number,
  efficiency: number,
  storageCapacityKWh: number
): CyclePoint[] {
  const dtHours = 1;
  const batteryDischargeRateW =
    storageCapacityKWh > 0
      ? (storageCapacityKWh * 1000) / NIGHT_HOURS
      : 0;

  const series: CyclePoint[] = [];
  let batteryLevelKWh = storageCapacityKWh;

  for (let hour = 0; hour < CYCLE_HOURS; hour += dtHours) {
    const solar = solarPowerW(hour, collectorAreaM2, efficiency);

    let batteryPowerW = 0;
    if (solar > 0) {
      const chargeW = solar;
      const roomKWh = storageCapacityKWh - batteryLevelKWh;
      const chargeKWh = Math.min((chargeW * dtHours) / 1000, roomKWh);
      batteryLevelKWh = clamp(
        batteryLevelKWh + chargeKWh,
        0,
        storageCapacityKWh
      );
    } else {
      const availableKWh = batteryLevelKWh;
      const drawKWh = Math.min(
        (batteryDischargeRateW * dtHours) / 1000,
        availableKWh
      );
      batteryLevelKWh = clamp(
        batteryLevelKWh - drawKWh,
        0,
        storageCapacityKWh
      );
      batteryPowerW = (drawKWh * 1000) / dtHours;
    }

    series.push({
      hour,
      solarPowerW: solar,
      batteryLevelKWh,
      totalPowerW: solar + batteryPowerW,
    });
  }

  return series;
}

export type OxideRuntime = Oxide & {
  currentThroughputKgPerHr: number;
  cumulativeKg: number;
};

// Computes per-oxide current throughput (at the given hour) and cumulative
// production across the full series (a simple Riemann sum at 1-hour steps).
export function computeOxideRuntimes(
  series: CyclePoint[],
  currentHour: number
): OxideRuntime[] {
  const ranked = rankByReducibility(OXIDES, PROCESS_TEMP_K);
  const currentPoint =
    series.find((p) => p.hour === Math.floor(currentHour)) ?? series[0];

  return ranked.map((oxide) => {
    const cumulativeKg = series.reduce(
      (sum, point) => sum + throughputKgPerHr(oxide, point.totalPowerW),
      0
    );
    return {
      ...oxide,
      currentThroughputKgPerHr: throughputKgPerHr(
        oxide,
        currentPoint.totalPowerW
      ),
      cumulativeKg,
    };
  });
}
