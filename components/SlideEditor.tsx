
import React, { useState } from 'react';
import { Trash2, Code, Eye, MousePointer2 } from 'lucide-react';
import { Slide } from '../types';
import PreviewFrame from './PreviewFrame';

interface SlideEditorProps {
  slide: Slide;
  index: number;
  onRemove: () => void;
  onChange: (code: string) => void;
  onRegisterRef: (ref: HTMLIFrameElement | null) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ 
  slide, 
  index, 
  onRemove, 
  onChange,
  onRegisterRef
}) => {
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'visual'>('preview');

  return (
    <div className="group relative bg-gray-900 rounded-3xl border border-gray-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-xs font-bold text-gray-400">
            {index + 1}
          </div>
          <h3 className="font-semibold text-gray-200">Slide {index + 1}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-gray-800 p-1 rounded-xl border border-gray-700 flex gap-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'editor' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Code
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'visual' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              Visual Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
          
          <button
            onClick={onRemove}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-0">
        <div className={viewMode === 'editor' ? 'block' : 'hidden'}>
          <div className="p-6">
            <textarea
              value={slide.code}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-[450px] bg-gray-950 text-gray-300 font-mono text-sm p-6 rounded-2xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Paste HTML here..."
              spellCheck={false}
            />
          </div>
        </div>
        <div className={viewMode !== 'editor' ? 'flex justify-center bg-gray-950 p-6 md:p-12' : 'hidden'}>
          <div className="w-full max-w-[800px]">
             <PreviewFrame 
              code={slide.code} 
              isVisualEdit={viewMode === 'visual'}
              onCodeChange={onChange}
              onRegisterRef={onRegisterRef} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;
