
import React from 'react';
import { FileText, Presentation, Github, Download } from 'lucide-react';

interface NavbarProps {
  onExport: (type: 'PDF' | 'PPTX') => void;
  onExportAll: () => void;
  isExporting: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onExport, onExportAll, isExporting }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 z-[60] flex items-center justify-between px-4 sm:px-8 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Presentation className="w-6 h-6 text-white" />
        </div>
        <div className="hidden xs:block">
          <span className="font-bold text-lg tracking-tight block leading-none">HTML2Slides</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1 block font-mono">Build & Export</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Export Group */}
        <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700/50 shadow-inner">
          <button
            onClick={() => onExport('PDF')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 text-xs sm:text-sm font-bold rounded-xl transition-all border border-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
            title="Download as PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => onExport('PPTX')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 disabled:opacity-50 text-xs sm:text-sm font-bold rounded-xl transition-all border border-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
            title="Download as PowerPoint"
          >
            <Presentation className="w-4 h-4" />
            <span>PPTX</span>
          </button>
        </div>

        {/* Primary Action */}
        <button
          onClick={onExportAll}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Generate All</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
