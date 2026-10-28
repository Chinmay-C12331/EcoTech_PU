/**
 * Create Action Task Modal
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Initiates the "Measure → Detect → Act → Verify" workflow by converting
 * an algorithmic recommendation into an operational campus task.
 */

import React, { useState, useEffect } from 'react';
import { Recommendation, ActionTask, CampusLocation, ResourceType } from '../types/resource';
import { 
  X, 
  ClipboardCheck, 
  User, 
  Calendar, 
  AlertCircle, 
  MapPin, 
  Zap, 
  Droplets, 
  Trash2,
  FileText
} from 'lucide-react';

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onCreateTask: (task: ActionTask) => void;
}

export const CreateActionModal: React.FC<CreateActionModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onCreateTask
}) => {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (recommendation) {
      setTitle(`Remediate: ${recommendation.location} - ${recommendation.resource.toUpperCase()} Anomaly`);
      
      // Smart owner defaults based on resource & location
      if (recommendation.resource === 'energy') {
        setOwner('P. Sharma (Campus Electrical BMS Lead)');
      } else if (recommendation.resource === 'water') {
        setOwner('B. Gowda (Campus Plumbing Supervisor)');
      } else {
        setOwner('Green Campus Student Marshals & Mess Liaison');
      }

      setPriority(recommendation.priorityScore >= 75 ? 'High' : recommendation.priorityScore >= 45 ? 'Medium' : 'Low');

      // Default due date: tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);

      setNotes(`Initiated from EcoTech PU anomaly detection.\nAction: ${recommendation.suggestedAction}`);
    }
  }, [recommendation]);

  if (!isOpen || !recommendation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const newTask: ActionTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recommendationId: recommendation.id,
      resource: recommendation.resource,
      location: recommendation.location,
      title: title.trim() || `Remediation for ${recommendation.location}`,
      finding: recommendation.finding,
      originalEvidence: recommendation.evidence,
      originalObservedValue: recommendation.observedValue,
      originalBaseline: recommendation.baseline,
      originalExcess: recommendation.estimatedExcess,
      unit: recommendation.unit,
      correctiveAction: recommendation.suggestedAction,
      owner: owner.trim() || 'Facility Operations Team',
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      status: 'Detected',
      history: [
        {
          fromStatus: 'Detected',
          toStatus: 'Detected',
          timestamp: now,
          changedBy: 'EcoTech PU Operator',
          note: 'Task initialized from automated resource recommendation.'
        }
      ],
      followUpMeasurements: [],
      createdAt: now,
      updatedAt: now
    };

    onCreateTask(newTask);
    onClose();
  };

  const getResourceIcon = () => {
    if (recommendation.resource === 'energy') return <Zap className="w-4 h-4 text-amber-500" />;
    if (recommendation.resource === 'water') return <Droplets className="w-4 h-4 text-sky-500" />;
    return <Trash2 className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-700 text-white">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Create Corrective Action Task
              </h3>
              <p className="text-xs text-slate-500">
                Measure → Detect → Act → Verify Workflow Initialization
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Prefilled Anomaly Context Summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 capitalize">
                {getResourceIcon()}
                {recommendation.resource} Telemetry · {recommendation.location}
              </span>
              <span className="font-mono text-slate-500">
                Priority Index: {recommendation.priorityScore}/100
              </span>
            </div>
            <p className="text-slate-700 font-medium">
              {recommendation.finding}
            </p>
            <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              <span>Observed: <strong>{recommendation.observedValue} {recommendation.unit}</strong></span>
              <span>Baseline: <strong>{recommendation.baseline} {recommendation.unit}</strong></span>
              <span className="text-amber-700 font-semibold">Excess: +{recommendation.estimatedExcess} {recommendation.unit}</span>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Action Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              placeholder="e.g. Inspect restroom flush valves and tank seals"
            />
          </div>

          {/* Owner & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Task Owner</span>
              </label>
              <input
                type="text"
                required
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                placeholder="Name and role..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Resolution Due Date</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Initial Workflow State
              </label>
              <div className="px-3 py-1.5 text-xs bg-slate-100 rounded-md border border-slate-200 text-slate-700 font-medium">
                Detected (Ready to Acknowledge & Investigate)
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Field Action Notes & Protocol
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-600 focus:outline-hidden font-sans"
              placeholder="Specific inspection instructions, breaker numbers, or valve locations..."
            />
          </div>

          {/* Footer inside form */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Creates auditable tracking record with follow-up verification
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Create Action Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
