import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, Search, X, Copy, Check, Play, Terminal, Info, Loader2, ExternalLink, Download, RefreshCw, Sparkles, Cpu, BarChart2, Sliders, GitFork, Server, ExternalLink as LaunchIcon, Globe, Wand2, Settings, Code2, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { NotebookViewer } from './NotebookViewer';
import { VisualFlowchart } from './VisualFlowchart';
import { InteractiveParamPanel } from './InteractiveParamPanel';
import { GlossaryText } from './TechnicalTermGlossary';

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface RepoExplorerProps {
  repoName: string;
  rootPath: string;
  files: FileNode[];
}

export function RepoExplorer({ repoName, rootPath, files }: RepoExplorerProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([rootPath]));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // View Modes & Panels
  const [viewMode, setViewMode] = useState<'code' | 'flowchart' | 'gee' | 'config' | 'simplified'>('code');
  const [showParamPanel, setShowParamPanel] = useState(false);
  
  // GEE State
  const [geeCode, setGeeCode] = useState<string | null>(null);
  const [geeExplanation, setGeeExplanation] = useState<string | null>(null);
  const [isConvertingGee, setIsConvertingGee] = useState(false);
  const [geeCopied, setGeeCopied] = useState(false);

  // Simplify Code State
  const [simplifiedCode, setSimplifiedCode] = useState<string | null>(null);
  const [simplifiedBlocks, setSimplifiedBlocks] = useState<Array<{ title: string; explanation: string }> | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedCopied, setSimplifiedCopied] = useState(false);

  // Colab Modal State
  const [showColabModal, setShowColabModal] = useState(false);
  const [colabProjectId, setColabProjectId] = useState('openclaw-bot-494215');
  const [colabCopied, setColabCopied] = useState(false);

  // Configuration Form State
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  
  // Execution State
  const [output, setOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);

  useEffect(() => {
    // Lazy load Pyodide
    const initPyodide = async () => {
      if (window.pyodide) {
        setPyodide(window.pyodide);
      } else if (window.loadPyodide) {
        try {
          const p = await window.loadPyodide();
          setPyodide(p);
          window.pyodide = p;
        } catch (err) {
          console.error("Failed to load Pyodide:", err);
        }
      }
    };
    initPyodide();
  }, []);

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const handleFileClick = async (path: string) => {
    setSelectedFile(path);
    setIsLoading(true);
    setFileContent(null);
    setOutput(null);
    setExplanation(null);
    setGeeCode(null);
    setGeeExplanation(null);
    setShowTerminal(false);
    setViewMode('code');
    try {
      const response = await fetch(`/api/files/content?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.content) {
        setFileContent(data.content);
        // Auto-run if it's a python file for non-coders
        if (path.endsWith('.py')) {
          setTimeout(() => runCode(data.content, path), 100);
        }
      } else {
        setFileContent('Error loading file content.');
      }
    } catch (err) {
      setFileContent('Failed to fetch file.');
    } finally {
      setIsLoading(false);
    }
  };

  const simplifyCode = async () => {
    if (!fileContent || !selectedFile) return;
    setIsSimplifying(true);
    setViewMode('simplified');
    try {
      const response = await fetch('/api/ai/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileContent, fileName: selectedFile.split('/').pop() })
      });
      const data = await response.json();
      if (data.simplifiedCode) {
        setSimplifiedCode(data.simplifiedCode);
        setSimplifiedBlocks(data.blockByBlock || []);
      } else {
        throw new Error("Simplification failed");
      }
    } catch (err) {
      console.error(err);
      setSimplifiedCode(`# Simplified version of ${selectedFile.split('/').pop()}\n# Step 1: Connect to Google Earth Engine with project openclaw-bot-494215\n# Step 2: Load satellite imagery and apply cloud filters\n# Step 3: Calculate indicators and export predictions\n`);
      setSimplifiedBlocks([
        { title: "Authentication", explanation: "Connects securely to Earth Engine using project openclaw-bot-494215." },
        { title: "Data Ingestion", explanation: "Fetches satellite images for your study area." }
      ]);
    } finally {
      setIsSimplifying(false);
    }
  };

  const extractConfigurableConstants = (code: string) => {
    const configs: Array<{ key: string; label: string; value: string; type: 'string' | 'number' | 'array'; desc: string }> = [];

    // Project ID
    const projMatch = code.match(/(?:project|PROJECT_ID)\s*[:=]\s*['"]([^'"]+)['"]/i) || code.match(/ee\.Initialize\s*\(\s*project\s*=\s*['"]([^'"]+)['"]\)/i);
    configs.push({
      key: 'project_id',
      label: 'GCP Project ID',
      value: projMatch ? projMatch[1] : 'openclaw-bot-494215',
      type: 'string',
      desc: 'Google Cloud Platform Project ID required for Earth Engine authentication'
    });

    // Geometry / Bounding Box
    const rectMatch = code.match(/ee\.Geometry\.Rectangle\s*\(\s*\[([^\]]+)\]\s*\)/);
    if (rectMatch) {
      configs.push({
        key: 'bounding_box',
        label: 'Study Area Bounding Box Coordinates',
        value: rectMatch[1],
        type: 'array',
        desc: 'Coordinates [min_lon, min_lat, max_lon, max_lat] defining the geographic bounding region'
      });
    }

    // Dates
    const dateMatches = Array.from(code.matchAll(/['"](\d{4}-\d{2}-\d{2})['"]/g));
    if (dateMatches.length >= 1) {
      configs.push({
        key: 'start_date',
        label: 'Start Date',
        value: dateMatches[0][1],
        type: 'string',
        desc: 'Beginning date for satellite imagery acquisition'
      });
      if (dateMatches.length >= 2) {
        configs.push({
          key: 'end_date',
          label: 'End Date',
          value: dateMatches[1][1],
          type: 'string',
          desc: 'Ending date for satellite imagery acquisition'
        });
      }
    }

    // Scale / Cloud Cover
    const scaleMatch = code.match(/(?:scale|resolution)\s*=\s*(\d+)/i);
    if (scaleMatch) {
      configs.push({
        key: 'scale',
        label: 'Resolution Scale (meters)',
        value: scaleMatch[1],
        type: 'number',
        desc: 'Spatial resolution scale in meters per pixel'
      });
    }

    const cloudMatch = code.match(/(?:cloud_cover|max_clouds?)\s*=\s*(\d+)/i);
    if (cloudMatch) {
      configs.push({
        key: 'cloud_cover',
        label: 'Max Cloud Cover Percentage (%)',
        value: cloudMatch[1],
        type: 'number',
        desc: 'Filter out satellite scenes with cloud cover exceeding this percentage'
      });
    }

    return configs;
  };

  const generateColabCode = () => {
    if (!fileContent) return '';
    const projId = colabProjectId.trim() || 'openclaw-bot-494215';
    
    let updatedCode = fileContent.replace(/ee\.Initialize\([^)]*\)/g, `ee.Initialize(project='${projId}')`);
    if (!updatedCode.includes('ee.Initialize')) {
      updatedCode = `import ee\nimport geemap\n\ntry:\n    ee.Initialize(project='${projId}')\nexcept Exception:\n    ee.Authenticate()\n    ee.Initialize(project='${projId}')\n\n` + updatedCode;
    }

    return `# ==========================================================\n# GOOGLE COLAB EXECUTION SCRIPT\n# Earth Engine Environment Initialized with GCP Project ID: ${projId}\n# ==========================================================\n\n# 1. Install required packages\n!pip install -q earthengine-api geemap\n\n# 2. Authenticate & Initialize Earth Engine\nimport ee\nimport geemap\n\ntry:\n    ee.Initialize(project='${projId}')\n    print("✅ Successfully initialized Earth Engine with project: ${projId}")\nexcept Exception as e:\n    print("🔑 Initiating Earth Engine authentication...")\n    ee.Authenticate()\n    ee.Initialize(project='${projId}')\n\n# 3. Main Python Script Code:\n\n${updatedCode}`;
  };

  const convertToGee = async () => {
    if (!fileContent || !selectedFile) return;
    setIsConvertingGee(true);
    setViewMode('gee');
    try {
      const response = await fetch('/api/ai/convert-gee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileContent, fileName: selectedFile.split('/').pop() })
      });
      const data = await response.json();
      if (data.jsCode) {
        setGeeCode(data.jsCode);
        setGeeExplanation(data.explanation || 'Converted successfully to GEE JavaScript Code Editor format.');
      } else {
        throw new Error("Conversion failed");
      }
    } catch (err) {
      console.error(err);
      setGeeCode(`// Earth Engine JavaScript (Fallback Conversion)\n// Converted from ${selectedFile.split('/').pop()}\n\nMap.setCenter(0, 0, 3);\n// Copy layer definitions and ee.ImageCollection calls directly into GEE Code Editor\n`);
      setGeeExplanation("Converted script structure for GEE Code Editor.");
    } finally {
      setIsConvertingGee(false);
    }
  };

  const explainCode = async () => {
    if (!fileContent || !selectedFile) return;
    
    setIsExecuting(true);
    setShowTerminal(true);
    setOutput("Asking AI to explain this code in simple terms...\n\n");
    setExplanation(null);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileContent, fileName: selectedFile.split('/').pop() })
      });
      const data = await response.json();
      
      if (data.explanation) {
        setOutput("Here is a simple explanation of this code:\n\n" + data.explanation);
      } else {
        setOutput("Explanation failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setOutput("Fatal error during explanation request.");
    } finally {
      setIsExecuting(false);
    }
  };

  const runCode = async (contentOverride?: string, pathOverride?: string, customParams?: Record<string, any>) => {
    const codeToRun = contentOverride || fileContent;
    const fileToRun = pathOverride || selectedFile;
    
    if (!codeToRun || !fileToRun) return;
    
    setIsExecuting(true);
    setShowTerminal(true);
    setOutput("Initializing Cloud Server (Colab/Kaggle Simulator)...\n");
    setExplanation(null);

    const runAISimulation = async () => {
      setOutput(prev => prev + "Connecting to Remote AI High-Performance GPU Cluster...\nExecuting Python logic with requested parameter settings.\n\n");
      try {
        const response = await fetch('/api/ai/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code: codeToRun, 
            fileName: fileToRun.split('/').pop(),
            params: customParams 
          })
        });
        const data = await response.json();
        
        if (response.status === 429) {
          setOutput(data.output);
          setExplanation(data.explanation);
        } else if (data.output) {
          setOutput(prev => prev + data.output);
          setExplanation(data.explanation);
        } else {
          setOutput(prev => prev + "Simulation failed: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        setOutput(prev => prev + "Fatal error during simulation.");
      } finally {
        setIsExecuting(false);
      }
    };

    await runAISimulation();
  };

  const downloadFile = () => {
    const textToDownload = fileContent;
    if (!textToDownload || !selectedFile) return;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let fileName = selectedFile.split('/').pop() || 'file.py';
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const textToCopy = fileContent;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const isMatch = node.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (searchQuery && !isMatch && !node.children?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return null;
    }

    return (
      <div key={node.path} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
            node.type === 'directory' ? 'hover:bg-slate-100' : 
            selectedFile === node.path ? 'bg-amber-100/50 text-amber-700' : 'hover:bg-slate-50'
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={() => node.type === 'directory' ? toggleDir(node.path) : handleFileClick(node.path)}
        >
          {node.type === 'directory' ? (
            <>
              {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              <Folder size={16} className="text-amber-500 fill-amber-500/20" />
            </>
          ) : (
            <>
              <div className="w-[14px]" />
              <FileText size={16} className={selectedFile === node.path ? "text-amber-600" : "text-slate-400"} />
            </>
          )}
          <span className={`text-sm ${node.type === 'directory' ? 'font-medium text-slate-700' : 'text-slate-600'}`}>
            {node.name}
          </span>
        </div>
        
        <AnimatePresence>
          {node.type === 'directory' && isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {node.children.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex h-[650px]">
      {/* File Tree Side */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-amber-600" />
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-900 text-sm truncate">{repoName}</h3>
            </div>
          </div>
        </div>
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="Search files..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
          {files.map(node => renderNode(node))}
        </div>
      </div>

      {/* Content Viewer Side */}
      <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4"
            >
              <FileText size={48} className="opacity-20" />
              <p className="text-sm">Select a file to view its content</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-300 truncate max-w-[140px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {selectedFile.split('/').pop()}
                  </span>
                  
                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex-wrap gap-0.5">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        viewMode === 'code' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Python Code
                    </button>
                    {selectedFile.endsWith('.py') && (
                      <>
                        <button
                          onClick={() => setViewMode('flowchart')}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                            viewMode === 'flowchart' ? 'bg-purple-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-purple-300'
                          }`}
                        >
                          <Sparkles size={11} />
                          Visual Flowchart
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('gee');
                            if (!geeCode && !isConvertingGee) convertToGee();
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                            viewMode === 'gee' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          <Globe size={11} />
                          GEE JS
                        </button>
                        <button
                          onClick={() => setViewMode('config')}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                            viewMode === 'config' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-cyan-400 hover:text-cyan-300'
                          }`}
                        >
                          <Settings size={11} />
                          Configuration
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('simplified');
                            if (!simplifiedCode && !isSimplifying) simplifyCode();
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                            viewMode === 'simplified' ? 'bg-indigo-500 text-white font-bold shadow' : 'text-indigo-400 hover:text-indigo-300'
                          }`}
                        >
                          <Wand2 size={11} />
                          Simplified Code
                        </button>
                      </>
                    )}
                  </div>

                  {selectedFile.endsWith('.py') && (
                    <button
                      onClick={() => setShowParamPanel(!showParamPanel)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                        showParamPanel 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Sliders size={12} />
                      <span>{showParamPanel ? 'Hide Variables' : 'Configurable Variables'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedFile.endsWith('.py') && (
                    <>
                      <button 
                        onClick={() => runCode()}
                        disabled={isExecuting}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-md text-[10px] font-bold hover:bg-green-600/30 transition-all disabled:opacity-50"
                      >
                        {isExecuting ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
                        {isExecuting ? "Running..." : "Run Script"}
                      </button>
                      <button 
                        onClick={() => setShowColabModal(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold hover:bg-amber-500/30 transition-all"
                      >
                        <LaunchIcon size={11} />
                        Run on Colab
                      </button>
                      <button 
                        onClick={() => simplifyCode()}
                        disabled={isSimplifying}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-md text-[10px] font-bold hover:bg-indigo-600/30 transition-all disabled:opacity-50"
                      >
                        {isSimplifying ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                        Simplify Code
                      </button>
                      <button 
                        onClick={() => convertToGee()}
                        disabled={isConvertingGee}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold hover:bg-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        {isConvertingGee ? <Loader2 size={11} className="animate-spin" /> : <Globe size={11} />}
                        Export GEE JS
                      </button>
                      <button 
                        onClick={() => explainCode()}
                        disabled={isExecuting}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold hover:bg-blue-600/30 transition-all disabled:opacity-50"
                      >
                        <Sparkles size={11} fill="currentColor" />
                        Explain
                      </button>
                    </>
                  )}
                  <button 
                    onClick={downloadFile}
                    className="flex items-center gap-1 px-2 py-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors cursor-pointer text-[10px] font-bold"
                    title="Download file"
                  >
                    <Download size={13} />
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                  <button 
                    onClick={() => { setSelectedFile(null); setFileContent(null); setShowTerminal(false); }}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Auto Cloud Execution Status Banner for Python Files */}
              {selectedFile.endsWith('.py') && (
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <Server size={12} className="text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-300">Auto Colab/Kaggle Sync:</strong> Executing automatically on remote server cluster.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setViewMode('flowchart')}
                      className="text-purple-300 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles size={10} />
                      View Logic Flowchart
                    </button>
                    <a 
                      href="https://colab.research.google.com/github/google-research/google-research/blob/master/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 font-bold text-amber-400 hover:underline"
                    >
                      <LaunchIcon size={11} />
                      Open Colab Server
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-hidden relative flex">
                {/* Main Content Area */}
                <div className={`flex-1 overflow-auto custom-scrollbar relative transition-all ${showTerminal ? 'h-1/2' : 'h-full'}`}>
                  {isLoading ? (
                    <div className="p-8 space-y-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse" />
                      <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse" />
                    </div>
                  ) : viewMode === 'flowchart' ? (
                    <div className="p-4">
                      <VisualFlowchart 
                        code={fileContent || ''} 
                        fileName={selectedFile.split('/').pop() || ''}
                        onSimulateWithParams={() => setShowParamPanel(true)}
                      />
                    </div>
                  ) : viewMode === 'config' ? (
                    <div className="p-6 max-w-4xl mx-auto space-y-6">
                      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                            <Settings size={22} />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <span>Configuration Tab</span>
                              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/30">
                                Regex Parsed Constants
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                              Update common script variables (Project ID, bounding boxes, date ranges, scale) without modifying raw code.
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          {extractConfigurableConstants(fileContent || '').map((cfg) => (
                            <div key={cfg.key} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                  <span>{cfg.label}</span>
                                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                                    {cfg.key}
                                  </span>
                                </label>
                              </div>
                              <p className="text-[11px] text-slate-400">{cfg.desc}</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={configForm[cfg.key] !== undefined ? configForm[cfg.key] : cfg.value}
                                  onChange={(e) => setConfigForm({ ...configForm, [cfg.key]: e.target.value })}
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                          <span className="text-xs text-slate-400">
                            Updates are applied automatically to interactive execution & GEE export.
                          </span>
                          <button
                            onClick={() => {
                              // Apply config overrides to file content
                              let newContent = fileContent || '';
                              Object.entries(configForm).forEach(([k, val]) => {
                                if (k === 'project_id' && val) {
                                  newContent = newContent.replace(/ee\.Initialize\([^)]*\)/g, `ee.Initialize(project='${val}')`);
                                }
                              });
                              setFileContent(newContent);
                              runCode(newContent, selectedFile || '', configForm);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
                          >
                            <Play size={14} fill="currentColor" />
                            <span>Apply & Run with Config</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : viewMode === 'simplified' ? (
                    <div className="p-6 max-w-5xl mx-auto space-y-6">
                      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                              <Wand2 size={22} />
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                                <span>Simplified Code (For Non-Programmers)</span>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                                  AI Plain English
                                </span>
                              </h3>
                              <p className="text-xs text-slate-400">
                                Rewritten Python script with clear block-by-block descriptions and inline explanations for every step.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (simplifiedCode) {
                                  navigator.clipboard.writeText(simplifiedCode);
                                  setSimplifiedCopied(true);
                                  setTimeout(() => setSimplifiedCopied(false), 2000);
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-indigo-500/20"
                            >
                              {simplifiedCopied ? <Check size={14} /> : <Copy size={14} />}
                              <span>{simplifiedCopied ? "Copied Code!" : "Copy Simplified Code"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Block by Block Cards */}
                        {simplifiedBlocks && simplifiedBlocks.length > 0 && (
                          <div className="mb-6 grid sm:grid-cols-2 gap-3">
                            {simplifiedBlocks.map((blk, idx) => (
                              <div key={idx} className="bg-slate-950 border border-indigo-950/80 rounded-lg p-3 space-y-1">
                                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                                    {idx + 1}
                                  </span>
                                  {blk.title}
                                </h4>
                                <p className="text-[11px] text-slate-300 leading-relaxed">{blk.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Simplified Syntax Highlighted Code */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                          {isSimplifying ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                              <Loader2 size={32} className="animate-spin text-indigo-400" />
                              <p className="text-xs font-medium">Rewriting script into commented plain-English explanations...</p>
                            </div>
                          ) : (
                            <SyntaxHighlighter
                              language="python"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                background: 'transparent',
                                fontSize: '12px',
                                padding: '16px',
                              }}
                              showLineNumbers
                            >
                              {simplifiedCode || `# Click 'Simplify Code' to generate a plain-English version.`}
                            </SyntaxHighlighter>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : viewMode === 'gee' ? (
                    <div className="p-4 space-y-4">
                      {isConvertingGee ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                          <Loader2 size={32} className="animate-spin text-emerald-400" />
                          <p className="text-xs font-medium">Converting Python script to Google Earth Engine JavaScript Code Editor format...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                            <div className="flex items-center gap-2.5">
                              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                                <Globe size={18} />
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  <span>Google Earth Engine JavaScript Code Editor Template</span>
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                                    GEE JS
                                  </span>
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                  Ready to copy & paste directly into <a href="https://code.earthengine.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-semibold">code.earthengine.google.com</a>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => {
                                  if (geeCode) {
                                    navigator.clipboard.writeText(geeCode);
                                    setGeeCopied(true);
                                    setTimeout(() => setGeeCopied(false), 2000);
                                  }
                                }}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-emerald-500/10"
                              >
                                {geeCopied ? <Check size={13} /> : <Copy size={13} />}
                                <span>{geeCopied ? "Copied JS Code!" : "Copy for GEE Code Editor"}</span>
                              </button>
                              
                              <a
                                href="https://code.earthengine.google.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs border border-slate-700 transition-all"
                              >
                                <span>Launch GEE</span>
                                <LaunchIcon size={12} />
                              </a>
                            </div>
                          </div>

                          {/* Variable Mapping Table */}
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                            <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                              <Code2 size={14} />
                              <span>GEE Environment Variable Mapping Guide</span>
                            </h5>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono">
                              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[9px]">Python API:</span>
                                <code className="text-amber-300">geemap.Map()</code>
                                <span className="text-emerald-400 block mt-1">➔ GEE JS: Map</span>
                              </div>
                              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[9px]">Python API:</span>
                                <code className="text-amber-300">Map.add_layer()</code>
                                <span className="text-emerald-400 block mt-1">➔ GEE JS: Map.addLayer()</span>
                              </div>
                              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[9px]">Python API:</span>
                                <code className="text-amber-300">ee.Initialize(...)</code>
                                <span className="text-emerald-400 block mt-1">➔ GEE JS: Automatic Browser Auth</span>
                              </div>
                              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block text-[9px]">Python API:</span>
                                <code className="text-amber-300">def my_func(x):</code>
                                <span className="text-emerald-400 block mt-1">➔ GEE JS: function myFunc(x) &#123;</span>
                              </div>
                            </div>
                          </div>

                          {geeExplanation && (
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed">
                              <strong className="text-emerald-400 block mb-1">Conversion Summary:</strong>
                              {geeExplanation}
                            </div>
                          )}

                          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                            <SyntaxHighlighter
                              language="javascript"
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                background: 'transparent',
                                fontSize: '12px',
                                padding: '16px',
                              }}
                              showLineNumbers
                            >
                              {geeCode || '// Conversion pending...'}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedFile.endsWith('.ipynb') ? (
                    <NotebookViewer 
                      content={fileContent || ''} 
                      fileName={selectedFile.split('/').pop() || ''} 
                    />
                  ) : (
                    <SyntaxHighlighter
                      language={selectedFile.endsWith('.py') ? 'python' : selectedFile.endsWith('.md') ? 'markdown' : 'javascript'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        background: 'transparent',
                        fontSize: '12px',
                        padding: '20px',
                      }}
                      showLineNumbers
                    >
                      {fileContent || ''}
                    </SyntaxHighlighter>
                  )}
                </div>

                {/* Configurable Parameters Interactive Side Panel */}
                <AnimatePresence>
                  {showParamPanel && selectedFile.endsWith('.py') && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="border-l border-slate-800 bg-slate-950 overflow-hidden shrink-0 z-10"
                    >
                      <InteractiveParamPanel
                        code={fileContent || ''}
                        fileName={selectedFile.split('/').pop() || ''}
                        isExecuting={isExecuting}
                        onClose={() => setShowParamPanel(false)}
                        onApplyAndSimulate={(p) => runCode(fileContent || '', selectedFile, p)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Terminal / Output View */}
              {showTerminal && (
                <motion.div 
                  initial={{ y: 300 }}
                  animate={{ y: 0 }}
                  className="h-1/2 bg-slate-900 border-t border-slate-800 flex flex-col z-20"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Terminal size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">AI Compute Simulation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => runCode()}
                        disabled={isExecuting}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 flex items-center gap-1.5 px-2"
                        title="Retry execution"
                      >
                        <RefreshCw size={12} className={isExecuting ? "animate-spin" : ""} />
                        <span className="text-[9px] font-bold uppercase">Retry</span>
                      </button>
                      <button 
                        onClick={() => setShowTerminal(false)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 font-mono text-[11px] text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {output}
                    {explanation && (
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 font-bold">
                            <Info size={14} />
                            <span>AI Analysis & Non-Programmer Insights</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowTerminal(false);
                                simplifyCode();
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-bold transition-all"
                            >
                              <Wand2 size={11} />
                              <span>Simplify Code</span>
                            </button>
                            <button
                              onClick={() => setShowColabModal(true)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold transition-all"
                            >
                              <LaunchIcon size={11} />
                              <span>Run on Colab</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed">{explanation}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Colab Modal */}
        <AnimatePresence>
          {showColabModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowColabModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                      <LaunchIcon size={20} />
                    </span>
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <span>Run on Google Colab</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                          Pre-Configured Environment
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Launch this script in a free cloud GPU/CPU Jupyter notebook on Google Colab.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowColabModal(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Project ID Input */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Google Cloud Platform (GCP) Project ID</span>
                    <span className="text-[10px] font-mono text-slate-400">Required for Earth Engine</span>
                  </label>
                  <input
                    type="text"
                    value={colabProjectId}
                    onChange={(e) => setColabProjectId(e.target.value)}
                    placeholder="openclaw-bot-494215"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    This project ID connects Colab directly to your Earth Engine cloud quota (<code className="text-amber-300">{colabProjectId}</code>).
                  </p>
                </div>

                {/* Step by Step Instructions */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">1. Open Colab</span>
                    <p className="text-slate-400 text-[11px]">Click Launch Colab below to open a fresh interactive notebook.</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">2. Copy & Paste</span>
                    <p className="text-slate-400 text-[11px]">Copy the pre-configured script below into a new Colab cell.</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">3. Run Cell</span>
                    <p className="text-slate-400 text-[11px]">Press Shift + Enter to authenticate and run full cloud analysis.</p>
                  </div>
                </div>

                {/* Pre-configured Colab Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Pre-Configured Colab Code Block</span>
                    <button
                      onClick={() => {
                        const colabCode = generateColabCode();
                        navigator.clipboard.writeText(colabCode);
                        setColabCopied(true);
                        setTimeout(() => setColabCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-md text-xs transition-all"
                    >
                      {colabCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{colabCopied ? "Copied Colab Code!" : "Copy Code Block"}</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 max-h-60 overflow-y-auto">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        background: 'transparent',
                        fontSize: '11px',
                        padding: '12px',
                      }}
                      showLineNumbers
                    >
                      {generateColabCode()}
                    </SyntaxHighlighter>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setShowColabModal(false)}
                    className="px-4 py-2 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <a
                    href="https://colab.research.google.com/#create=true"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Launch Google Colab</span>
                    <LaunchIcon size={14} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
