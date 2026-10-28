/**
 * Top Navigation Header
 * EcoTech PU - Presidency University Bengaluru
 */

import React from 'react';
import { 
  Building2, 
  UploadCloud, 
  Sliders, 
  Sparkles, 
  RefreshCw,
  Zap,
  Droplets,
  Trash2,
  LayoutDashboard,
  ClipboardCheck,
  ShieldCheck
} from 'lucide-react';
import { TariffAssumptions } from '../types/resource';

export type ActiveTab = 'overview' | 'energy' | 'water' | 'waste' | 'actions' | 'interventions' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenTariffs: () => void;
  onResetData: () => void;
  tariffConfig: TariffAssumptions;
  isSimulatedDataset: boolean;
  activeTasksCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenTariffs,
  onResetData,
  tariffConfig,
  isSimulatedDataset,
  activeTasksCount = 0
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Campus Operations & Telemetry Notice */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400">Presidency University, Bengaluru</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">Campus Resource Intelligence</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-medium">Rajanukunte Campus</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-200 font-semibold tracking-wide">SIMULATED DEMO DATA</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[11px]">Seed #42</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            {tariffConfig.isConfigured 
              ? `Tariffs: ₹${tariffConfig.electricityRateInrPerKwh}/kWh · ₹${tariffConfig.waterRateInrPerKl}/kL` 
              : 'Tariffs: Unconfigured (Assumptions Disclosed)'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-bold text-slate-900 tracking-tight">EcoTech PU</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wide">
                  Presidency
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Campus Resource Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Functional Segmented Control) */}
          <nav className="hidden lg:flex items-center gap-0.5 p-1 bg-slate-100/90 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => onTabChange('overview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Campus Overview</span>
            </button>

            <button
              onClick={() => onTabChange('energy')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'energy'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Energy</span>
            </button>

            <button
              onClick={() => onTabChange('water')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'water'
                  ? 'bg-white text-sky-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Water</span>
            </button>

            <button
              onClick={() => onTabChange('waste')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'waste'
                  ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Waste</span>
            </button>

            <button
              onClick={() => onTabChange('actions')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'actions'
                  ? 'bg-white text-indigo-950 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Action Tasks</span>
              {activeTasksCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                  {activeTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('interventions')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'interventions'
                  ? 'bg-white text-purple-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Interventions</span>
            </button>

            <button
              onClick={() => onTabChange('architecture')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'architecture' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span>Architecture & Methodology</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
              title="Upload custom CSV records"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>

            <button
              onClick={onOpenTariffs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
              title="Configure tariff and baseline assumptions"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Tariff Policy</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shrink-0"
              title="Reset to deterministic synthetic dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="lg:hidden flex items-center py-2 border-t border-slate-200 overflow-x-auto gap-1.5">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'overview' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('energy')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'energy' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Energy
          </button>
          <button
            onClick={() => onTabChange('water')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'water' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Water
          </button>
          <button
            onClick={() => onTabChange('waste')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'waste' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Waste
          </button>
          <button
            onClick={() => onTabChange('actions')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'actions' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Action Tasks ({activeTasksCount})
          </button>
          <button
            onClick={() => onTabChange('interventions')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'interventions' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Interventions
          </button>
          <button
            onClick={() => onTabChange('architecture')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'architecture' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 bg-slate-100 hover:text-slate-900'
            }`}
          >
            Architecture
          </button>
        </div>
      </div>
    </header>
  );
};
