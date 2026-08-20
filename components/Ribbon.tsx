import React, { useRef, useState } from 'react';
import { 
  Bold, AlignLeft, AlignCenter, AlignRight,
  List, Link, Table, Upload, Trash2,
  MoveUp, MoveDown, Copy, Plus, Image, Square, Circle, LayoutGrid, Type, Palette, Sparkles, FileText, Download
} from 'lucide-react';

interface RibbonProps {
  onCommand: (command: string, value?: string) => void;
  onAddSlide: (templateId: string) => void;
  hasElementSelected: boolean;
  onExport: (type: 'PDF' | 'PPTX') => void;
  onExportAll: () => void;
  isExporting: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  activeSlideId: string;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  onApplyBackgroundToAll: () => void;
}

const Ribbon: React.FC<RibbonProps> = ({
  onCommand,
  onAddSlide,
  hasElementSelected,
  onExport,
  onExportAll,
  isExporting,
  isSidebarCollapsed,
  onToggleSidebar,
  isCopilotOpen,
  onToggleCopilot,
  activeSlideId,
  showGridlines,
  onToggleGridlines,
  onApplyBackgroundToAll
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design'>('home');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // Inject image HTML at selection
        const html = `<img src="${base64}" style="max-width: 100%; height: auto;" />`;
        onCommand('insertHTML', html);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="w-full bg-[#0b0f19] border-b border-slate-800 text-slate-200 select-none flex flex-col z-50">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#070a11]">
        {/* Left: Branding & Navigation Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Toggle Slide Navigator"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <div className="w-6 h-6 rounded-lg bg-indigo-650 flex items-center justify-center text-white shadow-md shadow-indigo-650/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Slides Sparks</span>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center bg-slate-900/60 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'home' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('insert')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'insert' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'design' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Design
          </button>
        </div>

        {/* Right: Export Panel & Copilot Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isCopilotOpen 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <button
            onClick={() => onExport('PDF')}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold transition-colors disabled:opacity-40"
            title="Export to PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => onExport('PPTX')}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold transition-colors disabled:opacity-40"
            title="Export to PowerPoint"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PPTX</span>
          </button>

          <button
            onClick={onExportAll}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
            title="Export All Formats"
          >
            {isExporting ? 'Exporting...' : 'Export All'}
          </button>
        </div>
      </div>

      {/* Bottom Command Area (Active Ribbon Tab Controls) */}
      <div className="h-16 px-4 bg-[#0a0d16] flex items-center gap-6 overflow-x-auto no-scrollbar">
        
        {/* Tab 1: HOME (Formatting, Layering, Alignments, Operations) */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-5">
            {/* Clipboard / Slide Actions */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-1">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('undo')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('redo')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">System</span>
            </div>

            {/* Typography Selection */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-1.5">
                <select
                  onChange={(e) => onCommand('fontName', e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="">Font Family</option>
                  <option value="Arial">Arial</option>
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                </select>

                <select
                  onChange={(e) => onCommand('fontSize', e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="">Size</option>
                  <option value="1">10px</option>
                  <option value="2">13px</option>
                  <option value="3">16px</option>
                  <option value="4">18px</option>
                  <option value="5">24px</option>
                  <option value="6">32px</option>
                  <option value="7">48px</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Color:</span>
                  <input
                    type="color"
                    onInput={(e) => onCommand('foreColor', (e.target as HTMLInputElement).value)}
                    className="w-4 h-4 p-0 border border-slate-700 bg-transparent cursor-pointer rounded overflow-hidden"
                    title="Text Color"
                  />
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Typography</span>
            </div>

            {/* Formatting Actions */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-0.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('bold')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('italic')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white font-serif italic font-extrabold"
                  title="Italic"
                >
                  I
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('underline')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white underline font-extrabold"
                  title="Underline"
                >
                  U
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('strikeThrough')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white line-through font-extrabold"
                  title="Strikethrough"
                >
                  S
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Formatting</span>
            </div>

            {/* Paragraph / Alignment */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-0.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('justifyLeft')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('justifyCenter')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('justifyRight')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('insertUnorderedList')}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Paragraph</span>
            </div>

            {/* Arrange & Actions */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-1">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('bringToFront')}
                  disabled={!hasElementSelected}
                  className={`p-1.5 hover:bg-slate-800 rounded transition-colors ${hasElementSelected ? 'text-slate-350 hover:text-white' : 'text-slate-600'}`}
                  title="Bring to Front"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('sendToBack')}
                  disabled={!hasElementSelected}
                  className={`p-1.5 hover:bg-slate-800 rounded transition-colors ${hasElementSelected ? 'text-slate-350 hover:text-white' : 'text-slate-600'}`}
                  title="Send to Back"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('duplicate')}
                  disabled={!hasElementSelected}
                  className={`p-1.5 hover:bg-slate-800 rounded transition-colors ${hasElementSelected ? 'text-slate-350 hover:text-white' : 'text-slate-600'}`}
                  title="Duplicate Element"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('deleteElement')}
                  disabled={!hasElementSelected}
                  className={`p-1.5 hover:bg-red-950/30 text-red-500 rounded transition-colors ${hasElementSelected ? 'text-red-400 hover:text-red-300' : 'text-red-900 opacity-30'}`}
                  title="Delete Element"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Arrange & Layering</span>
            </div>

            {/* Shape Customizing Styles (only enabled when an element is active) */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 ${!hasElementSelected && 'opacity-30'}`}>
                  <span className="text-[10px] text-slate-400 font-semibold">Fill:</span>
                  <input
                    type="color"
                    disabled={!hasElementSelected}
                    onInput={(e) => onCommand('setElementStyle', JSON.stringify({ property: 'backgroundColor', value: (e.target as HTMLInputElement).value }))}
                    className="w-4 h-4 p-0 border border-slate-700 bg-transparent cursor-pointer rounded overflow-hidden"
                    title="Fill Color"
                  />
                </div>

                <div className={`flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 ${!hasElementSelected && 'opacity-30'}`}>
                  <span className="text-[10px] text-slate-400 font-semibold">Border:</span>
                  <input
                    type="color"
                    disabled={!hasElementSelected}
                    onInput={(e) => {
                      onCommand('setElementStyle', JSON.stringify({ property: 'borderStyle', value: 'solid' }));
                      onCommand('setElementStyle', JSON.stringify({ property: 'borderColor', value: (e.target as HTMLInputElement).value }));
                    }}
                    className="w-4 h-4 p-0 border border-slate-700 bg-transparent cursor-pointer rounded overflow-hidden"
                    title="Border Color"
                  />
                </div>

                <select
                  disabled={!hasElementSelected}
                  onChange={(e) => {
                    const val = e.target.value;
                    onCommand('setElementStyle', JSON.stringify({ property: 'borderStyle', value: val === 'none' ? 'none' : 'solid' }));
                    onCommand('setElementStyle', JSON.stringify({ property: 'borderWidth', value: val }));
                  }}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 disabled:opacity-30 focus:outline-none cursor-pointer"
                >
                  <option value="none">Border Width</option>
                  <option value="none">None</option>
                  <option value="1px">1px</option>
                  <option value="2px">2px</option>
                  <option value="4px">4px</option>
                  <option value="8px">8px</option>
                </select>

                <select
                  disabled={!hasElementSelected}
                  onChange={(e) => onCommand('setElementStyle', JSON.stringify({ property: 'borderRadius', value: e.target.value }))}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 disabled:opacity-30 focus:outline-none cursor-pointer"
                >
                  <option value="0px">Corner Radius</option>
                  <option value="0px">Sharp</option>
                  <option value="4px">Small</option>
                  <option value="8px">Medium</option>
                  <option value="16px">Large</option>
                  <option value="9999px">Pill</option>
                </select>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Shape Formatting</span>
            </div>
          </div>
        )}

        {/* Tab 2: INSERT (New Slides, Shapes, Images, Tables, Icons) */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-5">
            {/* Shapes */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-1.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('insertTextBox')}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Text Box</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('insertShape', 'rectangle')}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rectangle</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('insertShape', 'circle')}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Circle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Circle</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCommand('insertShape', 'card')}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Card Block</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Shapes & Blocks</span>
            </div>

            {/* Media & Links */}
            <div className="flex flex-col gap-0.5 border-r border-slate-850 pr-4">
              <div className="flex items-center gap-1.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Upload Image"
                >
                  <Image className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload Image</span>
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const icon = prompt('Enter Lucide icon name (e.g. sparkles, star, heart, arrow-right, info):', 'sparkles');
                    if (icon) onCommand('insertIcon', icon);
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lucide Icon</span>
                </button>
                
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) onCommand('createLink', url);
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Link className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Link</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Media & Web</span>
            </div>

            {/* Layout structures */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const rows = prompt('Enter rows:', '3');
                    const cols = prompt('Enter columns:', '3');
                    if (rows && cols) {
                      let table = '<table border="1" style="width:100%; border-collapse:collapse; border:1px solid #ccc;">';
                      for (let i = 0; i < parseInt(rows); i++) {
                        table += '<tr>';
                        for (let j = 0; j < parseInt(cols); j++) {
                          table += '<td style="padding:8px; border:1px solid #ccc; color:#0f172a;">Cell</td>';
                        }
                        table += '</tr>';
                      }
                      table += '</table><p><br></p>';
                      onCommand('insertHTML', table);
                    }
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Table className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Table</span>
                </button>

                <button
                  onClick={() => onAddSlide('title')}
                  className="px-3 py-1 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Slide</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Data & Layout</span>
            </div>
          </div>
        )}

        {/* Tab 3: DESIGN (Slide Background Quick Style Themes) */}
        {activeTab === 'design' && (
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCommand('setElementStyle', JSON.stringify({ property: 'background', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Dark Indigo Gradient"
                >
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] border border-slate-700"></span>
                  <span>Midnight Glow</span>
                </button>

                <button
                  onClick={() => onCommand('setElementStyle', JSON.stringify({ property: 'background', value: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)' }))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Deep Emerald Gradient"
                >
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#022c22] to-[#064e3b] border border-slate-700"></span>
                  <span>Emerald Sea</span>
                </button>

                <button
                  onClick={() => onCommand('setElementStyle', JSON.stringify({ property: 'background', value: 'linear-gradient(135deg, #180828 0%, #2e0854 100%)' }))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Royal Purple Gradient"
                >
                  <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-[#180828] to-[#2e0854] border border-slate-700"></span>
                  <span>Royal Velvet</span>
                </button>

                <button
                  onClick={() => onCommand('setElementStyle', JSON.stringify({ property: 'background', value: '#0f172a' }))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Solid Charcoal Slate"
                >
                  <span className="w-3.5 h-3.5 rounded bg-[#0f172a] border border-slate-700"></span>
                  <span>Solid Slate</span>
                </button>

                <button
                  onClick={() => onCommand('setElementStyle', JSON.stringify({ property: 'background', value: '#f8fafc' }))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Clean Light Canvas"
                >
                  <span className="w-3.5 h-3.5 rounded bg-[#f8fafc] border border-slate-300"></span>
                  <span>Clean Light</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Active Slide Theme Presets</span>
            </div>

            <div className="h-8 w-px bg-slate-800 mx-2"></div>

            {/* Design & Canvas Layout Tools */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleGridlines}
                  className={`px-3 py-1 border text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    showGridlines 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:text-indigo-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white'
                  }`}
                  title="Toggle designer grid dots helper inside workspace"
                >
                  Gridlines: {showGridlines ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={onApplyBackgroundToAll}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Replicate the active background styles across all slides in deck"
                >
                  Apply to All Slides
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">Designer Options</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper SVG elements matching Undo/Redo since we don't import them from Lucide
const Undo2: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);
const Redo2: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

export default Ribbon;
