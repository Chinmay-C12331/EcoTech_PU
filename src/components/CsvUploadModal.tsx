/**
 * CSV Upload & Validation Modal
 * EcoTech PU - Presidency University Bengaluru
 */

import React, { useState } from 'react';
import { 
  ResourceType, 
  EnergyReading, 
  WaterReading, 
  WasteReading,
  CsvValidationResult
} from '../types/resource';
import { 
  validateEnergyCsv, 
  validateWaterCsv, 
  validateWasteCsv,
  SAMPLE_ENERGY_CSV,
  SAMPLE_WATER_CSV,
  SAMPLE_WASTE_CSV
} from '../analysis/csvValidator';
import { 
  X, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  HelpCircle
} from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadEnergy: (data: EnergyReading[]) => void;
  onUploadWater: (data: WaterReading[]) => void;
  onUploadWaste: (data: WasteReading[]) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadEnergy,
  onUploadWater,
  onUploadWaste
}) => {
  const [activeStream, setActiveStream] = useState<ResourceType>('energy');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult<any> | null>(null);

  if (!isOpen) return null;

  const handleValidate = (textToValidate: string) => {
    let result: CsvValidationResult<any>;
    if (activeStream === 'energy') {
      result = validateEnergyCsv(textToValidate);
    } else if (activeStream === 'water') {
      result = validateWaterCsv(textToValidate);
    } else {
      result = validateWasteCsv(textToValidate);
    }
    setValidationResult(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = (evt.target?.result as string) || '';
      setRawText(text);
      handleValidate(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    if (text.trim().length > 0) {
      handleValidate(text);
    } else {
      setValidationResult(null);
    }
  };

  const handleDownloadSample = () => {
    let sample = SAMPLE_ENERGY_CSV;
    let name = 'presidency_energy_sample.csv';
    if (activeStream === 'water') {
      sample = SAMPLE_WATER_CSV;
      name = 'presidency_water_sample.csv';
    } else if (activeStream === 'waste') {
      sample = SAMPLE_WASTE_CSV;
      name = 'presidency_waste_sample.csv';
    }

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApply = () => {
    if (!validationResult || !validationResult.isValid) return;

    if (activeStream === 'energy') {
      onUploadEnergy(validationResult.data as EnergyReading[]);
    } else if (activeStream === 'water') {
      onUploadWater(validationResult.data as WaterReading[]);
    } else {
      onUploadWaste(validationResult.data as WasteReading[]);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-900 text-white">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Resource Telemetry CSV Ingestion
              </h3>
              <p className="text-xs text-slate-500">
                Upload real or simulated campus audit records with instant schema validation
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

        {/* Stream Selector Tabs */}
        <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setActiveStream('energy');
                setValidationResult(null);
                setRawText('');
                setFileName('');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeStream === 'energy' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Energy CSV
            </button>
            <button
              onClick={() => {
                setActiveStream('water');
                setValidationResult(null);
                setRawText('');
                setFileName('');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeStream === 'water' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Water CSV
            </button>
            <button
              onClick={() => {
                setActiveStream('waste');
                setValidationResult(null);
                setRawText('');
                setFileName('');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeStream === 'waste' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waste CSV
            </button>
          </div>

          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded hover:bg-slate-50 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample {activeStream.toUpperCase()} CSV</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Documented Schema Reference Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Documented Schema: {activeStream.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">UTF-8 Comma-Separated</span>
            </div>

            {activeStream === 'energy' && (
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Required Columns:</strong> <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">timestamp</code> (ISO 8601 e.g. 2026-10-26T02:00:00Z), <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">location</code>, <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">observed_kwh</code>, <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">baseline_kwh</code>. Optional: <code className="text-slate-500">notes</code>.
              </p>
            )}

            {activeStream === 'water' && (
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Required Columns:</strong> <code className="text-sky-800 bg-white px-1 py-0.5 rounded border border-slate-200">timestamp</code> (ISO 8601), <code className="text-sky-800 bg-white px-1 py-0.5 rounded border border-slate-200">location</code>, <code className="text-sky-800 bg-white px-1 py-0.5 rounded border border-slate-200">observed_litres</code>, <code className="text-sky-800 bg-white px-1 py-0.5 rounded border border-slate-200">baseline_litres</code>. Optional: <code className="text-slate-500">notes</code>.
              </p>
            )}

            {activeStream === 'waste' && (
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Required Columns:</strong> <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">date</code> (YYYY-MM-DD), <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">location</code>, <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">food_waste_kg</code>, <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">recyclable_waste_kg</code>, <code className="text-emerald-800 bg-white px-1 py-0.5 rounded border border-slate-200">mixed_waste_kg</code>. Optional: <code className="text-slate-500">baseline_total_kg</code>.
              </p>
            )}
          </div>

          {/* File Picker or Paste Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Choose CSV File or Paste Raw Text:
            </label>
            <div className="flex items-center gap-3 mb-2">
              <label className="cursor-pointer px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 inline-flex items-center gap-1.5 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Select .csv file</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500 italic">
                {fileName ? fileName : 'No file chosen (or paste directly below)'}
              </span>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={handleTextChange}
              placeholder="Paste raw CSV text here..."
              className="w-full font-mono text-xs p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Validation Feedback Report */}
          {validationResult && (
            <div className={`p-3.5 rounded-lg border text-xs ${
              validationResult.isValid 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Schema Validation Passed ({validationResult.validRowCount} valid rows parsed)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    <span>Validation Failed ({validationResult.errors.length} error{validationResult.errors.length > 1 ? 's' : ''})</span>
                  </>
                )}
              </div>

              {validationResult.errors.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-rose-800 font-mono">
                  {validationResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {validationResult.errors.length > 5 && (
                    <li className="italic text-slate-500">
                      ...and {validationResult.errors.length - 5} more issues.
                    </li>
                  )}
                </ul>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-800">
                  <span className="font-semibold">Warnings:</span> {validationResult.warnings.join('; ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            * All uploaded records are labeled as SIMULATED DEMO DATA
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!validationResult || !validationResult.isValid}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-xs ${
                validationResult && validationResult.isValid
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Apply & Re-Analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
