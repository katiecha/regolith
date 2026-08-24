# Regolith Power Simulator: Model, Equations & Assumptions

A complete technical description of the lunar oxide-reduction simulator on the
`/simulator` page. This document is the ground truth for *why the numbers are
what they are*: every equation, constant, data source, and simplifying
assumption baked into the model.

All logic lives in one pure-function module, **`src/app/data/simulator.ts`**;
the React components under `src/app/components/simulator/` only render it. If
this document and the code ever disagree, the code wins, but they were written
together and cross-checked numerically (see [§11 Validation](#11-validation)).

---

## Table of contents

1. [Purpose & scope](#1-purpose--scope)
2. [The big picture (data flow)](#2-the-big-picture-data-flow)
3. [Notation & global constants](#3-notation--global-constants)
4. [Lunar day/night solar model](#4-lunar-daynight-solar-model)
5. [Battery / energy-storage model](#5-battery--energy-storage-model)
6. [Thermodynamics: ΔH, ΔS, ΔG as functions of temperature](#6-thermodynamics-δh-δs-δg-as-functions-of-temperature)
7. [Power → chemistry coupling (composition-weighted reduction)](#7-power--chemistry-coupling-composition-weighted-reduction)
8. [Oxygen production](#8-oxygen-production)
9. [Cumulative production & the time loop](#9-cumulative-production--the-time-loop)
10. [User controls](#10-user-controls)
11. [Validation](#11-validation)
12. [Complete list of assumptions & limitations](#12-complete-list-of-assumptions--limitations)
13. [Data sources](#13-data-sources)
14. [Roadmap to higher fidelity](#14-roadmap-to-higher-fidelity)
15. [Code map](#15-code-map)

---

## 1. Purpose & scope

The thesis behind the tool: **the Moon is free-energy constrained, not resource
constrained.** Lunar regolith is full of metal oxides (FeO, TiO₂, SiO₂, Al₂O₃,
…). Reducing them yields structural metals *and* oxygen, but every reduction is
thermodynamically uphill and must be driven by electrical energy. Available
solar power, buffered through a battery across the two-week lunar night, is
what actually gates how much you can produce.

The simulator ties three subsystems together:

1. **Energy supply**: a solar array + battery over one full lunar day/night cycle.
2. **Thermodynamics**: the temperature-dependent feasibility (ΔG) of each reduction, from real handbook data.
3. **Mass production**: how the available power converts into kilograms of metal and oxygen per hour, and cumulatively per cycle.

It is an **order-of-magnitude engineering model**, intended to build intuition
and compare scenarios, not a process-design or CFD tool. See
[§12](#12-complete-list-of-assumptions--limitations) for exactly where it is
simplified.

---

## 2. The big picture (data flow)

```
 user sliders                    pure functions (simulator.ts)                UI panels
 ────────────                    ─────────────────────────────                ─────────
 collector area  ┐
 efficiency      ├──►  buildCycleSeries() ──► CyclePoint[]  ──►  PowerCurveChart (solar + process power)
 battery kWh     ┘        (672 hourly points:                    BatteryMeter   (state of charge)
                           solar, battery SoC, process power)
                                     │
 temperature ────────────────────────┼──►  computeOxideRuntimes(series, hour, T)
                                     │        │
                                     │        ├─ composition-weighted power split ──► OxidePanel  (metal kg/hr, kg/cycle)
                                     │        └─ stoichiometric O₂ per metal      ──► OxygenPanel (O₂ kg/hr, kg/cycle)
                                     │
 temperature ────────────────────────┴──►  reactionGibbs / Enthalpy / Entropy(oxide, T)
                                              ├──► ThermoPanel     (ΔH, ΔS, ΔG per reaction)
                                              └──► EllinghamChart  (ΔG vs T curves)
```

Two independent axes:

- **Power/battery is temperature-independent**: `buildCycleSeries` does not take
  temperature. Turning the temperature slider does **not** rebuild the power
  curve.
- **Chemistry is temperature-dependent**: `computeOxideRuntimes` and the thermo
  functions all take `T`. (Note: temperature currently drives *feasibility and
  the thermo readouts*, not the electrical energy cost of reduction, see
  [§7.5](#75-why-energy-per-kg-is-decoupled-from-temperature).)

---

## 3. Notation & global constants

| Symbol | Code name | Value | Units | Meaning |
|---|---|---|---|---|
| $G_{sc}$ | `SOLAR_IRRADIANCE_W_M2` | 1361 | W/m² | Solar constant at 1 AU |
| $t_{day}$ | `DAY_HOURS` | 336 | h | Lunar daytime (14 Earth-days) |
| $t_{night}$ | `NIGHT_HOURS` | 336 | h | Lunar night (14 Earth-days) |
| $t_{cyc}$ | `CYCLE_HOURS` | 672 | h | Full synodic cycle |
| $\eta_{rt}$ | `ROUND_TRIP_EFFICIENCY` | 0.90 | – | Battery store→deliver efficiency |
| $T_{ref}$ | `REFERENCE_TEMPERATURE_K` | 298.15 | K | Thermodynamic reference temp |
| $T_0$ | `DEFAULT_TEMPERATURE_K` | 1873 | K | Default process temp (molten regolith) |
| – | `MIN/MAX_TEMPERATURE_K` | 300 / 2500 | K | Temperature slider range |
| – | `MIN/MAX_COLLECTOR_AREA_M2` | 10 / 1000 | m² | Array-area slider range |
| – | `MIN/MAX_EFFICIENCY` | 0.05 / 0.40 | – | System-efficiency slider range |
| – | `MIN/MAX_STORAGE_CAPACITY_KWH` | 0 / 5000 | kWh | Battery-size slider range |

Time is discretized at **Δt = 1 hour** for the whole cycle (672 steps).

---

## 4. Lunar day/night solar model

### 4.1 Equations

Solar intensity is modeled as a smooth half-sine during the day and zero at
night. For an hour $h$ within the cycle (`solarFraction`):

```
                ⎧ sin(π · h / t_day)     if 0 ≤ h < t_day   (daytime)
 f_solar(h)  =  ⎨
                ⎩ 0                       if h ≥ t_day       (night)
```

Instantaneous generated power (`solarPowerW`), given collector area $A$ (m²) and
system efficiency $\varepsilon$:

```
 P_solar(h) = G_sc · f_solar(h) · A · ε          [W]
```

At the defaults ($A=100\ \text{m}^2$, $\varepsilon=0.20$) the noon peak is
$1361 \times 1 \times 100 \times 0.20 = 27{,}220\ \text{W} \approx 27.2\ \text{kW}$,
and the energy collected over one daytime is ≈ 5822 kWh.

### 4.2 What "system efficiency" folds together

The single `efficiency` slider (5–40%) is a **lumped** wall-plug efficiency: PV
conversion × wiring/conditioning × any downstream electrical losses before the
reduction cell. It is deliberately coarse so one number sweeps the whole
supply-side sensitivity.

### 4.3 Assumptions

- **Idealized half-sine.** No incidence-angle (cosine) losses, no libration, no
  terrain shadowing, no dust degradation.
- **Symmetric 14/14-day cycle.** Real lunation is ~29.5 Earth-days and location-
  dependent; polar "peaks of eternal light" and permanently-shadowed regions
  (PSRs) are not modeled.
- **Fixed solar constant.** No Earth–Moon orbital distance variation.

These are all conservative-to-optimistic simplifications appropriate for an
equatorial, order-of-magnitude estimate.

---

## 5. Battery / energy-storage model

This is the "charge by day, discharge by night" subsystem. It is a
**path-dependent** integration over the whole cycle (state of charge at hour $h$
depends on all prior hours), so it is precomputed as a series in
`buildCycleSeries`.

### 5.1 Design intent

A reduction plant wants **steady** power, but solar is intermittent. The battery
time-shifts daytime surplus into the night. The model picks a **flat baseload
power** $P_{base}$ that the system can hold around the clock, runs the process at
that level whenever it can, banks daytime surplus above it, and draws the
battery down at night.

### 5.2 Choosing the baseload $P_{base}$ (`targetPowerW`)

The baseload is the **lesser** of two ceilings:

**(a) Energy-limited.** To hold $P_{base}$ for all 672 h, daytime supplies
$P_{base}\,t_{day}$ directly, and the night's $P_{base}\,t_{night}$ must be
banked first, but banking loses a round-trip factor, so you must collect
$P_{base}\,t_{night}/\eta_{rt}$ of solar for it. Total solar energy required
equals what's collected, $E_{solar}$:

```
 E_solar = P_base · ( t_day + t_night / η_rt )

                        E_solar
 ⟹  P_energy =  ─────────────────────────       [W]   (E_solar in Wh)
                  t_day + t_night / η_rt
```

**(b) Capacity-limited.** Even with unlimited sun, the battery can only deliver
$\eta_{rt}$ of its stored energy across the night:

```
              η_rt · C · 1000
 P_capacity = ─────────────────      [W]    (C = battery capacity in kWh)
                  t_night
```

```
 P_base = min( P_energy , P_capacity )
```

If capacity $C = 0$, then $P_{base} = 0$ and the process simply runs on
instantaneous solar (nothing at night).

> **Worked example** (defaults $A=100$, $\varepsilon=0.20$, $C=1000$ kWh):
> $E_{solar}=5822$ kWh ⟹ $P_{energy}= 5{,}822{,}000 / (336 + 336/0.9) = 8208$ W;
> $P_{capacity}= 0.9\times1000\times1000 / 336 = 2679$ W.
> So $P_{base} = 2679$ W, the 1000 kWh battery is the binding constraint here.

### 5.3 Hour-by-hour integration

Battery starts **empty at dawn** ($SoC_0 = 0$). For each hour, let
$P_{sol}=P_{solar}(h)$ and let $SoC$ be the current stored energy (kWh):

**No battery** ($C \le 0$): `process = P_sol` (follows solar; 0 at night).

**Surplus hour** ($P_{sol} \ge P_{base}$): run at baseload, bank the excess
(1:1 into storage), capped by remaining room. Any surplus that doesn't fit runs
the process now rather than being curtailed:

```
 surplus   = P_sol − P_base
 accepted  = min( surplus·Δt/1000 , C − SoC )          [kWh stored]
 SoC      += accepted
 process   = P_base + ( surplus − accepted·1000/Δt )   [W]
```

**Deficit hour** ($P_{sol} < P_{base}$; dawn/dusk/night): discharge to hold the
baseload if possible. Discharge delivers only $\eta_{rt}$ of what's drawn:

```
 deficit   = P_base − P_sol
 draw      = min( deficit·Δt/1000 / η_rt , SoC )       [kWh removed from SoC]
 SoC      −= draw
 delivered = draw · η_rt · 1000 / Δt                   [W]
 process   = P_sol + delivered   (≤ P_base)
```

Each `CyclePoint` records `{ hour, solarPowerW, batteryLevelKWh, totalPowerW }`,
where **`totalPowerW` is the actual process power** delivered that hour.

### 5.4 Round-trip efficiency convention

The 90% loss is applied **on discharge**: energy stores 1:1 but delivers at
$\eta_{rt}$. (Applying it on charge instead is mathematically equivalent for a
single round trip; discharge-side was chosen for readability.)

### 5.5 Energy conservation (a correctness invariant)

Total process energy over the cycle is bounded by collected solar energy:

```
 Σ process·Δt  =  E_solar − (1−η_rt)·E_banked − η_rt·SoC_final  ≤  E_solar
```

Verified numerically at defaults: solar 5822 kWh, process 5722 kWh, the 100 kWh
gap is exactly the round-trip loss on the ~1000 kWh cycled through the battery.

### 5.6 Behavior & known imperfections

- SoC sits at ~0 through the **morning shoulder** (solar below baseload, battery
  empty), climbs midday as surplus banks, plateaus if it fills, then drains
  through dusk + night. This is the textbook charge-by-day / discharge-by-night
  curve.
- The baseload $P_{base}$ is a **design setpoint**, not a guarantee. Because the
  afternoon shoulder also draws the battery, an undersized battery can empty
  before dawn, and the process power then falls toward the (zero) night solar.
- **SoC is not carried across the cycle wrap.** Each cycle is modeled
  independently starting empty; any charge left at hour 671 is discarded at the
  hour-0 restart. Cosmetic only, and negligible for right-sized batteries.

### 5.7 Assumptions

- Lossless storage except the single round-trip factor (no self-discharge, no
  depth-of-discharge derating, no C-rate limits, no degradation).
- No mass, volume, thermal, or cost penalty for the battery.
- The baseload heuristic assumes a well-behaved single daytime solar hump.

---

## 6. Thermodynamics: ΔH, ΔS, ΔG as functions of temperature

This is the "is the reduction even feasible, and how does that change with
temperature" subsystem. It uses **real standard-state data** and a
**heat-capacity (Kirchhoff) correction**, so ΔH, ΔS, and ΔG are genuine
functions of $T$.

### 6.1 Species dataset (298.15 K)

Each chemical species carries formation enthalpy, standard entropy, a
representative heat capacity, and molar mass (`Species` type). Values are from
the CRC Handbook / NIST-JANAF tables.

| Species | ΔfH° (kJ/mol) | S° (J·mol⁻¹·K⁻¹) | Cp (J·mol⁻¹·K⁻¹) | M (g/mol) |
|---|---:|---:|---:|---:|
| O₂ (g) | 0 | 205.15 | 29.38 | 32.00 |
| Fe (s) | 0 | 27.28 | 25.10 | 55.85 |
| Ti (s) | 0 | 30.63 | 25.02 | 47.87 |
| Si (s) | 0 | 18.81 | 19.99 | 28.09 |
| Al (s) | 0 | 28.30 | 24.20 | 26.98 |
| FeO (s), wüstite | −272.0 | 60.75 | 49.92 | 71.84 |
| TiO₂ (s), rutile | −944.0 | 50.62 | 55.02 | 79.87 |
| SiO₂ (s), α-quartz | −910.7 | 41.46 | 44.43 | 60.08 |
| Al₂O₃ (s), corundum | −1675.7 | 50.92 | 79.04 | 101.96 |

Elements in their standard state have ΔfH° = 0 by definition.

### 6.2 Reactions

Each oxide has a reduction written as **oxide → metal + O₂** with stoichiometric
coefficients (`Reaction` type):

| Oxide | Reaction (per formula unit) | O₂ coeff |
|---|---|---:|
| FeO | FeO → Fe + ½ O₂ | 0.5 |
| TiO₂ | TiO₂ → Ti + O₂ | 1.0 |
| SiO₂ | SiO₂ → Si + O₂ | 1.0 |
| Al₂O₃ | Al₂O₃ → 2 Al + 3⁄2 O₂ | 1.5 |

### 6.3 Reaction-level standard quantities (derived, not hand-entered)

Reaction values are computed as **Σ(products) − Σ(reactants)** from the species
table (functions `reactionDeltaH298`, `reactionDeltaS298`, `reactionDeltaCp`).
Deriving them this way guarantees the model can't drift out of internal
consistency. For a reaction with coefficients $\nu$:

```
 ΔrH°  = ν_metal·ΔfH°_metal + ν_O2·ΔfH°_O2 − ν_oxide·ΔfH°_oxide     [kJ]
 ΔrS°  = ν_metal·S°_metal   + ν_O2·S°_O2   − ν_oxide·S°_oxide       [J/K]
 ΔrCp  = ν_metal·Cp_metal   + ν_O2·Cp_O2   − ν_oxide·Cp_oxide       [J/K]
```

Because metals and O₂ have ΔfH° = 0, $\Delta_rH° = -\nu_{oxide}\,\Delta_fH°_{oxide}$
That is, reduction enthalpy is just the (positive) reverse of formation.

### 6.4 Temperature dependence (Kirchhoff, constant-Cp)

Holding Cp constant between $T_{ref}$ and $T$ (the intended approximation):

```
 ΔrH(T) = ΔrH° + ΔrCp · (T − T_ref)                    [ (J→kJ on the Cp term) ]
 ΔrS(T) = ΔrS° + ΔrCp · ln(T / T_ref)
 ΔrG(T) = ΔrH(T) − T · ΔrS(T)
```

### 6.5 Normalization: per mole of O₂ (Ellingham convention)

All three exported functions (`reactionEnthalpy`, `reactionEntropy`,
`reactionGibbs`) divide by the O₂ coefficient, so results are **per mole of O₂**.
This is the Ellingham-diagram convention and puts all four reductions on one
comparable energy axis (otherwise Al₂O₃'s 1.5-O₂ stoichiometry would look
artificially expensive). In code:

```ts
reactionEnthalpy(oxide, T) = [ ΔrH° + (ΔrCp/1000)·(T − 298.15) ] / ν_O2   // kJ/mol O₂
reactionEntropy(oxide, T)  = [ ΔrS° +  ΔrCp     ·ln(T/298.15) ] / ν_O2    // J/(mol O₂·K)
reactionGibbs(oxide, T)    = reactionEnthalpy − T·reactionEntropy/1000    // kJ/mol O₂
```

Derived per-mole-O₂ standard quantities:

| Reaction (per mol O₂) | ΔrH° (kJ) | ΔrS° (J/K) | ΔrCp (J/K) |
|---|---:|---:|---:|
| 2 FeO → 2 Fe + O₂ | 544.0 | 138.21 | −20.26 |
| SiO₂ → Si + O₂ | 910.7 | 182.50 | +4.94 |
| TiO₂ → Ti + O₂ | 944.0 | 185.16 | −0.62 |
| ⅔ Al₂O₃ → 4⁄3 Al + O₂ | 1117.1 | 208.94 | +8.95 |

> **Worked example, FeO at 1873 K (per mol O₂):**
> ΔrH = 544.0 + (−20.26/1000)(1873−298.15) = 544.0 − 31.9 = **512.1 kJ**
> ΔrS = 138.21 + (−20.26)·ln(1873/298.15) = 138.21 − 37.2 = **101.0 J/K**
> ΔrG = 512.1 − 1873·(101.0/1000) = 512.1 − 189.1 = **+323.0 kJ**

### 6.6 Reducibility ranking

`rankByReducibility` sorts oxides by **ascending** ΔrG(T). Because these are
*reduction* ΔG values, they are **positive** (reduction is non-spontaneous), and
the least-positive one is the least stable oxide, easiest to reduce.

> ⚠️ **Sign convention pitfall.** The earlier prototype stored *formation* ΔG
> (negative) and sorted descending. Reduction ΔG flips the sign, so the sort had
> to flip to ascending. Both orderings happen to give the same sequence
> (FeO → SiO₂ → TiO₂ → Al₂O₃), so a wrong sign would be visually subtle, hence
> the explicit note.

### 6.7 The Ellingham chart (sign convention)

`EllinghamChart` plots **reduction ΔG per mole O₂** vs temperature. Because these
are reduction (not formation) values, all four lines are **positive** and stay
positive across the whole 300–2500 K range, they never cross zero. That is the
correct teaching signal: **heat alone never frees the oxygen** from these oxides;
electrolysis supplies the remaining free energy. "Lower on the chart = easier to
reduce," consistent with the throughput bars.

### 6.8 Assumptions & caveats

- **Constant Cp / no phase transitions.** We ignore heat-capacity variation with
  T and, critically, **latent heats of fusion**. At 1873 K several species are
  actually molten (Fe mp 1811 K, Si 1687 K, Al 933 K, FeO ~1650 K), so real
  Ellingham lines *kink* at melting points; ours are smooth. The dominant error
  is the missing fusion enthalpies (tens of kJ), not the Cp approximation. This
  does **not** change the reducibility ordering.
- **FeO is the least-certain species.** Wüstite is non-stoichiometric (≈Fe₀.₉₄₇O),
  so its reported ΔfH° and S° vary between sources.
- **Single process temperature** applied to all reactions. Real processes each
  have their own operating window and pathway.
- ΔG here is a **thermodynamic feasibility** indicator. It is intentionally *not*
  the same quantity as the electrical energy cost of reduction, see §7.5.

---

## 7. Power → chemistry coupling (composition-weighted reduction)

This is the "how does available power become kilograms" subsystem
(`computeOxideRuntimes`). The key modeling choice: **all four oxides reduce
simultaneously**, as in molten-regolith electrolysis, sharing the power budget
in proportion to the feedstock composition. This makes per-oxide outputs sum to
an honest total (no double-counting of the power).

### 7.1 Feedstock composition

Approximate mare-regolith oxide mass fractions (`regolithMassFraction`):

| Oxide | wt% (raw) | renormalized over these 4 |
|---|---:|---:|
| SiO₂ | 45% | 0.570 |
| Al₂O₃ | 15% | 0.190 |
| FeO | 15% | 0.190 |
| TiO₂ | 4% | 0.051 |

Raw fractions sum to 79%; the remaining ~21% (MgO, CaO, …) is **not modeled**, so
we renormalize over the four oxides: $w_i = \text{wt}\%_i / \sum \text{wt}\%$.

### 7.2 Per-oxide conversion factors

```
 metalMassPerOxideMass(i)   = (ν_metal · M_metal) / (ν_oxide · M_oxide)   [kg metal / kg oxide]
 energyPerKgOxide(i)        = energyPerKgMetal_i · 1e6 · metalMassPerOxideMass(i)   [J / kg oxide]
```

where `energyPerKgMetal` is the empirical electrical specific energy per oxide
(Fe 7, Ti 30, Si 45, Al 55 MJ/kg, Al's ~15 kWh/kg matches industrial
Hall–Héroult).

| Oxide | kg metal / kg oxide | energyPerKgMetal (MJ/kg) | ⟹ MJ / kg oxide |
|---|---:|---:|---:|
| FeO | 0.777 | 7 | 5.44 |
| TiO₂ | 0.599 | 30 | 17.98 |
| SiO₂ | 0.468 | 45 | 21.04 |
| Al₂O₃ | 0.529 | 55 | 29.10 |

### 7.3 The power split

Treat the plant as processing a single stream of regolith. The energy to reduce
1 kg of the feedstock **mix** is the composition-weighted average:

```
 e_reg = Σ_i  w_i · energyPerKgOxide(i)              [J / kg regolith]
```

At default composition, $e_{reg} \approx 19.45\ \text{MJ/kg}$. Given the current
process power $P$ (= `totalPowerW`), the feedstock throughput and per-oxide
outputs are:

```
 ṁ_reg(P)   = P / e_reg · 3600                       [kg regolith / hr]
 metal_i    = w_i · ṁ_reg · metalMassPerOxideMass(i) [kg metal / hr]
```

Because each oxide's share of the power equals its share of the feedstock's total
reduction energy, the metal outputs are automatically **energy-consistent**:
$\sum_i \text{metal}_i \cdot \text{energyPerKgMetal}_i \cdot 10^6 / 3600 = P$.

> **Worked example** at $P = 8200$ W: $\dot m_{reg} = 1.52$ kg/hr, giving Si 0.40,
> Fe 0.22, Al 0.15, Ti 0.05 kg/hr of metal. Reconstructing the power from those
> outputs returns 8200 W exactly, energy is conserved, nothing double-counted.

### 7.4 Why this replaced the old "menu" model

The prototype showed each oxide *as if it received the entire power budget* (a
menu of alternatives). Those rows could not be summed, doing so would count the
power 4×. The composition-weighted model reduces everything at once, so the
metal panel and the oxygen total are now physically additive.

### 7.5 Why energy-per-kg is decoupled from temperature

`energyPerKgMetal` is an **empirical electrical** specific energy, it bundles
cell voltage, overpotential, and Faradaic efficiency for a real reduction cell.
That is a different quantity from the **thermal** ΔG(T) in §6. We deliberately
keep them separate: the temperature slider changes the *thermodynamic feasibility
story* (ΔG, Ellingham), while the *mass-throughput economics* use the fixed
empirical energy. Coupling them (deriving energy cost from ΔG(T) plus
overpotentials) is future work, see [§14](#14-roadmap-to-higher-fidelity).

### 7.6 Assumptions

- **Simultaneous reduction in feedstock proportion.** Real molten-regolith
  electrolysis is **voltage-gated**: at a given cell voltage the least-stable
  oxide (FeO) reduces preferentially, and more-stable oxides (Al₂O₃) only join at
  higher voltage. We ignore that selectivity.
- **MgO and CaO excluded** from the feedstock (the model only tracks four
  oxides), so the composition is renormalized over the four.
- **Fixed electrical specific energy** per oxide (no temperature, purity, or
  scale dependence).

---

## 8. Oxygen production

Oxygen is the headline ISRU product, for life support and, especially, as
propellant oxidizer (the bulk of a rocket's propellant mass by weight). Every
reduction co-produces it.

### 8.1 Stoichiometry

Per kilogram of metal reduced, the co-produced O₂ mass is fixed by stoichiometry
(`oxygenPerMetalMassRatio`):

```
 O₂ per metal (i) = (ν_O2 · M_O2) / (ν_metal · M_metal)     [kg O₂ / kg metal]
```

| Oxide | reaction | kg O₂ / kg metal |
|---|---|---:|
| FeO | FeO → Fe + ½O₂ | 16.00 / 55.85 = **0.286** |
| TiO₂ | TiO₂ → Ti + O₂ | 32.00 / 47.87 = **0.668** |
| SiO₂ | SiO₂ → Si + O₂ | 32.00 / 28.09 = **1.139** |
| Al₂O₃ | Al₂O₃ → 2Al + 3⁄2O₂ | 48.00 / 53.96 = **0.890** |

Silicon is the standout: reducing SiO₂ yields more oxygen than silicon by mass.

### 8.2 Throughput

```
 O₂_i = metal_i · oxygenPerMetalMassRatio(i)      [kg O₂ / hr]
 O₂_total = Σ_i O₂_i
```

At the default operating point (~2.7 kW night baseload / 27 kW solar peak), total
O₂ is order ~0.7 kg/hr, dominated by the SiO₂ reduction because SiO₂ is both the
largest feedstock fraction and the richest O₂ source per kg metal.

---

## 9. Cumulative production & the time loop

### 9.1 Cumulative mass (per cycle)

Cumulative metal and O₂ are simple 1-hour Riemann sums over the whole 672-point
series (each point represents one hour):

```
 cumulativeMetal_i = Σ_points  metal_i(P_point)
 cumulativeO₂_i    = Σ_points  O₂_i(P_point)
```

Because `metal_i` is linear in power, this is equivalent to integrating the
process-power curve and converting once.

### 9.2 The animation clock

`PowerSimulator` (the one stateful client component) advances a simulated clock
with `requestAnimationFrame`:

- `HOURS_PER_SECOND = 8`: 8 simulated hours per real second.
- `timeHours` wraps modulo `CYCLE_HOURS` (672), so playback loops the cycle.
- Dragging the time slider scrubs `timeHours` and pauses playback.
- `currentHour = Math.floor(timeHours)` indexes the precomputed series for the
  live readouts (current power, SoC, throughput).

The heavy series (`buildCycleSeries`, `computeOxideRuntimes`) are memoized; the
power series recomputes only when area/efficiency/battery change, and the
chemistry recomputes when the series or temperature change.

---

## 10. User controls

| Control | State | Range | Default | Drives |
|---|---|---|---|---|
| Time (play/scrub) | `timeHours` | 0–672 h | 0 | Which hour is "now" |
| Collector area | `collectorArea` | 10–1000 m² | 100 | Solar power |
| System efficiency | `efficiency` | 5–40% | 20% | Solar power |
| Battery capacity | `storageCapacityKWh` | 0–5000 kWh | 1000 | Baseload & night survival |
| Process temperature | `temperatureK` | 300–2500 K | 1873 | ΔH/ΔS/ΔG, Ellingham, ranking |

All slider inputs are clamped to their min/max in `PowerSimulator`.

---

## 11. Validation

The thermodynamics were checked against published values and the mass/energy
balances against hand calculation.

**ΔG at 298.15 K reproduces published ΔfG° per mole O₂** (best evidence the
dataset + formulas are internally correct):

| Oxide | model ΔG(298) | published ΔfG°₂₉₈ (per mol O₂) |
|---|---:|---:|
| FeO | 502.8 | 502.8 |
| SiO₂ | 856.3 | 856.3 |
| TiO₂ | 888.8 | 888.8 |
| Al₂O₃ | 1054.8 | 1054.9 |

**ΔG at 1873 K (per mole O₂):** FeO +323.0, SiO₂ +559.7, TiO₂ +598.4,
Al₂O₃ +709.1 kJ. Ordering easiest→hardest **FeO < SiO₂ < TiO₂ < Al₂O₃**; all
positive and non-crossing from 300–2500 K.

**O₂ yields:** 0.286 / 0.668 / 1.139 / 0.890 kg O₂ per kg metal (FeO/TiO₂/SiO₂/Al₂O₃).

**Battery/energy balance** (defaults + 1000 kWh): SoC starts 0 at dawn, peaks at
full, returns to 0; process energy 5722 kWh ≤ solar 5822 kWh (Δ = round-trip
loss). With capacity 0, night process power = 0.

**Power split:** reconstructing input power from the per-oxide metal outputs
returns the exact process power (energy conserved).

The build passes `next build` (TypeScript strict) and `eslint` cleanly.

---

## 12. Complete list of assumptions & limitations

Consolidated, in roughly decreasing order of impact:

**Thermodynamics**
1. Constant Cp; **no phase-transition / fusion enthalpies** (several species are
   molten at process temperature, real Ellingham lines kink; ours don't).
2. FeO/wüstite data are non-stoichiometric and source-dependent.
3. A single process temperature is applied to all reactions.
4. ΔG is a feasibility indicator, **decoupled from the electrical energy cost**
   used for throughput.

**Power → mass coupling**
5. All oxides reduce **simultaneously in feedstock proportion**; real
   electrolysis is voltage-gated (FeO before Al₂O₃).
6. MgO/CaO (and everything beyond the four oxides) excluded; composition
   renormalized over four.
7. Fixed empirical `energyPerKgMetal` per oxide (no T/scale/purity dependence).

**Energy supply & storage**
8. Idealized half-sine solar; no incidence angle, dust, libration, terrain, or
   PSR effects; symmetric 14/14-day cycle.
9. Single lumped "system efficiency."
10. Battery lossless except a 90% round-trip factor; no self-discharge, DoD
    derating, C-rate, degradation, mass, or cost.
11. Battery starts empty each dawn; SoC not carried across the cycle wrap.
12. Baseload is a design setpoint, not guaranteed, an undersized battery can
    empty before dawn.

**General**
13. Order-of-magnitude engineering model, not a validated process design.

---

## 13. Data sources

- **Thermodynamic data** (ΔfH°, S°, Cp, at 298.15 K): CRC Handbook of Chemistry
  and Physics; NIST-JANAF Thermochemical Tables. Values are standard-state,
  solid phase (rutile TiO₂, α-quartz SiO₂, corundum Al₂O₃, wüstite FeO).
- **Solar constant:** 1361 W/m² (nominal total solar irradiance at 1 AU).
- **Lunar day/night length:** ~14 Earth-days each (synodic-month approximation).
- **Regolith composition:** approximate lunar mare (basaltic) oxide weight
  fractions.
- **Al specific energy** cross-check: industrial Hall–Héroult ≈ 13–15 kWh/kg Al.
- **Framing essays** (linked from the site): *Metallurgy for a Vacuum World* and
  *Energy for a Vacuum World*.

> Note: handbook values are transcribed constants in `simulator.ts`, chosen for
> order-of-magnitude fidelity. For a publication-grade model, re-source each
> value with an explicit citation and uncertainty.

---

## 14. Roadmap to higher fidelity

Concrete upgrades, roughly easiest → hardest:

- **Full Shomate/JANAF Cp(T)** polynomials plus fusion enthalpies, so ΔG(T) kinks
  correctly at melting points.
- **Voltage-gated reduction:** allocate power by reduction potential rather than
  raw feedstock fraction, so FeO reduces before Al₂O₃ as cell voltage rises.
- **Couple energy cost to thermodynamics:** derive electrical energy from ΔG(T)
  plus a modeled overpotential and Faradaic efficiency, so the temperature slider
  affects throughput too.
- **Feedstock composition inputs:** let the user pick mare vs highlands vs a
  specific landing site; add MgO/CaO.
- **Realistic solar:** latitude, incidence angle, dust degradation, true 29.5-day
  lunation, and a PSR/peak-of-eternal-light option.
- **Battery realism:** charge/discharge efficiency split, DoD limits, degradation,
  and mass/cost so battery size trades against launch mass.
- **Steady-state cycling:** carry SoC across cycles and iterate to a periodic
  steady state instead of resetting to empty each dawn.

---

## 15. Code map

| File | Responsibility |
|---|---|
| `src/app/data/simulator.ts` | **All** data + physics: species/reactions, thermo functions, solar model, battery integration, composition-weighted reduction, oxygen. |
| `src/app/components/simulator/power-simulator.tsx` | Stateful client component: sliders, RAF clock, memoized series, composes all panels. |
| `…/power-curve-chart.tsx` | Solar vs process-power curve (inline SVG). |
| `…/battery-meter.tsx` | Battery state-of-charge readout. |
| `…/simulator-controls.tsx` | Sliders (area, efficiency, battery, temperature) + play/pause. |
| `…/thermo-panel.tsx` | Per-reaction ΔH/ΔS/ΔG at current T. |
| `…/ellingham-chart.tsx` | ΔG-vs-T curves with a temperature marker. |
| `…/oxide-panel.tsx` | Per-oxide metal throughput bars. |
| `…/oxygen-panel.tsx` | Total + per-oxide O₂ production. |
| `…/model-assumptions.tsx` | In-app short version of §12. |

Key functions in `simulator.ts`: `solarFraction`, `solarPowerW`,
`buildCycleSeries`, `reactionEnthalpy`, `reactionEntropy`, `reactionGibbs`,
`rankByReducibility`, `metalMassPerOxideMass`, `oxygenPerMetalMassRatio`,
`computeOxideRuntimes`.
