/**
 * Energy Resource Intelligence & Anomaly Detection Engine
 * EcoTech PU - Presidency University Bengaluru
 */

import { EnergyReading, Recommendation, CampusLocation } from '../types/resource';
import { calculatePrioritizationScore } from './prioritization';

export interface EnergyAnalysisResult {
  totalObservedKwh: number;
  totalBaselineKwh: number;
  totalExcessKwh: number;
  afterHoursObservedKwh: number;
  afterHoursBaselineKwh: number;
  afterHoursExcessKwh: number;
  flaggedReadingsCount: number;
  anomaliesByLocation: Record<CampusLocation, EnergyReading[]>;
  recommendations: Recommendation[];
  hourlyTrend: Array<{
    timestamp: string;
    hour: number;
    date: string;
    observed: number;
    baseline: number;
    excess: number;
    isAfterHours: boolean;
    flagged: boolean;
  }>;
}

export function analyzeEnergyReadings(readings: EnergyReading[]): EnergyAnalysisResult {
  let totalObservedKwh = 0;
  let totalBaselineKwh = 0;
  let afterHoursObservedKwh = 0;
  let afterHoursBaselineKwh = 0;
  let flaggedReadingsCount = 0;

  const anomaliesByLocation: Record<CampusLocation, EnergyReading[]> = {
    'Academic Block 1': [],
    'Academic Block 2': [],
    'Hostel Cluster A & B': [],
    'University Food Court': [],
    'Central Library & Admin': [],
    'Sports Complex & Auditorium': []
  };

  // Group readings by location sorted by timestamp
  const locationGroups: Record<string, EnergyReading[]> = {};

  readings.forEach(r => {
    totalObservedKwh += r.observedKwh;
    totalBaselineKwh += r.baselineKwh;

    if (r.isAfterHours) {
      afterHoursObservedKwh += r.observedKwh;
      afterHoursBaselineKwh += r.baselineKwh;
    }

    if (!locationGroups[r.location]) {
      locationGroups[r.location] = [];
    }
    locationGroups[r.location].push(r);
  });

  totalObservedKwh = Math.round(totalObservedKwh * 10) / 10;
  totalBaselineKwh = Math.round(totalBaselineKwh * 10) / 10;
  const totalExcessKwh = Math.max(0, Math.round((totalObservedKwh - totalBaselineKwh) * 10) / 10);

  afterHoursObservedKwh = Math.round(afterHoursObservedKwh * 10) / 10;
  afterHoursBaselineKwh = Math.round(afterHoursBaselineKwh * 10) / 10;
  const afterHoursExcessKwh = Math.max(0, Math.round((afterHoursObservedKwh - afterHoursBaselineKwh) * 10) / 10);

  const recommendations: Recommendation[] = [];

  // Evaluate location trends and identify sustained patterns
  Object.entries(locationGroups).forEach(([locStr, locReadings]) => {
    const loc = locStr as CampusLocation;
    const sorted = [...locReadings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Rule 1: After-Hours Inefficiency Detection
    // Contiguous after-hours readings (21:00 to 06:00) where observed > baseline * 1.35 and excess >= 15 kWh
    const afterHoursStreak: EnergyReading[] = [];
    sorted.forEach((r, idx) => {
      const isElevatedAfterHours =
        r.isAfterHours &&
        r.observedKwh > r.baselineKwh * 1.35 &&
        (r.observedKwh - r.baselineKwh) >= 15;

      if (isElevatedAfterHours) {
        afterHoursStreak.push(r);
        r.flagged = true;
        r.anomalyType = 'after_hours_inefficiency';
        anomaliesByLocation[loc]?.push(r);
        flaggedReadingsCount++;
      }
    });

    if (afterHoursStreak.length >= 3) {
      const sumObserved = afterHoursStreak.reduce((acc, curr) => acc + curr.observedKwh, 0);
      const sumBaseline = afterHoursStreak.reduce((acc, curr) => acc + curr.baselineKwh, 0);
      const estExcess = Math.round((sumObserved - sumBaseline) * 10) / 10;
      const hoursCount = afterHoursStreak.length;
      const startHour = afterHoursStreak[0].hour;
      const endHour = afterHoursStreak[afterHoursStreak.length - 1].hour;
      const dateStr = afterHoursStreak[0].date;

      const scoreBreakdown = calculatePrioritizationScore({
        resource: 'energy',
        observed: sumObserved,
        baseline: sumBaseline,
        excess: estExcess,
        hoursOrDaysPersisting: hoursCount,
        confidence: 'High',
        effort: 'Low' // Automation timer schedule or building walkthrough
      });

      recommendations.push({
        id: `rec-eng-afterhours-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        resource: 'energy',
        location: loc,
        finding: `Sustained after-hours power draw detected between ${startHour}:00 and ${endHour}:00 (${hoursCount} consecutive hours).`,
        evidence: `Observed ${Math.round(sumObserved)} kWh vs expected baseline ${Math.round(sumBaseline)} kWh (excess +${estExcess} kWh, +${Math.round((estExcess / sumBaseline) * 100)}%) during scheduled un-occupied hours on ${dateStr}.`,
        baseline: Math.round(sumBaseline),
        observedValue: Math.round(sumObserved),
        estimatedExcess: estExcess,
        unit: 'kWh',
        suggestedAction: `Audit centralized VRF/split AC units and lab power distribution boards in ${loc}. Configure BMS contactor timers to automate shutoff after 21:00.`,
        confidence: 'High',
        confidenceReason: 'Consistent multi-hour elevation during zero-occupancy night curfew window with high baseline contrast.',
        implementationEffort: 'Low',
        policyReference: 'Presidency University Green Campus Operating Procedure (Internal EcoTech SOP-ENG-04: Building Power Shutdown Protocols)',
        isSimulated: true,
        priorityScore: scoreBreakdown.finalScore,
        scoreBreakdown,
        detectedAt: afterHoursStreak[0].timestamp,
        detectionRuleName: 'After-Hours Baseline Curfew Rule (Internal EcoTech SOP-ENG-04)',
        ruleThresholdFormula: 'isAfterHours (21:00–06:00) AND Observed > 1.35 × Baseline AND (Observed - Baseline) ≥ 15 kWh sustained for ≥ 3 hours (Internal EcoTech heuristic threshold)',
        persistenceDetails: `${hoursCount} consecutive hours (${startHour}:00 to ${endHour}:00) on ${dateStr}`,
        dataQualityLimitations: 'Simulated sub-meter telemetry (Seed #42) with ±5% Gaussian noise; feeder-level aggregation does not isolate individual room sub-breakers.',
        actionRationale: 'Automated BMS contactor schedules cut parasitic night loads at the panel level without impacting daytime academic instruction.'
      });
    }

    // Rule 2: Sustained Daytime Peak Overload Detection
    // Daytime hours (08:00 to 18:00) with sustained elevation > 1.3x baseline for 3+ hours
    let currentDayStreak: EnergyReading[] = [];
    sorted.forEach(r => {
      const isDaytime = r.hour >= 8 && r.hour <= 18;
      const isElevated = isDaytime && r.observedKwh > r.baselineKwh * 1.3 && (r.observedKwh - r.baselineKwh) >= 20;

      if (isElevated) {
        currentDayStreak.push(r);
        r.flagged = true;
        if (!r.anomalyType || r.anomalyType === 'none') {
          r.anomalyType = 'sustained_peak_overload';
        }
        if (!anomaliesByLocation[loc]?.some(x => x.id === r.id)) {
          anomaliesByLocation[loc]?.push(r);
          flaggedReadingsCount++;
        }
      } else {
        if (currentDayStreak.length >= 3) {
          generateDaytimeRecommendation(currentDayStreak, loc, recommendations);
        }
        currentDayStreak = [];
      }
    });

    if (currentDayStreak.length >= 3) {
      generateDaytimeRecommendation(currentDayStreak, loc, recommendations);
    }
  });

  // Calculate aggregated campus hourly trend
  const timeMap = new Map<string, { observed: number; baseline: number; hour: number; date: string; isAfterHours: boolean; flagged: boolean }>();
  readings.forEach(r => {
    const existing = timeMap.get(r.timestamp) || {
      observed: 0,
      baseline: 0,
      hour: r.hour,
      date: r.date,
      isAfterHours: r.isAfterHours,
      flagged: false
    };
    existing.observed += r.observedKwh;
    existing.baseline += r.baselineKwh;
    if (r.flagged) existing.flagged = true;
    timeMap.set(r.timestamp, existing);
  });

  const hourlyTrend = Array.from(timeMap.entries())
    .map(([ts, val]) => ({
      timestamp: ts,
      hour: val.hour,
      date: val.date,
      observed: Math.round(val.observed * 10) / 10,
      baseline: Math.round(val.baseline * 10) / 10,
      excess: Math.max(0, Math.round((val.observed - val.baseline) * 10) / 10),
      isAfterHours: val.isAfterHours,
      flagged: val.flagged
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    totalObservedKwh,
    totalBaselineKwh,
    totalExcessKwh,
    afterHoursObservedKwh,
    afterHoursBaselineKwh,
    afterHoursExcessKwh,
    flaggedReadingsCount,
    anomaliesByLocation,
    recommendations,
    hourlyTrend
  };
}

function generateDaytimeRecommendation(
  streak: EnergyReading[],
  location: CampusLocation,
  outList: Recommendation[]
) {
  const sumObserved = streak.reduce((acc, curr) => acc + curr.observedKwh, 0);
  const sumBaseline = streak.reduce((acc, curr) => acc + curr.baselineKwh, 0);
  const estExcess = Math.round((sumObserved - sumBaseline) * 10) / 10;
  const hoursCount = streak.length;
  const startHour = streak[0].hour;
  const endHour = streak[streak.length - 1].hour;
  const dateStr = streak[0].date;

  const scoreBreakdown = calculatePrioritizationScore({
    resource: 'energy',
    observed: sumObserved,
    baseline: sumBaseline,
    excess: estExcess,
    hoursOrDaysPersisting: hoursCount,
    confidence: 'Moderate', // Daytime load may reflect unscheduled academic demand
    effort: 'Medium'
  });

  outList.push({
    id: `rec-eng-peak-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dateStr}`,
    resource: 'energy',
    location,
    finding: `Sustained daytime peak power spike observed across ${hoursCount} consecutive hours (${startHour}:00 to ${endHour}:00).`,
    evidence: `Logged ${Math.round(sumObserved)} kWh against historical baseline of ${Math.round(sumBaseline)} kWh (+${estExcess} kWh deviation) on ${dateStr}.`,
    baseline: Math.round(sumBaseline),
    observedValue: Math.round(sumObserved),
    estimatedExcess: estExcess,
    unit: 'kWh',
    suggestedAction: `Check for concurrent chiller staging or unscheduled computer lab operation in ${location}. Stagger heavy inductive loads and shift equipment testing away from campus peak demand windows.`,
    confidence: 'Moderate',
    confidenceReason: 'Elevated daytime profile could partially reflect verified academic seminar usage or unscheduled research compute load. Field verification advised before intervention.',
    implementationEffort: 'Medium',
    policyReference: 'Presidency University Energy Management Guidelines & BEE National Building Energy Efficiency Code',
    isSimulated: true,
    priorityScore: scoreBreakdown.finalScore,
    scoreBreakdown,
    detectedAt: streak[0].timestamp,
    detectionRuleName: 'Sustained Peak Demand Overload Rule (BEE ECBC)',
    ruleThresholdFormula: 'isDaytime (08:00–18:00) AND Observed > 1.30 × Baseline AND (Observed - Baseline) ≥ 20 kWh sustained for ≥ 3 hours',
    persistenceDetails: `${hoursCount} consecutive hours (${startHour}:00 to ${endHour}:00) on ${dateStr}`,
    dataQualityLimitations: 'Feeder-level telemetry; unscheduled seminars or concurrent lab tests cannot be distinguished from equipment malfunction without timetable cross-referencing.',
    actionRationale: 'Sequenced chiller staging and shifting heavy compute lab experiments outside peak billing hours protects contract kVA limits.'
  });
}
