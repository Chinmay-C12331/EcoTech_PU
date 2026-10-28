/**
 * Dedicated Water Resource Dashboard
 * EcoTech PU - Presidency University Bengaluru
 * 
 * CORE REQUIREMENT COMPLIANCE:
 * Unusual overnight flow is categorized strictly as an investigation trigger,
 * not deterministic proof of a leak or verified waste.
 */

import React, { useState } from 'react';
import { 
  WaterReading, 
  CampusLocation, 
  TariffAssumptions,
  ActionTask,
  Recommendation
} from '../types/resource';
import { analyzeWaterReadings } from '../analysis/waterAnalysis';
import { CAMPUS_LOCATIONS } from '../data/syntheticData';
import { ResourceChart, ChartDataPoint } from './ResourceChart';
import { RecommendationCard } from './RecommendationCard';
import { 
  Droplets, 
  Filter, 
  Moon, 
  AlertCircle, 
  Info,
  Waves,
  Clock,
  Sun,
  AlertTriangle
} from 'lucide-react';

interface WaterDashboardProps {
  readings: WaterReading[];
  tariffConfig: TariffAssumptions;
  actionTasks?: ActionTask[];
  onCreateActionTask?: (rec: Recommendation) => void;
  onViewTask?: (taskId: string) => void;
}

export const WaterDashboard: React.FC<WaterDashboardProps> = ({
  readings,
  tariffConfig,
  actionTasks = [],
  onCreateActionTask,
  onViewTask
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<'all' | 'overnight' | 'daytime' | 'anomalies'>('all');

  const filteredReadings = selectedLocation === 'all'
    ? readings
    : readings.filter(r => r.location === selectedLocation);

  const analysis = analyzeWaterReadings(filteredReadings);

  const rawChartPoints: ChartDataPoint[] = analysis.hourlyTrend.map(h => ({
    timestamp: h.timestamp,
    hour: h.hour,
    date: h.date,
    label: `${h.date.slice(5)} ${String(h.hour).padStart(2, '0')}:00`,
    observed: h.observed,
    baseline: h.baseline,
    flagged: h.flagged,
    isSpecialWindow: h.isOvernightWindow,
    anomalyType: h.flagged ? (h.isOvernightWindow ? 'unusual_overnight_flow' : 'daytime_surge') : undefined
  }));

  // Apply interactive time window filtering if selected
  const chartPoints = rawChartPoints.filter(p => {
    if (timeWindowFilter === 'overnight') return p.isSpecialWindow;
    if (timeWindowFilter === 'daytime') return !p.isSpecialWindow;
    if (timeWindowFilter === 'anomalies') return p.flagged;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Location Filter & View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-sky-100 text-sky-800">
              <Droplets className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Water Intelligence
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              SIMULATED DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Volumetric flow monitoring, quiescent nocturnal baseline auditing, and non-residential continuous flow inspection triggers.
          </p>
        </div>

        {/* Location selector dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter Location:</span>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Location Segmented Buttons for 1-Click Interactive Filtering */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedLocation('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
            selectedLocation === 'all'
              ? 'bg-sky-600 text-white font-semibold shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Locations
        </button>
        {CAMPUS_LOCATIONS.map(loc => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedLocation === loc
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Observed Litres */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Observed Volume</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {analysis.totalObservedLitres.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Litres</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {(analysis.totalObservedLitres / 1000).toFixed(1)} kL total draw
          </span>
        </div>

        {/* Baseline Expected */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Expected Baseline</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-700">
              {analysis.totalBaselineLitres.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Litres</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Quiescent hydraulic model
          </span>
        </div>

        {/* Estimated Deviation */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Estimated Excess</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-sky-800">
              +{analysis.totalExcessLitres.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Litres</span>
          </div>
          <span className="text-[11px] text-sky-700 font-medium mt-1 block">
            +{Math.round((analysis.totalExcessLitres / Math.max(1, analysis.totalBaselineLitres)) * 100)}% above baseline
          </span>
        </div>

        {/* Overnight Window Consumption */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overnight (01:00-05:00)</span>
            <Moon className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {analysis.overnightObservedLitres.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Litres</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            +{analysis.overnightExcessLitres.toLocaleString()} L nocturnal deviation
          </span>
        </div>
      </div>

      {/* University STP Wastewater Benchmark Banner */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-sky-950">
        <Waves className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-sky-950">Presidency University Wastewater Reclamation Benchmark: </span>
          The university reports treating and reusing nearly <strong>300,000 litres/day (300 kL/day)</strong> of campus wastewater through its advanced on-site Sewage Treatment Plant (STP) for landscaping and dual-plumbing toilet flushing.
          <span className="block mt-0.5 text-[11px] text-sky-800 italic">
            * Benchmark sourced from Presidency University Water Conservation Documentation; distinct from simulated sub-meter readings.
          </span>
        </div>
      </div>

      {/* Interactive Time-Series Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>Hydraulic Timeline View:</span>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setTimeWindowFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              timeWindowFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 72 Hours ({rawChartPoints.length})
          </button>
          <button
            onClick={() => setTimeWindowFilter('overnight')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              timeWindowFilter === 'overnight'
                ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-indigo-900'
            }`}
          >
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>Nocturnal Quiescent (01:00–05:00)</span>
          </button>
          <button
            onClick={() => setTimeWindowFilter('daytime')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              timeWindowFilter === 'daytime'
                ? 'bg-white text-sky-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-sky-900'
            }`}
          >
            <Sun className="w-3 h-3 text-sky-500" />
            <span>Daytime Flow</span>
          </button>
          <button
            onClick={() => setTimeWindowFilter('anomalies')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              timeWindowFilter === 'anomalies'
                ? 'bg-white text-rose-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-rose-900'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Flagged Trigger Points ({analysis.flaggedReadingsCount})</span>
          </button>
        </div>
      </div>

      {/* Hourly Time Series Chart */}
      <ResourceChart
        title={`Water Volumetric Flow (${timeWindowFilter === 'all' ? 'Full 72-Hour Audit' : timeWindowFilter === 'overnight' ? 'Nocturnal Quiescent Audit Window' : timeWindowFilter === 'daytime' ? 'Daytime Flow Profile' : 'Inspection Trigger Readings'})`}
        subtitle="Gray background highlights nocturnal window (01:00 - 05:00). Red points mark elevated continuous flow flagged for inspection."
        data={chartPoints}
        unit="Litres"
        resourceColor="sky"
        specialWindowLabel="Overnight Window (01:00-05:00)"
      />

      {/* Explicit Investigation Notice */}
      <div className="p-3 bg-slate-100 rounded-md border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Hydraulic Audit Distinction: </span>
          In accordance with plumbing inspection standards, an overnight water anomaly is classified as an <strong>investigation trigger</strong> rather than proof of a pipe breach or verified wasted resource. Legitimate nocturnal operations (such as automated storage tank balancing, RO backwash regeneration, or early kitchen food prep) may account for elevated readings until physical valve verification is conducted.
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Flagged Water Flow Deviations & Recommended Actions ({analysis.recommendations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Physical inspection protocols and fixture integrity checks
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {analysis.flaggedReadingsCount} flagged readings
          </span>
        </div>

        {analysis.recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
            No water deviations detected for the selected location filter.
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.recommendations.map(rec => (
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
    </div>
  );
};
