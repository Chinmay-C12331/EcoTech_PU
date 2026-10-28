/**
 * EcoTech PU - Presidency University Bengaluru
 * Campus Resource Intelligence Dashboard Type Definitions
 * 
 * All synthetic readings and generated recommendations are marked with isSimulated: true.
 */

export type ResourceType = 'energy' | 'water' | 'waste';

export type CampusLocation =
  | 'Academic Block 1'
  | 'Academic Block 2'
  | 'Hostel Cluster A & B'
  | 'University Food Court'
  | 'Central Library & Admin'
  | 'Sports Complex & Auditorium';

export interface EnergyReading {
  id: string;
  timestamp: string; // ISO 8601 string: YYYY-MM-DDTHH:mm:ss
  hour: number; // 0-23
  date: string; // YYYY-MM-DD
  location: CampusLocation;
  observedKwh: number;
  baselineKwh: number;
  isAfterHours: boolean; // 21:00 to 06:00
  isSimulated: true;
  flagged?: boolean;
  anomalyType?: 'after_hours_inefficiency' | 'sustained_peak_overload' | 'none';
  notes?: string;
}

export interface WaterReading {
  id: string;
  timestamp: string;
  hour: number;
  date: string;
  location: CampusLocation;
  observedLitres: number;
  baselineLitres: number;
  isOvernightWindow: boolean; // 01:00 to 05:00
  isSimulated: true;
  flagged?: boolean;
  anomalyType?: 'unusual_overnight_flow' | 'daytime_surge' | 'none';
  notes?: string;
}

export interface WasteReading {
  id: string;
  date: string; // YYYY-MM-DD
  location: CampusLocation;
  foodWasteKg: number;
  recyclableWasteKg: number;
  mixedWasteKg: number;
  totalKg: number;
  baselineTotalKg: number;
  isSimulated: true;
  flagged?: boolean;
  anomalyType?: 'mixed_waste_surge' | 'food_waste_spike' | 'low_segregation_rate' | 'none';
  notes?: string;
}

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';
export type ImplementationEffort = 'Low' | 'Medium' | 'High';

export interface PrioritizationBreakdown {
  severityScore: number; // 0 - 40 (relative excess)
  persistenceScore: number; // 0 - 30 (duration or recurrence)
  confidenceMultiplier: number; // High: 1.0, Moderate: 0.85, Low: 0.70
  effortDivisor: number; // Low: 1.0, Medium: 1.25, High: 1.60
  formula: string;
  finalScore: number; // 0 - 100
}

export interface Recommendation {
  id: string;
  resource: ResourceType;
  location: CampusLocation;
  finding: string;
  evidence: string;
  baseline: number;
  observedValue: number;
  estimatedExcess: number;
  unit: 'kWh' | 'Litres' | 'kg';
  suggestedAction: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  implementationEffort: ImplementationEffort;
  policyReference: string;
  isSimulated: true;
  priorityScore: number; // 0 - 100
  scoreBreakdown: PrioritizationBreakdown;
  detectedAt: string;
  resolved?: boolean;
  // Explainability and methodology fields (IEEE Evaluation)
  detectionRuleName?: string;
  ruleThresholdFormula?: string;
  persistenceDetails?: string;
  dataQualityLimitations?: string;
  actionRationale?: string;
}

export interface TariffAssumptions {
  electricityRateInrPerKwh: number | null; // e.g. 8.50 or null
  waterRateInrPerKl: number | null; // e.g. 60.00 (per 1000 litres) or null
  wasteDisposalRateInrPerKg: number | null; // e.g. 4.50 or null
  co2FactorKgPerKwh: number | null; // e.g. 0.82 (Grid emission factor India) or null
  isConfigured: boolean;
  notes: string;
}

export interface UniversityReferenceFact {
  metric: string;
  figure: string;
  unit: string;
  context: string;
  provenance: string;
  officialSourceUrl: string;
  disclaimer: string;
}

export interface CsvValidationResult<T> {
  isValid: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  rowCount: number;
  validRowCount: number;
}

export interface InterventionScenario {
  id: string;
  title: string;
  resource: ResourceType;
  targetLocations: CampusLocation[];
  description: string;
  expectedReductionPercent: number;
  isActive: boolean;
  estimatedRecoveryUnits: number;
  unit: 'kWh/day' | 'Litres/day' | 'kg/day';
  feasibility: 'Immediate' | 'Short-Term' | 'Capital Project';
}

export type ActionStatus =
  | 'Detected'
  | 'Acknowledged'
  | 'Investigating'
  | 'Repair Reported'
  | 'Awaiting Verification'
  | 'Verified Improvement'
  | 'No Improvement'
  | 'Inconclusive';

export interface ActionStatusHistory {
  fromStatus: ActionStatus;
  toStatus: ActionStatus;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface FollowUpMeasurement {
  id: string;
  timestamp: string;
  value: number;
  durationHoursOrDays: number;
  isComparablePeriod: boolean;
  notes?: string;
  isSimulated: boolean;
}

export type VerificationResultType = 'Verified Improvement' | 'No Improvement' | 'Inconclusive';

export interface VerificationAnalysis {
  outcome: VerificationResultType;
  beforeValue: number;
  baselineValue: number;
  followUpValue: number;
  absoluteReduction: number;
  percentageExcessAvoided: number;
  unit: 'kWh' | 'Litres' | 'kg';
  isComparable: boolean;
  sampleCount: number;
  explanation: string;
  disclaimer: string;
  isSimulated?: boolean; // True if verified using simulated/test follow-up readings; excluded from real-world campus totals
}

export interface ActionTask {
  id: string;
  recommendationId: string;
  resource: ResourceType;
  location: CampusLocation;
  title: string;
  finding: string;
  originalEvidence: string;
  originalObservedValue: number;
  originalBaseline: number;
  originalExcess: number;
  unit: 'kWh' | 'Litres' | 'kg';
  correctiveAction: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  notes: string;
  status: ActionStatus;
  history: ActionStatusHistory[];
  followUpMeasurements: FollowUpMeasurement[];
  verification?: VerificationAnalysis;
  createdAt: string;
  updatedAt: string;
}
