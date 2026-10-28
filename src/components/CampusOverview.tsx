/**
 * Campus Overview Dashboard & Shared Ranked Priority List
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Integrates:
 * 1. High-Priority Action Alerts (Top existing findings)
 * 2. Measure → Detect → Act → Verify closed-loop workflow
 * 3. Tri-Resource Surveillance Cards (kWh, Litres, kg strictly isolated)
 * 4. Shared Multi-Resource Action Priority List with Explainability Audits
 * 5. Presidency University Published Reference Benchmarks & Provenance
 */

import React, { useState } from 'react';
import { 
  EnergyReading, 
  WaterReading, 
  WasteReading, 
  Recommendation, 
  TariffAssumptions,
  ResourceType,
  ActionTask
} from '../types/resource';
import { analyzeEnergyReadings } from '../analysis/energyAnalysis';
import { analyzeWaterReadings } from '../analysis/waterAnalysis';
import { analyzeWasteReadings } from '../analysis/wasteAnalysis';
import { RecommendationCard } from './RecommendationCard';
import { CampusReferenceCard } from './CampusReferenceCard';
import { ImpactLedger } from './ImpactLedger';
import { 
  Zap, 
  Droplets, 
  Trash2, 
  ArrowRight, 
  AlertTriangle, 
  SlidersHorizontal,
  Info,
  Layers,
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  Activity,
  Search,
  CheckCircle2,
  FileCheck2,
  ChevronRight,
  X
} from 'lucide-react';

interface CampusOverviewProps {
  energyReadings: EnergyReading[];
  waterReadings: WaterReading[];
  wasteReadings: WasteReading[];
  tariffConfig: TariffAssumptions;
  onNavigateTab: (tab: 'energy' | 'water' | 'waste' | 'actions' | 'interventions' | 'architecture') => void;
  actionTasks?: ActionTask[];
  onCreateActionTask?: (rec: Recommendation) => void;
  onViewTask?: (taskId: string) => void;
}

