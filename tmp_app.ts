
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
    background-color: white;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    font-family: 'Inter', sans-serif;
}
/* Left Split: Image */
.image-split {
    width: 50%;
    height: 100%;
    position: relative;
    overflow: hidden;
}
.bg-image {
    width: 100%;
    height: 100%;
    background-image: url("https://page.gensparksite.com/slides_images/6431568537e8cad036e70c217d962029.jpg");
    background-size: cover;
    background-position: center;
}
.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 106, 78, 0.2);
}

/* Right Split: Content */
.content-split {
    width: 50%;
    height: 100%;
    padding: 48px 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #ffffff;
    position: relative;
}

.university-green-text { color: #006A4E; }
.university-teal-text { color: #0d9488; }

.bullet-point {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24px;
}
.bullet-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #f0fdf4;
    color: #006A4E;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 16px;
    font-size: 18px;
}
.metric-card {
    background-color: #f8fafc;
    border-left: 4px solid #0d9488;
    padding: 16px;
    border-radius: 0 8px 8px 0;
    margin-top: 12px;
}

/* Decorative element */
.deco-line {
    position: absolute;
    top: 48px;
    left: 0;
    width: 6px;
    height: 64px;
    background-color: #006A4E;
}
</style>

<div class="slide-container">
<!-- Left Side: Visual -->
<div class="image-split">
<div class="bg-image"></div>
<div class="image-overlay"></div>
<!-- Caption Overlay -->
<div class="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg max-w-sm">
<p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Visual Metaphor</p>
<p class="text-gray-900 font-serif italic text-lg leading-tight">"Focusing on the immediate harvest rather than the health of the soil."</p>
</div>
</div>
<!-- Right Side: Content -->
<div class="content-split">
<!-- Decorative Accent -->
<div class="deco-line"></div>
<!-- Header -->
<div class="mb-8">
<div class="flex items-center gap-2 mb-2">
<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Concept 01</span>
<span class="text-gray-400 text-sm font-medium">Traditional Approach</span>
</div>
<h1 class="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Profit <br/><span class="university-green-text">Maximization</span>
</h1>
</div>
<!-- Definition -->
<div class="mb-8">
<p class="text-xl text-gray-700 font-medium leading-relaxed border-l-4 border-gray-200 pl-4 italic">
                    The process of making business decisions primarily to increase short-term accounting profit or Earnings Per Share (EPS).
                </p>
</div>
<!-- Key Characteristics (Bullets) -->
<div class="space-y-2 flex-1">
<div class="bullet-point">
<div class="bullet-icon"><i class="fa-solid fa-crosshairs"></i></div>
<div>
<p class="text-lg font-bold text-gray-900">Primary Focus</p>
<p class="text-gray-600 text-sm mt-1">Immediate earnings; tactical price/output decisions for the current period.</p>
</div>
</div>
<div class="bullet-point">
<div class="bullet-icon"><i class="fa-solid fa-eye-slash"></i></div>
<div>
<p class="text-lg font-bold text-gray-900">Key Assumptions (Flaws)</p>
<p class="text-gray-600 text-sm mt-1">Ignores <strong>Risk</strong> and uncertainty. Often overlooks the <strong>Time Value of Money</strong> (TVM).</p>
</div>
</div>
<div class="bullet-point">
<div class="bullet-icon"><i class="fa-solid fa-hourglass-start"></i></div>
<div>
<p class="text-lg font-bold text-gray-900">Time Horizon</p>
<p class="text-gray-600 text-sm mt-1">Short-term (Quarterly / Annual). Prioritizes "now" over "later".</p>
</div>
</div>
</div>
<!-- Metric Box -->
<div class="metric-card">
<div class="flex items-center justify-between">
<div>
<p class="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Success Metrics</p>
<div class="flex gap-3">
<span class="inline-flex items-center gap-1 text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-200"><i class="fa-solid fa-calculator text-gray-400"></i> EPS</span>
<span class="inline-flex items-center gap-1 text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-200"><i class="fa-solid fa-percent text-gray-400"></i> Net Margin</span>
<span class="inline-flex items-center gap-1 text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-200"><i class="fa-solid fa-money-bill-wave text-gray-400"></i> Gross Profit</span>
</div>
</div>
</div>
</div>
<!-- Page Number -->
<div class="absolute bottom-6 right-8 text-gray-300 font-black text-6xl opacity-20 z-0">04</div>
</div>
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
