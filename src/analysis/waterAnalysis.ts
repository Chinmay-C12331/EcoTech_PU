/**
 * Water Resource Intelligence & Anomaly Detection Engine
 * EcoTech PU - Presidency University Bengaluru
 * 
 * CORE COMPLIANCE PRINCIPLE:
 * Unusual overnight flow is categorized strictly as an "Investigation Trigger"
 * rather than deterministic proof of a leak, pipe burst, or confirmed resource waste.
 */

import { WaterReading, Recommendation, CampusLocation } from '../types/resource';
import { calculatePrioritizationScore } from './prioritization';

export interface WaterAnalysisResult {
  totalObservedLitres: number;
  totalBaselineLitres: number;
  totalExcessLitres: number;
  overnightObservedLitres: number;
  overnightBaselineLitres: number;
  overnightExcessLitres: number;
  flaggedReadingsCount: number;
  anomaliesByLocation: Record<CampusLocation, WaterReading[]>;
  recommendations: Recommendation[];
  hourlyTrend: Array<{
    timestamp: string;
    hour: number;
    date: string;
    observed: number;
    baseline: number;
    excess: number;
    isOvernightWindow: boolean;
    flagged: boolean;
  }>;
}

export function analyzeWaterReadings(readings: WaterReading[]): WaterAnalysisResult {
  let totalObservedLitres = 0;
  let totalBaselineLitres = 0;
  let overnightObservedLitres = 0;
  let overnightBaselineLitres = 0;
  let flaggedReadingsCount = 0;

  const anomaliesByLocation: Record<CampusLocation, WaterReading[]> = {
    'Academic Block 1': [],
    'Academic Block 2': [],
    'Hostel Cluster A & B': [],
    'University Food Court': [],
    'Central Library & Admin': [],
    'Sports Complex & Auditorium': []
  };

  const locationGroups: Record<string, WaterReading[]> = {};

  readings.forEach(r => {
    totalObservedLitres += r.observedLitres;
    totalBaselineLitres += r.baselineLitres;

    if (r.isOvernightWindow) {
      overnightObservedLitres += r.observedLitres;
      overnightBaselineLitres += r.baselineLitres;
    }

    if (!locationGroups[r.location]) {
      locationGroups[r.location] = [];
    }
    locationGroups[r.location].push(r);
  });

  const totalExcessLitres = Math.max(0, totalObservedLitres - totalBaselineLitres);
  const overnightExcessLitres = Math.max(0, overnightObservedLitres - overnightBaselineLitres);

  const recommendations: Recommendation[] = [];

  // Analyze location-specific patterns
  Object.entries(locationGroups).forEach(([locStr, locReadings]) => {
    const loc = locStr as CampusLocation;
    const sorted = [...locReadings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const isNonResidential = !loc.includes('Hostel');

    // Rule 1: Overnight Flow Investigation Trigger (01:00 to 05:00)
    // Non-residential buildings should have minimal baselines (<100 L/hr).
    // If sustained flow exceeds 3.0x baseline, trigger a manual physical audit.
    const overnightStreak: WaterReading[] = [];
    sorted.forEach(r => {
      const isElevatedOvernight =
        r.isOvernightWindow &&
        r.observedLitres > r.baselineLitres * 2.5 &&
        (r.observedLitres - r.baselineLitres) >= 200;

      if (isElevatedOvernight) {
        overnightStreak.push(r);
        r.flagged = true;
        r.anomalyType = 'unusual_overnight_flow';
        anomaliesByLocation[loc]?.push(r);
        flaggedReadingsCount++;
      }
    });

    if (overnightStreak.length >= 2) {
      const sumObserved = overnightStreak.reduce((acc, curr) => acc + curr.observedLitres, 0);
      const sumBaseline = overnightStreak.reduce((acc, curr) => acc + curr.baselineLitres, 0);
      const estExcess = sumObserved - sumBaseline;
      const hoursCount = overnightStreak.length;
      const startHour = overnightStreak[0].hour;
      const endHour = overnightStreak[overnightStreak.length - 1].hour;
      const dateStr = overnightStreak[0].date;

      const scoreBreakdown = calculatePrioritizationScore({
        resource: 'water',
        observed: sumObserved,
        baseline: sumBaseline,
        excess: estExcess,
        hoursOrDaysPersisting: hoursCount,
        confidence: isNonResidential ? 'High' : 'Moderate',
        effort: 'Low' // Valve audit / float switch inspection
      });

      recommendations.push({
        id: `rec-wat-overnight-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        resource: 'water',
        location: loc,
        finding: `Unusual sustained overnight water flow detected (${hoursCount} hours between ${startHour}:00 and ${endHour}:00). Flagged as a priority inspection trigger.`,
        evidence: `Observed continuous draw of ${sumObserved.toLocaleString()} Litres vs expected quiescent baseline of ${sumBaseline.toLocaleString()} Litres (estimated deviation +${estExcess.toLocaleString()} Litres) during minimum nocturnal activity period on ${dateStr}.`,
        baseline: sumBaseline,
        observedValue: sumObserved,
        estimatedExcess: estExcess,
        unit: 'Litres',
        suggestedAction: `Dispatch plumbing maintenance team to ${loc} for manual inspection: inspect overhead tank float valves, check for unseated dual-flush valves in washrooms, and test riser branch shutoff valves. Treat as an investigation trigger rather than verified pipe failure until physically audited.`,
        confidence: isNonResidential ? 'High' : 'Moderate',
        confidenceReason: isNonResidential
          ? 'Non-residential facility with expected near-zero overnight demand; sustained continuous night draw strongly warrants on-site valve verification.'
          : 'Residential hostel facility where nighttime laundry or early morning bathroom usage can partially account for deviations.',
        implementationEffort: 'Low',
        policyReference: 'Presidency University Water Conservation Manual (Internal EcoTech SOP-WAT-02: Nocturnal Water Audit & Fixture Integrity)',
        isSimulated: true,
        priorityScore: scoreBreakdown.finalScore,
        scoreBreakdown,
        detectedAt: overnightStreak[0].timestamp,
        detectionRuleName: 'Nocturnal Quiescent Hydraulic Audit (Internal EcoTech SOP-WAT-02)',
        ruleThresholdFormula: 'isOvernightWindow (01:00–05:00) AND Observed > 2.50 × Baseline AND (Observed - Baseline) ≥ 200 Litres sustained for ≥ 2 hours (Internal EcoTech inspection trigger heuristic)',
        persistenceDetails: `${hoursCount} consecutive nocturnal hours (${startHour}:00 to ${endHour}:00) on ${dateStr}`,
        dataQualityLimitations: 'Feeder ultrasonic sub-meter telemetry; cannot independently localize flow to specific cisterns or roof-tank float bypass without physical valve audit.',
        actionRationale: 'Targeted physical walkthrough of restroom cisterns and overhead tanks directly verifies whether continuous flow stems from an unseated valve versus legitimate off-hours supply replenishment.'
      });
    }

    // Rule 2: Sudden Daytime Surge Detection
    let surgeStreak: WaterReading[] = [];
    sorted.forEach(r => {
      const isDaytime = r.hour >= 8 && r.hour <= 20;
      const isExtremeSurge =
        isDaytime &&
        r.observedLitres > r.baselineLitres * 1.75 &&
        (r.observedLitres - r.baselineLitres) >= 800;

      if (isExtremeSurge) {
        surgeStreak.push(r);
        r.flagged = true;
        if (!r.anomalyType || r.anomalyType === 'none') {
          r.anomalyType = 'daytime_surge';
        }
        if (!anomaliesByLocation[loc]?.some(x => x.id === r.id)) {
          anomaliesByLocation[loc]?.push(r);
          flaggedReadingsCount++;
        }
      } else {
        if (surgeStreak.length >= 2) {
          generateWaterSurgeRecommendation(surgeStreak, loc, recommendations);
        }
        surgeStreak = [];
      }
    });

    if (surgeStreak.length >= 2) {
      generateWaterSurgeRecommendation(surgeStreak, loc, recommendations);
    }
  });

  // Calculate aggregated campus hourly trend
  const timeMap = new Map<string, { observed: number; baseline: number; hour: number; date: string; isOvernightWindow: boolean; flagged: boolean }>();
  readings.forEach(r => {
    const existing = timeMap.get(r.timestamp) || {
      observed: 0,
      baseline: 0,
      hour: r.hour,
      date: r.date,
      isOvernightWindow: r.isOvernightWindow,
      flagged: false
    };
    existing.observed += r.observedLitres;
    existing.baseline += r.baselineLitres;
    if (r.flagged) existing.flagged = true;
    timeMap.set(r.timestamp, existing);
  });

  const hourlyTrend = Array.from(timeMap.entries())
    .map(([ts, val]) => ({
      timestamp: ts,
      hour: val.hour,
      date: val.date,
      observed: val.observed,
      baseline: val.baseline,
      excess: Math.max(0, val.observed - val.baseline),
      isOvernightWindow: val.isOvernightWindow,
      flagged: val.flagged
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    totalObservedLitres,
    totalBaselineLitres,
    totalExcessLitres,
    overnightObservedLitres,
    overnightBaselineLitres,
    overnightExcessLitres,
    flaggedReadingsCount,
    anomaliesByLocation,
    recommendations,
    hourlyTrend
  };
}

function generateWaterSurgeRecommendation(
  streak: WaterReading[],
  location: CampusLocation,
  outList: Recommendation[]
) {
  const sumObserved = streak.reduce((acc, curr) => acc + curr.observedLitres, 0);
  const sumBaseline = streak.reduce((acc, curr) => acc + curr.baselineLitres, 0);
  const estExcess = sumObserved - sumBaseline;
  const hoursCount = streak.length;
  const startHour = streak[0].hour;
  const endHour = streak[streak.length - 1].hour;
  const dateStr = streak[0].date;

  const scoreBreakdown = calculatePrioritizationScore({
    resource: 'water',
    observed: sumObserved,
    baseline: sumBaseline,
    excess: estExcess,
    hoursOrDaysPersisting: hoursCount,
    confidence: 'Moderate',
    effort: 'Medium'
  });

  outList.push({
    id: `rec-wat-surge-${location.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${dateStr}`,
    resource: 'water',
    location,
    finding: `Rapid daytime water surge recorded over ${hoursCount} consecutive hours (${startHour}:00 - ${endHour}:00).`,
    evidence: `Logged ${sumObserved.toLocaleString()} Litres compared to anticipated baseline of ${sumBaseline.toLocaleString()} Litres (surge differential: +${estExcess.toLocaleString()} Litres) on ${dateStr}.`,
    baseline: sumBaseline,
    observedValue: sumObserved,
    estimatedExcess: estExcess,
    unit: 'Litres',
    suggestedAction: `Inspect bulk water equipment (commercial dishwashers, RO plant backwash cycle, or garden irrigation lines) in ${location}. Install flow limiters and aerators on heavy-use delivery outlets.`,
    confidence: 'Moderate',
    confidenceReason: 'Operational event or deep kitchen sanitation could explain surge; physical spot check advised before attributing to loss.',
    implementationEffort: 'Medium',
    policyReference: 'National Building Code 2016 (Part 9 Section 1: Water Supply and Sanitary Fixture Efficiency)',
    isSimulated: true,
    priorityScore: scoreBreakdown.finalScore,
    scoreBreakdown,
    detectedAt: streak[0].timestamp,
    detectionRuleName: 'High Volumetric Daytime Surge Rule (NBC Part 9)',
    ruleThresholdFormula: 'isDaytime (08:00–20:00) AND Observed > 1.75 × Baseline AND (Observed - Baseline) ≥ 800 Litres sustained for ≥ 2 hours',
    persistenceDetails: `${hoursCount} consecutive hours (${startHour}:00 to ${endHour}:00) on ${dateStr}`,
    dataQualityLimitations: 'Feeder line metering; high-demand commercial kitchen deep-cleaning or RO regeneration cycles can register transient high volumetric draws.',
    actionRationale: 'Fitting pressure-compensating aerators and pre-rinse shutoff triggers curbs high-rate open-flow wastage without degrading cleaning effectiveness.'
  });
}
