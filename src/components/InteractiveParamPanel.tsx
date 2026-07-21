import React, { useState, useEffect } from 'react';
import { Sliders, HelpCircle, RefreshCw, Play, Check, Sparkles, Info, X, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export interface ScriptParam {
  key: string;
  label: string;
  type: 'number' | 'slider' | 'date' | 'select' | 'text';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  explanation: string;
  impact: string;
}

interface InteractiveParamPanelProps {
  code: string;
  fileName: string;
  onApplyAndSimulate: (params: Record<string, any>) => void;
  isExecuting?: boolean;
  onClose?: () => void;
}

export function InteractiveParamPanel({ code, fileName, onApplyAndSimulate, isExecuting, onClose }: InteractiveParamPanelProps) {
  const [params, setParams] = useState<ScriptParam[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, any>>({});

  useEffect(() => {
    // Generate parameter list based on script filename and code inspection
    const detected: ScriptParam[] = [];
    const lowerCode = code.toLowerCase();

    // 1. Coordinates / Region
    if (lowerCode.includes('lat') || lowerCode.includes('bounding') || lowerCode.includes('coord') || lowerCode.includes('location')) {
      detected.push({
        key: 'target_latitude',
        label: 'Target Latitude',
        type: 'slider',
        value: 37.7749,
        min: -90,
        max: 90,
        step: 0.001,
        explanation: 'Geographic latitude center point for satellite acquisition.',
        impact: 'Adjusts the target location on Earth (e.g., California farmlands or Amazon basin).'
      });
      detected.push({
        key: 'target_longitude',
        label: 'Target Longitude',
        type: 'slider',
        value: -122.4194,
        min: -180,
        max: 180,
        step: 0.001,
        explanation: 'Geographic longitude center point for satellite acquisition.',
        impact: 'Defines the East/West coordinate on the global map grid.'
      });
    }

    // 2. Cloud Cover Threshold
    if (lowerCode.includes('cloud') || lowerCode.includes('mask') || lowerCode.includes('quality')) {
      detected.push({
        key: 'max_cloud_cover',
        label: 'Max Cloud Cover Tolerance (%)',
        type: 'slider',
        value: 15,
        min: 0,
        max: 100,
        step: 1,
        explanation: 'Maximum allowed percentage of cloud obstruction in satellite imagery.',
        impact: 'Lower values ensure crisp clear images; higher values include more raw scenes.'
      });
    }

    // 3. Date Range
    if (lowerCode.includes('date') || lowerCode.includes('time') || lowerCode.includes('year') || lowerCode.includes('period')) {
      detected.push({
        key: 'start_date',
        label: 'Analysis Start Date',
        type: 'date',
        value: '2024-01-01',
        explanation: 'The starting date for collecting historical satellite or climate observations.',
        impact: 'Defines the temporal window for baseline measurement.'
      });
      detected.push({
        key: 'end_date',
        label: 'Analysis End Date',
        type: 'date',
        value: '2024-06-30',
        explanation: 'The ending date for observation filtering.',
        impact: 'Determines the duration of the time-series evaluation.'
      });
    }

    // 4. Spatial Resolution
    if (lowerCode.includes('res') || lowerCode.includes('scale') || lowerCode.includes('pixel') || lowerCode.includes('grid')) {
      detected.push({
        key: 'spatial_resolution',
        label: 'Spatial Resolution',
        type: 'select',
        value: '10m (High Precision)',
        options: ['10m (High Precision)', '30m (Standard)', '100m (Regional)', '1km (Coarse Global)'],
        explanation: 'The physical pixel size on the ground.',
        impact: 'Higher precision reveals finer details but requires more processing computation.'
      });
    }

    // 5. ML Model Hyperparameters
    if (lowerCode.includes('epoch') || lowerCode.includes('model') || lowerCode.includes('train') || lowerCode.includes('batch')) {
      detected.push({
        key: 'confidence_threshold',
        label: 'Detection Confidence Threshold',
        type: 'slider',
        value: 0.75,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        explanation: 'Minimum statistical certainty score required for an AI detection flag.',
        impact: 'Higher values reduce false positives; lower values flag subtle anomalies.'
      });
      detected.push({
        key: 'training_epochs',
        label: 'Simulation Epochs',
        type: 'slider',
        value: 10,
        min: 1,
        max: 50,
        step: 1,
        explanation: 'Number of training passes over the dataset.',
        impact: 'Higher epochs allow the model to learn complex patterns.'
      });
    }

    // Default fallback params if none specific matched
    if (detected.length === 0) {
      detected.push({
        key: 'sample_rate',
        label: 'Data Sample Frequency',
        type: 'select',
        value: 'Daily',
        options: ['Hourly', 'Daily', 'Weekly', 'Monthly'],
        explanation: 'Time step interval between observations.',
        impact: 'Higher frequency captures rapid weather changes.'
      });
      detected.push({
        key: 'anomaly_threshold',
        label: 'Anomaly Sensitivity',
        type: 'slider',
        value: 2.5,
        min: 0.5,
        max: 5.0,
        step: 0.1,
        explanation: 'Standard deviation threshold for marking unusual weather or vegetation shifts.',
        impact: 'Controls how aggressively unusual readings are flagged.'
      });
    }

    setParams(detected);
    const initialVals: Record<string, any> = {};
    detected.forEach(p => {
      initialVals[p.key] = p.value;
    });
    setParamValues(initialVals);
  }, [code, fileName]);

  const handleChange = (key: string, value: any) => {
    setParamValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSimulate = () => {
    onApplyAndSimulate(paramValues);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
            <Sliders size={16} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Interactive Script Parameters</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Tune script variables without editing raw code
            </p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar mb-4 flex-1">
        {params.map((p) => (
          <div key={p.key} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-200">
                {p.label}
              </label>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {paramValues[p.key]}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              {p.explanation}
            </p>

            {p.type === 'slider' && (
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={paramValues[p.key] ?? p.value}
                onChange={(e) => handleChange(p.key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mb-1"
              />
            )}

            {p.type === 'date' && (
              <input
                type="date"
                value={paramValues[p.key] ?? p.value}
                onChange={(e) => handleChange(p.key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            )}

            {p.type === 'select' && (
              <select
                value={paramValues[p.key] ?? p.value}
                onChange={(e) => handleChange(p.key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {p.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            <div className="mt-2 text-[10px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded p-1.5 flex items-start gap-1">
              <Sparkles size={11} className="mt-0.5 shrink-0 text-amber-400" />
              <span>{p.impact}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-800">
        <button
          onClick={handleSimulate}
          disabled={isExecuting}
          className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
        >
          {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
          <span>{isExecuting ? "Simulating with Parameters..." : "Run Simulation with Parameters"}</span>
        </button>
      </div>
    </div>
  );
}
