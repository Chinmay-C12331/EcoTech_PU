/**
 * Deterministic Synthetic Demo Data Generator
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Every record is explicitly tagged with isSimulated: true.
 * Planted anomalies demonstrate algorithmic classification across all resources.
 */

import { EnergyReading, WaterReading, WasteReading, CampusLocation } from '../types/resource';

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  'Academic Block 1',
  'Academic Block 2',
  'Hostel Cluster A & B',
  'University Food Court',
  'Central Library & Admin',
  'Sports Complex & Auditorium'
];

/**
 * Deterministic PRNG (Linear Congruential Generator)
 * Ensures reproducible readings across reloads and test runs.
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate 72 hours of hourly Energy readings across campus locations.
 * Includes intentional planted anomalies:
 * 1. Academic Block 2: After-hours excessive consumption (01:00 - 05:00 on Day 3)
 * 2. Academic Block 1: Sustained peak overload during academic hours (11:00 - 15:00 on Day 2)
 */
export function generateSyntheticEnergyData(): EnergyReading[] {
  const readings: EnergyReading[] = [];
  const rand = seededRandom(42);
  const baseDate = new Date('2026-10-25T00:00:00Z');

  // Baseline templates by hour (0 to 23)
  const academicBaseProfile = [
    18, 16, 15, 15, 17, 22, 35, 65, 95, 110, 115, 118,
    112, 115, 110, 105, 90, 70, 50, 38, 28, 22, 20, 19
  ];
  const hostelBaseProfile = [
    30, 25, 22, 20, 24, 38, 65, 80, 55, 45, 40, 42,
    48, 50, 45, 42, 50, 72, 95, 105, 98, 80, 55, 40
  ];
  const foodCourtBaseProfile = [
    12, 10, 10, 10, 12, 20, 45, 80, 95, 85, 120, 135,
    140, 130, 90, 75, 80, 110, 125, 115, 80, 40, 20, 14
  ];

  for (let hourOffset = 0; hourOffset < 72; hourOffset++) {
    const current = new Date(baseDate.getTime() + hourOffset * 3600 * 1000);
    const hour = current.getUTCHours();
    const dateStr = current.toISOString().split('T')[0];
    const isAfterHours = hour >= 21 || hour < 6;

    for (const location of CAMPUS_LOCATIONS) {
      let baseline = 30;
      let profile = academicBaseProfile;

      if (location.includes('Hostel')) profile = hostelBaseProfile;
      else if (location.includes('Food Court')) profile = foodCourtBaseProfile;
      else if (location.includes('Sports')) profile = academicBaseProfile.map(v => Math.round(v * 0.45));
      else if (location.includes('Library')) profile = academicBaseProfile.map(v => Math.round(v * 0.7));

      baseline = profile[hour];
      // Normal variation +/- 5%
      const jitter = (rand() - 0.5) * 0.1 * baseline;
      let observed = Math.max(5, Math.round((baseline + jitter) * 10) / 10);
      let flagged = false;
      let anomalyType: EnergyReading['anomalyType'] = 'none';
      let notes = 'Simulated nominal telemetry';

      // Planted Anomaly 1: Academic Block 2 - Sustained After-Hours Inefficiency on Day 3 (Hours 49 to 53 -> 01:00 to 05:00)
      if (location === 'Academic Block 2' && hourOffset >= 49 && hourOffset <= 53) {
        observed = Math.round((baseline * 3.8 + 25) * 10) / 10; // ~82 kWh vs baseline ~15 kWh
        flagged = true;
        anomalyType = 'after_hours_inefficiency';
        notes = 'Planted anomaly: Central AC chillers & lab test bench left active overnight without occupancy.';
      }

      // Planted Anomaly 2: Academic Block 1 - Sustained Peak Daytime Overload on Day 2 (Hours 35 to 39 -> 11:00 to 15:00)
      if (location === 'Academic Block 1' && hourOffset >= 35 && hourOffset <= 39) {
        observed = Math.round((baseline * 1.55) * 10) / 10; // ~180 kWh vs baseline ~115 kWh
        flagged = true;
        anomalyType = 'sustained_peak_overload';
        notes = 'Planted anomaly: Concurrent seminar auditorium chillers + computer labs exceeding contract demand.';
      }

      readings.push({
        id: `eng-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${hourOffset}`,
        timestamp: current.toISOString(),
        hour,
        date: dateStr,
        location,
        observedKwh: observed,
        baselineKwh: baseline,
        isAfterHours,
        isSimulated: true,
        flagged,
        anomalyType,
        notes
      });
    }
  }

  return readings;
}

