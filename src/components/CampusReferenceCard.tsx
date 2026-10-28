/**
 * Presidency University Sustainability Reference & Provenance Card
 * EcoTech PU - Presidency University Bengaluru
 * 
 * STRICT ATTRIBUTION COMPLIANCE:
 * Displays Presidency University's published institutional figures separately
 * from simulated telemetry, noting official citations and limitations.
 */

import React from 'react';
import { PRESIDENCY_UNIVERSITY_FACTS } from '../data/presidencyFacts';
import { ShieldCheck, ExternalLink, Info, Sun, Droplets, Utensils } from 'lucide-react';

export const CampusReferenceCard: React.FC = () => {
  const getIcon = (idx: number) => {
    if (idx === 0) return <Sun className="w-4 h-4 text-amber-500" />;
    if (idx === 1) return <Droplets className="w-4 h-4 text-sky-500" />;
    return <Utensils className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Presidency University Sustainability Benchmarks
            </h3>
            <p className="text-xs text-slate-500">
              Institutional Baseline Figures & Source Attribution (Distinct from Simulated Telemetry)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Curated Institutional Records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {PRESIDENCY_UNIVERSITY_FACTS.map((fact, idx) => (
          <div 
            key={idx}
            className="flex flex-col justify-between p-4 rounded-lg bg-slate-50/70 border border-slate-200"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  {getIcon(idx)}
                  {fact.metric}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {fact.figure}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {fact.unit}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {fact.context}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80">
              <div className="text-[11px] text-slate-500 flex items-start gap-1">
                <span className="font-medium text-slate-700 shrink-0">Source:</span>
                <span className="italic">{fact.provenance}</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700 bg-amber-50/80 p-1.5 rounded border border-amber-200/60 leading-tight">
                <strong>Provenance Notice:</strong> {fact.disclaimer}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-100/60 rounded-md border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Operational Integrity Note: </span>
          The above figures are published benchmarks sourced from Presidency University's institutional green campus documentation. In compliance with rigorous engineering and auditing standards, EcoTech PU keeps these reference benchmarks strictly segregated from simulated sensor telemetry. We do not claim these are real-time automated IoT feeds, nor do we invent unverified electricity or water billing rates.
        </div>
      </div>
    </div>
  );
};
