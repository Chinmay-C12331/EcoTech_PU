/**
 * Tariff & Cost Assumptions Configuration Modal
 * EcoTech PU - Presidency University Bengaluru
 * 
 * STRICT COMPLIANCE REQUIREMENT:
 * Prevents inventing unverified electricity tariffs, water rates, or emissions figures.
 * When unconfigured, all financial metrics display:
 * "Cost impact cannot yet be calculated reliably."
 */

import React, { useState } from 'react';
import { TariffAssumptions } from '../types/resource';
import { DEMO_PRESET_TARIFFS } from '../data/presidencyFacts';
import { X, Sliders, ShieldAlert, Check, RotateCcw } from 'lucide-react';

interface TariffSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffConfig: TariffAssumptions;
  onSaveConfig: (updated: TariffAssumptions) => void;
}

export const TariffSettingsModal: React.FC<TariffSettingsModalProps> = ({
  isOpen,
  onClose,
  tariffConfig,
  onSaveConfig
}) => {
  const [isConfigured, setIsConfigured] = useState(tariffConfig.isConfigured);
  const [elecRate, setElecRate] = useState<string>(
    tariffConfig.electricityRateInrPerKwh ? String(tariffConfig.electricityRateInrPerKwh) : ''
  );
  const [waterRate, setWaterRate] = useState<string>(
    tariffConfig.waterRateInrPerKl ? String(tariffConfig.waterRateInrPerKl) : ''
  );
  const [wasteRate, setWasteRate] = useState<string>(
    tariffConfig.wasteDisposalRateInrPerKg ? String(tariffConfig.wasteDisposalRateInrPerKg) : ''
  );
  const [co2Factor, setCo2Factor] = useState<string>(
    tariffConfig.co2FactorKgPerKwh ? String(tariffConfig.co2FactorKgPerKwh) : ''
  );
  const [notes, setNotes] = useState(tariffConfig.notes || '');

  if (!isOpen) return null;

  const handleApplyPreset = () => {
    setIsConfigured(true);
    setElecRate(String(DEMO_PRESET_TARIFFS.electricityRateInrPerKwh));
    setWaterRate(String(DEMO_PRESET_TARIFFS.waterRateInrPerKl));
    setWasteRate(String(DEMO_PRESET_TARIFFS.wasteDisposalRateInrPerKg));
    setCo2Factor(String(DEMO_PRESET_TARIFFS.co2FactorKgPerKwh));
    setNotes(DEMO_PRESET_TARIFFS.notes);
  };

  const handleResetUnconfigured = () => {
    setIsConfigured(false);
    setElecRate('');
    setWaterRate('');
    setWasteRate('');
    setCo2Factor('');
    setNotes('Unset by default to prevent fictitious financial claims without verified commercial contracts.');
  };

  const handleSave = () => {
    const parsedElec = elecRate ? parseFloat(elecRate) : null;
    const parsedWater = waterRate ? parseFloat(waterRate) : null;
    const parsedWaste = wasteRate ? parseFloat(wasteRate) : null;
    const parsedCo2 = co2Factor ? parseFloat(co2Factor) : null;

    onSaveConfig({
      isConfigured: isConfigured && (parsedElec !== null || parsedWater !== null || parsedWaste !== null),
      electricityRateInrPerKwh: parsedElec,
      waterRateInrPerKl: parsedWater,
      wasteDisposalRateInrPerKg: parsedWaste,
      co2FactorKgPerKwh: parsedCo2,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-100 text-emerald-800">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Tariff Policy & Cost Assumptions
              </h3>
              <p className="text-xs text-slate-500">
                Configurable economic rates and mandatory disclosure policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Policy Compliance Warning Box */}
          <div className="p-3 bg-amber-50 rounded-md border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-950">Audit Integrity Policy: </span>
              In adherence with institutional audit guidelines, EcoTech PU never invents campus utility tariffs. Without an official signed Power Purchase Agreement (PPA) or municipal bulk water bill, commercial savings cannot be definitively asserted. Missing rates will cause financial projections to be transparently reported as uncalculated.
            </div>
          </div>

          {/* Toggle & Current Status Banner */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Tariff Modeling Assumptions Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  {isConfigured 
                    ? 'Active: Calculating estimated rupee metrics using disclosed reference assumptions.' 
                    : 'Unconfigured: Financial figures reported as uncalculated across all views.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfigured}
                  onChange={e => setIsConfigured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className={`p-2 rounded text-[11px] font-mono flex items-center justify-between ${
              isConfigured 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <span>STATUS: {isConfigured ? 'ILLUSTRATIVE ASSUMPTIONS ENABLED' : 'UNCONFIGURED (SAVINGS UNASSERTED)'}</span>
              <span className="text-[10px] uppercase font-sans font-semibold">
                {isConfigured ? 'Non-Certified Estimate' : 'Disclosure Active'}
              </span>
            </div>
          </div>

          {/* Rate Fields & Units - Always Visible */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">
                Resource Stream Tariff Schedule
              </span>
              <span className="text-[10px] text-slate-400">
                {isConfigured ? 'Editable Rate Inputs' : 'Rate Parameters (Disabled until enabled)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Electricity Commercial Tariff (₹ / kWh)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.50"
                  value={elecRate}
                  disabled={!isConfigured}
                  onChange={e => setElecRate(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    isConfigured ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-slate-600 shrink-0">₹ / kWh</span>
              </div>
              <span className="text-[10px] text-slate-400">Typical Karnataka BESCOM HT-2c commercial reference: ~₹8.50/kWh</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Water Supply Tariff (₹ / kL or ₹ / 1,000 Litres)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 60.00"
                  value={waterRate}
                  disabled={!isConfigured}
                  onChange={e => setWaterRate(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    isConfigured ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-slate-600 shrink-0">₹ / 1,000 L (kL)</span>
              </div>
              <span className="text-[10px] text-slate-400">Typical bulk commercial tanker / municipal reference: ~₹60.00 per kilolitre</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Waste Hauling & Processing Fee (₹ / kg)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 4.00"
                  value={wasteRate}
                  disabled={!isConfigured}
                  onChange={e => setWasteRate(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    isConfigured ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-slate-600 shrink-0">₹ / kg</span>
              </div>
              <span className="text-[10px] text-slate-400">Estimated municipal tipping & transport fee: ~₹4.00/kg</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Grid Emission Factor (kg CO₂ / kWh)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.82"
                  value={co2Factor}
                  disabled={!isConfigured}
                  onChange={e => setCo2Factor(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    isConfigured ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-slate-600 shrink-0">kg CO₂ / kWh</span>
              </div>
              <span className="text-[10px] text-slate-400">Central Electricity Authority (CEA) India grid baseline: ~0.82 kg CO₂/kWh</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assumption Disclosure Note
              </label>
              <textarea
                rows={2}
                value={notes}
                disabled={!isConfigured}
                onChange={e => setNotes(e.target.value)}
                className={`w-full p-2 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                  isConfigured ? 'border-slate-300 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
                placeholder="Notes explaining source or provisional tariff agreement..."
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              onClick={handleApplyPreset}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline"
            >
              Load Illustrative Tariff Assumptions
            </button>
            <button
              onClick={handleResetUnconfigured}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Unset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Save Assumptions
          </button>
        </div>
      </div>
    </div>
  );
};
