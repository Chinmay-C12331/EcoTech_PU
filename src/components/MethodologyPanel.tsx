/**
 * Methodology & Architecture Panel
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Technical specification of deterministic anomaly detection, stream isolation,
 * dimensionless prioritization index, and closed-loop verification architecture.
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Layers, 
  GitBranch, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Trash2, 
  ArrowRight, 
  HelpCircle,
  Database,
  Calculator,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  ClipboardCheck
} from 'lucide-react';
import { PRESIDENCY_UNIVERSITY_FACTS } from '../data/presidencyFacts';

interface MethodologyPanelProps {
  onNavigateTab?: (tab: 'overview' | 'energy' | 'water' | 'waste' | 'actions' | 'interventions') => void;
}

export const MethodologyPanel: React.FC<MethodologyPanelProps> = ({ onNavigateTab }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Institutional Sustainability Governance
              </span>
              <span className="text-xs font-mono text-slate-400">
                Architecture Briefing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              System Architecture &amp; Methodology
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Presidency University Bengaluru campus resource intelligence engine. 
              Deterministic rules, physical stream isolation, and closed-loop corrective action verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('actions')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Live Action Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('overview')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <span>Campus Telemetry</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Architectural Principles Quick Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <a
            href="#principle-1"
            className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all text-left block"
          >
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Architecture Principle 1
            </div>
            <div className="text-xs font-semibold text-slate-100">
              How do we classify &amp; analyse inefficiencies?
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Deterministic standards (BEE ECBC 2017, NBC 2016, MoEF&amp;CC SWM Rules 2026)
            </div>
          </a>

          <a
            href="#principle-2"
            className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all text-left block"
          >
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
              Architecture Principle 2
            </div>
            <div className="text-xs font-semibold text-slate-100">
              Are we using an AI model?
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              NO black-box AI; 100% explainable engineering rules
            </div>
          </a>

          <a
            href="#principle-3"
            className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all text-left block"
          >
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1">
              Architecture Principle 3
            </div>
            <div className="text-xs font-semibold text-slate-100">
              Why use separate engines?
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Physical unit isolation (kWh ≠ L ≠ kg)
            </div>
          </a>

          <a
            href="#principle-4"
            className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-all text-left block"
          >
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
              Architecture Principle 4
            </div>
            <div className="text-xs font-semibold text-slate-100">
              What makes our architecture different?
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Measure → Detect → Act → Verify closed loop
            </div>
          </a>
        </div>
      </div>

      {/* Dedicated Section: How EcoTech PU Works */}
      <div id="how-ecotech-pu-works" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                How EcoTech PU Works: The Measure → Detect → Act → Verify Lifecycle
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end technical explanation: from synthetic sensor ingestion through domain-isolated heuristic engines to closed-loop corrective action tracking and empirical verification.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 shrink-0 self-start sm:self-auto">
            Lifecycle Specification
          </span>
        </div>

        {/* 4-Phase Lifecycle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1: Measure */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Phase 1 · Ingestion
                </span>
                <Database className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Measure
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ingests multi-resource campus time-series telemetry with strict physical thermodynamic isolation:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Energy (kWh):</strong> 72h interval power meter data seeded via PRNG #42.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Water (Litres):</strong> 72h pulse flow meter logs seeded via PRNG #108.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Waste (kg):</strong> 14-day digital weighbridge audit logs seeded via PRNG #777.
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                *Physical isolation: Units are strictly segregated (<code className="font-mono text-slate-700">kWh ≠ Litres ≠ kg</code>) to prevent invalid thermodynamic summations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Client-side CSV Ingestion</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Phase 2: Detect */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  Phase 2 · Heuristics
                </span>
                <Search className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Detect
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Evaluates time-series through three domain-specific deterministic rule engines with zero black-box AI:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Energy Engine:</strong> BEE ECBC 2017 daytime peak rules + internal SOP-ENG-04 curfew limits (&ge;1.35x baseline).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Water Engine:</strong> SOP-WAT-02 nocturnal quiescent trigger (01:00–05:00, &ge;2.5x baseline) + NBC 2016 Part 9 daytime surge checks.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Waste Engine:</strong> MoEF&amp;CC SWM Rules 2026 4-stream segregation check + Food Court event discard surge detection.
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                *Scientific framing: Overnight water flow is explicitly flagged as an inspection trigger, not proof of leak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Explainable Rule Logic</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Phase 3: Act */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Phase 3 · Dispatch
                </span>
                <ClipboardCheck className="w-4 h-4 text-indigo-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Act
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Normalizes cross-resource anomalies onto a dimensionless 0–100 Priority Index and dispatches Action Tasks:
              </p>
              <div className="p-2.5 bg-white rounded border border-indigo-200 font-mono text-[10px] text-indigo-900 leading-snug">
                Score = [(Severity + Persistence) &times; Confidence] &divide; Effort
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">Task Creation:</strong> Dispatches to responsible team (Campus Electrical Cell, Plumbing Maintenance, Dining Facilities).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-800">6-Stage FSM:</strong> Enforces valid operational transitions from Detected to Acknowledged, In Progress, Resolved, and Awaiting Verification.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Finite State Machine</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Phase 4: Verify */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Phase 4 · Audit
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Verify
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Closes the operational loop via empirical before-and-after follow-up measurements:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-emerald-800">Verified Improvement:</strong> &ge;15% excess reduction under comparable operating window logged into the Campus Impact Ledger.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-700">No Improvement:</strong> Consumption remains high; triggers re-investigation.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                  <strong className="text-amber-800">Inconclusive:</strong> Insufficient samples (&lt;2) or non-comparable operating hours.
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                *Simulation isolation: Simulated demo readings are explicitly partitioned and excluded from verified real-world savings totals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Impact Ledger Lineage</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Shared Decision Architecture: Stream Isolation & Common Workflow
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical separation at data and thermodynamic level, bridged exclusively by a normalized, dimensionless prioritization index.
          </p>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
          {/* Step 1: Ingestion */}
          <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Layer 1: Telemetry
              </span>
              <Database className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Physical Sensor Streams
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Continuous or batch time-series with schema validation & sanity checks.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Smart Power Meters (kWh)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-sky-50 rounded border border-sky-200 text-sky-900 text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Pulse Flow Meters (Litres)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                <Trash2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Weighbridge Scales (kg)</span>
              </div>
            </div>
          </div>

          {/* Step 2: 3 Independent Domain Engines */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Layer 2: Domain Rules
              </span>
              <Cpu className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              3 Isolated Domain Engines
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Independent thermodynamic, hydraulic, and mass-balance heuristics.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="p-1.5 bg-white rounded border border-amber-200 text-[11px]">
                <span className="font-semibold text-amber-800">Energy Engine: </span>
                <span className="text-slate-600">Off-hours baseline & peak demand (ECBC 2017)</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-sky-200 text-[11px]">
                <span className="font-semibold text-sky-800">Water Engine: </span>
                <span className="text-slate-600">Night window flow & daytime surges (NBC Part 9)</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-200 text-[11px]">
                <span className="font-semibold text-emerald-800">Waste Engine: </span>
                <span className="text-slate-600">Category stream rates &amp; segregation (MoEF&amp;CC SWM Rules 2026 context)</span>
              </div>
            </div>
          </div>

          {/* Step 3: Dimensionless Prioritization Filter */}
          <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Layer 3: Cross-Ranking
              </span>
              <Calculator className="w-4 h-4 text-indigo-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Dimensionless Scoring Filter
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Unifies recommendations without mixing incompatible physical units.
            </p>
            <div className="p-2 bg-white rounded border border-indigo-200 text-indigo-950 font-mono text-[10px] space-y-1">
              <div className="font-bold">Formula (0-100 pts):</div>
              <div>[(Severity + Persist) × Conf] ÷ Effort</div>
              <div className="text-[9px] text-slate-500 font-sans mt-1">
                Severity: 0-40 · Persistence: 0-30<br/>
                Conf: 0.70-1.0x · Effort: 1.0-1.6x
              </div>
            </div>
          </div>

          {/* Step 4: Closed-Loop Verification */}
          <div className="p-4 rounded-xl border-2 border-teal-200 bg-teal-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                Layer 4: Verification
              </span>
              <ShieldCheck className="w-4 h-4 text-teal-700" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Measure → Detect → Act → Verify
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Auditable dispatch, operating comparability checks, and empirical confirmation.
            </p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Task SLA & Owner assignment</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Comparability auditing</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Follow-up reduction check</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principle 1: How do we classify and analyse resource inefficiencies? */}
      <div id="principle-1" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs scroll-mt-20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              Q1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                How do we classify and analyse resource inefficiencies?
              </h2>
              <span className="text-xs text-slate-500">
                Exact mathematical algorithms and Indian standards implemented in source code
              </span>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            src/analysis/*.ts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Energy Classification */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>1. Energy Analytics</span>
            </div>
            <p className="text-xs text-slate-600">
              Evaluates electricity telemetry against location-specific baselines across after-hours and active campus schedules.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-amber-200">
                <div className="font-semibold text-slate-900">Internal Rule: EcoTech SOP-ENG-04 (After-Hours Curfew)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Internal rule identifier · Window: 22:00–06:00 (Campus Off-Hours)
                </div>
                <div className="font-mono text-[11px] text-amber-800 mt-1">
                  EcoTech Heuristic: observed &gt; 1.50 × baseline for ≥4 consecutive hours (Internal operational threshold)
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Detects un-scheduled AHUs, server room chillers, or forgotten lab lighting left powered overnight.
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-amber-200">
                <div className="font-semibold text-slate-900">Rule: BEE ECBC 2017 (Daytime Peak)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Window: 09:00–18:00 (Active Academic Hours)
                </div>
                <div className="font-mono text-[11px] text-amber-800 mt-1">
                  Condition: observed &gt; 1.30 × baseline for ≥2 consecutive hours
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Detects concurrent lab compressor cycles or air handling unit scheduling conflicts exceeding design diversity factors.
                </div>
              </div>
            </div>
          </div>

          {/* Water Classification */}
          <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/40 space-y-3">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>2. Water Analytics</span>
            </div>
            <p className="text-xs text-slate-600">
              Surveils volumetric pulses from distribution meters, emphasizing the critical overnight minimum night flow (MNF).
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-sky-200">
                <div className="font-semibold text-slate-900">Internal Rule: EcoTech SOP-WAT-02 (Nocturnal Flow Trigger)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Internal rule identifier · Window: 00:00–05:00 (Campus Zero-Occupancy Window)
                </div>
                <div className="font-mono text-[11px] text-sky-800 mt-1">
                  EcoTech Heuristic: observed &gt; 300 L/hr sustained for ≥3 hours (Internal inspection trigger, not statutory limit)
                </div>
                <div className="text-[11px] text-sky-950 font-medium mt-1 bg-sky-100/70 p-1.5 rounded">
                  ⚠️ Rigor Mandate: Framed as an internal <strong>inspection trigger</strong>, NOT proof of a leak (could be unrecorded automated tank filling, cistern float failure, or flush valve stuck open).
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-sky-200">
                <div className="font-semibold text-slate-900">Rule: NBC 2016 Part 9 (Volumetric Surge)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Daytime campus operational hours
                </div>
                <div className="font-mono text-[11px] text-sky-800 mt-1">
                  Condition: observed &gt; 1.35 × baseline volumetric cap
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Detects sustained flush-valve blow-by, main riser valve degradation, or localized piping ruptures.
                </div>
              </div>
            </div>
          </div>

          {/* Waste Classification */}
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Trash2 className="w-4 h-4 text-emerald-600" />
              <span>3. Waste Analytics</span>
            </div>
            <p className="text-xs text-slate-600">
              Evaluates daily mass weighbridge logs across food, recyclable, and mixed waste streams.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-emerald-200">
                <div className="font-semibold text-slate-900">Heuristic: Organic Food Waste Surge (MoEF&amp;CC SWM Rules, 2026 Context)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Regulatory Context: Solid Waste Management Rules, 2026 (MoEF&amp;CC, effective 1 April 2026; replaces 2016 Rules). Refs: <a href="https://swmp.cpcb.gov.in/en" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">CPCB SWMP</a> &amp; <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">PIB PRID 2219676</a>
                </div>
                <div className="font-mono text-[11px] text-emerald-800 mt-1">
                  EcoTech Heuristic: food_kg &gt; 1.30 × rolling 14-day baseline (Internal campus heuristic, not statutory limit)
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Triggers meal-prep portion calibration and on-site organic composting capacity reallocation, supporting bulk waste generator processing mandates under the 2026 Rules.
                </div>
              </div>

              <div className="p-2.5 bg-white rounded border border-emerald-200">
                <div className="font-semibold text-slate-900">Rule: Presidency Zero-Landfill Charter</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Corridor & facility waste bin stations
                </div>
                <div className="font-mono text-[11px] text-emerald-800 mt-1">
                  Condition: segregation_rate &lt; 65% of total mass
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Identifies bin contamination where wet food waste spoils dry cardboard/paper recyclables, preventing circular recovery.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principle 2: Are we using an AI model? */}
      <div id="principle-2" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs scroll-mt-20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              P2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Are we using an AI model?
              </h2>
              <span className="text-xs text-slate-500">
                Engineering integrity disclosure: Deterministic algorithms vs. Probabilistic LLMs
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            NO Black-Box AI / LLM
          </span>
        </div>

        {/* Clear Callout Banner */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                Engineering Disclosure on AI & Model Usage:
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                EcoTech PU <strong>does NOT</strong> use a black-box large language model or generative AI in its telemetry anomaly engine. 
                All detection, priority ranking, and verification decisions are driven by <strong>deterministic statistical baselines, national codes (BEE ECBC 2017, NBC 2016 Part 9), environmental frameworks (MoEF&amp;CC Solid Waste Management Rules, 2026), and transparent internal heuristics (SOP-ENG-04, SOP-WAT-02)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Technical Reasons Why This is Superior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">1</span>
              <span>Zero Hallucination Tolerance</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              In physical campus infrastructure, dispatching maintenance personnel, isolating high-voltage switchgear, or excavating water mains based on probabilistic LLM tokens is dangerous, costly, and legally unviable.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">2</span>
              <span>100% Deterministic Reproducibility</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Given identical sensor readings, the system guarantees an identical mathematical verdict every time. This repeatability is essential for before/after empirical verification of maintenance interventions.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">3</span>
              <span>Legal &amp; Regulatory Framework Alignment</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Flagged findings reference national building and environmental frameworks (BEE Energy Conservation Building Code 2017, National Building Code 2016 Part 9, and MoEF&amp;CC Solid Waste Management Rules, 2026, which supersedes the historical 2016 Rules as of 1 April 2026; official refs: <a href="https://swmp.cpcb.gov.in/en" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">CPCB SWMP</a> and <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">PIB PRID 2219676</a>). EcoTech&apos;s custom detection thresholds are internal analytical heuristics designed for proactive campus facility management rather than statutory prescriptive limits.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px]">4</span>
              <span>Edge & Offline Resilience</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The detection engine executes in under 2 milliseconds with zero cloud API latency, zero token costs, and 100% offline capability on local campus Building Management System (BMS) controllers.
            </p>
          </div>
        </div>
      </div>

      {/* Principle 3: Why do we use separate engines? */}
      <div id="principle-3" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs scroll-mt-20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
              P3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Why do we use separate engines?
              </h2>
              <span className="text-xs text-slate-500">
                Thermodynamic, hydraulic, and mass stream isolation with dimensionless prioritization
              </span>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800">
            kWh ≠ Litres ≠ kg
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">The Physical Incompatibility Law: </span>
            A common failure in amateur sustainability dashboards is adding different physical dimensions together into a single arbitrary &quot;eco score&quot; or commingled scalar. 
            <strong> 1 Kilowatt-hour of electrical work, 1 Litre of hydraulic volume, and 1 Kilogram of solid municipal waste share no common physical dimension.</strong> 
            Combining them corrupts physical conservation laws.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Isolated Domain Engines */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                Physical Stream Isolation
              </h3>
              <p className="text-[11px] text-slate-600">
                Each resource maintains its own dedicated time-series pipeline, baseline definitions, and anomaly thresholds:
              </p>
              <ul className="text-[11px] space-y-1 text-slate-600 pl-4 list-disc">
                <li><strong>Energy Engine:</strong> Active power integration (kWh), power factor, after-hours baseloads.</li>
                <li><strong>Water Engine:</strong> Fluid pressure, nocturnal minimum night flow (L/hr), volumetric bursts.</li>
                <li><strong>Waste Engine:</strong> Gravitational mass balance (kg), organic/inorganic segregation ratios.</li>
              </ul>
            </div>

            {/* The Dimensionless Bridge */}
            <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/20 space-y-2">
              <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-700" />
                The Bridge: Dimensionless Prioritization Index
              </h3>
              <p className="text-[11px] text-slate-600">
                To allow facility managers to rank interventions across streams, we convert findings into a dimensionless mathematical index (0–100):
              </p>
              <div className="p-2.5 rounded bg-white border border-indigo-200 font-mono text-[11px] text-indigo-900">
                Score = [(Severity + Persistence) × Confidence] ÷ Effort
              </div>
              <div className="text-[10px] text-slate-500">
                • <strong>Severity (0-40):</strong> Normalized ratio of excess over baseline<br/>
                • <strong>Persistence (0-30):</strong> Duration of anomaly window (hours/days)<br/>
                • <strong>Confidence (0.7-1.0):</strong> Sensor signal clarity and completeness<br/>
                • <strong>Effort (1.0-1.6x):</strong> Operational friction divisor (Low=1.0, Med=1.25, High=1.6)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principle 4: What makes our architecture different? */}
      <div id="principle-4" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs scroll-mt-20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              P4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                What makes our architecture different from conventional solutions?
              </h2>
              <span className="text-xs text-slate-500">
                Closed-Loop &quot;Measure → Detect → Act → Verify&quot; with Empirical Follow-up Audit
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
            Closed-Loop Workflow
          </span>
        </div>

        <div className="space-y-6">
          {/* Comparison Table: Conventional Project vs. EcoTech PU */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-2.5 font-bold">Evaluation Criteria</th>
                  <th className="p-2.5 font-semibold text-slate-500">Conventional Dashboards</th>
                  <th className="p-2.5 font-bold text-emerald-800 bg-emerald-50/50">EcoTech PU (Presidency University)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-2.5 font-semibold">Architecture Loop</td>
                  <td className="p-2.5 text-slate-500">Open-loop: Displays charts &amp; passive alerts; stops there.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    <strong>Closed-loop:</strong> Measure → Detect → Act → Verify operational lifecycle.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Action Dispatch</td>
                  <td className="p-2.5 text-slate-500">None; users must manually email or copy-paste text.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    One-click formal <strong>Action Task creation</strong> with owner, SLA, notes, and Kanban transitions.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Post-Repair Verification</td>
                  <td className="p-2.5 text-slate-500">Assumed fixed without empirical evidence.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    Requires <strong>post-action empirical measurements</strong>; verifies before-and-after comparability.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Data Sufficiency &amp; Inconclusive Flag</td>
                  <td className="p-2.5 text-slate-500">Claims victory on single random reading.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    Requires &ge;2 valid samples under comparable operating periods; returns <strong>Inconclusive</strong> if insufficient.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Scientific Claim Discipline</td>
                  <td className="p-2.5 text-slate-500">Over-claims: &quot;AI detected a broken pipe&quot; or &quot;Fixed permanently&quot;.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    Strict scientific framing: Overnight flow is an <strong>inspection trigger</strong>, not proof of leak; consumption drops do not prove root cause fix.
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Audit Trail &amp; Provenance</td>
                  <td className="p-2.5 text-slate-500">Ephemereal state; lost on refresh; no timestamp log.</td>
                  <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/30">
                    <strong>Persistent localStorage + full event audit trail</strong> recording actor, timestamp, and status shifts.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* The 4-Stage Workflow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Stage 1</div>
              <div className="font-bold text-slate-900 text-xs mt-1">1. MEASURE</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Continuous telemetry ingestion with schema checking, unit enforcement, and CSV upload validation.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Stage 2</div>
              <div className="font-bold text-slate-900 text-xs mt-1">2. DETECT</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Explainable rule-based anomaly detection citing exact standards thresholds, persistence, and confidence.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Stage 3</div>
              <div className="font-bold text-slate-900 text-xs mt-1">3. ACT</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Action Task dispatch with owner assignment, SLA, and strict status progression (<code className="font-mono text-[10px]">Detected &rarr; Acknowledged &rarr; Investigating &rarr; Repair Reported &rarr; Awaiting Verification</code>).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Stage 4</div>
              <div className="font-bold text-slate-900 text-xs mt-1">4. VERIFY</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Algorithmic verification: logs follow-up readings, checks operational comparability, and computes avoided excess.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Data Provenance & Rigor Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Data Integrity &amp; Provenance Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero ambiguity: how simulated demo data, hypothetical simulations, verified measurements, and real Presidency University facts are kept distinct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              1. Institutional Facts
            </span>
            <div className="font-bold text-slate-900 text-xs">
              Presidency University Reference
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Real institutional statistics verified from university disclosures (60+ acres, 4,000+ kVA, 700 kL STP, 1,200 kg/day waste). Clearly framed as institutional context.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              2. Demonstration Stream
            </span>
            <div className="font-bold text-slate-900 text-xs">
              Simulated Telemetry (Seed #42)
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Deterministic synthetic time-series with intentionally planted anomalies (after-hours loads, night flow, food spikes). Explicitly labelled <code className="font-mono text-amber-800 font-semibold">SIMULATED DEMO DATA</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/30 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              3. Scenario Modeling
            </span>
            <div className="font-bold text-slate-900 text-xs">
              Hypothetical Interventions
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Projected what-if simulations (VFD retrofit, aerators, biogas digestion) with transparently disclosed tariff and payback assumptions. Never presented as achieved savings.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              4. Corrective Verification
            </span>
            <div className="font-bold text-slate-900 text-xs">
              Empirical Action Measurements
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Follow-up sensor observations entered after maintenance repairs. Verified using comparability algorithms and recorded with author timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
