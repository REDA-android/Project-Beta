import React, { useState, useEffect } from 'react';
import { 
  Sliders, Play, Check, Sparkles, RefreshCw, BarChart2, Cpu, 
  Settings, Server, Info, Layout, Layers, FileCode, Droplets, 
  Thermometer, Wind, AlertTriangle, HelpCircle, Eye, RefreshCcw, 
  Map, Database, HelpCircle as HelpIcon, ArrowUpRight
} from 'lucide-react';

interface InteractivePythonUIProps {
  filePath: string;
  fileContent: string;
  onRunScript: () => void;
  isExecuting: boolean;
  terminalOutput: string | null;
}

export function InteractivePythonUI({ filePath, fileContent, onRunScript, isExecuting, terminalOutput }: InteractivePythonUIProps) {
  // Extract file name
  const fileName = filePath.split('/').pop() || '';

  // 1. LSTM & GRU Models Configuration State
  const [inputSize, setInputSize] = useState(5);
  const [hiddenSize, setHiddenSize] = useState(64);
  const [numLayers, setNumLayers] = useState(2);
  const [seqLen, setSeqLen] = useState(14);
  const [isSimulatingModel, setIsSimulatingModel] = useState(false);
  const [simulatedLoss, setSimulatedLoss] = useState<number | null>(null);

  // 2. Data Processing State
  const [precipScale, setPrecipScale] = useState(2.0);
  const [moistureOffset, setMoistureOffset] = useState(0.25);
  const [activeDataSlice, setActiveDataSlice] = useState(0);

  // 3. Global Streamflow Inference State
  const [selectedBasin, setSelectedBasin] = useState('US_Gauging_01022500');
  const [basinRainfall, setBasinRainfall] = useState<number[]>([0.0, 5.2, 12.8, 2.1, 0.0, 0.0, 8.4, 15.0, 1.2, 0.0]);
  const [basinTemp, setBasinTemp] = useState(12.5);
  const [basinMoisture, setBasinMoisture] = useState(0.32);

  // 4. Evaluation Metrics State
  const [observedFlow, setObservedFlow] = useState<number[]>([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9]);
  const [simulatedFlow, setSimulatedFlow] = useState<number[]>([11.8, 13.9, 19.5, 26.0, 29.8, 21.0, 16.9, 14.2, 13.5, 12.4]);
  const [nseScore, setNseScore] = useState(0.962);
  const [kgeScore, setKgeScore] = useState(0.938);

  // 5. RUSLE Model State
  const [selectedAoi, setSelectedAoi] = useState('Highlands Basin');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [pFactor, setPFactor] = useState(0.6); // terracing/contouring factor

  // 6. RUSLE Factors State
  const [annualPrecip, setAnnualPrecip] = useState(1250.0);
  const [sandPct, setSandPct] = useState(30);
  const [siltPct, setSiltPct] = useState(45);
  const [clayPct, setClayPct] = useState(25);
  const [orgMatter, setOrgMatter] = useState(3.5);
  const [slopeDeg, setSlopeDeg] = useState(8.5);
  const [flowAccumulation, setFlowAccumulation] = useState(120.0);

  // 7. Bulk Downloader 25D State
  const [bboxPreset, setBboxPreset] = useState('Paris Center');
  const [bboxCoords, setBboxCoords] = useState([48.85, 2.34, 48.86, 2.35]);
  const [concurrency, setConcurrency] = useState(4);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 8. GEETiles State
  const [tileCollection, setTileCollection] = useState('Copernicus/S2_SR');
  const [tileSizeMeters, setTileSizeMeters] = useState(10000);
  const [strideSize, setStrideSize] = useState(128);
  const [patchSize, setPatchSize] = useState(256);

  // 9. Geemap State
  const [mapCenter, setMapCenter] = useState({ lat: 40.0, lon: -100.0 });
  const [mapZoom, setMapZoom] = useState(4);
  const [activeBasemap, setActiveBasemap] = useState('HYBRID');
  const [timelapseSpeed, setTimelapseSpeed] = useState(5);
  const [timelapseRegion, setTimelapseRegion] = useState('Lake Mead');
  const [timelapseFrame, setTimelapseFrame] = useState(0);

  // Run model parameter simulations
  const handleSimulateModelConfig = () => {
    setIsSimulatingModel(true);
    setTimeout(() => {
      // Simulate validation loss decreasing with hidden size & layers
      const baseLoss = 0.45;
      const layerDiscount = (numLayers - 1) * 0.05;
      const sizeDiscount = (hiddenSize / 128) * 0.15;
      const finalLoss = Math.max(0.015, baseLoss - layerDiscount - sizeDiscount + Math.random() * 0.02);
      setSimulatedLoss(finalLoss);
      setIsSimulatingModel(false);
    }, 600);
  };

  // Safe Sand-Silt-Clay slider balancer
  const handleSoilTextureChange = (type: 'sand' | 'silt' | 'clay', val: number) => {
    if (type === 'sand') {
      const remaining = 100 - val;
      const currentSum = siltPct + clayPct;
      if (currentSum > 0) {
        setSandPct(val);
        setSiltPct(Math.round((siltPct / currentSum) * remaining));
        setClayPct(Math.round((clayPct / currentSum) * remaining));
      } else {
        setSandPct(val);
        setSiltPct(Math.round(remaining / 2));
        setClayPct(Math.round(remaining / 2));
      }
    } else if (type === 'silt') {
      const remaining = 100 - val;
      const currentSum = sandPct + clayPct;
      if (currentSum > 0) {
        setSiltPct(val);
        setSandPct(Math.round((sandPct / currentSum) * remaining));
        setClayPct(Math.round((clayPct / currentSum) * remaining));
      } else {
        setSiltPct(val);
        setSandPct(Math.round(remaining / 2));
        setClayPct(Math.round(remaining / 2));
      }
    } else {
      const remaining = 100 - val;
      const currentSum = sandPct + siltPct;
      if (currentSum > 0) {
        setClayPct(val);
        setSandPct(Math.round((sandPct / currentSum) * remaining));
        setSiltPct(Math.round((siltPct / currentSum) * remaining));
      } else {
        setClayPct(val);
        setSandPct(Math.round(remaining / 2));
        setSiltPct(Math.round(remaining / 2));
      }
    }
  };

  // Recalculate metrics dynamically
  useEffect(() => {
    // NSE Formula: 1 - sum((obs - sim)^2) / sum((obs - mean_obs)^2)
    const meanObs = observedFlow.reduce((a, b) => a + b, 0) / observedFlow.length;
    let sumSqrDiff = 0;
    let sumSqrMeanDiff = 0;
    for (let i = 0; i < observedFlow.length; i++) {
      sumSqrDiff += Math.pow(observedFlow[i] - simulatedFlow[i], 2);
      sumSqrMeanDiff += Math.pow(observedFlow[i] - meanObs, 2);
    }
    const nse = sumSqrMeanDiff > 0 ? 1 - (sumSqrDiff / sumSqrMeanDiff) : 0;
    setNseScore(parseFloat(nse.toFixed(3)));

    // Simulating KGE mathematically
    // KGE = 1 - sqrt((r-1)^2 + (beta-1)^2 + (gamma-1)^2)
    const meanSim = simulatedFlow.reduce((a, b) => a + b, 0) / simulatedFlow.length;
    const beta = meanSim / meanObs;

    // Standard deviations
    const stdObs = Math.sqrt(observedFlow.map(x => Math.pow(x - meanObs, 2)).reduce((a, b) => a + b, 0) / observedFlow.length);
    const stdSim = Math.sqrt(simulatedFlow.map(x => Math.pow(x - meanSim, 2)).reduce((a, b) => a + b, 0) / simulatedFlow.length);
    const cvObs = stdObs / meanObs;
    const cvSim = stdSim / meanSim;
    const gamma = cvObs > 0 ? cvSim / cvObs : 1;

    // Correlation (simple simulation based on alignment)
    let cov = 0;
    for (let i = 0; i < observedFlow.length; i++) {
      cov += (observedFlow[i] - meanObs) * (simulatedFlow[i] - meanSim);
    }
    const r = (stdObs * stdSim > 0) ? (cov / observedFlow.length) / (stdObs * stdSim) : 0.9;
    const kge = 1 - Math.sqrt(Math.pow(r - 1, 2) + Math.pow(beta - 1, 2) + Math.pow(gamma - 1, 2));
    setKgeScore(parseFloat(kge.toFixed(3)));
  }, [observedFlow, simulatedFlow]);

  // Bulk downloader loop simulation
  const handleTriggerDownload = () => {
    setDownloadStep('downloading');
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setDownloadStep('completed');
          return 100;
        }
        return p + Math.round(Math.random() * 15 + 5);
      });
    }, 200);
  };

  // Timelapse frame slider simulation
  useEffect(() => {
    if (fileName === 'geemap_utils.py') {
      const interval = setInterval(() => {
        setTimelapseFrame(f => (f + 1) % 6);
      }, 10000 / timelapseSpeed);
      return () => clearInterval(interval);
    }
  }, [fileName, timelapseSpeed]);

  // Preset switchers
  const applyPresetBbox = (preset: string) => {
    setBboxPreset(preset);
    if (preset === 'Paris Center') {
      setBboxCoords([48.85, 2.34, 48.86, 2.35]);
    } else if (preset === 'Manhattan Core') {
      setBboxCoords([40.75, -73.98, 40.76, -73.97]);
    } else if (preset === 'Tokyo Shibuya') {
      setBboxCoords([35.65, 139.70, 35.66, 139.71]);
    } else if (preset === 'Rome Colosseum') {
      setBboxCoords([41.89, 12.49, 41.90, 12.50]);
    }
  };

  // ----------------- RENDER SUB-INTERFACES -----------------

  // Render model LSTM/GRU setup GUI
  const renderModelUI = (isLSTM: boolean) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="text-blue-400" size={18} />
              {isLSTM ? "LSTM" : "GRU"} Model Topology Adjuster
            </h4>
            <p className="text-xs text-slate-400">Interactive parameter tuner for sequence-to-one river discharge network.</p>
          </div>
          <button 
            onClick={handleSimulateModelConfig}
            disabled={isSimulatingModel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md disabled:opacity-50"
          >
            {isSimulatingModel ? <RefreshCw size={12} className="animate-spin" /> : <Sliders size={12} />}
            {isSimulatingModel ? "Compiling..." : "Compile Architecture"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hyperparameters</h5>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Input Size (Meteorological Variables)</span>
                  <span className="text-blue-400 font-bold">{inputSize} variables</span>
                </div>
                <input 
                  type="range" min="1" max="12" step="1"
                  value={inputSize} onChange={(e) => setInputSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Precipitation, Temp, Soil Moisture</span>
                  <span>+ custom variables</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Hidden State Units (Width)</span>
                  <span className="text-blue-400 font-bold">{hiddenSize} dimensions</span>
                </div>
                <input 
                  type="range" min="16" max="256" step="16"
                  value={hiddenSize} onChange={(e) => setHiddenSize(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Number of RNN Layers (Depth)</span>
                  <span className="text-blue-400 font-bold">{numLayers} stacked layers</span>
                </div>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3].map((l) => (
                    <button
                      key={l}
                      onClick={() => setNumLayers(l)}
                      className={`flex-1 py-1 rounded border text-xs font-semibold transition-all ${numLayers === l ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-slate-800/30 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}
                    >
                      {l} {l === 1 ? 'Layer' : 'Layers'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Model Estimation</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Active Model Type:</span>
                  <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] uppercase">{isLSTM ? "LSTM" : "GRU"}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Learnable Weights:</span>
                  <span className="font-mono text-slate-200">{((inputSize * hiddenSize + hiddenSize * hiddenSize + hiddenSize) * (isLSTM ? 4 : 3) * numLayers).toLocaleString()} params</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Memory Complexity:</span>
                  <span className="font-mono text-slate-200">{isLSTM ? "High (4 cell-gates)" : "Medium (3 reset/update gates)"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wide">Validation Loss Estimate</span>
                  <span className="text-xl font-bold font-mono text-blue-400">{simulatedLoss ? simulatedLoss.toFixed(5) : "---"}</span>
                </div>
                {simulatedLoss ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                    <Check size={10} /> Optimized
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">
                    Ready to evaluate
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual LSTM Chain representation */}
        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Inference State Graph</h5>
          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            <div className="flex flex-col items-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg w-28 text-center shadow-lg">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Inputs</span>
              <span className="text-xs text-slate-300 font-bold mt-1">X [N, {inputSize}]</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Precip, Temp, Soil</span>
            </div>
            <div className="text-slate-600 font-bold text-lg">→</div>
            <div className="flex flex-col items-center p-2.5 bg-slate-900 border border-blue-500/30 rounded-lg w-32 text-center shadow-lg relative">
              <span className="text-[9px] text-blue-400 font-bold uppercase">{isLSTM ? "LSTM Cells" : "GRU Cells"}</span>
              <span className="text-xs text-slate-200 font-mono mt-1 font-bold">Stacked x{numLayers}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">H: {hiddenSize} units</span>
            </div>
            <div className="text-slate-600 font-bold text-lg">→</div>
            <div className="flex flex-col items-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg w-28 text-center shadow-lg">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Last Sequence State</span>
              <span className="text-xs text-slate-300 font-mono mt-1 font-bold">out[:, -1, :]</span>
            </div>
            <div className="text-slate-600 font-bold text-lg">→</div>
            <div className="flex flex-col items-center p-2.5 bg-blue-600/10 border border-blue-500 rounded-lg w-28 text-center shadow-lg">
              <span className="text-[9px] text-blue-400 font-bold uppercase">Dense Linear FC</span>
              <span className="text-xs text-emerald-400 font-bold mt-1">Discharge Q(t)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Data Prep GUI
  const renderDataPrepUI = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="text-emerald-400" size={18} />
              Hydrological Dataset Preprocessor
            </h4>
            <p className="text-xs text-slate-400">Sliding window sequence generator and alignment inspector.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4 col-span-1">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sliding Window</h5>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Sequence Length (Lookback)</span>
                <span className="text-emerald-400 font-bold">{seqLen} days</span>
              </div>
              <input 
                type="range" min="7" max="30" step="1"
                value={seqLen} onChange={(e) => setSeqLen(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Precipitation Scale Factor</span>
                <span className="text-emerald-400 font-bold">x{precipScale.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="1.0" max="5.0" step="0.5"
                value={precipScale} onChange={(e) => setPrecipScale(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Soil Moisture Baseline</span>
                <span className="text-emerald-400 font-bold">{(moistureOffset * 100).toFixed(0)}% vol</span>
              </div>
              <input 
                type="range" min="0.1" max="0.5" step="0.05"
                value={moistureOffset} onChange={(e) => setMoistureOffset(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Simulated Precipitation & Delayed Run-off Graph</h5>
            
            <div className="h-44 w-full relative">
              {/* Draw custom SVG line charts representing data flow */}
              <svg className="w-full h-full" viewBox="0 0 500 150">
                {/* Background grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3,3" />

                {/* Simulated rainfall bars */}
                {[0, 10, 0, 0, 45, 60, 20, 5, 0, 0, 5, 30, 0, 0, 0, 15, 0, 0, 0, 0].map((val, idx) => {
                  const x = (idx / 20) * 480 + 10;
                  const h = (val * precipScale) * 0.7;
                  return (
                    <rect 
                      key={idx} 
                      x={x} 
                      y={0} 
                      width="10" 
                      height={h} 
                      fill="#3b82f6" 
                      opacity="0.3" 
                      rx="1"
                    />
                  );
                })}

                {/* Simulated soil moisture curves */}
                <path 
                  d={`M 10 110 Q 50 110 80 110 Q 110 60 140 70 Q 170 85 200 95 Q 240 100 270 70 Q 300 80 330 95 L 490 100`}
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                />

                {/* Simulated delayed streamflow discharge peaks */}
                <path 
                  d={`M 10 130 C 50 130, 80 130, 110 130 C 130 110, 150 40, 170 55 C 190 70, 220 110, 250 120 C 270 120, 280 100, 290 85 C 310 70, 330 120, 360 125 L 490 128`}
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                />
              </svg>

              <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-bold">
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2 h-2 bg-blue-500/30 rounded" /> Precipitation (bar)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-500" /> Soil Moisture (SM)
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="w-3 h-0.5 bg-sky-400" /> Gauge Flow Q (Delayed)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Time Steps (Daily sequence)</span>
              <span className="text-slate-400">Sliding Sequence: <b>[Batch Size, {seqLen}, 4 Features]</b></span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
          <h5 className="font-bold text-slate-200 mb-2">Preprocessing Workflow Output:</h5>
          <div className="font-mono bg-slate-950 p-3 rounded text-[11px] text-slate-400 space-y-1">
            <p className="text-emerald-400">&gt;&gt;&gt; dataset = prepare_streamflow_dataset("precip.csv", "gauge_flow.csv", seq_len={seqLen})</p>
            <p>Loading meteorological data from precip.csv... [OK]</p>
            <p>Loading streamflow observations from gauge_flow.csv... [OK]</p>
            <p>Building sliding windows of size {seqLen} with stride=1...</p>
            <p className="text-blue-400">Generated {1000 - seqLen} sequences. Input Tensor shape: ({1000 - seqLen}, {seqLen}, 4), Labels shape: ({1000 - seqLen}, 1)</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Global Streamflow Predictor GUI
  const renderGlobalStreamflowUI = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Droplets className="text-sky-400" size={18} />
              Global Daily Streamflow Inference Engine
            </h4>
            <p className="text-xs text-slate-400">Predict river discharge (m³/s) using NeuralHydrology pretrained basin weights.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4 col-span-1">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Basin Select & Climate</h5>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target Basin ID</label>
                <select 
                  value={selectedBasin}
                  onChange={(e) => setSelectedBasin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="US_Gauging_01022500">Narraguagus River, ME (USA)</option>
                  <option value="AM_Gauging_33910">Rio Negro Tributary (Brazil)</option>
                  <option value="EU_Gauging_99182">Upper Rhine Segment (Germany)</option>
                  <option value="AF_Gauging_88192">Congo River, Kisangani (Congo)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Basin Mean Temp</span>
                  <span className="text-sky-400 font-bold">{basinTemp}°C</span>
                </div>
                <input 
                  type="range" min="0" max="35" step="1"
                  value={basinTemp} onChange={(e) => setBasinTemp(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-50"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Pre-wet Soil Moisture</span>
                  <span className="text-sky-400 font-bold">{(basinMoisture * 100).toFixed(0)}% vol</span>
                </div>
                <input 
                  type="range" min="0.10" max="0.50" step="0.02"
                  value={basinMoisture} onChange={(e) => setBasinMoisture(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-50"
                />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">10-Day Rain Event Preset</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setBasinRainfall([0, 0, 1.2, 0, 0, 0, 0, 0.5, 0, 0])}
                    className="flex-1 text-[9px] font-semibold py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Dry Period
                  </button>
                  <button 
                    onClick={() => setBasinRainfall([0, 4.5, 12.0, 18.5, 5.0, 1.0, 0, 10.2, 3.0, 0])}
                    className="flex-1 text-[9px] font-semibold py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Heavy Storm
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Simulated 10-Day Discharge Hydrograph (m³/s)</h5>
              
              <div className="h-44 w-full relative pt-2">
                <svg className="w-full h-full" viewBox="0 0 500 150">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3,3" />

                  {/* Discharge spline curve based on rain variables */}
                  <path 
                    d={`M 10 130 
                        C 50 ${130 - (basinRainfall[1] * 3)}, 100 ${130 - (basinRainfall[2] * 4 + basinMoisture * 40)}, 150 ${130 - (basinRainfall[3] * 5 + basinMoisture * 50)}
                        C 200 ${130 - (basinRainfall[4] * 4 + basinMoisture * 40)}, 250 ${130 - (basinRainfall[5] * 2 + basinMoisture * 20)}, 300 ${130 - (basinRainfall[6] * 1.5 + basinMoisture * 15)}
                        C 350 ${130 - (basinRainfall[7] * 3.5 + basinMoisture * 25)}, 400 ${130 - (basinRainfall[8] * 2 + basinMoisture * 20)}, 490 ${130 - (basinMoisture * 10)}`}
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="3" 
                  />

                  {/* Draw points */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val, idx) => {
                    const x = (val / 10) * 480 + 10;
                    const rValue = basinRainfall[val];
                    const y = 130 - (rValue * 3 + basinMoisture * 30);
                    return (
                      <circle 
                        key={idx} 
                        cx={x} 
                        cy={y} 
                        r="3.5" 
                        fill="#38bdf8" 
                        stroke="#0f172a" 
                        strokeWidth="1.5" 
                      />
                    );
                  })}
                </svg>

                <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-bold">
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-3 h-0.5 bg-sky-400" /> Pre-trained LSTM Discharge
                  </span>
                  <span className="text-slate-500">Basin weights: NeuralHydrology v1.2</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-center min-w-20">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase">Max Peak</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {(Math.max(...basinRainfall) * 4.5 + basinMoisture * 45).toFixed(1)} m³/s
                  </span>
                </div>
                <div className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-center min-w-20">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase">Soil Saturation</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {(basinMoisture * 100 + Math.max(...basinRainfall) * 1.5).toFixed(0)}%
                  </span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 flex items-center gap-1">
                <Info size={11} className="text-sky-400" /> Discharge computed on-the-fly.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Evaluation Metrics GUI
  const renderEvaluationMetricsUI = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="text-indigo-400" size={18} />
              Hydrological Performance Benchmarking
            </h4>
            <p className="text-xs text-slate-400">Interactive Nash-Sutcliffe Efficiency (NSE) and Kling-Gupta Efficiency (KGE) calculator.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-1 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Interactive Flow Adjustment</h5>
            <p className="text-[10px] text-slate-400 leading-normal">Tune predictions dynamically to inspect metrics sensitivity.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Streamflow Profile Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setObservedFlow([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9]);
                      setSimulatedFlow([11.8, 13.9, 19.5, 26.0, 29.8, 21.0, 16.9, 14.2, 13.5, 12.4]);
                    }}
                    className="text-[9px] font-bold py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  >
                    High Accuracy
                  </button>
                  <button
                    onClick={() => {
                      setObservedFlow([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9]);
                      setSimulatedFlow([11.0, 11.5, 12.0, 18.0, 22.0, 29.0, 23.0, 18.0, 14.0, 11.0]); // Delayed peak
                    }}
                    className="text-[9px] font-bold py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  >
                    Time-Lagged Peak
                  </button>
                  <button
                    onClick={() => {
                      setObservedFlow([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9]);
                      setSimulatedFlow([8.0, 9.2, 10.5, 14.1, 17.0, 13.0, 11.5, 9.8, 8.5, 8.0]); // Underestimated
                    }}
                    className="text-[9px] font-bold py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  >
                    Severe Under-estimation
                  </button>
                  <button
                    onClick={() => {
                      setObservedFlow([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9]);
                      setSimulatedFlow([12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5]); // Flat baseline
                    }}
                    className="text-[9px] font-bold py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                  >
                    Flat Mean Baseline
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Observed Peak Flow (Day 5)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="15" max="45" step="1"
                    value={observedFlow[4]}
                    onChange={(e) => {
                      const updated = [...observedFlow];
                      updated[4] = Number(e.target.value);
                      setObservedFlow(updated);
                    }}
                    className="flex-1 h-1 bg-slate-800 rounded accent-blue-500"
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 w-12 text-right">{observedFlow[4]} m³/s</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulated Peak Flow (Day 5)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="15" max="45" step="1"
                    value={simulatedFlow[4]}
                    onChange={(e) => {
                      const updated = [...simulatedFlow];
                      updated[4] = Number(e.target.value);
                      setSimulatedFlow(updated);
                    }}
                    className="flex-1 h-1 bg-slate-800 rounded accent-indigo-500"
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 w-12 text-right">{simulatedFlow[4]} m³/s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Observed vs. Simulated Discharge Splines</h5>
              <div className="flex gap-3 text-[9px] font-bold">
                <span className="text-blue-400 flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-500" /> Observed</span>
                <span className="text-indigo-400 flex items-center gap-1"><span className="w-2.5 h-0.5 bg-indigo-500" /> Simulated</span>
              </div>
            </div>

            <div className="h-40 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 500 130">
                {/* Grid */}
                <line x1="0" y1="26" x2="500" y2="26" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="65" x2="500" y2="65" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="104" x2="500" y2="104" stroke="#1e293b" strokeDasharray="3,3" />

                {/* Observed spline */}
                <path 
                  d={`M 10 ${130 - observedFlow[0] * 3} 
                      ${observedFlow.map((v, i) => `L ${(i / 9) * 480 + 10} ${130 - v * 3}`).join(' ')}`}
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                />

                {/* Simulated spline */}
                <path 
                  d={`M 10 ${130 - simulatedFlow[0] * 3} 
                      ${simulatedFlow.map((v, i) => `L ${(i / 9) * 480 + 10} ${130 - v * 3}`).join(' ')}`}
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2.5" 
                  strokeDasharray="4,2"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Nash-Sutcliffe Efficiency (NSE)</span>
                <span className={`text-lg font-bold font-mono mt-1 ${nseScore > 0.8 ? 'text-emerald-400' : nseScore > 0.5 ? 'text-amber-400' : 'text-rose-500'}`}>
                  {nseScore.toFixed(3)}
                </span>
                <span className="text-[8px] text-slate-500 uppercase font-medium mt-0.5">
                  {nseScore > 0.8 ? 'Excellent Fit' : nseScore > 0.5 ? 'Satisfactory' : 'Poor Predictability'}
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center">
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Kling-Gupta Efficiency (KGE)</span>
                <span className={`text-lg font-bold font-mono mt-1 ${kgeScore > 0.8 ? 'text-emerald-400' : kgeScore > 0.5 ? 'text-amber-400' : 'text-rose-500'}`}>
                  {kgeScore.toFixed(3)}
                </span>
                <span className="text-[8px] text-slate-500 uppercase font-medium mt-0.5">
                  {kgeScore > 0.8 ? 'Highly Accurate' : kgeScore > 0.5 ? 'Moderate' : 'Unacceptable bias'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render RUSLE Model GUI
  const renderRusleModelUI = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="text-amber-400" size={18} />
              RUSLE Soil Loss GEE Planner
            </h4>
            <p className="text-xs text-slate-400">Estimate soil water erosion rate using spatial parameters: $A = R \times K \times LS \times C \times P$.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4 col-span-1">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-semibold">Region & Practices</h5>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Area of Interest (AOI)</label>
                <select 
                  value={selectedAoi}
                  onChange={(e) => setSelectedAoi(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Highlands Basin">Andean Highlands Basin</option>
                  <option value="Tropical River Basin">Tropical Amazon Tributary</option>
                  <option value="Agricultural Plains">Midwest Agricultural Plains</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target Assessment Year</label>
                <div className="grid grid-cols-3 gap-1">
                  {[2020, 2025, 2026].map(y => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`text-[10px] font-bold py-1 rounded transition-all ${selectedYear === y ? 'bg-amber-600/20 text-amber-400 border border-amber-500' : 'bg-slate-800 text-slate-400 border border-transparent'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                  <span>Support Practice Factor (P)</span>
                  <span className="text-amber-400 font-bold">{pFactor.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.1"
                  value={pFactor} onChange={(e) => setPFactor(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                />
                <div className="text-[9px] text-slate-500 mt-1 leading-snug">
                  {pFactor <= 0.2 ? "Terracing (Very protective)" : pFactor <= 0.5 ? "Contour farming (Moderate)" : "No protective practices (High erosion)"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Simulated GEE Spatial Soil Loss Map (tonnes/ha/yr)</h5>
            
            <div className="grid grid-cols-5 gap-1 bg-slate-950 p-3 rounded-lg border border-slate-800 h-40">
              {/* Render simulated 5x5 grid cells representing erosion risk */}
              {Array.from({ length: 25 }).map((_, idx) => {
                const baseVal = [12, 42, 8, 5, 20, 18, 56, 12, 4, 32, 2, 8, 48, 14, 6, 15, 24, 78, 10, 5, 30, 12, 14, 9, 3][idx];
                const finalLoss = baseVal * pFactor;
                const colorClass = finalLoss > 40 ? 'bg-rose-600' : finalLoss > 20 ? 'bg-amber-600' : finalLoss > 10 ? 'bg-yellow-600' : 'bg-emerald-600';
                return (
                  <div 
                    key={idx} 
                    className={`${colorClass} rounded flex items-center justify-center text-[10px] font-mono font-bold text-slate-900/95 transition-all shadow`}
                    title={`Loss: ${finalLoss.toFixed(1)} t/ha/yr`}
                  >
                    {finalLoss.toFixed(0)}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-800 mt-2">
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" /> Safe (&lt;10)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-600 rounded-sm" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-600 rounded-sm" /> Severe (&gt;40)</span>
              </div>
              <span className="text-slate-400">GEE Image Graph Compiled</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render RUSLE Individual Factor Calculators
  const renderFactorUI = (factorType: 'R' | 'K' | 'LS') => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="text-amber-400" size={18} />
              {factorType === 'R' ? "Rainfall Erosivity (R-Factor)" : factorType === 'K' ? "Soil Erodibility (K-Factor)" : "Slope Length/Steepness (LS-Factor)"} Calculator
            </h4>
            <p className="text-xs text-slate-400">Determine empirical parameters used inside GEE RUSLE modeling graphs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Configure Attributes</h5>
            
            {factorType === 'R' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Annual Precipitation (mm)</span>
                    <span className="text-amber-400 font-bold">{annualPrecip} mm</span>
                  </div>
                  <input 
                    type="range" min="100" max="3000" step="50"
                    value={annualPrecip} onChange={(e) => setAnnualPrecip(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded">
                  Formula (Wischmeier & Smith):<br />
                  <span className="text-amber-400">R = 38.5 + 0.35 * precipitation</span>
                </div>
              </div>
            )}

            {factorType === 'K' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Sand Fraction %</span>
                    <span className="text-amber-400 font-bold">{sandPct}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={sandPct} onChange={(e) => handleSoilTextureChange('sand', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Silt Fraction %</span>
                    <span className="text-amber-400 font-bold">{siltPct}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={siltPct} onChange={(e) => handleSoilTextureChange('silt', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Clay Fraction %</span>
                    <span className="text-amber-400 font-bold">{clayPct}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={clayPct} onChange={(e) => handleSoilTextureChange('clay', Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Organic Matter %</span>
                    <span className="text-amber-400 font-bold">{orgMatter}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="10.0" step="0.1"
                    value={orgMatter} onChange={(e) => setOrgMatter(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>
              </div>
            )}

            {factorType === 'LS' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Slope Gradient (degrees)</span>
                    <span className="text-amber-400 font-bold">{slopeDeg}°</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="45.0" step="0.5"
                    value={slopeDeg} onChange={(e) => setSlopeDeg(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Flow Accumulation Length</span>
                    <span className="text-amber-400 font-bold">{flowAccumulation} meters</span>
                  </div>
                  <input 
                    type="range" min="5" max="500" step="5"
                    value={flowAccumulation} onChange={(e) => setFlowAccumulation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Calculated Parameter Value</h5>
              
              {factorType === 'R' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated R-Value</span>
                    <span className="text-3xl font-mono font-bold text-amber-400 mt-1 block">
                      {(38.5 + 0.35 * annualPrecip).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-1">MJ.mm / ha.h.yr (Rainfall Kinetic Force)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    This value denotes the total erosive power of rain over a year. Multiplies local run-off capacity directly.
                  </p>
                </div>
              )}

              {factorType === 'K' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated K-Value</span>
                    <span className="text-3xl font-mono font-bold text-amber-400 mt-1 block">
                      {(0.1 + 0.05 * (1 - (sandPct / 100)) + 0.02 * (siltPct / (siltPct + clayPct || 1)) - 0.01 * orgMatter).toFixed(4)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-1">t.ha.h / (ha.MJ.mm) (Erodibility Coefficient)</span>
                  </div>
                  <div className="text-xs text-slate-400 leading-normal flex justify-between items-center bg-slate-950 px-3 py-2 rounded">
                    <span>Soil Classification:</span>
                    <span className="font-bold text-slate-200">
                      {clayPct > 40 ? "Silty Clay" : sandPct > 60 ? "Sandy Soil" : "Medium Loam"}
                    </span>
                  </div>
                </div>
              )}

              {factorType === 'LS' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated LS-Value</span>
                    <span className="text-3xl font-mono font-bold text-amber-400 mt-1 block">
                      {(Math.pow(flowAccumulation / 22.13, 0.4) * Math.pow(Math.sin(slopeDeg * Math.PI / 180) / 0.0896, 1.3)).toFixed(3)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-1">Dimensionless topographic ratio</span>
                  </div>
                  
                  {/* Visualizing the slope angle dynamically */}
                  <div className="h-16 border border-slate-800 bg-slate-950 rounded flex items-end justify-center relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 200 60">
                      <line 
                        x1="10" y1="50" 
                        x2="190" y2={50 - slopeDeg} 
                        stroke="#f59e0b" 
                        strokeWidth="3" 
                      />
                      <line x1="10" y1="50" x2="190" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="15" y="20" fill="#f59e0b" fontSize="10" fontWeight="bold">{slopeDeg}° Slope</text>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render 2.5D Building Downloader GUI
  const renderDownloaderUI = (isConverter: boolean) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="text-indigo-400" size={18} />
              Google 2.5D Building Mesh {isConverter ? "Converter" : "Downloader"}
            </h4>
            <p className="text-xs text-slate-400">Fetch proprietary building height structures or compile them to standard glTF.</p>
          </div>
          {!isConverter && (
            <button 
              onClick={handleTriggerDownload}
              disabled={downloadStep === 'downloading'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
            >
              <Play size={12} fill="currentColor" />
              Start Bulk Download
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-1 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Parameters</h5>
            
            {!isConverter ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Predefined Bounds</label>
                  <div className="space-y-1">
                    {['Paris Center', 'Manhattan Core', 'Tokyo Shibuya', 'Rome Colosseum'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => applyPresetBbox(preset)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-all flex justify-between items-center ${bboxPreset === preset ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700/50'}`}
                      >
                        <span>{preset}</span>
                        <ArrowUpRight size={10} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Concurrency Workers</span>
                    <span className="text-indigo-400 font-bold">{concurrency} threads</span>
                  </div>
                  <input 
                    type="range" min="1" max="16" step="1"
                    value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target 3D Export Format</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                    <option value="gltf">glTF 2.0 (.gltf / JSON)</option>
                    <option value="glb">glb (Binary glTF - Recommended)</option>
                    <option value="obj">Wavefront OBJ Mesh</option>
                    <option value="citygml">CityGML Geographic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Texture Packing</label>
                  <div className="flex gap-2">
                    <button className="flex-1 text-[10px] font-bold py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded">Draco Comp.</button>
                    <button className="flex-1 text-[10px] font-bold py-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700">None</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {isConverter ? "Mesh Vertex Conversion Pipeline" : "Bulk Download Queue Simulator"}
            </h5>

            {!isConverter ? (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {downloadStep === 'idle' ? (
                  <div className="text-center py-8 text-slate-500">
                    <Database size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Select bounds and click start to run simulation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Downloading fragments for <b>{bboxPreset}</b>:</span>
                      <span className="font-mono font-bold text-indigo-400">{downloadProgress}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-150" 
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                      <div>Status: <span className={downloadStep === 'completed' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}>{downloadStep === 'completed' ? 'Finished' : 'In Progress'}</span></div>
                      <div>BBox: {bboxCoords.join(', ')}</div>
                      <div>Avg Chunk: 1.2MB</div>
                      <div>Threads Active: {concurrency}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {/* Pipeline step indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">1</span>
                    <span className="text-slate-300">Parse Proprietary 2.5D Buffer Block...</span>
                    <span className="text-emerald-400 text-[10px] ml-auto font-mono">[Success]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">2</span>
                    <span className="text-slate-300">Reconstruct Triangles & Height Vertices...</span>
                    <span className="text-emerald-400 text-[10px] ml-auto font-mono">[Success]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">3</span>
                    <span className="text-slate-300">Decimate Face Count & Export Binary glB...</span>
                    <span className="text-emerald-400 text-[10px] ml-auto font-mono">[Success]</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render GEETiles Fragmenter GUI
  const renderGEETilesUI = (isPreparation: boolean) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="text-emerald-400" size={18} />
              GEETiles Image Fragmenter & Patch Loader
            </h4>
            <p className="text-xs text-slate-400">Bypass Google Earth Engine export size limits by partitioning imagery into ML patches.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-1 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-semibold">Tiling Settings</h5>
            
            {!isPreparation ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target Collection</label>
                  <select 
                    value={tileCollection}
                    onChange={(e) => setTileCollection(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="Copernicus/S2_SR">Sentinel-2 Surface Reflectance</option>
                    <option value="LANDSAT/LC08/C01/T1_SR">Landsat 8 OLI/TIRS SR</option>
                    <option value="MODIS/006/MOD13A1">MODIS Vegetation Indices</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Grid Cell Size (meters)</span>
                    <span className="text-emerald-400 font-bold">{tileSizeMeters.toLocaleString()}m</span>
                  </div>
                  <input 
                    type="range" min="2000" max="50000" step="2000"
                    value={tileSizeMeters} onChange={(e) => setTileSizeMeters(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>CNN Patch Size (pixels)</span>
                    <span className="text-emerald-400 font-bold">{patchSize} x {patchSize}</span>
                  </div>
                  <select 
                    value={patchSize}
                    onChange={(e) => setPatchSize(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value={128}>128 x 128</option>
                    <option value={256}>256 x 256 (Default)</option>
                    <option value={512}>512 x 512</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Overlap Stride (pixels)</span>
                    <span className="text-emerald-400 font-bold">{strideSize} pixels</span>
                  </div>
                  <input 
                    type="range" min="32" max="256" step="32"
                    value={strideSize} onChange={(e) => setStrideSize(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {!isPreparation ? "GEE Spatial Fragment Task Division" : "Visual CNN Sliding Window Patch Slicer"}
            </h5>

            {!isPreparation ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Calculated GEE Tasks</span>
                  <span className="text-2xl font-mono font-bold text-emerald-400 mt-0.5 block">
                    {Math.ceil(100000 / tileSizeMeters) * Math.ceil(100000 / tileSizeMeters)} Tasks
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1">To fragment a 100km x 100km region</p>
                </div>

                <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2.5 rounded border border-slate-800 h-24">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="border border-emerald-500/20 bg-emerald-500/5 rounded flex flex-col items-center justify-center text-[8px] text-emerald-400 font-mono shadow-inner"
                    >
                      <span>tile_{i}</span>
                      <span className="text-[7px] text-slate-500">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-32 bg-slate-950 rounded border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  {/* Visualizing sliding window overlapping boxes */}
                  <svg className="w-40 h-40" viewBox="0 0 100 100">
                    <rect x="5" y="5" width="90" height="90" fill="#1e293b" stroke="#334155" />
                    {/* First patch */}
                    <rect x="10" y="10" width="40" height="40" fill="none" stroke="#10b981" strokeWidth="1.5" />
                    {/* Stride shift patch */}
                    <rect 
                      x={10 + (strideSize / patchSize) * 40} 
                      y="10" 
                      width="40" 
                      height="40" 
                      fill="none" 
                      stroke="#38bdf8" 
                      strokeWidth="1.5" 
                      strokeDasharray="2,2" 
                    />
                  </svg>
                  <div className="absolute bottom-2 left-2 text-[8px] font-bold flex gap-3 text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 border border-emerald-500" /> Original</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 border border-sky-500 border-dashed" /> Stride Overlap</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono text-center bg-slate-950 py-1.5 rounded">
                  PyTorch Matrix Tensor shape: <b className="text-emerald-400">[{Math.ceil(1024 / strideSize) * Math.ceil(1024 / strideSize)}, {patchSize}, {patchSize}, 4]</b>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Geemap Dashboard GUI
  const renderGeemapUI = (isUtils: boolean) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Map className="text-purple-400" size={18} />
              Geemap Interactive Mapping Notebook
            </h4>
            <p className="text-xs text-slate-400">Display ipyleaflet maps, composite widgets, and automated timelapse GIFs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-1 space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-semibold">Map Controls</h5>
            
            {!isUtils ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Basemap Overlay</label>
                  <select 
                    value={activeBasemap}
                    onChange={(e) => setActiveBasemap(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="HYBRID">Google Hybrid Imagery</option>
                    <option value="ROADMAP">Google Maps Streetview</option>
                    <option value="TERRAIN">DEM Topographic Terrain</option>
                    <option value="SATELLITE">Raw Satellite Panchromatic</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Map Zoom</span>
                    <span className="text-purple-400 font-bold">Level {mapZoom}</span>
                  </div>
                  <input 
                    type="range" min="1" max="18" step="1"
                    value={mapZoom} onChange={(e) => setMapZoom(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Timelapse Region</label>
                  <select 
                    value={timelapseRegion}
                    onChange={(e) => setTimelapseRegion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="Lake Mead">Lake Mead Reservoir (Drying)</option>
                    <option value="Columbia Glacier">Columbia Glacier (Retreat)</option>
                    <option value="Amazon Deforestation">Amazon Rainforest (Loss)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Timelapse Frame Rate</span>
                    <span className="text-purple-400 font-bold">{timelapseSpeed} fps</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" step="1"
                    value={timelapseSpeed} onChange={(e) => setTimelapseSpeed(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 col-span-2 space-y-4 flex flex-col justify-between">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {!isUtils ? "Interactive Notebook Map Canvas" : "Animated Sentinel-2 Multi-Annual Timelapse"}
            </h5>

            {!isUtils ? (
              <div className="h-40 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center justify-center">
                {/* Simulated dynamic map with zoom details */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="z-10 text-center space-y-1">
                  <span className="text-xs text-slate-300 font-semibold uppercase tracking-wide block">Map Widget Loaded</span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Center: [{mapCenter.lat.toFixed(1)}, {mapCenter.lon.toFixed(1)}] | Zoom: {mapZoom}
                  </span>
                  <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded inline-block font-mono font-bold">
                    Active Base: {activeBasemap}
                  </span>
                </div>
                
                {/* Floating scale widget */}
                <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-[8px] font-mono border border-slate-800 text-slate-400">
                  Scale: {Math.round(40000 / mapZoom)} km
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-32 bg-slate-950 rounded border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  {/* Dynamic frame changer depending on simulated Frame */}
                  <div className="text-center space-y-1">
                    <span className="text-xs text-purple-400 font-bold block uppercase">Composite Year: {2015 + timelapseFrame}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Target: {timelapseRegion}</span>
                    
                    {/* Simulated visual of drying reservoir or glacier */}
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto overflow-hidden border border-slate-700 mt-2">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-700" 
                        style={{ width: `${Math.max(15, 90 - (timelapseFrame * 12))}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono block">Water level index: {(Math.max(15, 90 - (timelapseFrame * 12)))}%</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-bold flex justify-between items-center px-1">
                  <span>Rendering frame: {timelapseFrame + 1} / 6</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px]">● Running</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----------------- MAIN DISPATCH ROUTER -----------------

  const getActiveUI = () => {
    switch (fileName) {
      case 'lstm.py':
        return renderModelUI(true);
      case 'gru.py':
        return renderModelUI(false);
      case 'hydro_data.py':
        return renderDataPrepUI();
      case 'streamflow_prediction.py':
        return renderGlobalStreamflowUI();
      case 'evaluation_metrics.py':
        return renderEvaluationMetricsUI();
      case 'rusle_model.py':
        return renderRusleModelUI();
      case 'r_factor.py':
        return renderFactorUI('R');
      case 'k_factor.py':
        return renderFactorUI('K');
      case 'ls_factor.py':
        return renderFactorUI('LS');
      case 'download_mesh.py':
        return renderDownloaderUI(false);
      case 'convert_formats.py':
        return renderDownloaderUI(true);
      case 'tile_downloader.py':
        return renderGEETilesUI(false);
      case 'dataset_preparation.py':
        return renderGEETilesUI(true);
      case 'interactive_map.py':
        return renderGeemapUI(false);
      case 'geemap_utils.py':
        return renderGeemapUI(true);
      default:
        // Generic dynamic UI for unspecified python scripts
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileCode className="text-amber-400" size={18} />
                  Generic Python Script Interface
                </h4>
                <p className="text-xs text-slate-400">Parsed variables & execution entry points detected inside <b>{fileName}</b>.</p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-center space-y-4">
              <Cpu className="mx-auto text-slate-400 opacity-40 animate-pulse" size={40} />
              <div className="max-w-md mx-auto space-y-2">
                <h5 className="text-sm font-bold text-slate-200">Execution Entry point detected</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This Python script contains executable blocks. You can automatically configure inputs and observe standard output results directly.
                </p>
              </div>
              <button 
                onClick={onRunScript}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                {isExecuting ? "Executing Script..." : "Run Script Simulation"}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-300 h-full overflow-y-auto custom-scrollbar">
      {getActiveUI()}

      {/* Embedded Terminal Output preview when simulation occurs */}
      {terminalOutput && (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              <Cpu size={12} className="text-blue-400 animate-pulse" />
              <span>Console Output Logs</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Exit code: 0</span>
            </span>
          </div>
          <div className="p-4 font-mono text-[10px] text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {terminalOutput}
          </div>
        </div>
      )}
    </div>
  );
}
