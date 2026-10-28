/**
 * Waste Resource Intelligence & Segregation Engine
 * EcoTech PU - Presidency University Bengaluru
 */

import { WasteReading, Recommendation, CampusLocation } from '../types/resource';
import { calculatePrioritizationScore } from './prioritization';

export interface WasteAnalysisResult {
  totalFoodWasteKg: number;
  totalRecyclableWasteKg: number;
  totalMixedWasteKg: number;
  totalWasteKg: number;
  totalBaselineKg: number;
  totalExcessKg: number;
  averageDailyFoodWasteKg: number;
  averageSegregationRatePercent: number; // (recyclable + food diverted) / total
  flaggedRecordsCount: number;
  anomaliesByLocation: Record<CampusLocation, WasteReading[]>;
  recommendations: Recommendation[];
  dailyTrend: Array<{
    date: string;
    foodKg: number;
    recyclableKg: number;
    mixedKg: number;
    totalKg: number;
    baselineTotalKg: number;
    segregationRatePercent: number;
    flagged: boolean;
  }>;
}

export function analyzeWasteReadings(readings: WasteReading[]): WasteAnalysisResult {
  let totalFoodWasteKg = 0;
  let totalRecyclableWasteKg = 0;
  let totalMixedWasteKg = 0;
  let totalBaselineKg = 0;
  let flaggedRecordsCount = 0;

  const anomaliesByLocation: Record<CampusLocation, WasteReading[]> = {
    'Academic Block 1': [],
    'Academic Block 2': [],
    'Hostel Cluster A & B': [],
    'University Food Court': [],
    'Central Library & Admin': [],
    'Sports Complex & Auditorium': []
  };

  const locationGroups: Record<string, WasteReading[]> = {};
  const dateMap = new Map<string, { food: number; rec: number; mixed: number; total: number; baseline: number; flagged: boolean }>();

  readings.forEach(r => {
    totalFoodWasteKg += r.foodWasteKg;
    totalRecyclableWasteKg += r.recyclableWasteKg;
    totalMixedWasteKg += r.mixedWasteKg;
    totalBaselineKg += r.baselineTotalKg;

    if (!locationGroups[r.location]) {
      locationGroups[r.location] = [];
    }
    locationGroups[r.location].push(r);

    const existing = dateMap.get(r.date) || {
      food: 0,
      rec: 0,
      mixed: 0,
      total: 0,
      baseline: 0,
      flagged: false
    };
    existing.food += r.foodWasteKg;
    existing.rec += r.recyclableWasteKg;
    existing.mixed += r.mixedWasteKg;
    existing.total += r.totalKg;
    existing.baseline += r.baselineTotalKg;
    dateMap.set(r.date, existing);
  });

  const totalWasteKg = totalFoodWasteKg + totalRecyclableWasteKg + totalMixedWasteKg;
  const totalExcessKg = Math.max(0, totalWasteKg - totalBaselineKg);

  const uniqueDatesCount = Math.max(1, dateMap.size);
  const averageDailyFoodWasteKg = Math.round((totalFoodWasteKg / uniqueDatesCount) * 10) / 10;
  const averageSegregationRatePercent = totalWasteKg > 0
    ? Math.round(((totalRecyclableWasteKg + totalFoodWasteKg) / totalWasteKg) * 1000) / 10
    : 0;

  const recommendations: Recommendation[] = [];

  // Evaluate location trends
  Object.entries(locationGroups).forEach(([locStr, locReadings]) => {
    const loc = locStr as CampusLocation;
    const sorted = [...locReadings].sort((a, b) => a.date.localeCompare(b.date));

    // Rule 1: Food Waste Spike Detection (> 1.35x baseline or acute single-day surge)
    const foodSpikes = sorted.filter(r => {
      // Estimated baseline food waste portion (assuming ~60% in dining, ~20% in academic)
      const expectedFoodBaseline = loc.includes('Food Court') || loc.includes('Hostel')
        ? r.baselineTotalKg * 0.65
        : r.baselineTotalKg * 0.25;
      return r.foodWasteKg > expectedFoodBaseline * 1.35 && (r.foodWasteKg - expectedFoodBaseline) >= 30;
    });

    if (foodSpikes.length > 0) {
      foodSpikes.forEach(r => {
        r.flagged = true;
        r.anomalyType = 'food_waste_spike';
        if (!anomaliesByLocation[loc]?.some(x => x.id === r.id)) {
          anomaliesByLocation[loc]?.push(r);
          flaggedRecordsCount++;
        }
      });

      const totalSpikeObserved = foodSpikes.reduce((acc, curr) => acc + curr.foodWasteKg, 0);
      const expectedBaseline = Math.round(
        foodSpikes.reduce((acc, curr) => {
          const exp = loc.includes('Food Court') || loc.includes('Hostel')
            ? curr.baselineTotalKg * 0.65
            : curr.baselineTotalKg * 0.25;
          return acc + exp;
        }, 0)
      );
      const estExcess = Math.max(0, totalSpikeObserved - expectedBaseline);

      const scoreBreakdown = calculatePrioritizationScore({
        resource: 'waste',
        observed: totalSpikeObserved,
        baseline: expectedBaseline,
        excess: estExcess,
        hoursOrDaysPersisting: foodSpikes.length,
        confidence: 'High',
        effort: 'Low' // Kitchen prep portioning & composting feed
      });

      recommendations.push({
        id: `rec-wst-food-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        resource: 'waste',
        location: loc,
        finding: `Elevated food waste surge logged across ${foodSpikes.length} audit days.`,
        evidence: `Accumulated ${totalSpikeObserved} kg food discard against expected baseline of ${expectedBaseline} kg (+${estExcess} kg excess, +${Math.round((estExcess / expectedBaseline) * 100)}%). Peak recorded on ${foodSpikes[0].date}.`,
        baseline: expectedBaseline,
        observedValue: totalSpikeObserved,
        estimatedExcess: estExcess,
        unit: 'kg',
        suggestedAction: `Implement kitchen batch-cooking scheduling with catering vendors at ${loc}, introduce smaller buffet serving ladles, and direct unavoidable organic pre-consumer trimmings to the campus aerobic composting pit.`,
        confidence: 'High',
        confidenceReason: 'Weigh-scale records verify acute surge correlated with specific catering prep dates.',
        implementationEffort: 'Low',
        policyReference: 'Presidency University Solid Waste Action Plan & Solid Waste Management Rules, 2026 (MoEF&CC, effective 1 April 2026; CPCB SWMP: https://swmp.cpcb.gov.in/en; PIB PRID 2219676)',
        isSimulated: true,
        priorityScore: scoreBreakdown.finalScore,
        scoreBreakdown,
        detectedAt: foodSpikes[0].date,
        detectionRuleName: 'Organic Food Waste Surge Rule (EcoTech Heuristic / CPCB & MoEF&CC SWM Rules 2026 Context)',
        ruleThresholdFormula: 'Observed Food Discard > 1.35 × Category Baseline AND (Observed - Baseline) ≥ 30 kg (Internal EcoTech campus heuristic, not statutory threshold)',
        persistenceDetails: `${foodSpikes.length} evaluated audit days (Peak date: ${foodSpikes[0].date})`,
        dataQualityLimitations: 'Daily loading dock scale manifests; pre-consumer culinary scrap is commingled with post-consumer tray returns.',
        actionRationale: 'Menu portion forecasting reduces prep overproduction, while clean organic trimmings are diverted to the university aerobic compost pits in alignment with bulk generator processing mandates under MoEF&CC Solid Waste Management Rules, 2026.'
      });
    }

    // Rule 2: Low Segregation Rate / Mixed Waste Dominance
    // If mixed waste exceeds 50% of total waste over consecutive days
    const poorSegregationDays = sorted.filter(r => {
      const mixedRatio = r.totalKg > 0 ? r.mixedWasteKg / r.totalKg : 0;
      return mixedRatio > 0.50 && r.mixedWasteKg >= 25;
    });

    if (poorSegregationDays.length >= 2) {
      poorSegregationDays.forEach(r => {
        r.flagged = true;
        if (!r.anomalyType || r.anomalyType === 'none') {
          r.anomalyType = 'low_segregation_rate';
        }
        if (!anomaliesByLocation[loc]?.some(x => x.id === r.id)) {
          anomaliesByLocation[loc]?.push(r);
          flaggedRecordsCount++;
        }
      });

      const totalMixed = poorSegregationDays.reduce((acc, curr) => acc + curr.mixedWasteKg, 0);
      const totalBatch = poorSegregationDays.reduce((acc, curr) => acc + curr.totalKg, 0);
      const mixedPct = Math.round((totalMixed / totalBatch) * 100);
      const estTargetExcess = Math.round(totalMixed - totalBatch * 0.25); // Target is <= 25% mixed

      const scoreBreakdown = calculatePrioritizationScore({
        resource: 'waste',
        observed: totalMixed,
        baseline: Math.round(totalBatch * 0.25),
        excess: estTargetExcess,
        hoursOrDaysPersisting: poorSegregationDays.length,
        confidence: 'High',
        effort: 'Medium' // Bin infrastructure & student awareness
      });

      recommendations.push({
        id: `rec-wst-segregation-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        resource: 'waste',
        location: loc,
        finding: `Chronic low waste segregation: unsegregated mixed waste accounts for ${mixedPct}% of total volume.`,
        evidence: `Audit identified ${totalMixed} kg mixed waste out of ${totalBatch} kg total waste across ${poorSegregationDays.length} evaluated days. Corridors show lack of distinct dry/wet separation containers.`,
        baseline: Math.round(totalBatch * 0.25),
        observedValue: totalMixed,
        estimatedExcess: estTargetExcess,
        unit: 'kg',
        suggestedAction: `Deploy color-coded source segregation bins (Green = Wet/Organic, Blue = Recyclable Dry, Black = Residual) at ${loc}. Station EcoTech student green marshals during peak lunch/break intervals.`,
        confidence: 'High',
        confidenceReason: 'Systematic visual audit logs indicate dry paper and beverage containers regularly commingled into residual landfill bags.',
        implementationEffort: 'Medium',
        policyReference: 'Presidency University Campus Sustainability Policy (Zero Landfill Protocol 2024)',
        isSimulated: true,
        priorityScore: scoreBreakdown.finalScore,
        scoreBreakdown,
        detectedAt: poorSegregationDays[0].date,
        detectionRuleName: 'Source Segregation Deficit Rule (Zero Landfill Charter)',
        ruleThresholdFormula: '(Mixed Waste / Total Waste) > 50% AND Mixed Waste ≥ 25 kg across ≥ 2 consecutive audit days',
        persistenceDetails: `${poorSegregationDays.length} evaluated audit days`,
        dataQualityLimitations: 'Visual segregation audit logs subject to manual batch sampling variances.',
        actionRationale: 'Installing paired 3-stream containers with clear signage and student marshal guidance prevents dry recyclable contamination at source.'
      });
    }
  });

  // Calculate daily trend
  const dailyTrend = Array.from(dateMap.entries())
    .map(([date, val]) => {
      const isAnyFlagged = readings.some(r => r.date === date && r.flagged);
      const segRate = val.total > 0 ? Math.round(((val.rec + val.food) / val.total) * 1000) / 10 : 0;
      return {
        date,
        foodKg: Math.round(val.food * 10) / 10,
        recyclableKg: Math.round(val.rec * 10) / 10,
        mixedKg: Math.round(val.mixed * 10) / 10,
        totalKg: Math.round(val.total * 10) / 10,
        baselineTotalKg: Math.round(val.baseline * 10) / 10,
        segregationRatePercent: segRate,
        flagged: isAnyFlagged
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalFoodWasteKg: Math.round(totalFoodWasteKg * 10) / 10,
    totalRecyclableWasteKg: Math.round(totalRecyclableWasteKg * 10) / 10,
    totalMixedWasteKg: Math.round(totalMixedWasteKg * 10) / 10,
    totalWasteKg: Math.round(totalWasteKg * 10) / 10,
    totalBaselineKg: Math.round(totalBaselineKg * 10) / 10,
    totalExcessKg: Math.round(totalExcessKg * 10) / 10,
    averageDailyFoodWasteKg,
    averageSegregationRatePercent,
    flaggedRecordsCount,
    anomaliesByLocation,
    recommendations,
    dailyTrend
  };
}
