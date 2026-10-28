/**
 * Evidence-Backed Recommendation Card
 * EcoTech PU - Presidency University Bengaluru
 */

import React, { useState } from 'react';
import { 
  Recommendation, 
  TariffAssumptions,
  ActionTask
} from '../types/resource';
import { 
  Zap, 
  Droplets, 
  Trash2, 
  AlertTriangle, 
  ArrowUpRight, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Clock,
  ClipboardCheck
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  tariffConfig: TariffAssumptions;
  onToggleResolve?: (id: string) => void;
  onCreateActionTask?: (rec: Recommendation) => void;
  existingTask?: ActionTask;
  onViewTask?: (taskId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation: r,
  tariffConfig,
  onToggleResolve,
  onCreateActionTask,
  existingTask,
  onViewTask
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const getResourceIcon = () => {
    if (r.resource === 'energy') return <Zap className="w-4 h-4 text-amber-500" />;
    if (r.resource === 'water') return <Droplets className="w-4 h-4 text-sky-500" />;
    return <Trash2 className="w-4 h-4 text-emerald-600" />;
  };

  const getConfidenceColor = () => {
    if (r.confidence === 'High') return 'text-emerald-700 font-semibold';
    if (r.confidence === 'Moderate') return 'text-amber-700 font-medium';
    return 'text-slate-600 font-normal';
  };

  const getEffortColor = () => {
    if (r.implementationEffort === 'Low') return 'text-emerald-700 font-semibold';
    if (r.implementationEffort === 'Medium') return 'text-slate-700 font-medium';
    return 'text-purple-700 font-semibold';
  };

  // Calculate hypothetical cost impact only if tariffs are configured, disclosing assumptions
  const getHypotheticalCost = () => {
    if (!tariffConfig.isConfigured) {
      return {
        label: 'Cost impact cannot yet be calculated reliably',
        subtext: 'Requires verified campus tariff schedule (e.g. BESCOM commercial tariff).'
      };
    }

    if (r.resource === 'energy' && tariffConfig.electricityRateInrPerKwh) {
      const inr = Math.round(r.estimatedExcess * tariffConfig.electricityRateInrPerKwh);
      return {
        label: `₹${inr.toLocaleString()} hypothetical excess`,
        subtext: `At configured baseline rate ₹${tariffConfig.electricityRateInrPerKwh}/kWh (Assumed).`
      };
    }

    if (r.resource === 'water' && tariffConfig.waterRateInrPerKl) {
      const inr = Math.round((r.estimatedExcess / 1000) * tariffConfig.waterRateInrPerKl);
      return {
        label: `₹${inr.toLocaleString()} hypothetical excess`,
        subtext: `At configured rate ₹${tariffConfig.waterRateInrPerKl}/kL (Assumed).`
      };
    }

    if (r.resource === 'waste' && tariffConfig.wasteDisposalRateInrPerKg) {
      const inr = Math.round(r.estimatedExcess * tariffConfig.wasteDisposalRateInrPerKg);
      return {
        label: `₹${inr.toLocaleString()} potential tipping savings`,
        subtext: `At assumed handling rate ₹${tariffConfig.wasteDisposalRateInrPerKg}/kg.`
      };
    }

    return {
      label: 'Cost impact cannot yet be calculated reliably',
      subtext: 'Tariff rate not set for this resource stream.'
    };
  };

  const costInfo = getHypotheticalCost();

  return (
    <div className={`bg-white rounded-lg border transition-all shadow-xs ${
      r.resolved ? 'border-slate-200 opacity-60 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="p-5">
        {/* Header: Resource, Location, Priority Score */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-slate-100 text-slate-700 shrink-0 mt-0.5">
              {getResourceIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize font-semibold text-slate-800">{r.resource} Intelligence</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {r.location}
                </span>
                <span>·</span>
                <span className="text-slate-400">SIMULATED DEMO DATA</span>
              </div>
              <h4 className="text-base font-semibold text-slate-900 mt-1 leading-snug">
                {r.finding}
              </h4>
            </div>
          </div>

          {/* Priority Score Gauge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Priority Index
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold tracking-tight ${
                r.priorityScore >= 75 ? 'text-rose-600' :
                r.priorityScore >= 50 ? 'text-amber-600' : 'text-slate-700'
              }`}>
                {r.priorityScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Evidence & Metrics Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-500 block">Observed Value:</span>
            <span className="text-sm font-semibold font-mono text-slate-900 mt-0.5 block">
              {r.observedValue.toLocaleString()} {r.unit}
            </span>
            <span className="text-[11px] text-slate-400">Telemetry observation</span>
          </div>

          <div>
            <span className="text-slate-500 block">Baseline Expected:</span>
            <span className="text-sm font-semibold font-mono text-slate-700 mt-0.5 block">
              {r.baseline.toLocaleString()} {r.unit}
            </span>
            <span className="text-[11px] text-slate-400">Quiescent standard</span>
          </div>

          <div>
            <span className="text-slate-500 block">Estimated Deviation:</span>
            <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block">
              +{r.estimatedExcess.toLocaleString()} {r.unit}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              +{Math.round((r.estimatedExcess / Math.max(1, r.baseline)) * 100)}% over baseline
            </span>
          </div>
        </div>

        {/* Concrete Evidence Narrative */}
        <div className="mt-3 text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">
          <span className="font-semibold text-slate-900 block mb-0.5">Audit Evidence:</span>
          {r.evidence}
        </div>

        {/* Suggested Action */}
        <div className="mt-3 text-xs text-emerald-950 bg-emerald-50/60 p-3.5 rounded border border-emerald-200/80 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Recommended Intervention Protocol:</span>
          </div>
          {r.suggestedAction}
        </div>

        {/* Metadata Strip: Confidence, Effort, Policy, Cost Disclosures */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
            <div>
              <span className="text-slate-500">Confidence: </span>
              <span className={getConfidenceColor()}>{r.confidence}</span>
            </div>

            <span className="text-slate-300">·</span>

            <div>
              <span className="text-slate-500">Implementation Effort: </span>
              <span className={getEffortColor()}>{r.implementationEffort}</span>
            </div>

            <span className="text-slate-300">·</span>

            <div className="flex items-center gap-1 text-slate-500 max-w-xs truncate" title={r.policyReference}>
              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{r.policyReference}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <span>{showFormula ? 'Hide Explainability Audit' : 'Explain Detection & Scoring'}</span>
              {showFormula ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {existingTask ? (
              <button
                onClick={() => onViewTask && onViewTask(existingTask.id)}
                className="text-xs px-2.5 py-1 rounded font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>Task: {existingTask.status}</span>
              </button>
            ) : (
              onCreateActionTask && (
                <button
                  onClick={() => onCreateActionTask(r)}
                  className="text-xs px-2.5 py-1 rounded font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Create Action Task</span>
                </button>
              )
            )}

            {onToggleResolve && (
              <button
                onClick={() => onToggleResolve(r.id)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  r.resolved
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {r.resolved ? 'Reopen Action' : 'Mark Addressed'}
              </button>
            )}
          </div>
        </div>

        {/* Comprehensive Explainable Detection & Prioritization Audit Panel */}
        {showFormula && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-lg text-xs space-y-3.5 shadow-md animate-fadeIn">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  EXPLAINABLE DETECTION AUDIT
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">Physics & Rule-Based Model (Zero Black-Box AI)</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                IEEE Standard Audit
              </span>
            </div>

            {/* 1. Detection Rule & Threshold */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                1. Triggering Detection Rule & Threshold
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] font-mono leading-relaxed text-slate-300">
                <div className="text-emerald-400 font-bold mb-0.5">
                  Rule: {r.detectionRuleName || 'Statistical Baseline Deviation Rule'}
                </div>
                <div className="text-amber-200/90">
                  Threshold: {r.ruleThresholdFormula || `Observed > 1.30 × Baseline AND (Observed - Baseline) > 0 ${r.unit}`}
                </div>
              </div>
            </div>

            {/* 2. Deviation & Persistence Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-850 bg-slate-800/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Baseline vs Observed:</span>
                <span className="text-slate-200 font-bold">
                  {r.baseline} → {r.observedValue} {r.unit}
                </span>
              </div>
              <div className="p-2 bg-slate-850 bg-slate-800/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Absolute & % Deviation:</span>
                <span className="text-amber-400 font-bold">
                  +{r.estimatedExcess} {r.unit} (+{Math.round((r.estimatedExcess / Math.max(1, r.baseline)) * 100)}%)
                </span>
              </div>
              <div className="p-2 bg-slate-850 bg-slate-800/60 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Persistence Window:</span>
                <span className="text-slate-200 font-medium">
                  {r.persistenceDetails || 'Multi-hour sustained profile'}
                </span>
              </div>
            </div>

            {/* 3. Data Quality & Limitations */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
                2. Data Quality & Sensor Limitations
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                {r.dataQualityLimitations || 'Simulated hourly telemetry log (Deterministic Seed #42) with Gaussian noise. Sub-feeder telemetry does not isolate individual branch circuits without on-site sub-metering.'}
              </div>
            </div>

            {/* 4. Action Rationale: Why This Remedy is Appropriate */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                3. Action Rationale & Causal Linkage
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                {r.actionRationale || 'The recommended protocol directly targets the mechanical or operational subsystem identified by the anomaly, avoiding costly broad replacements.'}
              </div>
            </div>

            {/* 5. Explainable Prioritization Formula Breakdown */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-purple-300 uppercase tracking-wider">
                  4. Dimensionless Prioritization Formula
                </span>
                <span className="text-amber-300 font-mono font-bold">
                  Score: {r.priorityScore}/100
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-mono">
                Formula: <span className="text-amber-300">{r.scoreBreakdown.formula}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1 font-mono">
                <div>
                  <span className="block text-slate-500">Severity (Max 40):</span>
                  <span className="text-slate-200 font-semibold">{r.scoreBreakdown.severityScore} pts</span>
                </div>
                <div>
                  <span className="block text-slate-500">Persistence (Max 30):</span>
                  <span className="text-slate-200 font-semibold">{r.scoreBreakdown.persistenceScore} pts</span>
                </div>
                <div>
                  <span className="block text-slate-500">Confidence Weight:</span>
                  <span className="text-slate-200 font-semibold">{r.scoreBreakdown.confidenceMultiplier}x</span>
                </div>
                <div>
                  <span className="block text-slate-500">Effort Divisor:</span>
                  <span className="text-slate-200 font-semibold">{r.scoreBreakdown.effortDivisor}x</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                * Physical units ({r.unit}) are kept separate. Prioritization uses dimensionless indices to prevent nonsensical addition across kWh, Litres, and kg.
              </div>
            </div>
          </div>
        )}

        {/* Hypothetical Economic Cost Disclosures Strip */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-slate-700">{costInfo.label}. </span>
            <span className="italic">{costInfo.subtext}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
