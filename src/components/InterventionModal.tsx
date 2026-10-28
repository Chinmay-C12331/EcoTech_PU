/**
 * Before/After Intervention Simulation Interface
 * EcoTech PU - Presidency University Bengaluru
 * 
 * STRICT COMPLIANCE REQUIREMENT:
 * Labeled explicitly as a HYPOTHETICAL INTERVENTION SCENARIO.
 * Keeps resource quantities separate without adding kWh, litres, and kg into one total.
 */

import React, { useState } from 'react';
import { 
  InterventionScenario, 
  EnergyReading, 
  WaterReading, 
  WasteReading,
  TariffAssumptions
} from '../types/resource';
import { 
  DEFAULT_INTERVENTIONS, 
  runInterventionSimulation 
} from '../analysis/interventionSim';
import { 
  Sparkles, 
  Check, 
  AlertCircle, 
  Zap, 
  Droplets, 
  Trash2, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface InterventionModalProps {
  energyReadings: EnergyReading[];
  waterReadings: WaterReading[];
  wasteReadings: WasteReading[];
  tariffConfig: TariffAssumptions;
  onNavigateToTab?: (tab: 'energy' | 'water' | 'waste') => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  energyReadings,
  waterReadings,
  wasteReadings,
  tariffConfig,
  onNavigateToTab
}) => {
  const [interventions, setInterventions] = useState<InterventionScenario[]>(DEFAULT_INTERVENTIONS);

  const toggleIntervention = (id: string) => {
    setInterventions(prev =>
      prev.map(item => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const activeIds = interventions.filter(i => i.isActive).map(i => i.id);
  const sim = runInterventionSimulation(energyReadings, waterReadings, wasteReadings, activeIds);

  const getResourceIcon = (res: 'energy' | 'water' | 'waste') => {
    if (res === 'energy') return <Zap className="w-4 h-4 text-amber-500" />;
    if (res === 'water') return <Droplets className="w-4 h-4 text-sky-500" />;
    return <Trash2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Title & Mandatory Hypothetical Disclaimer Banner */}
      <div className="bg-indigo-950 text-indigo-100 rounded-lg p-5 border border-indigo-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-800/80 text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Campus Intervention Scenario Modeling
                </h3>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                  HYPOTHETICAL SIMULATION
                </span>
              </div>
              <p className="text-xs text-indigo-300 mt-0.5">
                Simulate targeted engineering and operational policies to project resource recovery across campus blocks.
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-indigo-300 font-mono">
            {activeIds.length} of {interventions.length} Interventions Active
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-indigo-800/80 text-[11px] text-indigo-300 flex items-start gap-1.5 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Modeling Disclaimer:</strong> All projections generated below represent synthetic engineering models under assumed intervention efficacy factors. They are not guaranteed or independently verified empirical results. Resource streams (kWh, Litres, kg) are reported separately in conformance with physical measurement standards.
          </span>
        </div>
      </div>

      {/* Side-by-Side Projected Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Energy Impact Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Electricity Impact
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                -{sim.energy.percentReduction}%
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Baseline Observed:</span>
                <span className="font-mono font-medium text-slate-800">{sim.energy.beforeObservedKwh.toLocaleString()} kWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Projected Post-Intervention:</span>
                <span className="font-mono font-bold text-emerald-800">{sim.energy.afterSimulatedKwh.toLocaleString()} kWh</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-semibold text-emerald-900">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                  Estimated Energy Avoided:
                </span>
                <span className="font-mono text-sm">+{sim.energy.netSavedKwh.toLocaleString()} kWh</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {tariffConfig.isConfigured && tariffConfig.electricityRateInrPerKwh ? (
              <span>Hypothetical avoidance: ~₹{Math.round(sim.energy.netSavedKwh * tariffConfig.electricityRateInrPerKwh).toLocaleString()} at ₹{tariffConfig.electricityRateInrPerKwh}/kWh</span>
            ) : (
              <span>Cost avoidance cannot yet be calculated reliably without verified tariff schedules.</span>
            )}
          </div>
        </div>

        {/* Water Impact Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-500" />
                Water Conservation
              </span>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                -{sim.water.percentReduction}%
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Baseline Observed:</span>
                <span className="font-mono font-medium text-slate-800">{sim.water.beforeObservedLitres.toLocaleString()} L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Projected Post-Intervention:</span>
                <span className="font-mono font-bold text-sky-800">{sim.water.afterSimulatedLitres.toLocaleString()} L</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-semibold text-sky-900">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-sky-700" />
                  Estimated Water Conserved:
                </span>
                <span className="font-mono text-sm">+{sim.water.netSavedLitres.toLocaleString()} L</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {tariffConfig.isConfigured && tariffConfig.waterRateInrPerKl ? (
              <span>Hypothetical conservation: ~₹{Math.round((sim.water.netSavedLitres / 1000) * tariffConfig.waterRateInrPerKl).toLocaleString()} at ₹{tariffConfig.waterRateInrPerKl}/kL</span>
            ) : (
              <span>Water tariff cannot yet be calculated reliably without commercial supply agreements.</span>
            )}
          </div>
        </div>

        {/* Waste Impact Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-emerald-600" />
                Modeled Waste Diversion
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded" title="Reduction in unsegregated residual landfill waste">
                  -{sim.waste.residualReductionPercent}% Residual
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded" title="Diverted mass as share of total campus audited waste">
                  +{sim.waste.totalCampusDiversionPercent}% Total Diverted
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Baseline Residual Landfill:</span>
                <span className="font-mono font-medium text-slate-800">{sim.waste.beforeMixedKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Projected Residual Landfill:</span>
                <span className="font-mono font-bold text-emerald-800">{sim.waste.afterMixedKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Campus Audited Waste:</span>
                <span className="font-mono font-medium text-slate-600">{sim.waste.totalAuditedWasteKg.toLocaleString()} kg</span>
              </div>
              {sim.waste.divertedFoodKg > 0 && (
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-amber-700">Food Prep Scrap Composted:</span>
                  <span className="font-mono font-medium">+{sim.waste.divertedFoodKg.toLocaleString()} kg</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-semibold text-emerald-900">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                  Estimated Waste Diverted:
                </span>
                <span className="font-mono text-sm">+{sim.waste.netDivertedFromLandfillKg.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Clear Denominator Breakdown */}
            <div className="mt-3 p-2.5 rounded bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between items-center">
                <span>Residual-Waste Reduction:</span>
                <span className="font-mono font-semibold text-emerald-800">
                  {sim.waste.residualReductionPercent}% ({sim.waste.divertedMixedKg.toLocaleString()} / {sim.waste.beforeMixedKg.toLocaleString()} kg)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Campus Waste Share:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {sim.waste.totalCampusDiversionPercent}% ({sim.waste.netDivertedFromLandfillKg.toLocaleString()} / {sim.waste.totalAuditedWasteKg.toLocaleString()} kg)
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400">
                <span>Mass Balance:</span>
                <span className="font-mono">
                  {sim.waste.afterMixedKg.toLocaleString()} + {sim.waste.divertedMixedKg.toLocaleString()} = {sim.waste.beforeMixedKg.toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Diverted through 4-stream source segregation (MoEF&amp;CC SWM Rules 2026) to on-site aerobic composting and recycling aggregators.</span>
          </div>
        </div>
      </div>

      {/* Interactive Intervention Policy Toggles */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Configurable Illustrative Interventions
            </h4>
            <p className="text-xs text-slate-500">
              Efficacy percentages are illustrative modeling assumptions applying strictly to eligible excess, not guaranteed performance.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">HYPOTHETICAL EXPERIMENT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {interventions.map(int => (
            <div
              key={int.id}
              onClick={() => toggleIntervention(int.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                int.isActive
                  ? 'bg-slate-50/90 border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0 mt-0.5">
                    {getResourceIcon(int.resource)}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">
                      {int.title}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="capitalize">{int.resource}</span>
                      <span>·</span>
                      <span>{int.feasibility} Feasibility</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">-{int.expectedReductionPercent}% Target</span>
                    </div>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                  int.isActive ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {int.isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {int.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                Target locations: {int.targetLocations.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
