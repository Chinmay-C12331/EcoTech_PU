/**
 * Explainable Multi-Resource Prioritization Scoring Engine
 * EcoTech PU - Presidency University Bengaluru
 * 
 * IMPORTANT ARCHITECTURAL PRINCIPLE:
 * In accordance with engineering standards, physical quantities of different resources
 * (kWh, Litres, and kg) MUST NOT be summed together into a single meaningless metric.
 * 
 * Instead, prioritization is computed via an explainable, dimensionless index:
 *   Priority Score = [(Severity + Persistence) * ConfidenceMultiplier] / EffortDivisor
 * normalized to a 0 - 100 scale.
 */

import {
  ResourceType,
  ConfidenceLevel,
  ImplementationEffort,
  PrioritizationBreakdown
} from '../types/resource';

export interface ScoreInputs {
  resource: ResourceType;
  observed: number;
  baseline: number;
  excess: number;
  hoursOrDaysPersisting: number;
  confidence: ConfidenceLevel;
  effort: ImplementationEffort;
  criticalLocationBonus?: boolean;
}

export function calculatePrioritizationScore(inputs: ScoreInputs): PrioritizationBreakdown {
  const {
    baseline,
    excess,
    hoursOrDaysPersisting,
    confidence,
    effort,
    criticalLocationBonus = false
  } = inputs;

  // 1. Severity Score (0 - 40 points)
  // Evaluates relative percentage excess over baseline
  const relativeExcessRatio = baseline > 0 ? excess / baseline : 1.0;
  // If excess is 100% of baseline -> 25 points; 200%+ -> 40 points (capped at 40)
  let severityScore = Math.min(40, Math.round(relativeExcessRatio * 20 * 10) / 10);
  if (severityScore < 5) severityScore = 5;

  // 2. Persistence Score (0 - 30 points)
  // Continuous or repeated deviation presents a compounding operational concern
  let persistenceScore = 10;
  if (hoursOrDaysPersisting >= 4) {
    persistenceScore = 30; // Sustained over 4+ hours or multi-day
  } else if (hoursOrDaysPersisting >= 2) {
    persistenceScore = 20; // 2 to 3 hours/days
  } else {
    persistenceScore = 12; // Isolated or transient incident
  }

  if (criticalLocationBonus) {
    persistenceScore = Math.min(30, persistenceScore + 5);
  }

  // 3. Confidence Multiplier
  // High confidence means high sensor fidelity / clear pattern
  const confidenceMultiplierMap: Record<ConfidenceLevel, number> = {
    High: 1.0,
    Moderate: 0.85,
    Low: 0.70
  };
  const confidenceMultiplier = confidenceMultiplierMap[confidence];

  // 4. Effort Divisor (Favors low-hanging fruit with fast payback)
  // Low effort -> divisor 1.0
  // Medium effort -> divisor 1.25
  // High effort -> divisor 1.60
  const effortDivisorMap: Record<ImplementationEffort, number> = {
    Low: 1.0,
    Medium: 1.25,
    High: 1.60
  };
  const effortDivisor = effortDivisorMap[effort];

  // Raw combined index: (Severity + Persistence) has a maximum of 70
  const basePoints = severityScore + persistenceScore;
  const weightedPoints = (basePoints * confidenceMultiplier) / effortDivisor;
  // Normalize basePoints max (70) to 100 scale: multiplier is 100 / 70 = 1.4285
  const rawScore = Math.round(weightedPoints * (100 / 70));
  const finalScore = Math.max(1, Math.min(100, rawScore));

  const formula = `[Severity (${severityScore}/40) + Persistence (${persistenceScore}/30)] × Conf (${confidenceMultiplier}) ÷ Effort (${effortDivisor}) = ${finalScore}/100`;

  return {
    severityScore,
    persistenceScore,
    confidenceMultiplier,
    effortDivisor,
    formula,
    finalScore
  };
}
