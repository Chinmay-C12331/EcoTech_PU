/**
 * Dedicated Energy Resource Dashboard
 * EcoTech PU - Presidency University Bengaluru
 */

import React, { useState } from 'react';
import { 
  EnergyReading, 
  CampusLocation, 
  TariffAssumptions,
  ActionTask,
  Recommendation
} from '../types/resource';
import { analyzeEnergyReadings } from '../analysis/energyAnalysis';
import { CAMPUS_LOCATIONS } from '../data/syntheticData';
import { ResourceChart, ChartDataPoint } from './ResourceChart';
import { RecommendationCard } from './RecommendationCard';
import { 
  Zap, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Filter, 
  Info,
  TrendingUp,
  Clock
} from 'lucide-react';

interface EnergyDashboardProps {
  readings: EnergyReading[];
  tariffConfig: TariffAssumptions;
  actionTasks?: ActionTask[];
  onCreateActionTask?: (rec: Recommendation) => void;
  onViewTask?: (taskId: string) => void;
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({
  readings,
  tariffConfig,
  actionTasks = [],
  onCreateActionTask,
  onViewTask
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [timeWindowFilter, setTimeWindowFilter] = useState<'all' | 'afterHours' | 'daytime' | 'anomalies'>('all');

  const filteredReadings = selectedLocation === 'all'
    ? readings
    : readings.filter(r => r.location === selectedLocation);

  const analysis = analyzeEnergyReadings(filteredReadings);

  // Prepare chart data points
  // When 'all', group by timestamp; when single location, show direct readings
  const rawChartPoints: ChartDataPoint[] = analysis.hourlyTrend.map(h => ({
    timestamp: h.timestamp,
    hour: h.hour,
    date: h.date,
    label: `${h.date.slice(5)} ${String(h.hour).padStart(2, '0')}:00`,
    observed: h.observed,
    baseline: h.baseline,
    flagged: h.flagged,
    isSpecialWindow: h.isAfterHours,
    anomalyType: h.flagged ? (h.isAfterHours ? 'after_hours_inefficiency' : 'sustained_peak_overload') : undefined
  }));

  // Apply interactive time window filtering if selected
  const chartPoints = rawChartPoints.filter(p => {
    if (timeWindowFilter === 'afterHours') return p.isSpecialWindow;
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
            <div className="p-1.5 rounded bg-amber-100 text-amber-800">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Electricity Intelligence
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              SIMULATED DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly consumption profiling, baseline deviation analysis, and automated off-peak inefficiency detection.
          </p>
        </div>

        {/* Location selector dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter Location:</span>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
              ? 'bg-amber-600 text-white font-semibold shadow-xs'
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
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Observed */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Observed Electricity</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {analysis.totalObservedKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {filteredReadings.length} logged hours
          </span>
        </div>

        {/* Baseline Expected */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Expected Baseline</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-700">
              {analysis.totalBaselineKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Historical operational model
          </span>
        </div>

        {/* Estimated Deviation */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Estimated Excess</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-700">
              +{analysis.totalExcessKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            +{Math.round((analysis.totalExcessKwh / Math.max(1, analysis.totalBaselineKwh)) * 100)}% above baseline
          </span>
        </div>

        {/* After-Hours Draw */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">After-Hours (21:00-06:00)</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {analysis.afterHoursObservedKwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kWh</span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            +{analysis.afterHoursExcessKwh.toLocaleString()} kWh net off-hours excess
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {selectedLocation === 'all' 
              ? 'Campus 72h net (incl. Day 3 AB2 5h anomaly: +363 kWh)'
              : 'Selected location 72h after-hours net'
            }
          </span>
        </div>
      </div>

      {/* University Solar Benchmark Context Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
        <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-950">Presidency University Rooftop Solar Benchmark: </span>
          The university reports an institutional capacity benchmark of approximately <strong>800 units/day (kWh/day)</strong> of rooftop solar PV generation across academic buildings.
          <span className="block mt-0.5 text-[11px] text-amber-800">
            * Sourced from Presidency University institutional green campus documentation for high-level context. Direct mathematical percentage ratios against synthetic short-term hourly demo telemetry are omitted in accordance with auditing standards due to differing measurement scopes and time horizons.
          </span>
        </div>
      </div>

      {/* Interactive Time-Series Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Timeline View Mode:</span>
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
            onClick={() => setTimeWindowFilter('afterHours')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              timeWindowFilter === 'afterHours'
                ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-indigo-900'
            }`}
          >
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>Off-Hours Curfew (21:00–06:00)</span>
          </button>
          <button
            onClick={() => setTimeWindowFilter('daytime')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              timeWindowFilter === 'daytime'
                ? 'bg-white text-amber-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-amber-900'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Daytime Window</span>
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
            <span>Flagged Anomalies ({analysis.flaggedReadingsCount})</span>
          </button>
        </div>
      </div>

      {/* Hourly Time Series Chart */}
      <ResourceChart
        title={`Hourly Electricity Profile (${timeWindowFilter === 'all' ? 'Full 72-Hour Audit' : timeWindowFilter === 'afterHours' ? 'Off-Hours Curfew Window' : timeWindowFilter === 'daytime' ? 'Daytime Operational Hours' : 'Flagged Anomaly Data Points'})`}
        subtitle="Gray background indicates after-hours window (21:00 - 06:00). Red pins mark anomalies exceeding baseline threshold."
        data={chartPoints}
        unit="kWh"
        resourceColor="amber"
        specialWindowLabel="Off-Hours (21:00-06:00)"
      />

      {/* Actionable Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Flagged Energy Anomalies & Recommended Interventions ({analysis.recommendations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Algorithmic evidence, excess calculation, and prioritized action plans
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {analysis.flaggedReadingsCount} flagged readings
          </span>
        </div>

        {analysis.recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
            No energy anomalies detected for the selected filter. Consumption matches expected baseline.
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