/**
 * Generate 72 hours of hourly Water readings across campus locations.
 * Includes intentional planted anomalies:
 * 1. Academic Block 1: Unusual Overnight Flow between 01:00 - 05:00 on Day 3.
 *    (Disclosed as an investigation trigger, NOT proof of a leak).
 * 2. Food Court: High daytime surge on Day 2 afternoon.
 */
export function generateSyntheticWaterData(): WaterReading[] {
  const readings: WaterReading[] = [];
  const rand = seededRandom(108);
  const baseDate = new Date('2026-10-25T00:00:00Z');

  // Baseline hourly litres
  const academicBaseProfile = [
    80, 70, 65, 65, 80, 120, 300, 750, 1200, 1350, 1400, 1450,
    1300, 1400, 1350, 1250, 1100, 750, 450, 300, 180, 140, 110, 90
  ];
  const hostelBaseProfile = [
    350, 250, 200, 180, 300, 950, 2400, 3100, 2200, 1500, 1100, 1200,
    1400, 1350, 1100, 1200, 1600, 2500, 3200, 3000, 2400, 1600, 900, 500
  ];
  const foodCourtBaseProfile = [
    90, 80, 80, 80, 120, 250, 600, 1100, 1300, 1400, 1900, 2300,
    2500, 2400, 1800, 1500, 1700, 2200, 2400, 2100, 1400, 600, 250, 120
  ];

  for (let hourOffset = 0; hourOffset < 72; hourOffset++) {
    const current = new Date(baseDate.getTime() + hourOffset * 3600 * 1000);
    const hour = current.getUTCHours();
    const dateStr = current.toISOString().split('T')[0];
    const isOvernightWindow = hour >= 1 && hour <= 5;

    for (const location of CAMPUS_LOCATIONS) {
      let baseline = 100;
      let profile = academicBaseProfile;

      if (location.includes('Hostel')) profile = hostelBaseProfile;
      else if (location.includes('Food Court')) profile = foodCourtBaseProfile;
      else if (location.includes('Sports')) profile = academicBaseProfile.map(v => Math.round(v * 0.5));
      else if (location.includes('Library')) profile = academicBaseProfile.map(v => Math.round(v * 0.6));

      baseline = profile[hour];
      const jitter = (rand() - 0.5) * 0.08 * baseline;
      let observed = Math.max(20, Math.round(baseline + jitter));
      let flagged = false;
      let anomalyType: WaterReading['anomalyType'] = 'none';
      let notes = 'Simulated nominal telemetry';

      // Planted Anomaly 1: Academic Block 1 - Unusual overnight continuous flow (Day 3, hours 49-53 -> 01:00 to 05:00)
      if (location === 'Academic Block 1' && hourOffset >= 49 && hourOffset <= 53) {
        observed = Math.round(baseline * 11.5); // ~800-900 L/hr vs baseline ~70 L/hr
        flagged = true;
        anomalyType = 'unusual_overnight_flow';
        notes = 'Planted anomaly: Suspected unseated flush valve or supply bypass; trigger for physical maintenance inspection.';
      }

      // Planted Anomaly 2: University Food Court - Afternoon surge during dishwashing cycle
      if (location === 'University Food Court' && hourOffset >= 37 && hourOffset <= 39) {
        observed = Math.round(baseline * 1.85); // ~4,400 L/hr vs baseline ~2,400 L/hr
        flagged = true;
        anomalyType = 'daytime_surge';
        notes = 'Planted anomaly: High-rate dishwashing line left on continuous open-flow rinse.';
      }

      readings.push({
        id: `wat-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${hourOffset}`,
        timestamp: current.toISOString(),
        hour,
        date: dateStr,
        location,
        observedLitres: observed,
        baselineLitres: baseline,
        isOvernightWindow,
        isSimulated: true,
        flagged,
        anomalyType,
        notes
      });
    }
  }

  return readings;
}

