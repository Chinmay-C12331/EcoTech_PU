/**
 * Measure → Detect → Act → Verify Engine
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Manages valid workflow status transitions, follow-up measurement audits,
 * and scientific before/after verification analysis.
 */

import {
  ActionStatus,
  ActionTask,
  FollowUpMeasurement,
  VerificationAnalysis,
  VerificationResultType
} from '../types/resource';

/**
 * Valid state transition graph for Corrective Action Workflow:
 * Detected → Acknowledged → Investigating → Repair Reported → Awaiting Verification → Verified Improvement / No Improvement / Inconclusive
 */
export const VALID_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  'Detected': ['Acknowledged', 'Investigating'],
  'Acknowledged': ['Investigating'],
  'Investigating': ['Repair Reported'],
  'Repair Reported': ['Awaiting Verification'],
  'Awaiting Verification': ['Verified Improvement', 'No Improvement', 'Inconclusive', 'Investigating'],
  'Verified Improvement': ['Investigating'], // Can be reopened if regression occurs
  'No Improvement': ['Investigating'],        // Reopened for secondary investigation
  'Inconclusive': ['Investigating', 'Awaiting Verification']
};

export function canTransition(from: ActionStatus, to: ActionStatus): boolean {
  if (from === to) return false;
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Evaluates follow-up measurements against original observed values and baselines.
 * Enforces scientific comparability, sample sufficiency, and conservative framing.
 */
export function computeVerification(
  originalObserved: number,
  baseline: number,
  originalExcess: number,
  unit: 'kWh' | 'Litres' | 'kg',
  measurements: FollowUpMeasurement[]
): VerificationAnalysis {
  // 1. Data Sufficiency Check
  if (!measurements || measurements.length === 0) {
    return {
      outcome: 'Inconclusive',
      beforeValue: originalObserved,
      baselineValue: baseline,
      followUpValue: 0,
      absoluteReduction: 0,
      percentageExcessAvoided: 0,
      unit,
      isComparable: false,
      sampleCount: 0,
      explanation: 'No follow-up post-intervention measurements recorded yet. At least one valid post-repair reading is required.',
      disclaimer: 'Verification requires empirical follow-up readings under matching operational conditions.'
    };
  }

  // Filter valid non-negative measurements
  const validMeasurements = measurements.filter(
    m => typeof m.value === 'number' && !isNaN(m.value) && m.value >= 0
  );

  if (validMeasurements.length === 0) {
    return {
      outcome: 'Inconclusive',
      beforeValue: originalObserved,
      baselineValue: baseline,
      followUpValue: 0,
      absoluteReduction: 0,
      percentageExcessAvoided: 0,
      unit,
      isComparable: false,
      sampleCount: 0,
      explanation: 'Follow-up measurements contain invalid or negative readings. Verification cannot be confirmed.',
      disclaimer: 'Measurement integrity check failed.'
    };
  }

  // Check comparability
  const comparableMeasurements = validMeasurements.filter(m => m.isComparablePeriod);
  if (comparableMeasurements.length === 0) {
    return {
      outcome: 'Inconclusive',
      beforeValue: originalObserved,
      baselineValue: baseline,
      followUpValue: validMeasurements[0].value,
      absoluteReduction: Math.round((originalObserved - validMeasurements[0].value) * 10) / 10,
      percentageExcessAvoided: 0,
      unit,
      isComparable: false,
      sampleCount: validMeasurements.length,
      explanation: 'Follow-up readings were recorded during non-comparable operating hours (e.g. daytime vs nocturnal window). A reading matching original operating conditions is mandatory.',
      disclaimer: 'Non-comparable baseline conditions prevent conclusive verification.'
    };
  }

  // Calculate average follow-up value across comparable readings
  const sumValues = comparableMeasurements.reduce((acc, curr) => acc + curr.value, 0);
  const avgFollowUp = Math.round((sumValues / comparableMeasurements.length) * 10) / 10;

  const absoluteReduction = Math.round((originalObserved - avgFollowUp) * 10) / 10;
  
  // Calculate percentage of excess eliminated
  const effectiveExcess = originalExcess > 0 ? originalExcess : Math.max(1, originalObserved - baseline);
  const percentageExcessAvoided = Math.round((absoluteReduction / effectiveExcess) * 1000) / 10;

  let outcome: VerificationResultType = 'Inconclusive';
  let explanation = '';

  // Decision logic
  if (percentageExcessAvoided >= 60 || avgFollowUp <= baseline * 1.15) {
    outcome = 'Verified Improvement';
    explanation = `Follow-up consumption dropped from ${originalObserved} ${unit} to ${avgFollowUp} ${unit} (reduction: -${absoluteReduction} ${unit}, eliminating ~${Math.min(100, Math.round(percentageExcessAvoided))}% of prior excess) under comparable operational conditions across ${comparableMeasurements.length} audit log(s).`;
  } else if (percentageExcessAvoided <= 15 || avgFollowUp >= originalObserved * 0.90) {
    outcome = 'No Improvement';
    explanation = `Follow-up consumption remains elevated at ${avgFollowUp} ${unit} vs prior ${originalObserved} ${unit} (baseline: ${baseline} ${unit}). Corrective repair failed to restore nominal baseline.`;
  } else {
    outcome = 'Inconclusive';
    explanation = `Partial reduction observed (${avgFollowUp} ${unit} vs ${originalObserved} ${unit}, ~${Math.round(percentageExcessAvoided)}% reduction), but variance or sample size (${comparableMeasurements.length} reading) is insufficient to definitively verify permanent remediation. Additional audit cycles required.`;
  }

  // Determine if any follow-up measurement is simulated demo data
  const isSimulated = measurements.some(m => m.isSimulated);

  return {
    outcome,
    beforeValue: originalObserved,
    baselineValue: baseline,
    followUpValue: avgFollowUp,
    absoluteReduction,
    percentageExcessAvoided: Math.max(0, percentageExcessAvoided),
    unit,
    isComparable: true,
    sampleCount: comparableMeasurements.length,
    explanation,
    disclaimer: isSimulated
      ? 'Demonstrates algorithmic workflow recovery in a simulated test scenario with synthetic telemetry; does not constitute permanent proof that root causes will not recur. In compliance with data integrity standards, simulated results are excluded from real-world campus savings totals.'
      : 'Measured reduction correlates with reported corrective intervention during the test window. In compliance with auditing standards, this demonstrates operational recovery but does not constitute permanent proof that root causes will not recur.',
    isSimulated
  };
}
