
import React, { useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ImagePlus, ImageIcon, Maximize2, 
  Undo2, Redo2, Type, List, ListOrdered,
  ChevronDown, Link, Table, Plus, Minus, Upload
} from 'lucide-react';

interface VisualToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onInsertImage: (url: string) => void;
  onChangeImage: (url: string) => void;
  onSetImageWidth: (width: string) => void;
  selectedImage: boolean;
}

const VisualToolbar: React.FC<VisualToolbarProps> = ({ 
  onCommand, 
  onInsertImage, 
  onChangeImage, 
  onSetImageWidth,
  selectedImage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changeFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isChange: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (isChange) {
          onChangeImage(base64);
        } else {
          onInsertImage(base64);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input so identical file can be uploaded again
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-x-auto no-scrollbar w-full max-w-5xl mx-auto">
      {/* Undo/Redo */}
      <div className="flex items-center border-r border-slate-100 pr-1 mr-1">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('undo')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('redo')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Text Type & Font */}
      <div className="flex items-center border-r border-slate-100 pr-1 mr-1 gap-1">
        <select 
          onChange={(e) => onCommand('formatBlock', e.target.value)}
          className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600 transition-colors bg-transparent border border-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="<p>">Normal Text</option>
          <option value="<h1>">Heading 1</option>
          <option value="<h2>">Heading 2</option>
          <option value="<h3>">Heading 3</option>
          <option value="<blockquote>">Quote</option>
        </select>
        
        <select 
          onChange={(e) => onCommand('fontName', e.target.value)}
          className="px-2 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600 transition-colors bg-transparent border border-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="'Inter', sans-serif">Inter</option>
          <option value="Georgia">Georgia</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
        </select>

        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
          <select 
            onChange={(e) => onCommand('fontSize', e.target.value)}
            className="px-1 py-1 bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer"
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
        </div>

        <div className="flex items-center gap-1 ml-1">
          <input 
            type="color"
            onInput={(e) => onCommand('foreColor', e.target.value)}
            className="w-6 h-6 p-0 border border-slate-200 bg-transparent cursor-pointer rounded overflow-hidden"
            title="Text Color"
          />
          <input 
            type="color"
            onInput={(e) => onCommand('hiliteColor', e.target.value)}
            className="w-6 h-6 p-0 border border-slate-200 bg-transparent cursor-pointer rounded overflow-hidden"
            title="Highlight Color"
          />
        </div>
      </div>

      {/* Formatting */}
      <div className="flex items-center border-r border-slate-100 pr-1 mr-1">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('bold')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('italic')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('underline')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('strikeThrough')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center border-r border-slate-100 pr-1 mr-1">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('justifyLeft')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('justifyCenter')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('justifyRight')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('justifyFull')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center border-r border-slate-100 pr-1 mr-1">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('insertUnorderedList')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand('insertOrderedList')} 
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Insert/Image */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) onInsertImage(url);
            }} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
            title="Insert Image by URL"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
            title="Upload Image"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleFileUpload(e, false)}
          />
        </div>

        {selectedImage && (
          <>
            <div className="flex items-center gap-1 border-l border-slate-100 pl-1 ml-1">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => changeFileInputRef.current?.click()} 
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors" 
                title="Replace Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input 
                ref={changeFileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, true)}
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <Maximize2 className="w-3 h-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Width" 
                  className="w-12 bg-transparent text-[10px] font-bold focus:outline-none text-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSetImageWidth((e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={(e) => onSetImageWidth((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-1 border-l border-slate-100 pl-1 ml-1">
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) onCommand('createLink', url);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const rows = prompt('Enter rows:', '3');
              const cols = prompt('Enter columns:', '3');
              if (rows && cols) {
                let table = '<table border="1" style="width:100%; border-collapse:collapse;">';
                for (let i = 0; i < parseInt(rows); i++) {
                  table += '<tr>';
                  for (let j = 0; j < parseInt(cols); j++) {
                    table += '<td style="padding:8px; border:1px solid #ccc;">Cell</td>';
                  }
                  table += '</tr>';
                }
                table += '</table><p><br></p>';
                onCommand('insertHTML', table);
              }
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" 
            title="Insert Table"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualToolbar;