/**
 * Generate 14 days of daily Waste records across campus locations.
 * Categories: food_waste_kg, recyclable_waste_kg, mixed_waste_kg.
 * Includes intentional planted anomalies:
 * 1. University Food Court: Major food waste spike & mixed waste escalation.
 * 2. Academic Block 1: Low segregation rate (mixed waste > 65% of total).
 */
export function generateSyntheticWasteData(): WasteReading[] {
  const readings: WasteReading[] = [];
  const rand = seededRandom(777);
  const baseDate = new Date('2026-10-14T00:00:00Z');

  // Baseline waste distributions by location (kg/day)
  const baseConfig: Record<CampusLocation, { food: number; rec: number; mixed: number }> = {
    'University Food Court': { food: 130, rec: 45, mixed: 35 },
    'Hostel Cluster A & B': { food: 95, rec: 50, mixed: 40 },
    'Academic Block 1': { food: 15, rec: 25, mixed: 30 },
    'Academic Block 2': { food: 12, rec: 22, mixed: 28 },
    'Central Library & Admin': { food: 8, rec: 35, mixed: 18 },
    'Sports Complex & Auditorium': { food: 10, rec: 20, mixed: 20 }
  };

  for (let day = 0; day < 14; day++) {
    const current = new Date(baseDate.getTime() + day * 86400 * 1000);
    const dateStr = current.toISOString().split('T')[0];

    for (const location of CAMPUS_LOCATIONS) {
      const cfg = baseConfig[location];
      let food = Math.max(2, Math.round(cfg.food * (0.95 + rand() * 0.1)));
      let rec = Math.max(2, Math.round(cfg.rec * (0.95 + rand() * 0.1)));
      let mixed = Math.max(2, Math.round(cfg.mixed * (0.95 + rand() * 0.1)));
      const baselineTotal = cfg.food + cfg.rec + cfg.mixed;

      let flagged = false;
      let anomalyType: WasteReading['anomalyType'] = 'none';
      let notes = 'Simulated daily waste audit log';

      // Planted Anomaly 1: Food Court - Food Waste Spike on Day 11 (2026-10-24)
      if (location === 'University Food Court' && day === 10) {
        food = 215; // 215 kg vs 130 kg baseline (+65%)
        flagged = true;
        anomalyType = 'food_waste_spike';
        notes = 'Planted anomaly: Post-event banquet surplus discard; kitchen portion mismatch.';
      }

      // Planted Anomaly 2: Food Court - Mixed waste surge (Day 12)
      if (location === 'University Food Court' && day === 11) {
        mixed = 95; // 95 kg vs 35 kg baseline (segregation breakdown)
        flagged = true;
        anomalyType = 'mixed_waste_surge';
        notes = 'Planted anomaly: Contaminated organic stream diverted to landfill bin due to missing bin liners.';
      }

      // Planted Anomaly 3: Academic Block 1 - Chronic Low Segregation (<15% recyclables, 62% mixed)
      if (location === 'Academic Block 1' && day >= 10) {
        mixed = 48;
        rec = 6;
        flagged = true;
        anomalyType = 'low_segregation_rate';
        notes = 'Planted anomaly: Corridors lack paired dual-bins; paper and plastic discarded in general waste.';
      }

      const total = food + rec + mixed;

      readings.push({
        id: `wst-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${day}`,
        date: dateStr,
        location,
        foodWasteKg: food,
        recyclableWasteKg: rec,
        mixedWasteKg: mixed,
        totalKg: total,
        baselineTotalKg: baselineTotal,
        isSimulated: true,
        flagged,
        anomalyType,
        notes
      });
    }
  }

  return readings;
}