export const CampusOverview: React.FC<CampusOverviewProps> = ({
  energyReadings,
  waterReadings,
  wasteReadings,
  tariffConfig,
  onNavigateTab,
  actionTasks = [],
  onCreateActionTask,
  onViewTask
}) => {
  const [resourceFilter, setResourceFilter] = useState<'all' | ResourceType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'excess' | 'confidence' | 'effort'>('score');

  const energyAnalysis = analyzeEnergyReadings(energyReadings);
  const waterAnalysis = analyzeWaterReadings(waterReadings);
  const wasteAnalysis = analyzeWasteReadings(wasteReadings);

  // Combine recommendations across all three resources
  const allRecommendations: Recommendation[] = [
    ...energyAnalysis.recommendations,
    ...waterAnalysis.recommendations,
    ...wasteAnalysis.recommendations
  ];

  // Top 3 highest-priority recommendations using existing priorityScore
  const topPriorityRecs = [...allRecommendations]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  // Filter recommendations by resource and search text
  const filteredRecs = allRecommendations.filter(r => {
    if (resourceFilter !== 'all' && r.resource !== resourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesLocation = r.location.toLowerCase().includes(q);
      const matchesFinding = r.finding.toLowerCase().includes(q);
      const matchesEvidence = r.evidence.toLowerCase().includes(q);
      const matchesRule = (r.detectionRuleName || '').toLowerCase().includes(q);
      const matchesResource = r.resource.toLowerCase().includes(q);
      return matchesLocation || matchesFinding || matchesEvidence || matchesRule || matchesResource;
    }
    return true;
  });

  // Sort recommendations
  const sortedRecs = [...filteredRecs].sort((a, b) => {
    if (sortBy === 'score') {
      return b.priorityScore - a.priorityScore;
    }
    if (sortBy === 'excess') {
      const aPct = a.estimatedExcess / Math.max(1, a.baseline);
      const bPct = b.estimatedExcess / Math.max(1, b.baseline);
      return bPct - aPct;
    }
    if (sortBy === 'confidence') {
      const confVal = (c: string) => (c === 'High' ? 3 : c === 'Moderate' ? 2 : 1);
      return confVal(b.confidence) - confVal(a.confidence);
    }
    if (sortBy === 'effort') {
      const effVal = (e: string) => (e === 'Low' ? 1 : e === 'Medium' ? 2 : 3);
      return effVal(a.implementationEffort) - effVal(b.implementationEffort); // Low effort first
    }
    return 0;
  });

  const getResourceIcon = (res: ResourceType) => {
    if (res === 'energy') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    if (res === 'water') return <Droplets className="w-3.5 h-3.5 text-sky-500" />;
    return <Trash2 className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 75) {
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
          Priority {score}/100 · Urgent
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          Priority {score}/100 · High
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
        Priority {score}/100 · Moderate
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Operations Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400 text-slate-950 uppercase tracking-wider">
                Resource Operations
              </span>
              <span className="text-xs text-slate-400">Presidency University Bengaluru · Rajanukunte Campus</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white mt-1">
              Integrated Tri-Resource Anomaly &amp; Corrective Action Engine
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              <strong>Deterministic Engineering Rules:</strong> Grounded in certified building codes and regulatory frameworks (BEE ECBC 2017, NBC 2016 Part 9, MoEF&amp;CC Solid Waste Management Rules 2026). Physical streams are strictly isolated (<code className="font-mono text-emerald-300 text-[11px]">kWh ≠ Litres ≠ kg</code>) with an empirical <em>Measure → Detect → Act → Verify</em> closed loop.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('architecture')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <span>Architecture &amp; Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('actions')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Action Tasks ({actionTasks.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Differentiating "Measure → Detect → Act → Verify" Closed Loop Interactive Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Differentiating Core Architecture: Closed-Loop Lifecycle</span>
            </h2>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Empirical accountability workflow connecting sensor telemetry to verified real-world operational savings.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
            Deterministic Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1: Measure */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 uppercase tracking-wide">
                  Step 1
                </span>
                <span className="text-[11px] font-medium text-slate-500">Continuous Telemetry</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Measure</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Sub-metered interval data logged separately across Electricity (kWh), Water (Litres), and Waste (kg).
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('energy')}
              className="mt-3 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-slate-200/80 w-full"
            >
              <span>Inspect Telemetry</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 2: Detect */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 uppercase tracking-wide">
                  Step 2
                </span>
                <span className="text-[11px] font-medium text-slate-500">Certified Rules</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Detect</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Rule-based anomaly checks (BEE ECBC 2017, NBC Part 9, MoEF&amp;CC SWM Rules 2026 context). Water overnight flagged as internal trigger, not leak.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('architecture')}
              className="mt-3 text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center justify-between pt-2 border-t border-slate-200/80 w-full"
            >
              <span>Examine Rule Engine</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 3: Act */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 uppercase tracking-wide">
                  Step 3
                </span>
                <span className="text-[11px] font-medium text-slate-500">Ownership &amp; SLA</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Act</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Standardized Action Tasks with assigned department owner, due dates, dimensionless priority, and audit log.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('actions')}
              className="mt-3 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 flex items-center justify-between pt-2 border-t border-slate-200/80 w-full"
            >
              <span>Open Action Tasks ({actionTasks.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 4: Verify */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 uppercase tracking-wide">
                  Step 4
                </span>
                <span className="text-[11px] font-medium text-slate-500">Empirical Audit</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>4. Verify</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Mandatory before/after follow-up measurements with comparability checks: Verified vs. Inconclusive outcome.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('actions')}
              className="mt-3 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-2 border-t border-slate-200/80 w-full"
            >
              <span>Audit Verifications</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. High-Priority Action Alerts (Top 3 Recommendations) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Top Priority Operational Findings
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Top {topPriorityRecs.length} Issues Ranked by Priority Index
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Highest urgency findings requiring immediate institutional investigation across campus facilities.
            </p>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 self-start sm:self-auto">
            SIMULATED DEMO DATA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPriorityRecs.map(rec => {
            const existingTask = actionTasks.find(t => t.recommendationId === rec.id);
            const deviationPct = Math.round((rec.estimatedExcess / Math.max(1, rec.baseline)) * 100);

            return (
              <div 
                key={rec.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-white border border-slate-200 shadow-2xs">
                        {getResourceIcon(rec.resource)}
                      </div>
                      <span className="text-xs font-bold capitalize text-slate-800">
                        {rec.resource}
                      </span>
                    </div>
                    {getPriorityBadge(rec.priorityScore)}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-2.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{rec.location}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
                    {rec.finding}
                  </h4>

                  {/* Quantitative Metric Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 rounded bg-white border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Observed</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {rec.observedValue.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{rec.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Baseline</span>
                      <span className="text-xs font-mono font-medium text-slate-600">
                        {rec.baseline.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{rec.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Excess</span>
                      <span className="text-xs font-mono font-bold text-amber-700">
                        +{rec.estimatedExcess.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-amber-600 font-medium block">+{deviationPct}%</span>
                    </div>
                  </div>

                  {/* Supporting Evidence excerpt */}
                  <p className="mt-2.5 text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white/70 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">Evidence: </span>
                    {rec.evidence}
                  </p>
                </div>

                {/* Working Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateTab(rec.resource)}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                  >
                    <span>View Stream</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {existingTask ? (
                    <button
                      onClick={() => onViewTask && onViewTask(existingTask.id)}
                      className="text-[11px] px-2 py-1 rounded font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <ClipboardCheck className="w-3 h-3 text-indigo-700" />
                      <span>Task: {existingTask.status}</span>
                    </button>
                  ) : (
                    onCreateActionTask && (
                      <button
                        onClick={() => onCreateActionTask(rec)}
                        className="text-[11px] px-2.5 py-1 rounded font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <ClipboardCheck className="w-3 h-3" />
                        <span>Create Task</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tri-Resource Surveillance Summary Cards (kWh, Litres, kg) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Campus Tri-Resource Surveillance</span>
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic sensor audit spanning Electricity (<code className="font-mono text-slate-700 font-semibold">kWh</code>), Water (<code className="font-mono text-slate-700 font-semibold">Litres</code>), and Solid Waste (<code className="font-mono text-slate-700 font-semibold">kg</code>)
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded self-start sm:self-auto">
            SIMULATED DEMO DATA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Energy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Electricity Telemetry</h3>
                    <span className="text-[11px] text-slate-500">72-Hour Continuous Audit</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/50">
                  {energyAnalysis.recommendations.length} Action{energyAnalysis.recommendations.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Observed Energy:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {energyAnalysis.totalObservedKwh.toLocaleString()} kWh
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Expected Baseline:</span>
                  <span className="font-mono text-slate-600">
                    {energyAnalysis.totalBaselineKwh.toLocaleString()} kWh
                  </span>
                </div>

                <div className="flex items-center justify-between font-semibold text-amber-800 bg-amber-50/60 p-2 rounded border border-amber-200/60">
                  <span>Estimated Deviation:</span>
                  <span className="font-mono font-bold">
                    +{energyAnalysis.totalExcessKwh.toLocaleString()} kWh
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Key Finding: </span>
                  After-hours continuous load flagged in Academic Block 2 between 01:00–05:00 (+363 kWh off-hours excess).
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('energy')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center justify-between w-full transition-colors"
            >
              <span>Explore Energy Telemetry &amp; Hourly Curves</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Water */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/60">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Water Volumetric Flow</h3>
                    <span className="text-[11px] text-slate-500">72-Hour Continuous Audit</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200/50">
                  {waterAnalysis.recommendations.length} Action{waterAnalysis.recommendations.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Observed Volume:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {waterAnalysis.totalObservedLitres.toLocaleString()} Litres
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Expected Baseline:</span>
                  <span className="font-mono text-slate-600">
                    {waterAnalysis.totalBaselineLitres.toLocaleString()} Litres
                  </span>
                </div>

                <div className="flex items-center justify-between font-semibold text-sky-900 bg-sky-50/60 p-2 rounded border border-sky-200/60">
                  <span>Estimated Deviation:</span>
                  <span className="font-mono font-bold">
                    +{waterAnalysis.totalExcessLitres.toLocaleString()} Litres
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Audit Protocol: </span>
                  Nocturnal continuous flow identified in Academic Block 1; logged as an <em>inspection trigger</em> for physical audit.
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('water')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center justify-between w-full transition-colors"
            >
              <span>Explore Water Flow &amp; Night Windows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Waste */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Waste &amp; Circularity</h3>
                    <span className="text-[11px] text-slate-500">14-Day Discard Audit</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                  {wasteAnalysis.recommendations.length} Action{wasteAnalysis.recommendations.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Audited Mass:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {wasteAnalysis.totalWasteKg.toLocaleString()} kg
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Avg Food Discard:</span>
                  <span className="font-mono text-slate-600">
                    {wasteAnalysis.averageDailyFoodWasteKg} kg/day
                  </span>
                </div>

                <div className="flex items-center justify-between font-semibold text-emerald-900 bg-emerald-50/60 p-2 rounded border border-emerald-200/60">
                  <span>Segregation Rate:</span>
                  <span className="font-mono font-bold">
                    {wasteAnalysis.averageSegregationRatePercent}%
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Key Finding: </span>
                  Event food waste surge in Food Court (+85 kg excess); source segregation deficit in Academic Block 1 corridors.
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('waste')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between w-full transition-colors"
            >
              <span>Explore Waste Streams &amp; Segregation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Campus Sustainability Impact Ledger (Evidence Chain & Verified Savings) */}
      <ImpactLedger
        recommendations={allRecommendations}
        actionTasks={actionTasks}
        onCreateActionTask={onCreateActionTask}
        onViewTask={onViewTask}
        onNavigateTab={onNavigateTab}
      />

      {/* 6. Shared Multi-Resource Action Priority List */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Shared Multi-Resource Action Priority List
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                {sortedRecs.length} Ranked Interventions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified cross-resource prioritization using an explainable dimensionless score: 
              <span className="font-mono text-slate-700 font-medium"> [(Severity + Persistence) × Confidence] ÷ Effort</span>.
            </p>
          </div>

          {/* Filtering and Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Interactive Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search findings, locations..."
                className="text-xs pl-8 pr-7 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Resource Filter Segmented Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setResourceFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  resourceFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allRecommendations.length})
              </button>
              <button
                onClick={() => setResourceFilter('energy')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  resourceFilter === 'energy' ? 'bg-white text-amber-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                Energy ({energyAnalysis.recommendations.length})
              </button>
              <button
                onClick={() => setResourceFilter('water')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  resourceFilter === 'water' ? 'bg-white text-sky-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-sky-800'
                }`}
              >
                Water ({waterAnalysis.recommendations.length})
              </button>
              <button
                onClick={() => setResourceFilter('waste')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  resourceFilter === 'waste' ? 'bg-white text-emerald-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-emerald-800'
                }`}
              >
                Waste ({wasteAnalysis.recommendations.length})
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="score">Sort: Priority Score</option>
                <option value="excess">Sort: Relative Excess %</option>
                <option value="confidence">Sort: Confidence</option>
                <option value="effort">Sort: Effort (Fastest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Explainability Documentation Banner */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Methodology Transparency: </span>
            To preserve physical rigor, quantities from different physical dimensions (<code className="font-mono text-slate-800">kWh</code>, <code className="font-mono text-slate-800">Litres</code>, and <code className="font-mono text-slate-800">kg</code>) are kept distinct and never added into a combined sum. Prioritization is established via dimensionless Severity (0-40 pts), Persistence (0-30 pts), Sensor Confidence weight (0.70 - 1.0x), and Operational Effort factor (1.0 - 1.6x).
          </div>
        </div>

        {/* Recommendation Cards */}
        {sortedRecs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500 space-y-2">
            <div>No operational recommendations match the current search or resource filters.</div>
            {(searchQuery || resourceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResourceFilter('all');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              >
                Reset Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRecs.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                tariffConfig={tariffConfig}
                onCreateActionTask={onCreateActionTask}
                existingTask={actionTasks.find(t => t.recommendationId === rec.id)}
                onViewTask={onViewTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Presidency University Published Sustainability Reference Foundation */}
      <div className="pt-4 border-t border-slate-200">
        <CampusReferenceCard />
      </div>
    </div>
  );
};
