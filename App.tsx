
import React, { useState, useRef } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Slide } from './types';
import Navbar from './components/Navbar';
import SlideEditor from './components/SlideEditor';
import { exportSlides } from './services/exportService';

const DEFAULT_SLIDE_CODE = `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
        .slide-container {
            width: 1280px;
            height: 720px;
            position: relative;
            background-color: #f3f4f6;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            font-family: 'Inter', sans-serif;
        }

        /* Header Styling */
        .header-section {
            padding: 32px 64px 16px 64px;
            background-color: white;
            z-index: 10;
        }

        .section-tag {
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-block;
            margin-bottom: 8px;
        }

        /* Grid Layout */
        .grid-container {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            padding: 16px 64px 48px 64px;
            background-color: white;
        }

        /* Column Styling */
        .column-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
        }

        .profit-header { border-bottom-color: #ef4444; }
        .wealth-header { border-bottom-color: #f59e0b; }

        .cards-wrapper {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        /* Card Styling */
        .alert-card {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 14px 18px;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); /* slightly increased for better translation */
            border: 1px solid #f3f4f6;
            position: relative;
            overflow: hidden;
        }

        .card-stripe-profit {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: #ef4444;
        }

        .card-stripe-wealth {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: #f59e0b;
        }

        .icon-profit {
            color: #ef4444;
            background-color: #fee2e2;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 16px;
        }

        .icon-wealth {
            color: #d97706;
            background-color: #fef3c7;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 16px;
        }

        h3 { margin: 0; }
        p { margin: 0; }

    </style>

<div class="slide-container">
<!-- Header -->
<div class="header-section">
<div class="flex justify-between items-end">
<div>
<span class="section-tag"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Critical Analysis</span>
<h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Strategic Limitations &amp; Risks</h1>
<p class="text-gray-500 mt-2 text-lg">Comparative evaluation of inherent disadvantages in both approaches.</p>
</div>
<div class="text-right">
<p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Comparison Grid</p>
<div class="h-1 w-24 bg-gray-200 mt-2 ml-auto rounded-full"></div>
</div>
</div>
</div>
<!-- Main Grid Content -->
<div class="grid-container">
<!-- Left Column: Profit Maximization -->
<div class="flex flex-col">
<div class="column-header profit-header">
<div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shadow-sm">
<i class="fa-solid fa-chart-bar text-xl"></i>
</div>
<div>
<h2 class="text-xl font-bold text-gray-900 leading-tight">Profit Maximization</h2>
<p class="text-xs text-red-600 font-bold uppercase tracking-wide">Structural Flaws</p>
</div>
</div>
<div class="cards-wrapper">
<!-- Item 1 -->
<div class="alert-card card-profit">
<div class="card-stripe-profit"></div>
<div class="icon-profit"><i class="fa-solid fa-hourglass-end"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Short-Term Focus</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Prioritizes immediate earnings over long-term sustainability and growth.</p>
</div>
</div>
<!-- Item 2 -->
<div class="alert-card card-profit">
<div class="card-stripe-profit"></div>
<div class="icon-profit"><i class="fa-solid fa-dice"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Ignores Risk</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Fails to distinguish between safe and risky income streams.</p>
</div>
</div>
<!-- Item 3 -->
<div class="alert-card card-profit">
<div class="card-stripe-profit"></div>
<div class="icon-profit"><i class="fa-solid fa-clock-rotate-left"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">No Time Value of Money</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Treats current and future dollars as equal, ignoring inflation and opportunity cost.</p>
</div>
</div>
<!-- Item 4 -->
<div class="alert-card card-profit">
<div class="card-stripe-profit"></div>
<div class="icon-profit"><i class="fa-solid fa-pen-to-square"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Earnings Management</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Encourages accounting manipulation to meet short-term targets.</p>
</div>
</div>
<!-- Item 5 -->
<div class="alert-card card-profit">
<div class="card-stripe-profit"></div>
<div class="icon-profit"><i class="fa-solid fa-skull-crossbones"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Brand Damage</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Cost-cutting measures can compromise product quality and reputation.</p>
</div>
</div>
</div>
</div>
<!-- Right Column: Wealth Maximization -->
<div class="flex flex-col">
<div class="column-header wealth-header">
<div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
<i class="fa-solid fa-gem text-xl"></i>
</div>
<div>
<h2 class="text-xl font-bold text-gray-900 leading-tight">Wealth Maximization</h2>
<p class="text-xs text-amber-600 font-bold uppercase tracking-wide">Operational Challenges</p>
</div>
</div>
<div class="cards-wrapper">
<!-- Item 1 -->
<div class="alert-card card-wealth">
<div class="card-stripe-wealth"></div>
<div class="icon-wealth"><i class="fa-solid fa-arrow-trend-down"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Market Dependency</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Stock prices can fluctuate due to external market factors unrelated to performance.</p>
</div>
</div>
<!-- Item 2 -->
<div class="alert-card card-wealth">
<div class="card-stripe-wealth"></div>
<div class="icon-wealth"><i class="fa-solid fa-calculator"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Analytical Complexity</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Requires complex calculations involving beta, WACC, and cash flow projections.</p>
</div>
</div>
<!-- Item 3 -->
<div class="alert-card card-wealth">
<div class="card-stripe-wealth"></div>
<div class="icon-wealth"><i class="fa-solid fa-seedling"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Patient Capital Needed</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Strategies often have long gestation periods before yielding visible returns.</p>
</div>
</div>
<!-- Item 4 -->
<div class="alert-card card-wealth">
<div class="card-stripe-wealth"></div>
<div class="icon-wealth"><i class="fa-solid fa-handshake-slash"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Agency Issues</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Potential conflict of interest between management and shareholders (Agency Problem).</p>
</div>
</div>
<!-- Item 5 -->
<div class="alert-card card-wealth">
<div class="card-stripe-wealth"></div>
<div class="icon-wealth"><i class="fa-solid fa-database"></i></div>
<div>
<h3 class="text-base font-bold text-gray-800">Data Intensity</h3>
<p class="text-sm text-gray-500 mt-1 leading-snug">Relies heavily on accurate long-term forecasting and market data.</p>
</div>
</div>
</div>
</div>
</div>
<!-- Page Number -->
<div class="absolute bottom-6 right-8 text-gray-200 font-black text-6xl opacity-40 z-0 pointer-events-none">09</div>
</div>

`;

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem('slides_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load slides from localStorage", e);
    }
    return [{ id: crypto.randomUUID(), code: DEFAULT_SLIDE_CODE }];
  });

  React.useEffect(() => {
    localStorage.setItem('slides_v3', JSON.stringify(slides));
  }, [slides]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  const addSlide = () => {
    const id = crypto.randomUUID();
    const newSlide: Slide = {
      id,
      code: DEFAULT_SLIDE_CODE
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const updateSlideCode = (id: string, code: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, code } : s));
  };

  const handleExport = async (type: 'PDF' | 'PPTX') => {
    if (isExporting || slides.length === 0) return;
    setIsExporting(true);
    setError(null);
    try {
      await exportSlides(slides, slideRefs.current, type);
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (isExporting || slides.length === 0) return;
    setIsExporting(true);
    setError(null);
    try {
      await exportSlides(slides, slideRefs.current, 'PDF');
      await exportSlides(slides, slideRefs.current, 'PPTX');
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar onExport={handleExport} onExportAll={handleExportAll} isExporting={isExporting} />
      
      <main className="container mx-auto px-4 pt-32 pb-64 max-w-5xl">
        <header className="mb-20 text-center">
          <h1 className="text-6xl font-black tracking-tighter mb-4">HTML Builder</h1>
          <p className="text-slate-400 text-lg">WYSIWYG Visual Editor & High-Resolution PDF/PPTX Export</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-24">
          {slides.map((slide, index) => (
            <SlideEditor
              key={slide.id}
              slide={slide}
              index={index}
              onRemove={() => setSlides(prev => prev.filter(s => s.id !== slide.id))}
              onChange={(code) => updateSlideCode(slide.id, code)}
              onRegisterRef={(ref) => ref ? slideRefs.current.set(slide.id, ref) : slideRefs.current.delete(slide.id)}
            />
          ))}
        </div>
      </main>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={addSlide}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-black shadow-2xl transition-all"
        >
          <Plus className="w-5 h-5" /> Add Slide
        </button>
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[100] flex items-center justify-center">
          <div className="text-center p-12 bg-gray-900 rounded-[3rem] border border-gray-800">
             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
             <h3 className="text-2xl font-bold">Processing Presentation</h3>
             <p className="text-slate-500 mt-2">Capturing high-fidelity visuals...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
