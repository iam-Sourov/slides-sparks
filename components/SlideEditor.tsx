import React from 'react';
import { Trash2 } from 'lucide-react';
import { Slide } from '../types';
import PreviewFrame from './PreviewFrame';

interface SlideEditorProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  showGridlines?: boolean;
  onRemove: () => void;
  onChange: (code: string) => void;
  onRegisterRef: (ref: HTMLIFrameElement | null) => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ 
  slide, 
  index, 
  isActive,
  showGridlines = false,
  onRemove, 
  onChange,
  onRegisterRef
}) => {
  return (
    <div 
      className={`group bg-gray-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
        isActive 
          ? 'relative block animate-in fade-in slide-in-from-bottom-4 duration-500' 
          : 'absolute invisible pointer-events-none left-[-9999px] top-[-9999px] w-full'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-xs font-bold text-gray-400">
            {index + 1}
          </div>
          <h3 className="font-semibold text-gray-200">Slide {index + 1}</h3>
        </div>
        
        <button
          onClick={onRemove}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          title="Delete Slide"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-0">
        <div className="flex justify-center bg-gray-950 p-6 md:p-12">
          <div className="w-full max-w-[800px]">
             <PreviewFrame 
              code={slide.code} 
              isVisualEdit={true}
              showGridlines={showGridlines}
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
