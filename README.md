# EcoTech PU — Campus Resource Intelligence Dashboard
**Presidency University, Bengaluru · IEEE 5-Hour Hackathon (Round 2 Build)**

EcoTech PU is a professional, responsive campus resource intelligence dashboard engineered for Presidency University, Bengaluru. It provides multi-resource anomaly detection, evidence-backed actionable recommendations, and explainable prioritization across electricity, water, and solid waste.

---

## 1. Quick Startup Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (verifies detection rules, scoring, and CSV validator)
npm test

# 3. Start local development server (runs on port 3000)
npm run dev

# 4. Compile and verify production build
npm run build
```

---

## 2. Product Features & Modules

### A. Energy Surveillance (Electricity - kWh)
- **Hourly Baseline Profiling**: Evaluates hourly telemetry against quiescent operational baselines across campus facilities (Academic Blocks 1 & 2, Hostels, Food Court, Library, Sports Complex).
- **After-Hours Inefficiency Rule**: Identifies continuous elevated draw between 21:00 and 06:00 (e.g. Academic Block 2 chiller/benchtop draw: +363 kWh excess).
- **Sustained Peak Overload Rule**: Detects multi-hour daytime surges exceeding contract demand thresholds.
- **University Reference Benchmark**: Contextualized against Presidency University's reported **~800 units/day (kWh/day)** of rooftop solar PV generation.

### B. Water Surveillance (Litres)
- **Hydraulic Quiescent Profiling**: Tracks continuous volume across campus blocks.
- **Nocturnal Investigation Trigger**: Flags anomalous sustained flow between 01:00 and 05:00 in non-residential buildings (e.g. Academic Block 1: 850 L/hr vs baseline 70 L/hr).
- **Crucial Compliance Rule**: Overnight deviations are explicitly framed as **investigation triggers** for manual plumbing audits (e.g., float valves, flapper seals), **not proof of a pipe breach or verified resource waste**.
- **University Reference Benchmark**: Contextualized against Presidency University's on-site Sewage Treatment Plant (STP) reported reuse benchmark of **~300,000 litres/day (300 kL/day)**.

### C. Waste & Circularity (Solid Waste - kg)
- **Category-Level Audit**: Monitors organic food waste, dry recyclables, and residual mixed waste.
- **Food Discard Surges**: Detects kitchen prep surges and post-event banqueting waste (recommending portion forecasting and aerobic composting).
- **Low Segregation Ratio**: Flags locations where mixed waste exceeds 50% of volume (recommending color-coded tri-bin stations and green marshals).
- **University Reference Benchmark**: Contextualized against Presidency University's reported campus food waste figure of **~120–150 kg/day**.

### D. Explainable Prioritization Algorithm
Physical quantities from different dimensions (`kWh`, `Litres`, and `kg`) are **never added together**. Instead, an explainable dimensionless score (0–100) is computed:

$$\text{Priority Score} = \frac{(\text{Severity}_{0-40} + \text{Persistence}_{0-30}) \times \text{Confidence Multiplier}}{\text{Effort Divisor}} \times \frac{100}{70}$$

- **Severity (0–40 pts)**: Proportional to relative percentage excess above baseline.
- **Persistence (0–30 pts)**: Multi-hour sustained vs. transient occurrences.
- **Confidence Multiplier**: High = 1.0, Moderate = 0.85, Low = 0.70.
- **Effort Divisor**: Low Effort = 1.0 (favors rapid payback), Medium = 1.25, High = 1.60.

### E. Tariff Policy & Cost Assumptions
EcoTech PU **strictly avoids inventing unverified commercial tariffs or arbitrary rupee savings**:
- Cost calculations are disabled by default until verified commercial schedules (e.g., BESCOM HT-2c tariff or BWSSB bulk rates) are configured.
- When unset, economic impacts are transparently disclosed as: *"Cost impact cannot yet be calculated reliably without verified tariff agreements."*
- A configurable Tariff Policy modal allows judges and facility managers to input or test hypothetical rates with full disclosure.

### F. Corrective Action Workflow ("Measure → Detect → Act → Verify")
- **Workflow State Pipeline**: `Detected` → `Acknowledged` → `Investigating` → `Repair Reported` → `Awaiting Verification` → `Verified Improvement` / `No Improvement` / `Inconclusive`.
- **One-Click Task Initialization**: Every algorithmic recommendation contains a "Create Action Task" button prefilling finding, baseline, observed excess, and suggested action, with assigned owner and due date.
- **Empirical Follow-Up Verification**:
  - Compares follow-up measurements against original baseline and peak observations using consistent units (`kWh`, `Litres`, `kg`).
  - Enforces operational comparability checks (same shift/nocturnal hours).
  - Flags insufficient data as `Inconclusive`.
  - Marks `Verified Improvement` only upon significant empirical return toward baseline.
  - Transparent disclosure: *"Reduction correlates with reported corrective intervention; not definitive proof that all underlying root causes are permanently resolved."*

---

## 3. CSV Ingestion Schemas

Users can upload custom CSV records or download ready-to-use sample templates directly inside the UI.

### 1. Energy CSV Schema
- **File Format**: UTF-8 comma-separated text.
- **Headers**: `timestamp,location,observed_kwh,baseline_kwh,[notes]`
- **Example**:
  ```csv
  timestamp,location,observed_kwh,baseline_kwh,notes
  2026-10-26T00:00:00Z,Academic Block 1,18.5,18.0,Baseline night quiescent
  2026-10-26T02:00:00Z,Academic Block 1,78.4,15.0,Unusual after-hours high draw
  2026-10-26T09:00:00Z,Academic Block 1,110.0,110.0,Academic morning classes
  ```

### 2. Water CSV Schema
- **File Format**: UTF-8 comma-separated text.
- **Headers**: `timestamp,location,observed_litres,baseline_litres,[notes]`
- **Example**:
  ```csv
  timestamp,location,observed_litres,baseline_litres,notes
  2026-10-26T00:00:00Z,Academic Block 1,80,80,Normal midnight baseline
  2026-10-26T02:00:00Z,Academic Block 1,920,65,Overnight flow investigation trigger
  2026-10-26T10:00:00Z,Academic Block 1,1350,1350,Standard daytime student usage
  ```

### 3. Waste CSV Schema
- **File Format**: UTF-8 comma-separated text.
- **Headers**: `date,location,food_waste_kg,recyclable_waste_kg,mixed_waste_kg,[baseline_total_kg,notes]`
- **Example**:
  ```csv
  date,location,food_waste_kg,recyclable_waste_kg,mixed_waste_kg,baseline_total_kg,notes
  2026-10-20,University Food Court,130.0,45.0,35.0,210.0,Standard weekday audit
  2026-10-22,University Food Court,215.0,35.0,95.0,210.0,Event meal surplus
  2026-10-23,Academic Block 1,14.0,8.0,46.0,70.0,High mixed waste ratio (>65%)
  ```

---

## 4. Test Verification Report

A dedicated automated test suite (`npm test` / `test/run-tests.ts`) validates all mathematical and behavioral invariants:
- **Prioritization Scoring Integrity**: Boundary limits (1–100), severity caps, persistence scales, and relative urgency ranking.
- **Nominal Telemetry Safety**: Ensures nominal baselines trigger zero false positives.
- **Energy Detection Rules**: Verifies after-hours inefficiency detection and excess kWh calculations.
- **Water Overnight Rule**: Confirms nocturnal flow is framed as an investigation trigger rather than proven waste.
- **Waste Segregation Rules**: Validates food waste surge detection and composting recommendations.
- **CSV Ingestion & Validation**: Validates schema recognition, missing header rejections, negative value rejections, and date parsing.
- **Hypothetical Intervention Simulation**: Verifies multi-policy modeling and resource recovery math.
- **Action Workflow & Verification Engine**: Validates state transition graph, invalid transition rejections, follow-up calculation correctness, inconclusive data handling, and scientific disclaimers.
- **Persistence & Provenance**: Validates JSON serialization integrity of action tasks, history logs, and simulated demo provenance tagging.

**Execution Result**: **59 / 59 Tests Passed (0 Failed)**.
