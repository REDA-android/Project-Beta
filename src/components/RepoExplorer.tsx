import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, Search, X, Copy, Check, Play, Terminal, Info, Loader2, ExternalLink, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  
  // Execution State
  const [output, setOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);

  useEffect(() => {
    // Lazy load Pyodide
    const initPyodide = async () => {
      if (window.loadPyodide && !window.pyodide) {
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
    try {
      const response = await fetch(`/api/files/content?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.content) {
        setFileContent(data.content);
        // Auto-run if it's a python file
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

  const runCode = async (contentOverride?: string, pathOverride?: string) => {
    const codeToRun = contentOverride || fileContent;
    const fileToRun = pathOverride || selectedFile;
    
    if (!codeToRun || !fileToRun) return;
    
    setIsExecuting(true);
    setShowTerminal(true);
    setOutput("Initializing execution environment...\n");
    setExplanation(null);

    // If it's a research model or has complex imports, use AI simulation
    const complexKeywords = ['jax', 'torch', 'tensorflow', 'graphcast', 'xarray', 'beam', 'import', 'plt', 'pd'];
    const isComplex = complexKeywords.some(k => codeToRun.toLowerCase().includes(k));

    if (isComplex) {
      setOutput(prev => prev + "Detecting heavy research dependencies (JAX/Torch/Xarray)... \nInitializing high-performance AI Simulation Engine to process research logic.\n\n");
      try {
        const response = await fetch('/api/ai/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeToRun, fileName: fileToRun.split('/').pop() })
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
      return;
    }

    // Otherwise try Pyodide for simple logic
    if (!pyodide) {
      setOutput(prev => prev + "Pyodide not loaded. Using AI simulation as fallback...\n");
      // Repeat AI logic or just wait
      runCode(); 
      return;
    }

    try {
      setOutput(prev => prev + "Running client-side Python (Pyodide)...\n\n");
      // Redirect stdout
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
      `);
      
      await pyodide.runPythonAsync(fileContent);
      
      const stdOut = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(prev => prev + (stdOut || "Script finished with no output."));
    } catch (err: any) {
      setOutput(prev => prev + "Execution Error: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const getColabLink = () => {
    const repoMap: Record<string, string> = {
      'graphcast': 'google-deepmind/graphcast',
      'remote-sensing': 'google-research/remote-sensing',
      'timesfm': 'google-research/timesfm',
      'ai-weather-climate': 'google/ai-weather-climate',
      'Agriculture-Vision': 'SHI-Labs/Agriculture-Vision'
    };
    const repo = repoMap[repoName];
    if (!repo) return null;
    
    const baseUrl = `https://colab.research.google.com/github/${repo}`;
    if (selectedFile) {
      // Heuristic for branch (most are main or master)
      const branch = repoName === 'timesfm' || repoName === 'Agriculture-Vision' ? 'master' : 'main';
      return `${baseUrl}/blob/${branch}/${selectedFile}`;
    }
    return baseUrl;
  };

  const downloadFile = () => {
    if (!fileContent || !selectedFile) return;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.split('/').pop() || 'file.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
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
              {getColabLink() && (
                <a 
                  href={getColabLink()!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink size={10} /> Open in Google Colab
                </a>
              )}
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
              <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">{selectedFile}</span>
                  {selectedFile.endsWith('.py') && (
                    <button 
                      onClick={() => runCode()}
                      disabled={isExecuting}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-md text-[10px] font-bold hover:bg-green-600/30 transition-all disabled:opacity-50"
                    >
                      {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                      {isExecuting ? "Executing..." : "Run Script"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={downloadFile}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                    title="Download file"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button 
                    onClick={() => { setSelectedFile(null); setFileContent(null); setShowTerminal(false); }}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              <div className={`flex-1 overflow-auto custom-scrollbar relative transition-all ${showTerminal ? 'h-1/2' : 'h-full'}`}>
                {isLoading ? (
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse" />
                  </div>
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
