import React, { useState, useRef, useEffect } from 'react';
import { Plus, AlertCircle, ChevronUp, ChevronDown, Copy, Trash2, Heading, Columns, BarChart, LayoutGrid, Quote, X } from 'lucide-react';
import { Slide } from './types';
import Ribbon from './components/Ribbon';
import SlideEditor from './components/SlideEditor';
import { exportSlides } from './services/exportService';
import { SLIDE_TEMPLATES } from './services/templates';
import { AIConfig } from './services/aiService';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

const getSlideTitle = (code: string, index: number) => {
  const match = code.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (match && match[1]) {
    return match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
  }
  return `Slide ${index + 1}`;
};

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem('slides_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load slides from localStorage", e);
    }
    return [
      { id: crypto.randomUUID(), code: SLIDE_TEMPLATES[0].code },
      { id: crypto.randomUUID(), code: SLIDE_TEMPLATES[1].code }
    ];
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('slides_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return '';
  });

  useEffect(() => {
    localStorage.setItem('slides_v3', JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    if (slides.length > 0 && (!activeSlideId || !slides.some(s => s.id === activeSlideId))) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(true); // Open AI Copilot by default (like PowerPoint Copilot)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasElementSelected, setHasElementSelected] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true); // Default ON for alignment visibility

  // Undo/Redo History Stack state
  const [history, setHistory] = useState<Slide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isInternalChange = useRef(false);

  // Sync slides to undo/redo history stack
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (slides.length > 0) {
      const currentSlidesStr = JSON.stringify(slides);
      const historyStr = historyIndex >= 0 ? JSON.stringify(history[historyIndex]) : '';
      if (currentSlidesStr !== historyStr) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(currentSlidesStr));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [slides, historyIndex, history]);

  const undo = () => {
    if (historyIndex > 0) {
      isInternalChange.current = true;
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setSlides(JSON.parse(JSON.stringify(history[prevIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      isInternalChange.current = true;
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setSlides(JSON.parse(JSON.stringify(history[nextIndex])));
    }
  };

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem('ai_config_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      provider: 'gemini',
      apiKey: (process.env as any).GEMINI_API_KEY || '',
      model: 'gemini-2.6-flash'
    };
  });

  useEffect(() => {
    localStorage.setItem('ai_config_v1', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Reset selection state when changing slides
  useEffect(() => {
    setHasElementSelected(false);
  }, [activeSlideId]);

  // Sync element selection state from visual editor iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_SELECTED') {
        setHasElementSelected(event.data.hasSelection);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const activeSlide = slides.find(s => s.id === activeSlideId);
  const slideRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  const applyActiveBackgroundToAll = () => {
    if (!activeSlide) return;
    // Extract style attribute from the slide-container div of the active slide
    const match = activeSlide.code.match(/<div[^>]*class="[^"]*slide-container[^"]*"[^>]*style="([^"]*)"/i);
    if (match && match[1]) {
      const styleToApply = match[1];
      setSlides(prev => prev.map(s => {
        if (s.id === activeSlideId) return s;
        const updated = s.code.replace(/(<div[^>]*class="[^"]*slide-container[^"]*"[^>]*style=")([^"]*)(")/i, `$1${styleToApply}$3`);
        return { ...s, code: updated };
      }));
    }
  };

  const executeCommand = (command: string, value?: string) => {
    if (command === 'undo') {
      undo();
      return;
    }
    if (command === 'redo') {
      redo();
      return;
    }
    const ref = slideRefs.current.get(activeSlideId);
    if (ref?.contentWindow) {
      ref.contentWindow.postMessage({ type: 'EXEC_COMMAND', command, value }, '*');
    }
  };

  const addSlideWithTemplate = (templateCode: string) => {
    const id = crypto.randomUUID();
    const newSlide: Slide = { id, code: templateCode };
    const activeIndex = slides.findIndex(s => s.id === activeSlideId);
    setSlides(prev => {
      const next = [...prev];
      if (activeIndex !== -1) {
        next.splice(activeIndex + 1, 0, newSlide);
      } else {
        next.push(newSlide);
      }
      return next;
    });
    setActiveSlideId(id);
    setShowTemplateModal(false);
  };

  const duplicateSlide = (id: string) => {
    const slideToDuplicate = slides.find(s => s.id === id);
    if (!slideToDuplicate) return;
    const newId = crypto.randomUUID();
    const newSlide: Slide = { id: newId, code: slideToDuplicate.code };
    const index = slides.findIndex(s => s.id === id);
    setSlides(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, newSlide);
      return next;
    });
    setActiveSlideId(newId);
  };

  const addBlankSlide = () => {
    const id = crypto.randomUUID();
    const newSlide: Slide = { id, code: SLIDE_TEMPLATES[0].code };
    setSlides(prev => [...prev, newSlide]);
    setActiveSlideId(id);
  };

  const deleteSlide = (id: string) => {
    setSlides(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeSlideId === id) {
        if (filtered.length > 0) {
          const deletedIndex = prev.findIndex(s => s.id === id);
          const nextActiveIndex = deletedIndex === 0 ? 0 : deletedIndex - 1;
          setActiveSlideId(filtered[nextActiveIndex].id);
        } else {
          setActiveSlideId('');
        }
      }
      return filtered;
    });
  };

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setSlides(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const updateSlideCode = (id: string, code: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, code } : s));
  };

  const handleApplySlide = (code: string, mode: 'create' | 'edit') => {
    if (code) {
      if (mode === 'create') {
        const id = crypto.randomUUID();
        const newSlide: Slide = { id, code };
        const activeIndex = slides.findIndex(s => s.id === activeSlideId);
        setSlides(prev => {
          const next = [...prev];
          if (activeIndex !== -1) {
            next.splice(activeIndex + 1, 0, newSlide);
          } else {
            next.push(newSlide);
          }
          return next;
        });
        setActiveSlideId(id);
      } else if (mode === 'edit' && activeSlideId) {
        updateSlideCode(activeSlideId, code);
      }
    }
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
    <div className="h-screen bg-[#020617] text-white flex flex-col overflow-hidden">
      {/* Top Microsoft PowerPoint-Style Ribbon Bar */}
      <Ribbon
        onCommand={executeCommand}
        onAddSlide={(tmplId) => {
          const tmpl = SLIDE_TEMPLATES.find(t => t.id === tmplId) || SLIDE_TEMPLATES[0];
          addSlideWithTemplate(tmpl.code);
        }}
        hasElementSelected={hasElementSelected}
        onExport={handleExport}
        onExportAll={handleExportAll}
        isExporting={isExporting}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCopilotOpen={isAIDrawerOpen}
        onToggleCopilot={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
        activeSlideId={activeSlideId}
        showGridlines={showGridlines}
        onToggleGridlines={() => setShowGridlines(!showGridlines)}
        onApplyBackgroundToAll={applyActiveBackgroundToAll}
      />
      
      {/* 3-Section Workspace layout: Navigator - Canvas Workspace - AI Copilot Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Navigator */}
        <aside className={`bg-[#090d16] border-r border-slate-800/85 flex flex-col select-none transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarCollapsed ? 'w-0 border-r-0 overflow-hidden' : 'w-64'
        }`}>
          <div className="p-4 border-b border-slate-850 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Slides Navigator</span>
            <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
            </span>
          </div>
          
          {/* Slide Thumbnails Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {slides.map((slide, index) => {
              const title = getSlideTitle(slide.code, index);
              const isActive = slide.id === activeSlideId;
              return (
                <div 
                  key={slide.id}
                  onClick={() => setActiveSlideId(slide.id)}
                  className={`group relative p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 cursor-pointer transition-all duration-200 ${
                    isActive ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/50' : 'hover:bg-slate-900/70 hover:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                    
                    {/* Slide Action Controls */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 'up'); }}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 'down'); }}
                        disabled={index === slides.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800"
                        title="Duplicate Slide"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-950/30"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mini Mockup of Slide */}
                  <div className="h-20 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center p-2 text-center overflow-hidden">
                    <span className="text-xs font-bold text-slate-350 line-clamp-2 leading-tight">
                      {title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom Actions - Add Slide options */}
          <div className="p-4 border-t border-slate-850 flex flex-col gap-2">
            <button
              onClick={addBlankSlide}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-200" /> Add Blank Slide
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-[10px] text-slate-355 border border-slate-800 transition-all active:scale-[0.98]"
            >
              Choose Layout Template
            </button>
          </div>
        </aside>

        {/* Right Work Area (Canvas Editor) */}
        <main className="flex-1 overflow-y-auto bg-[#040815] bg-grid-pattern p-6 flex flex-col gap-6 relative">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center">
            {slides.length === 0 ? (
              <div className="text-center p-12 bg-slate-900/40 border border-slate-800/80 rounded-[3rem] max-w-lg mx-auto flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <Sparkles className="w-8 h-8 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Your Presentation is Empty</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Create slides from scratch, select preset layouts, or let the AI Assistant write copy and styling.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={addBlankSlide}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> Add Blank Slide
                  </button>
                  <button
                    onClick={() => setIsAIDrawerOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                  >
                    🪄 Generate with AI
                  </button>
                </div>
              </div>
            ) : (
              slides.map((slide, index) => (
                <SlideEditor
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={slide.id === activeSlideId}
                  showGridlines={showGridlines}
                  onRemove={() => deleteSlide(slide.id)}
                  onChange={(code) => updateSlideCode(slide.id, code)}
                  onRegisterRef={(ref) => ref ? slideRefs.current.set(slide.id, ref) : slideRefs.current.delete(slide.id)}
                />
              ))
            )}
          </div>
        </main>

        {/* Right Sidebar - AI Copilot Docked Panel */}
        {isAIDrawerOpen && (
          <AIAssistantDrawer
            isOpen={isAIDrawerOpen}
            onClose={() => setIsAIDrawerOpen(false)}
            onApplySlide={handleApplySlide}
            currentSlideCode={activeSlide?.code}
            config={aiConfig}
            onConfigChange={setAiConfig}
          />
        )}
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Select Slide Layout</h3>
                <p className="text-slate-400 text-sm mt-1">Choose a beautiful pre-styled template to start building.</p>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {SLIDE_TEMPLATES.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  onClick={() => addSlideWithTemplate(tmpl.code)}
                  className="p-5 bg-slate-950/60 hover:bg-slate-850 border border-slate-800/50 hover:border-indigo-500/50 rounded-2xl cursor-pointer text-left transition-all hover:scale-[1.01] flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{tmpl.name}</span>
                    <span className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center transition-all">
                      {tmpl.id === 'title' && <Heading className="w-4 h-4" />}
                      {tmpl.id === 'comparison' && <Columns className="w-4 h-4" />}
                      {tmpl.id === 'metrics' && <BarChart className="w-4 h-4" />}
                      {tmpl.id === 'features' && <LayoutGrid className="w-4 h-4" />}
                      {tmpl.id === 'quote' && <Quote className="w-4 h-4" />}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[100] flex items-center justify-center">
          <div className="text-center p-12 bg-slate-900 rounded-[3rem] border border-slate-800">
             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
             <h3 className="text-2xl font-bold">Processing Presentation</h3>
             <p className="text-slate-500 mt-2">Capturing high-fidelity layouts...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
