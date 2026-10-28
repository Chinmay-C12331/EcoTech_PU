/**
 * Action Tracker & Corrective Workflow Panel
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Manages the "Measure → Detect → Act → Verify" lifecycle:
 * Detected → Acknowledged → Investigating → Repair Reported → Awaiting Verification → Verified Improvement / No Improvement / Inconclusive
 */

import React, { useState } from 'react';
import { 
  ActionTask, 
  ActionStatus, 
  FollowUpMeasurement 
} from '../types/resource';
import { 
  canTransition, 
  VALID_TRANSITIONS, 
  computeVerification 
} from '../analysis/verificationEngine';
import { 
  ClipboardCheck, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Plus, 
  ArrowRight, 
  RotateCcw, 
  History, 
  Zap, 
  Droplets, 
  Trash2, 
  FileCheck,
  TrendingDown,
  Info,
  Calendar,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface ActionTrackerProps {
  tasks: ActionTask[];
  onUpdateTask: (updated: ActionTask) => void;
  onSelectTask?: (taskId: string) => void;
  onOpenCreateModal?: () => void;
}

export const ActionTracker: React.FC<ActionTrackerProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  onOpenCreateModal
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Follow-up measurement form state
  const [measurementVal, setMeasurementVal] = useState<string>('');
  const [measurementHours, setMeasurementHours] = useState<string>('4');
  const [isComparable, setIsComparable] = useState<boolean>(true);
  const [measurementIsSimulated, setMeasurementIsSimulated] = useState<boolean>(true);
  const [measurementNotes, setMeasurementNotes] = useState<string>('');
  const [statusChangeNote, setStatusChangeNote] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState<ActionStatus | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadgeStyle = (status: ActionStatus) => {
    switch (status) {
      case 'Detected':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Acknowledged':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Investigating':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Repair Reported':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Awaiting Verification':
        return 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
      case 'Verified Improvement':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'No Improvement':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Inconclusive':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getResourceIcon = (res: 'energy' | 'water' | 'waste') => {
    if (res === 'energy') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    if (res === 'water') return <Droplets className="w-3.5 h-3.5 text-sky-500" />;
    return <Trash2 className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const handleTransition = (newStatus: ActionStatus) => {
    if (!selectedTask) return;

    const now = new Date().toISOString();
    const updatedHistory = [
      ...selectedTask.history,
      {
        fromStatus: selectedTask.status,
        toStatus: newStatus,
        timestamp: now,
        changedBy: 'EcoTech PU Operator',
        note: statusChangeNote.trim() || `Workflow transitioned to ${newStatus}.`
      }
    ];

    // If transitioning to verification outcome, re-compute verification analysis
    let updatedVerification = selectedTask.verification;
    if (newStatus === 'Verified Improvement' || newStatus === 'No Improvement' || newStatus === 'Inconclusive') {
      updatedVerification = computeVerification(
        selectedTask.originalObservedValue,
        selectedTask.originalBaseline,
        selectedTask.originalExcess,
        selectedTask.unit,
        selectedTask.followUpMeasurements
      );
    }

    const updatedTask: ActionTask = {
      ...selectedTask,
      status: newStatus,
      history: updatedHistory,
      verification: updatedVerification,
      updatedAt: now
    };

    onUpdateTask(updatedTask);
    setShowStatusModal(null);
    setStatusChangeNote('');
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !measurementVal) return;

    const val = parseFloat(measurementVal);
    if (isNaN(val)) return;

    const newMeasurement: FollowUpMeasurement = {
      id: `fm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      value: Math.round(val * 10) / 10,
      durationHoursOrDays: parseFloat(measurementHours) || 4,
      isComparablePeriod: isComparable,
      notes: measurementNotes.trim() || (measurementIsSimulated ? 'Simulated post-remediation audit reading' : 'Field sensor post-remediation reading'),
      isSimulated: measurementIsSimulated
    };

    const updatedMeasurements = [...selectedTask.followUpMeasurements, newMeasurement];
    
    // Automatically re-compute verification outcome
    const verification = computeVerification(
      selectedTask.originalObservedValue,
      selectedTask.originalBaseline,
      selectedTask.originalExcess,
      selectedTask.unit,
      updatedMeasurements
    );

    let nextStatus = selectedTask.status;
    if (selectedTask.status === 'Awaiting Verification' || selectedTask.status === 'Inconclusive' || selectedTask.status === 'Repair Reported') {
      nextStatus = verification.outcome;
    }

    const updatedTask: ActionTask = {
      ...selectedTask,
      followUpMeasurements: updatedMeasurements,
      verification,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };

    onUpdateTask(updatedTask);
    setMeasurementVal('');
    setMeasurementNotes('');
  };

  const handleQuickDemoMeasurement = () => {
    if (!selectedTask) return;
    // Compute a simulated post-fix measurement near baseline (e.g. baseline + 5%)
    const simPostFix = Math.round((selectedTask.originalBaseline * 1.05) * 10) / 10;
    
    const newMeasurement: FollowUpMeasurement = {
      id: `fm-demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      value: simPostFix,
      durationHoursOrDays: 4,
      isComparablePeriod: true,
      notes: '[SIMULATED DEMO DATA] Modeled post-remediation audit reading near baseline',
      isSimulated: true
    };

    const updatedMeasurements = [...selectedTask.followUpMeasurements, newMeasurement];
    const verification = computeVerification(
      selectedTask.originalObservedValue,
      selectedTask.originalBaseline,
      selectedTask.originalExcess,
      selectedTask.unit,
      updatedMeasurements
    );

    const updatedTask: ActionTask = {
      ...selectedTask,
      followUpMeasurements: updatedMeasurements,
      verification,
      status: 'Verified Improvement',
      updatedAt: new Date().toISOString()
    };

    onUpdateTask(updatedTask);
  };

  const allowedNextStatuses = selectedTask ? (VALID_TRANSITIONS[selectedTask.status] || []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-700 text-white">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Measure → Detect → Act → Verify Lifecycle
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {tasks.length} Active Action Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-tracked corrective tasks with empirical follow-up verification and baseline comparisons.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="Detected">Detected</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Investigating">Investigating</option>
            <option value="Repair Reported">Repair Reported</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Verified Improvement">Verified Improvement</option>
            <option value="Inconclusive">Inconclusive</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No Action Tasks Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Navigate to the Campus Overview, Energy, Water, or Waste dashboards and click "Create Action Task" on any flagged recommendation to initialize a corrective action.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tasks List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Action Tasks ({filteredTasks.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Click to Inspect</span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    selectedTask?.id === task.id
                      ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 uppercase flex items-center gap-1">
                      {getResourceIcon(task.resource)}
                      {task.location}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h4>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[150px]">Owner: {task.owner.split(' ')[0]}</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Compact Action Tracking Panel (8 cols) */}
          {selectedTask && (
            <div className="lg:col-span-8 space-y-5">
              {/* Card 1: Task Overview & Workflow State Controller */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize font-semibold text-slate-800 flex items-center gap-1">
                        {getResourceIcon(selectedTask.resource)}
                        {selectedTask.resource} Resource Task
                      </span>
                      <span>·</span>
                      <span>{selectedTask.location}</span>
                      <span>·</span>
                      <span className="text-slate-400">ID: {selectedTask.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {selectedTask.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded border shadow-xs ${getStatusBadgeStyle(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Priority: {selectedTask.priority} · Due: {selectedTask.dueDate}
                    </span>
                  </div>
                </div>

                {/* Workflow Stepper Bar */}
                <div className="mt-4 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Workflow Pipeline Progress
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-x-auto gap-2">
                    {['Detected', 'Acknowledged', 'Investigating', 'Repair Reported', 'Awaiting Verification', 'Verified'].map((step, idx) => {
                      const isCompleted = 
                        (step === 'Detected' && selectedTask.status !== 'Detected') ||
                        (step === 'Acknowledged' && !['Detected', 'Acknowledged'].includes(selectedTask.status)) ||
                        (step === 'Investigating' && !['Detected', 'Acknowledged', 'Investigating'].includes(selectedTask.status)) ||
                        (step === 'Repair Reported' && ['Awaiting Verification', 'Verified Improvement', 'No Improvement', 'Inconclusive'].includes(selectedTask.status)) ||
                        (step === 'Awaiting Verification' && ['Verified Improvement', 'No Improvement', 'Inconclusive'].includes(selectedTask.status)) ||
                        (step === 'Verified' && selectedTask.status === 'Verified Improvement');

                      const isCurrent = 
                        (step === 'Detected' && selectedTask.status === 'Detected') ||
                        (step === 'Acknowledged' && selectedTask.status === 'Acknowledged') ||
                        (step === 'Investigating' && selectedTask.status === 'Investigating') ||
                        (step === 'Repair Reported' && selectedTask.status === 'Repair Reported') ||
                        (step === 'Awaiting Verification' && selectedTask.status === 'Awaiting Verification') ||
                        (step === 'Verified' && ['Verified Improvement', 'No Improvement', 'Inconclusive'].includes(selectedTask.status));

                      return (
                        <div key={idx} className="flex items-center gap-1.5 shrink-0">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isCompleted ? 'bg-emerald-700 text-white' :
                            isCurrent ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={isCurrent ? 'font-bold text-slate-900' : ''}>
                            {step}
                          </span>
                          {idx < 5 && <ArrowRight className="w-3 h-3 text-slate-300 ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State Transition Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Task Owner: </span>
                    <span>{selectedTask.owner}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {allowedNextStatuses.map(st => (
                      <button
                        key={st}
                        onClick={() => handleTransition(st)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1"
                      >
                        <span>Advance to: {st}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}

                    {/* Quick Reopen button if finalized */}
                    {['Verified Improvement', 'No Improvement', 'Inconclusive'].includes(selectedTask.status) && (
                      <button
                        onClick={() => handleTransition('Investigating')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen Investigation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Original Finding vs Corrective Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-2">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block text-rose-700">
                    Detected Anomaly & Evidence
                  </span>
                  <p className="font-medium text-slate-900">
                    {selectedTask.finding}
                  </p>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-slate-600 leading-relaxed text-[11px]">
                    {selectedTask.originalEvidence}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Observed:</span>
                      <strong className="text-slate-900">{selectedTask.originalObservedValue} {selectedTask.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Baseline:</span>
                      <strong className="text-slate-700">{selectedTask.originalBaseline} {selectedTask.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Prior Excess:</span>
                      <strong className="text-amber-700">+{selectedTask.originalExcess} {selectedTask.unit}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs space-y-2">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block text-emerald-800">
                    Corrective Intervention Plan
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedTask.correctiveAction}
                  </p>
                  <div className="p-2.5 bg-emerald-50/60 rounded border border-emerald-200/80 text-emerald-950 text-[11px] leading-relaxed">
                    <span className="font-semibold block mb-0.5">Field Dispatch Notes:</span>
                    {selectedTask.notes || 'Field team dispatched per SOP.'}
                  </div>
                </div>
              </div>

              {/* Card 3: Follow-Up Measurements & Empirical Verification Engine */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      Follow-Up Measurements & Verification Audit
                    </h4>
                    <p className="text-xs text-slate-500">
                      Record post-remediation readings to verify whether consumption has reverted toward baseline.
                    </p>
                  </div>

                  <button
                    onClick={handleQuickDemoMeasurement}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded border border-emerald-300 transition-colors shadow-xs flex items-center gap-1.5"
                    title="Simulate adding an empirical follow-up reading near baseline"
                  >
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2 rounded font-bold">
                      SIMULATED
                    </span>
                    <span>Record Simulated Follow-up Reading</span>
                  </button>
                </div>

                {/* Entry Form */}
                <form onSubmit={handleAddMeasurement} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                  <div className="font-semibold text-slate-800 text-xs">
                    Log New Follow-Up Reading ({selectedTask.unit})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Measured Value ({selectedTask.unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={measurementVal}
                        onChange={e => setMeasurementVal(e.target.value)}
                        placeholder={`e.g. ${selectedTask.originalBaseline}`}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Audit Duration (Hours / Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={measurementHours}
                        onChange={e => setMeasurementHours(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 font-mono"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={isComparable}
                          onChange={e => setIsComparable(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Comparable Shift/Window</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700">Reading Provenance:</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="readingProvenance"
                          checked={measurementIsSimulated}
                          onChange={() => setMeasurementIsSimulated(true)}
                          className="text-indigo-600 focus:ring-0"
                        />
                        <span>Simulated Demo Reading</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 font-medium">
                        <input
                          type="radio"
                          name="readingProvenance"
                          checked={!measurementIsSimulated}
                          onChange={() => setMeasurementIsSimulated(false)}
                          className="text-emerald-700 focus:ring-0"
                        />
                        <span>Certified Field Meter Reading</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={measurementNotes}
                      onChange={e => setMeasurementNotes(e.target.value)}
                      placeholder="Audit observation notes (e.g. post-contactor clamp reading)..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Baseline Target: <strong>{selectedTask.originalBaseline} {selectedTask.unit}</strong> (Prior Peak: {selectedTask.originalObservedValue} {selectedTask.unit})
                    </span>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      Log Measurement & Recalculate
                    </button>
                  </div>
                </form>

                {/* Follow-up measurement history table */}
                {selectedTask.followUpMeasurements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Recorded Follow-Up Audit Log ({selectedTask.followUpMeasurements.length})
                    </div>
                    <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                          <tr>
                            <th className="p-2 font-medium">Timestamp</th>
                            <th className="p-2 font-medium">Follow-Up Value</th>
                            <th className="p-2 font-medium">vs Baseline</th>
                            <th className="p-2 font-medium">Condition</th>
                            <th className="p-2 font-medium">Provenance</th>
                            <th className="p-2 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {selectedTask.followUpMeasurements.map(m => {
                            const diffFromBase = Math.round((m.value - selectedTask.originalBaseline) * 10) / 10;
                            return (
                              <tr key={m.id} className="hover:bg-slate-50/50">
                                <td className="p-2 font-mono text-[11px] text-slate-500">
                                  {m.timestamp.slice(0, 16).replace('T', ' ')}
                                </td>
                                <td className="p-2 font-bold font-mono text-slate-900">
                                  {m.value} {selectedTask.unit}
                                </td>
                                <td className="p-2 font-mono text-[11px]">
                                  {diffFromBase <= 0 ? (
                                    <span className="text-emerald-700 font-semibold">At/Below Baseline</span>
                                  ) : (
                                    <span className="text-amber-700 font-medium">+{diffFromBase} {selectedTask.unit}</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  {m.isComparablePeriod ? (
                                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                      Comparable
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                      Non-Comparable
                                    </span>
                                  )}
                                </td>
                                <td className="p-2">
                                  <span className={`text-[10px] border px-1.5 py-0.5 rounded font-mono ${
                                    m.isSimulated
                                      ? 'text-indigo-800 bg-indigo-50 border-indigo-200'
                                      : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                  }`}>
                                    {m.isSimulated ? 'SIMULATED DEMO' : 'CERTIFIED SENSOR'}
                                  </span>
                                </td>
                                <td className="p-2 text-slate-500 text-[11px] italic">
                                  {m.notes}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Verification Analysis Box */}
                {selectedTask.verification && (
                  <div className={`p-4 rounded-lg border text-xs space-y-2.5 ${
                    selectedTask.verification.outcome === 'Verified Improvement'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : selectedTask.verification.outcome === 'No Improvement'
                      ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {selectedTask.verification.outcome === 'Verified Improvement' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        )}
                        {selectedTask.verification.outcome === 'No Improvement' && (
                          <AlertTriangle className="w-5 h-5 text-rose-700" />
                        )}
                        {selectedTask.verification.outcome === 'Inconclusive' && (
                          <HelpCircle className="w-5 h-5 text-slate-600" />
                        )}
                        <span>Verification Status: {selectedTask.verification.outcome}</span>
                        {selectedTask.verification.isSimulated && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 border border-indigo-300 font-mono flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-700" />
                            Simulated Test Run
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-xs font-semibold">
                        Sample Size: {selectedTask.verification.sampleCount} comparable reading(s)
                      </span>
                    </div>

                    <p className="leading-relaxed font-medium">
                      {selectedTask.verification.explanation}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Original Observed:</span>
                        <span className="font-bold">{selectedTask.verification.beforeValue} {selectedTask.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Baseline Target:</span>
                        <span className="font-bold">{selectedTask.verification.baselineValue} {selectedTask.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Follow-Up Avg:</span>
                        <span className="font-bold text-emerald-800">{selectedTask.verification.followUpValue} {selectedTask.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Avoided Excess:</span>
                        <span className="font-bold text-emerald-800">
                          {selectedTask.verification.percentageExcessAvoided}% (-{selectedTask.verification.absoluteReduction} {selectedTask.unit})
                        </span>
                      </div>
                    </div>

                    {/* Scientific Disclaimer */}
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedTask.verification.disclaimer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Audit Trail History */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Immutable Action Audit Trail ({selectedTask.history.length} events)</span>
                </div>

                <div className="space-y-2">
                  {selectedTask.history.map((h, i) => (
                    <div key={i} className="flex items-start justify-between p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {h.fromStatus === h.toStatus ? `Created as ${h.toStatus}` : `${h.fromStatus} → ${h.toStatus}`}
                        </div>
                        <div className="text-slate-600 mt-0.5">{h.note}</div>
                      </div>
                      <div className="text-right text-slate-400 font-mono shrink-0 ml-2">
                        <div>{h.changedBy}</div>
                        <div>{h.timestamp.slice(0, 16).replace('T', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
