import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, Search, X, Copy, Check, Play, Terminal, Info, Loader2, ExternalLink, Download, RefreshCw, Sparkles, Cpu, BarChart2, Sliders, GitFork, Server, ExternalLink as LaunchIcon } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'code' | 'flowchart' | 'params'>('code');
  const [showParamPanel, setShowParamPanel] = useState(false);
  
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
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        viewMode === 'code' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Code View
                    </button>
                    {selectedFile.endsWith('.py') && (
                      <button
                        onClick={() => setViewMode('flowchart')}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          viewMode === 'flowchart' ? 'bg-purple-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-purple-300'
                        }`}
                      >
                        <Sparkles size={11} />
                        Visual Flowchart
                      </button>
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

                <div className="flex items-center gap-2">
                  {selectedFile.endsWith('.py') && (
                    <>
                      <button 
                        onClick={() => runCode()}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-md text-[10px] font-bold hover:bg-green-600/30 transition-all disabled:opacity-50"
                      >
                        {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                        {isExecuting ? "Executing..." : "Run Script"}
                      </button>
                      <button 
                        onClick={() => explainCode()}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold hover:bg-blue-600/30 transition-all disabled:opacity-50"
                      >
                        <Sparkles size={12} fill="currentColor" />
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
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300">
                        <div className="flex items-center gap-2 font-bold mb-2">
                          <Info size={14} />
                          <span>AI Analysis & Results</span>
                        </div>
                        {explanation}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
