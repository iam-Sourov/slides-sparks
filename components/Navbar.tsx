
import React from 'react';
import { FileText, Presentation, Github, Download } from 'lucide-react';

interface NavbarProps {
  onExport: (type: 'PDF' | 'PPTX') => void;
  onExportAll: () => void;
  isExporting: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onExport, onExportAll, isExporting }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 z-[60] flex items-center justify-between px-4 sm:px-8 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Presentation className="w-5 h-5 text-white" />
        </div>
        <div className="hidden xs:block">
          <span className="font-extrabold text-lg tracking-tight block leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-350">Slides Sparks</span>
          <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1.5 block font-mono">Presentation Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Export Group */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
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
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-sm font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-white border border-indigo-500/30"
          style={{ backgroundColor: '#4f46e5' }}
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Generate All</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
