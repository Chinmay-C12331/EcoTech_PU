/**
 * Campus Sustainability Impact Ledger
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Standout Feature: An unbroken, verifiable evidence chain connecting:
 * Raw Telemetry → Rule Detection → Action Dispatch → Empirical Follow-up → Outcome Verification
 * 
 * Strict Physical Integrity Mandate:
 * kWh, Litres, and kg remain strictly isolated (kWh ≠ Litres ≠ kg).
 * No commingling of incompatible dimensions.
 */

import React, { useState, useMemo } from 'react';
import { 
  Recommendation, 
  ActionTask, 
  ResourceType, 
  CampusLocation, 
  ActionStatus 
} from '../types/resource';
import { 
  FileCheck2, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  User, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export type LedgerOutcomeFilter = 
  | 'all' 
  | 'opportunity' 
  | 'in_progress' 
  | 'verified_real'
  | 'simulated_demo'
  | 'verified_improvement' 
  | 'no_improvement' 
  | 'inconclusive';

interface ImpactLedgerProps {
  recommendations: Recommendation[];
  actionTasks: ActionTask[];
  onNavigateTab: (tab: 'energy' | 'water' | 'waste' | 'actions' | 'interventions' | 'architecture') => void;
  onCreateActionTask?: (rec: Recommendation) => void;
  onViewTask?: (taskId: string) => void;
}

interface LedgerEntry {
  id: string;
  resource: ResourceType;
  location: CampusLocation;
  policyReference: string;
  finding: string;
  detectionRuleName: string;
  ruleThresholdFormula: string;
  persistenceDetails: string;
  dataQualityLimitations: string;
  baseline: number;
  observed: number;
  excess: number;
  unit: 'kWh' | 'Litres' | 'kg';
  correctiveAction: string;
  task?: ActionTask;
  outcomeType: 'Potential Opportunity' | 'Action in Progress' | 'Verified Improvement' | 'No Improvement' | 'Inconclusive';
  isSimulatedVerification: boolean;
  owner: string;
  dueDate: string;
  followUpSamples: number;
  latestFollowUpValue: number | null;
  percentageAvoided: number | null;
  absoluteAvoided: number | null;
  isComparable: boolean;
  priorityScore: number;
}

export const ImpactLedger: React.FC<ImpactLedgerProps> = ({
  recommendations,
  actionTasks,
  onNavigateTab,
  onCreateActionTask,
  onViewTask
}) => {
  const [resourceFilter, setResourceFilter] = useState<'all' | ResourceType>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<LedgerOutcomeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Synthesize Ledger entries by matching tasks to recommendations
  const ledgerEntries: LedgerEntry[] = useMemo(() => {
    const entries: LedgerEntry[] = [];
    const taskByRecId = new Map<string, ActionTask>();
    actionTasks.forEach(t => {
      taskByRecId.set(t.recommendationId, t);
    });

    // 1. Process all recommendations
    recommendations.forEach(rec => {
      const associatedTask = taskByRecId.get(rec.id);
      
      let outcomeType: LedgerEntry['outcomeType'] = 'Potential Opportunity';
      let owner = 'Unassigned';
      let dueDate = 'Pending Task Dispatch';
      let followUpSamples = 0;
      let latestFollowUpValue: number | null = null;
      let percentageAvoided: number | null = null;
      let absoluteAvoided: number | null = null;
      let isComparable = true;

      let isSimulatedVerification = false;
      if (associatedTask) {
        owner = associatedTask.owner;
        dueDate = associatedTask.dueDate;
        followUpSamples = associatedTask.followUpMeasurements.length;
        isSimulatedVerification = Boolean(
          associatedTask.verification?.isSimulated ||
          associatedTask.followUpMeasurements.some(m => m.isSimulated)
        );

        if (associatedTask.followUpMeasurements.length > 0) {
          const latestM = associatedTask.followUpMeasurements[associatedTask.followUpMeasurements.length - 1];
          latestFollowUpValue = latestM.value;
          isComparable = latestM.isComparablePeriod;
        }

        if (associatedTask.verification) {
          percentageAvoided = associatedTask.verification.percentageExcessAvoided;
          absoluteAvoided = associatedTask.verification.absoluteReduction;
          if (associatedTask.verification.outcome === 'Verified Improvement') {
            outcomeType = 'Verified Improvement';
          } else if (associatedTask.verification.outcome === 'No Improvement') {
            outcomeType = 'No Improvement';
          } else {
            outcomeType = 'Inconclusive';
          }
        } else {
          outcomeType = 'Action in Progress';
        }
      }

      entries.push({
        id: rec.id,
        resource: rec.resource,
        location: rec.location,
        policyReference: rec.policyReference,
        finding: rec.finding,
        detectionRuleName: rec.detectionRuleName || 'Institutional Standard Rule',
        ruleThresholdFormula: rec.ruleThresholdFormula || 'Observed > Baseline',
        persistenceDetails: rec.persistenceDetails || 'Documented interval',
        dataQualityLimitations: rec.dataQualityLimitations || 'Telemetry interval limitation',
        baseline: rec.baseline,
        observed: rec.observedValue,
        excess: rec.estimatedExcess,
        unit: rec.unit,
        correctiveAction: rec.suggestedAction,
        task: associatedTask,
        outcomeType,
        isSimulatedVerification,
        owner,
        dueDate,
        followUpSamples,
        latestFollowUpValue,
        percentageAvoided,
        absoluteAvoided,
        isComparable,
        priorityScore: rec.priorityScore
      });
    });

    // 2. Also include any custom tasks created independently of standard synthetic rec IDs
    actionTasks.forEach(task => {
      const alreadyInList = entries.some(e => e.id === task.recommendationId || (e.task && e.task.id === task.id));
      if (!alreadyInList) {
        let outcomeType: LedgerEntry['outcomeType'] = 'Action in Progress';
        if (task.verification) {
          outcomeType = task.verification.outcome;
        }

        const isSimulatedVerification = Boolean(
          task.verification?.isSimulated ||
          task.followUpMeasurements.some(m => m.isSimulated)
        );

        const latestM = task.followUpMeasurements[task.followUpMeasurements.length - 1];

        entries.push({
          id: task.recommendationId || task.id,
          resource: task.resource,
          location: task.location,
          policyReference: 'Presidency University Facility Management SOP',
          finding: task.finding,
          detectionRuleName: 'Direct Action Task Dispatch',
          ruleThresholdFormula: 'Observed > Baseline Target',
          persistenceDetails: 'Operational audit window',
          dataQualityLimitations: 'Field engineer observation',
          baseline: task.originalBaseline,
          observed: task.originalObservedValue,
          excess: task.originalExcess,
          unit: task.unit,
          correctiveAction: task.correctiveAction,
          task,
          outcomeType,
          isSimulatedVerification,
          owner: task.owner,
          dueDate: task.dueDate,
          followUpSamples: task.followUpMeasurements.length,
          latestFollowUpValue: latestM ? latestM.value : null,
          percentageAvoided: task.verification ? task.verification.percentageExcessAvoided : null,
          absoluteAvoided: task.verification ? task.verification.absoluteReduction : null,
          isComparable: latestM ? latestM.isComparablePeriod : true,
          priorityScore: task.priority === 'High' ? 85 : task.priority === 'Medium' ? 65 : 45
        });
      }
    });

    return entries;
  }, [recommendations, actionTasks]);

  // Filtered Ledger entries
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      // Resource filter
      if (resourceFilter !== 'all' && entry.resource !== resourceFilter) return false;

      // Outcome filter
      if (outcomeFilter === 'opportunity' && entry.outcomeType !== 'Potential Opportunity') return false;
      if (outcomeFilter === 'in_progress' && entry.outcomeType !== 'Action in Progress') return false;
      if (outcomeFilter === 'verified_real' && (entry.outcomeType !== 'Verified Improvement' || entry.isSimulatedVerification)) return false;
      if (outcomeFilter === 'simulated_demo' && (entry.outcomeType !== 'Verified Improvement' || !entry.isSimulatedVerification)) return false;
      if (outcomeFilter === 'verified_improvement' && entry.outcomeType !== 'Verified Improvement') return false;
      if (outcomeFilter === 'no_improvement' && entry.outcomeType !== 'No Improvement') return false;
      if (outcomeFilter === 'inconclusive' && entry.outcomeType !== 'Inconclusive') return false;

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLoc = entry.location.toLowerCase().includes(q);
        const matchesFinding = entry.finding.toLowerCase().includes(q);
        const matchesOwner = entry.owner.toLowerCase().includes(q);
        const matchesRule = entry.detectionRuleName.toLowerCase().includes(q);
        if (!matchesLoc && !matchesFinding && !matchesOwner && !matchesRule) return false;
      }

      return true;
    });
  }, [ledgerEntries, resourceFilter, outcomeFilter, searchQuery]);

  // Summary Metrics (Isolated by physical resource - strictly separated into Real-World vs Simulated Demo)
  const summaryMetrics = useMemo(() => {
    let opportunitiesCount = 0;
    let inProgressCount = 0;
    let realWorldVerifiedCount = 0;
    let simulatedDemoVerifiedCount = 0;
    let inconclusiveCount = 0;

    let energyVerifiedAvoidedKwh = 0;
    let waterVerifiedAvoidedLitres = 0;
    let wasteVerifiedAvoidedKg = 0;

    let simEnergyVerifiedAvoidedKwh = 0;
    let simWaterVerifiedAvoidedLitres = 0;
    let simWasteVerifiedAvoidedKg = 0;

    let energyActiveExcessKwh = 0;
    let waterActiveExcessLitres = 0;
    let wasteActiveExcessKg = 0;

    ledgerEntries.forEach(entry => {
      if (entry.outcomeType === 'Potential Opportunity') {
        opportunitiesCount++;
      } else if (entry.outcomeType === 'Action in Progress') {
        inProgressCount++;
      } else if (entry.outcomeType === 'Verified Improvement') {
        if (entry.isSimulatedVerification) {
          simulatedDemoVerifiedCount++;
          if (entry.resource === 'energy' && entry.absoluteAvoided) {
            simEnergyVerifiedAvoidedKwh += entry.absoluteAvoided;
          } else if (entry.resource === 'water' && entry.absoluteAvoided) {
            simWaterVerifiedAvoidedLitres += entry.absoluteAvoided;
          } else if (entry.resource === 'waste' && entry.absoluteAvoided) {
            simWasteVerifiedAvoidedKg += entry.absoluteAvoided;
          }
        } else {
          realWorldVerifiedCount++;
          if (entry.resource === 'energy' && entry.absoluteAvoided) {
            energyVerifiedAvoidedKwh += entry.absoluteAvoided;
          } else if (entry.resource === 'water' && entry.absoluteAvoided) {
            waterVerifiedAvoidedLitres += entry.absoluteAvoided;
          } else if (entry.resource === 'waste' && entry.absoluteAvoided) {
            wasteVerifiedAvoidedKg += entry.absoluteAvoided;
          }
        }
      } else if (entry.outcomeType === 'Inconclusive' || entry.outcomeType === 'No Improvement') {
        inconclusiveCount++;
      }

      // Active in-flight excess (items not yet resolved)
      if (entry.outcomeType !== 'Verified Improvement') {
        if (entry.resource === 'energy') energyActiveExcessKwh += entry.excess;
        else if (entry.resource === 'water') waterActiveExcessLitres += entry.excess;
        else if (entry.resource === 'waste') wasteActiveExcessKg += entry.excess;
      }
    });

    return {
      opportunitiesCount,
      inProgressCount,
      verifiedCount: realWorldVerifiedCount, // Real-world verified improvements (0)
      realWorldVerifiedCount,
      simulatedDemoVerifiedCount,
      inconclusiveCount,
      energyVerifiedAvoidedKwh: Math.round(energyVerifiedAvoidedKwh * 10) / 10,
      waterVerifiedAvoidedLitres: Math.round(waterVerifiedAvoidedLitres),
      wasteVerifiedAvoidedKg: Math.round(wasteVerifiedAvoidedKg * 10) / 10,
      simEnergyVerifiedAvoidedKwh: Math.round(simEnergyVerifiedAvoidedKwh * 10) / 10,
      simWaterVerifiedAvoidedLitres: Math.round(simWaterVerifiedAvoidedLitres),
      simWasteVerifiedAvoidedKg: Math.round(simWasteVerifiedAvoidedKg * 10) / 10,
      energyActiveExcessKwh: Math.round(energyActiveExcessKwh * 10) / 10,
      waterActiveExcessLitres: Math.round(waterActiveExcessLitres),
      wasteActiveExcessKg: Math.round(wasteActiveExcessKg * 10) / 10
    };
  }, [ledgerEntries]);

  // Export Ledger to CSV
  const handleExportCsv = () => {
    const headers = [
      'Resource',
      'Location',
      'Detection Rule',
      'Policy Reference',
      'Observed Value',
      'Baseline Target',
      'Excess Deviation',
      'Unit',
      'Assigned Owner',
      'Due Date',
      'Outcome Status',
      'Follow-Up Value',
      'Avoided Reduction',
      'Avoided Percent'
    ];

    const rows = filteredEntries.map(e => [
      `"${e.resource}"`,
      `"${e.location}"`,
      `"${e.detectionRuleName.replace(/"/g, '""')}"`,
      `"${e.policyReference.replace(/"/g, '""')}"`,
      e.observed,
      e.baseline,
      e.excess,
      `"${e.unit}"`,
      `"${e.owner}"`,
      `"${e.dueDate}"`,
      `"${e.outcomeType}"`,
      e.latestFollowUpValue !== null ? e.latestFollowUpValue : 'N/A',
      e.absoluteAvoided !== null ? e.absoluteAvoided : 'N/A',
      e.percentageAvoided !== null ? `${e.percentageAvoided}%` : 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `presidency_pu_impact_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResourcePill = (resource: ResourceType) => {
    switch (resource) {
      case 'energy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Zap className="w-3 h-3 text-amber-600" />
            Energy (kWh)
          </span>
        );
      case 'water':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Droplets className="w-3 h-3 text-sky-600" />
            Water (Litres)
          </span>
        );
      case 'waste':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Trash2 className="w-3 h-3 text-emerald-600" />
            Waste (kg)
          </span>
        );
    }
  };

  const getOutcomeBadge = (outcome: LedgerEntry['outcomeType'], isSimulated?: boolean) => {
    switch (outcome) {
      case 'Potential Opportunity':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Potential Opportunity
          </span>
        );
      case 'Action in Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Activity className="w-3 h-3 text-indigo-600 animate-spin" />
            Action in Progress
          </span>
        );
      case 'Verified Improvement':
        if (isSimulated) {
          return (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-950 border border-indigo-300"
              title="Demonstrates algorithmic recovery using simulated demo telemetry; excluded from real-world totals."
            >
              <Sparkles className="w-3 h-3 text-indigo-700" />
              Simulated Improvement (Demo Test)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Verified Real-World Improvement
          </span>
        );
      case 'No Improvement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            No Improvement
          </span>
        );
      case 'Inconclusive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-300">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            Inconclusive
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Campus Sustainability Impact Ledger</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Audited Evidence Chain
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete accountability trail linking detected anomalies to assigned corrective maintenance and empirical verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Export full evidence chain to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* Physical Integrity Callout */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-900">Conservation Law Compliance: </span>
          Energy (<code className="font-mono text-amber-700">kWh</code>), Water (<code className="font-mono text-sky-700">Litres</code>), and Waste (<code className="font-mono text-emerald-700">kg</code>) are isolated physical streams. In accordance with engineering standards, avoided quantities are reported exclusively within each domain and never aggregated into an unscientific combined scalar.
        </div>
      </div>

      {/* High-Level Status Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Potential Opportunities
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {summaryMetrics.opportunitiesCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Awaiting task dispatch
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-200">
          <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider block">
            Active in Workflow
          </span>
          <div className="text-2xl font-bold text-indigo-950 mt-1 font-mono">
            {summaryMetrics.inProgressCount}
          </div>
          <span className="text-[11px] text-indigo-700 mt-0.5 block">
            In investigation / repair
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
            Verified Real-World
          </span>
          <div className="text-2xl font-bold text-emerald-950 mt-1 font-mono">
            {summaryMetrics.realWorldVerifiedCount}
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            {summaryMetrics.realWorldVerifiedCount === 0 ? 'Awaiting certified field meters' : 'Empirical sensor verified'}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
              Simulated Demo Verifications
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-950 mt-1 font-mono">
            {summaryMetrics.simulatedDemoVerifiedCount}
          </div>
          <span className="text-[11px] text-purple-700 mt-0.5 block">
            Algorithmic test runs (quarantined)
          </span>
        </div>
      </div>

      {/* Tri-Resource Isolated Avoided Quantities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Real-World Achieved Recovery (Empirical Physical Sensors Only)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Synthetic readings strictly excluded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Energy Isolated Block */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">Electricity</span>
                <span className="text-[11px] text-amber-800">
                  Active In-Flight: {summaryMetrics.energyActiveExcessKwh} kWh
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 block font-mono">
                {summaryMetrics.energyVerifiedAvoidedKwh > 0 ? `-${summaryMetrics.energyVerifiedAvoidedKwh} kWh` : '0 kWh'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Real-World Verified</span>
            </div>
          </div>

          {/* Water Isolated Block */}
          <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-sky-950 block">Water</span>
                <span className="text-[11px] text-sky-800">
                  Active In-Flight: {summaryMetrics.waterActiveExcessLitres.toLocaleString()} L
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 block font-mono">
                {summaryMetrics.waterVerifiedAvoidedLitres > 0 ? `-${summaryMetrics.waterVerifiedAvoidedLitres.toLocaleString()} L` : '0 Litres'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Real-World Verified</span>
            </div>
          </div>

          {/* Waste Isolated Block */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Waste</span>
                <span className="text-[11px] text-emerald-800">
                  Active In-Flight: {summaryMetrics.wasteActiveExcessKg} kg
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 block font-mono">
                {summaryMetrics.wasteVerifiedAvoidedKg > 0 ? `-${summaryMetrics.wasteVerifiedAvoidedKg} kg` : '0 kg'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Real-World Verified</span>
            </div>
          </div>
        </div>

        {/* Dedicated Simulated Demo Verifications Box */}
        {summaryMetrics.simulatedDemoVerifiedCount > 0 && (
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-950">Simulated Demo Verification Sandbox:</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono">
                  Synthetic Telemetry Proof-of-Concept
                </span>
              </div>
              <p className="mt-0.5 text-indigo-800 leading-relaxed text-[11px]">
                The verification engine successfully demonstrated algorithmic before/after evaluation on <strong>{summaryMetrics.simulatedDemoVerifiedCount} test task(s)</strong> (Academic Block 2 after-hours BMS automation, recording ~{summaryMetrics.simEnergyVerifiedAvoidedKwh} kWh simulated avoidance). As required by scientific integrity rules, simulated data is quarantined in this test category and zero is recorded in real-world campus totals until physical meters are connected.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Stream Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setResourceFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              resourceFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Resources ({ledgerEntries.length})
          </button>
          <button
            onClick={() => setResourceFilter('energy')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              resourceFilter === 'energy'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Energy</span>
          </button>
          <button
            onClick={() => setResourceFilter('water')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              resourceFilter === 'water'
                ? 'bg-sky-600 text-white font-semibold'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Water</span>
          </button>
          <button
            onClick={() => setResourceFilter('waste')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              resourceFilter === 'waste'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Waste</span>
          </button>
        </div>

        {/* Outcome Selector & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={outcomeFilter}
            onChange={e => setOutcomeFilter(e.target.value as LedgerOutcomeFilter)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Outcome States</option>
            <option value="opportunity">Potential Opportunities ({summaryMetrics.opportunitiesCount})</option>
            <option value="in_progress">Action in Progress ({summaryMetrics.inProgressCount})</option>
            <option value="verified_real">Verified Real-World ({summaryMetrics.realWorldVerifiedCount})</option>
            <option value="simulated_demo">Simulated Demo Verification ({summaryMetrics.simulatedDemoVerifiedCount})</option>
            <option value="no_improvement">No Improvement</option>
            <option value="inconclusive">Inconclusive ({summaryMetrics.inconclusiveCount})</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search location or rule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-800 w-44 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No ledger records matching the selected stream and outcome filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredEntries.map(entry => {
              const isExpanded = expandedId === entry.id;
              const associatedRec = recommendations.find(r => r.id === entry.id);

              return (
                <div key={entry.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-3">
                  {/* Row Top Summary */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {getResourcePill(entry.resource)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {entry.location}
                          </span>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {entry.policyReference}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 mt-0.5 leading-snug">
                          {entry.finding}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                      {getOutcomeBadge(entry.outcomeType, entry.isSimulatedVerification)}
                      
                      {/* Action trigger button */}
                      {entry.task ? (
                        <button
                          onClick={() => onViewTask && onViewTask(entry.task!.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded border border-indigo-200 transition-colors flex items-center gap-1 shadow-xs"
                          title="Open active task in Action Tracker"
                        >
                          <span>View Task</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : associatedRec && onCreateActionTask ? (
                        <button
                          onClick={() => onCreateActionTask(associatedRec)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors flex items-center gap-1 shadow-xs"
                          title="Initialize Action Task in workflow"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Dispatch Action</span>
                        </button>
                      ) : null}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                        title={isExpanded ? 'Collapse evidence chain' : 'Expand evidence chain'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Evidence Chain Flow Cards (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                    {/* Stage 1: Telemetry Anomaly */}
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        1. Detected Telemetry
                      </span>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="text-slate-500">Observed:</span>
                        <strong className="text-slate-900 font-bold">{entry.observed} {entry.unit}</strong>
                      </div>
                      <div className="flex items-baseline justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Baseline:</span>
                        <span>{entry.baseline} {entry.unit}</span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono text-[11px] pt-0.5 border-t border-slate-200/60 text-amber-800 font-semibold">
                        <span>Excess:</span>
                        <span>+{entry.excess} {entry.unit}</span>
                      </div>
                    </div>

                    {/* Stage 2: Audit Rule & Standard */}
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        2. Detection Rule
                      </span>
                      <div className="font-semibold text-slate-900 leading-tight">
                        {entry.detectionRuleName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 bg-white p-1 rounded border border-slate-200 truncate" title={entry.ruleThresholdFormula}>
                        {entry.ruleThresholdFormula}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={entry.persistenceDetails}>
                        Window: {entry.persistenceDetails}
                      </div>
                    </div>

                    {/* Stage 3: Corrective Protocol & Owner */}
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        3. Corrective Plan
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium truncate">{entry.owner}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>SLA: {entry.dueDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5" title={entry.correctiveAction}>
                        Plan: {entry.correctiveAction}
                      </div>
                    </div>

                    {/* Stage 4: Empirical Verification Outcome */}
                    <div className={`p-2.5 rounded border space-y-1 ${
                      entry.outcomeType === 'Verified Improvement'
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : entry.outcomeType === 'No Improvement'
                        ? 'bg-rose-50/60 border-rose-300 text-rose-950'
                        : entry.outcomeType === 'Inconclusive'
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                        : 'bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        4. Follow-Up Audit
                      </span>
                      {entry.followUpSamples > 0 ? (
                        <>
                          <div className="flex items-baseline justify-between font-mono">
                            <span className="opacity-80">Latest Reading:</span>
                            <strong>{entry.latestFollowUpValue} {entry.unit}</strong>
                          </div>
                          {entry.percentageAvoided !== null && (
                            <div className="flex items-baseline justify-between font-mono text-[11px] font-bold text-emerald-800">
                              <span>Avoided:</span>
                              <span>{entry.percentageAvoided}% (-{entry.absoluteAvoided} {entry.unit})</span>
                            </div>
                          )}
                          <div className="text-[10px] pt-0.5 flex items-center justify-between">
                            <span>Samples: {entry.followUpSamples}</span>
                            <span className={`px-1 rounded font-medium ${entry.isComparable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {entry.isComparable ? 'Comparable' : 'Non-Comparable'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic pt-1">
                          No post-repair audit reading logged yet. Dispatch technician to verify.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Deep Evidence & Provenance Section */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-200 text-xs space-y-3 bg-slate-50/50 p-3 rounded-lg mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <span className="font-semibold text-slate-900 block">
                            Full Action Recommendation &amp; Implementation Details:
                          </span>
                          <p className="text-slate-700 leading-relaxed">
                            {entry.correctiveAction}
                          </p>
                          <div className="text-[11px] text-slate-500">
                            <strong>Policy Standard:</strong> {entry.policyReference}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-semibold text-slate-900 block">
                            Data Quality &amp; Limitation Disclosure:
                          </span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {entry.dataQualityLimitations}
                          </p>
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500">
                            <span>Deterministic Priority Index:</span>
                            <strong className="text-slate-900">{entry.priorityScore}/100</strong>
                          </div>
                        </div>
                      </div>

                      {/* If task has follow up readings list */}
                      {entry.task && entry.task.followUpMeasurements.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-semibold text-slate-800 block text-[11px] mb-1.5">
                            Logged Verification Measurements ({entry.task.followUpMeasurements.length}):
                          </span>
                          <div className="space-y-1">
                            {entry.task.followUpMeasurements.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200 text-[11px] font-mono">
                                <div>
                                  <span className="text-slate-500">{m.timestamp.slice(0, 16).replace('T', ' ')}</span>
                                  <span className="mx-2 text-slate-300">|</span>
                                  <strong className="text-slate-900">{m.value} {entry.unit}</strong>
                                  <span className="mx-2 text-slate-300">|</span>
                                  <span className="text-slate-600 font-sans">{m.notes}</span>
                                </div>
                                <div>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium font-sans ${m.isComparablePeriod ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                    {m.isComparablePeriod ? 'Comparable Shift' : 'Non-Comparable'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
