/**
 * EcoTech PU - Presidency University Bengaluru
 * Campus Resource Intelligence Dashboard
 * 
 * Includes "Measure → Detect → Act → Verify" Corrective Action Workflow
 */

import React, { useState, useEffect } from 'react';
import { 
  EnergyReading, 
  WaterReading, 
  WasteReading, 
  TariffAssumptions,
  ActionTask,
  Recommendation
} from './types/resource';
import { 
  generateSyntheticEnergyData, 
  generateSyntheticWaterData, 
  generateSyntheticWasteData 
} from './data/syntheticData';
import { DEFAULT_TARIFF_ASSUMPTIONS } from './data/presidencyFacts';
import { INITIAL_ACTION_TASKS } from './data/sampleTasks';
import { Navbar, ActiveTab } from './components/Navbar';
import { CampusOverview } from './components/CampusOverview';
import { EnergyDashboard } from './components/EnergyDashboard';
import { WaterDashboard } from './components/WaterDashboard';
import { WasteDashboard } from './components/WasteDashboard';
import { ActionTracker } from './components/ActionTracker';
import { InterventionModal } from './components/InterventionModal';
import { MethodologyPanel } from './components/MethodologyPanel';
import { CsvUploadModal } from './components/CsvUploadModal';
import { TariffSettingsModal } from './components/TariffSettingsModal';
import { CreateActionModal } from './components/CreateActionModal';
import { CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'ecotech_pu_action_tasks_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [energyReadings, setEnergyReadings] = useState<EnergyReading[]>(generateSyntheticEnergyData);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>(generateSyntheticWaterData);
  const [wasteReadings, setWasteReadings] = useState<WasteReading[]>(generateSyntheticWasteData);
  const [tariffConfig, setTariffConfig] = useState<TariffAssumptions>(DEFAULT_TARIFF_ASSUMPTIONS);
  
  // Action Tasks State with local persistence
  const [actionTasks, setActionTasks] = useState<ActionTask[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load stored action tasks:', e);
    }
    return INITIAL_ACTION_TASKS;
  });

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTariffOpen, setIsTariffOpen] = useState(false);
  const [createTaskRec, setCreateTaskRec] = useState<Recommendation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync action tasks to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actionTasks));
      }
    } catch (e) {
      console.warn('Could not save action tasks to storage:', e);
    }
  }, [actionTasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleResetData = () => {
    setEnergyReadings(generateSyntheticEnergyData());
    setWaterReadings(generateSyntheticWaterData());
    setWasteReadings(generateSyntheticWasteData());
    setActionTasks(INITIAL_ACTION_TASKS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    showToast('Reset to deterministic synthetic demo dataset and baseline tasks.');
  };

  const handleCreateActionTask = (newTask: ActionTask) => {
    setActionTasks(prev => [newTask, ...prev]);
    showToast(`Action task "${newTask.title}" initialized in workflow.`);
    setActiveTab('actions');
  };

  const handleUpdateActionTask = (updatedTask: ActionTask) => {
    setActionTasks(prev =>
      prev.map(t => (t.id === updatedTask.id ? updatedTask : t))
    );
    showToast(`Task status updated to: ${updatedTask.status}`);
  };

  const handleViewTask = (taskId: string) => {
    setActiveTab('actions');
  };

  const handleUploadEnergy = (data: EnergyReading[]) => {
    setEnergyReadings(data);
    showToast(`Successfully loaded ${data.length} custom Energy records.`);
    setActiveTab('energy');
  };

  const handleUploadWater = (data: WaterReading[]) => {
    setWaterReadings(data);
    showToast(`Successfully loaded ${data.length} custom Water records.`);
    setActiveTab('water');
  };

  const handleUploadWaste = (data: WasteReading[]) => {
    setWasteReadings(data);
    showToast(`Successfully loaded ${data.length} custom Waste records.`);
    setActiveTab('waste');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTariffs={() => setIsTariffOpen(true)}
        onResetData={handleResetData}
        tariffConfig={tariffConfig}
        isSimulatedDataset={true}
        activeTasksCount={actionTasks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <CampusOverview
            energyReadings={energyReadings}
            waterReadings={waterReadings}
            wasteReadings={wasteReadings}
            tariffConfig={tariffConfig}
            onNavigateTab={tab => setActiveTab(tab)}
            actionTasks={actionTasks}
            onCreateActionTask={rec => setCreateTaskRec(rec)}
            onViewTask={handleViewTask}
          />
        )}

        {activeTab === 'energy' && (
          <EnergyDashboard
            readings={energyReadings}
            tariffConfig={tariffConfig}
            actionTasks={actionTasks}
            onCreateActionTask={rec => setCreateTaskRec(rec)}
            onViewTask={handleViewTask}
          />
        )}

        {activeTab === 'water' && (
          <WaterDashboard
            readings={waterReadings}
            tariffConfig={tariffConfig}
            actionTasks={actionTasks}
            onCreateActionTask={rec => setCreateTaskRec(rec)}
            onViewTask={handleViewTask}
          />
        )}

        {activeTab === 'waste' && (
          <WasteDashboard
            readings={wasteReadings}
            tariffConfig={tariffConfig}
            actionTasks={actionTasks}
            onCreateActionTask={rec => setCreateTaskRec(rec)}
            onViewTask={handleViewTask}
          />
        )}

        {activeTab === 'actions' && (
          <ActionTracker
            tasks={actionTasks}
            onUpdateTask={handleUpdateActionTask}
            onSelectTask={handleViewTask}
          />
        )}

        {activeTab === 'interventions' && (
          <InterventionModal
            energyReadings={energyReadings}
            waterReadings={waterReadings}
            wasteReadings={wasteReadings}
            tariffConfig={tariffConfig}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'architecture' && (
          <MethodologyPanel
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CreateActionModal
        isOpen={!!createTaskRec}
        onClose={() => setCreateTaskRec(null)}
        recommendation={createTaskRec}
        onCreateTask={handleCreateActionTask}
      />

      <CsvUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadEnergy={handleUploadEnergy}
        onUploadWater={handleUploadWater}
        onUploadWaste={handleUploadWaste}
      />

      <TariffSettingsModal
        isOpen={isTariffOpen}
        onClose={() => setIsTariffOpen(false)}
        tariffConfig={tariffConfig}
        onSaveConfig={cfg => {
          setTariffConfig(cfg);
          showToast(cfg.isConfigured ? 'Custom tariff assumptions applied.' : 'Tariff rates reset to unconfigured.');
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">EcoTech PU</span>
            <span>·</span>
            <span>Presidency University Bengaluru</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Campus Resource Intelligence</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Deterministic Analysis Engine</span>
            <span>·</span>
            <span>BEE ECBC 2017 · NBC 2016 · MoEF&amp;CC SWM Rules 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
