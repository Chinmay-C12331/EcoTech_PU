/**
 * Dedicated Waste Resource Dashboard
 * EcoTech PU - Presidency University Bengaluru
 */

import React, { useState } from 'react';
import { 
  WasteReading, 
  CampusLocation, 
  TariffAssumptions,
  ActionTask,
  Recommendation
} from '../types/resource';
import { analyzeWasteReadings } from '../analysis/wasteAnalysis';
import { CAMPUS_LOCATIONS } from '../data/syntheticData';
import { RecommendationCard } from './RecommendationCard';
import { 
  Trash2, 
  Filter, 
  Utensils, 
  Recycle, 
  Package, 
  Info,
  CheckCircle2,
  PieChart
} from 'lucide-react';

interface WasteDashboardProps {
  readings: WasteReading[];
  tariffConfig: TariffAssumptions;
  actionTasks?: ActionTask[];
  onCreateActionTask?: (rec: Recommendation) => void;
  onViewTask?: (taskId: string) => void;
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({
  readings,
  tariffConfig,
  actionTasks = [],
  onCreateActionTask,
  onViewTask
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [highlightCategory, setHighlightCategory] = useState<'all' | 'food' | 'recyclable' | 'mixed'>('all');

  const filteredReadings = selectedLocation === 'all'
    ? readings
    : readings.filter(r => r.location === selectedLocation);

  const analysis = analyzeWasteReadings(filteredReadings);

  return (
    <div className="space-y-6">
      {/* Location Filter & View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-100 text-emerald-800">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Waste & Circularity Intelligence
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              SIMULATED DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Category auditing across organic food discard, dry recyclables, and residual mixed waste streams.
          </p>
        </div>

        {/* Location selector dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter Location:</span>
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
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
              ? 'bg-emerald-700 text-white font-semibold shadow-xs'
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
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Waste Audited */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Waste Audited</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {analysis.totalWasteKg.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {filteredReadings.length} audit logs
          </span>
        </div>

        {/* Organic Food Discard */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Organic Food Scrap</span>
            <Utensils className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-700">
              {analysis.totalFoodWasteKg.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ~{analysis.averageDailyFoodWasteKg} kg/day average
          </span>
        </div>

        {/* Dry Recyclables */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dry Recyclables</span>
            <Recycle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {analysis.totalRecyclableWasteKg.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Diverted to recycling vendors
          </span>
        </div>

        {/* Segregation Efficiency */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Segregation Rate</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl font-bold font-mono ${
              analysis.averageSegregationRatePercent >= 70 ? 'text-emerald-700' : 'text-amber-600'
            }`}>
              {analysis.averageSegregationRatePercent}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            (Recyclables + Clean Organic) / Total
          </span>
        </div>
      </div>

      {/* University Food Waste Benchmark Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-emerald-950">
        <Utensils className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-950">Presidency University Food Waste Benchmark: </span>
          The university's sustainability documentation reports generating approximately <strong>120 – 150 kg/day</strong> of food waste campus-wide across dining venues and food outlets. The simulated dataset models daily prep variations, event surges, and potential composting feedstock.
          <span className="block mt-0.5 text-[11px] text-emerald-800 italic">
            * Benchmark sourced from Presidency University Waste Management Guidelines; distinct from individual batch weigh-scale records.
          </span>
        </div>
      </div>

      {/* Category Breakdown & Daily Audits Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Daily Waste Category Distribution & Segregation Audit
            </h4>
            <p className="text-xs text-slate-500">
              Categorical breakdown: Food Waste vs. Dry Recyclables vs. Residual Mixed Waste
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setHighlightCategory('all')}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                highlightCategory === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Streams
            </button>
            <button
              onClick={() => setHighlightCategory('food')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                highlightCategory === 'food' ? 'bg-white text-amber-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
              <span>Food Waste</span>
            </button>
            <button
              onClick={() => setHighlightCategory('recyclable')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                highlightCategory === 'recyclable' ? 'bg-white text-emerald-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
              <span>Recyclables</span>
            </button>
            <button
              onClick={() => setHighlightCategory('mixed')}
              className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                highlightCategory === 'mixed' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-400"></span>
              <span>Mixed Residual</span>
            </button>
          </div>
        </div>

        {/* Stacked visual representation for daily trends */}
        <div className="mt-4 space-y-3">
          {analysis.dailyTrend.map((d, idx) => {
            const foodPct = d.totalKg > 0 ? (d.foodKg / d.totalKg) * 100 : 0;
            const recPct = d.totalKg > 0 ? (d.recyclableKg / d.totalKg) * 100 : 0;
            const mixedPct = d.totalKg > 0 ? (d.mixedKg / d.totalKg) * 100 : 0;

            return (
              <div key={idx} className="p-3 bg-slate-50/70 rounded-md border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-mono">{d.date}</span>
                    {d.flagged && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-medium px-1.5 py-0.2 rounded font-mono">
                        ANOMALY FLAGGED
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 font-mono">
                    Total: <strong className="text-slate-900">{d.totalKg} kg</strong> (Segregation: {d.segregationRatePercent}%)
                  </div>
                </div>

                {/* Stacked Bar with category spotlight opacity */}
                <div className="w-full h-3 rounded bg-slate-200 flex overflow-hidden">
                  <div 
                    style={{ width: `${foodPct}%` }} 
                    className={`bg-amber-500 h-full transition-opacity ${
                      highlightCategory === 'all' || highlightCategory === 'food' ? 'opacity-100' : 'opacity-25'
                    }`}
                    title={`Food Waste: ${d.foodKg} kg (${Math.round(foodPct)}%)`}
                  />
                  <div 
                    style={{ width: `${recPct}%` }} 
                    className={`bg-emerald-600 h-full transition-opacity ${
                      highlightCategory === 'all' || highlightCategory === 'recyclable' ? 'opacity-100' : 'opacity-25'
                    }`}
                    title={`Recyclables: ${d.recyclableKg} kg (${Math.round(recPct)}%)`}
                  />
                  <div 
                    style={{ width: `${mixedPct}%` }} 
                    className={`bg-slate-400 h-full transition-opacity ${
                      highlightCategory === 'all' || highlightCategory === 'mixed' ? 'opacity-100' : 'opacity-25'
                    }`}
                    title={`Mixed Residual: ${d.mixedKg} kg (${Math.round(mixedPct)}%)`}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className={highlightCategory === 'food' ? 'font-bold text-amber-800' : ''}>Food: {d.foodKg} kg</span>
                  <span className={highlightCategory === 'recyclable' ? 'font-bold text-emerald-800' : ''}>Recyclable: {d.recyclableKg} kg</span>
                  <span className={highlightCategory === 'mixed' ? 'font-bold text-slate-800' : ''}>Mixed Residual: {d.mixedKg} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Flagged Waste Anomalies & Segregation Interventions ({analysis.recommendations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Kitchen prep portioning, color-coded dual-bins, and composting protocols
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {analysis.flaggedRecordsCount} flagged logs
          </span>
        </div>

        {analysis.recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
            No waste anomalies detected for the selected location filter.
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
