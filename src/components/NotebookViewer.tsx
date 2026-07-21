import React from 'react';
import { IpynbRenderer } from "react-ipynb-renderer";
import { CheckCircle } from 'lucide-react';
// We use syntaxTheme to format code blocks, and we add custom styles below
// Note: using default styles from react-ipynb-renderer could clash, so we wrap it in a custom dark div.

interface NotebookViewerProps {
  content: string;
  fileName: string;
}

export function NotebookViewer({ content, fileName }: NotebookViewerProps) {
  let notebookData = null;
  let parseError = false;
  let numCells = 0;

  try {
    notebookData = JSON.parse(content);
    if (notebookData && notebookData.cells) {
      numCells = notebookData.cells.length;
    } else {
      parseError = true;
    }
  } catch (e) {
    parseError = true;
  }

  if (parseError || !notebookData) {
    return (
      <div className="p-6 bg-slate-950 text-slate-400 font-mono text-xs">
        <p className="text-rose-400 mb-4">Error: Could not parse .ipynb file.</p>
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden" id="notebook-direct-reader">
      {/* Notebook Header Status bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-200">{fileName}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
            Jupyter Notebook
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <span>{numCells} Cells</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle size={12} /> Ready
          </span>
        </div>
      </div>

      {/* Cells List Workspace */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white ipynb-container">
        <IpynbRenderer
          ipynb={notebookData}
          syntaxTheme="darcula"
          language="python"
        />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .ipynb-container .react-ipynb-renderer-code {
          background-color: #1e293b !important;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        .ipynb-container .react-ipynb-renderer-prompt {
          color: #64748b;
          font-family: monospace;
          font-size: 11px;
        }
        .ipynb-container .react-ipynb-renderer-output {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-top: 0.5rem;
        }
        .ipynb-container .react-ipynb-renderer-markdown {
          font-family: system-ui, -apple-system, sans-serif;
          color: #334155;
          line-height: 1.6;
        }
      `}} />
    </div>
  );
}
