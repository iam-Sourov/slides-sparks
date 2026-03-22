
import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import VisualToolbar from './VisualToolbar';

interface PreviewFrameProps {
  code: string;
  isVisualEdit?: boolean;
  onCodeChange?: (newCode: string) => void;
  onRegisterRef?: (ref: HTMLIFrameElement | null) => void;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ code, isVisualEdit = false, onCodeChange, onRegisterRef }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const WIDTH = 1280;
  const HEIGHT = 720;
  const ASPECT_RATIO = WIDTH / HEIGHT;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / WIDTH;
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync visual changes back to the editor
  const [srcDoc, setSrcDoc] = useState('');
  const lastSyncedHTML = useRef(code);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_HTML' && onCodeChange) {
        lastSyncedHTML.current = event.data.html;
        onCodeChange(event.data.html);
      } else if (event.data?.type === 'IMAGE_SELECTED') {
        setSelectedImageId(event.data.id);
      } else if (event.data?.type === 'IMAGE_DESELECTED') {
        setSelectedImageId(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCodeChange]);

  useEffect(() => {
    if (onRegisterRef && iframeRef.current) {
      onRegisterRef(iframeRef.current);
    }
  }, [onRegisterRef]);

  const executeCommand = (command: string, value?: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'EXEC_COMMAND', command, value }, '*');
    }
  };

  const handleInsertImage = (url: string) => {
    const html = `<img src="${url}" style="max-width: 100%; height: auto;" />`;
    executeCommand('insertHTML', html);
  };

  const handleChangeImage = (url: string) => {
    if (!selectedImageId) return;
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'UPDATE_IMAGE', 
        id: selectedImageId, 
        src: url 
      }, '*');
    }
  };

  const handleSetImageWidth = (width: string) => {
    if (!selectedImageId) return;
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'UPDATE_IMAGE', 
        id: selectedImageId, 
        width 
      }, '*');
    }
  };

  useEffect(() => {
    // Only update srcDoc if the code has changed from something OTHER than our own sync
    if (code !== lastSyncedHTML.current || !isReady) {
      const sanitizedHTML = DOMPurify.sanitize(code, {
        ADD_TAGS: [
          'script', 'link', 'style', 'img', 'svg', 'path', 'circle', 'rect', 'g', 'defs', 'linearGradient', 'stop',
          'font', 'b', 'i', 'u', 'strike', 'ul', 'ol', 'li', 'br', 'p', 'h1', 'h2', 'h3', 'blockquote', 'a', 'span',
          'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot'
        ],
        ADD_ATTR: [
          'target', 'rel', 'class', 'style', 'id', 'src', 'alt', 'width', 'height', 'fill', 'stroke', 'd', 'viewBox', 
          'x', 'y', 'x1', 'y1', 'x2', 'y2', 'face', 'size', 'color', 'contenteditable', 'border', 'cellpadding', 'cellspacing',
          'data-lucide'
        ],
        FORCE_BODY: true
      });

      const newSrcDoc = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            <style>
              html, body { 
                margin: 0; padding: 0; 
                width: ${WIDTH}px; height: ${HEIGHT}px;
                overflow: hidden; background-color: white;
                font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
              }
              #capture-root {
                width: ${WIDTH}px; height: ${HEIGHT}px;
                position: relative; overflow: hidden; box-sizing: border-box;
                outline: none;
              }
              ${isVisualEdit ? `
                #capture-root *:not(div):not(section):not(img):hover { 
                  outline: 1px dashed rgba(99, 102, 241, 0.8) !important; 
                  outline-offset: 4px;
                  cursor: text; 
                }
                #capture-root div:hover {
                  outline: 1px dotted rgba(99, 102, 241, 0.3) !important;
                }
                #capture-root *:focus { 
                  outline: 2px solid #6366f1 !important; 
                  background: rgba(99, 102, 241, 0.05);
                }
                #capture-root img:hover {
                  outline: 2px solid #6366f1 !important;
                  cursor: pointer;
                }
                #capture-root img.selected {
                  outline: 4px solid #6366f1 !important;
                  outline-offset: 2px;
                }
              ` : ''}
              img { max-width: 100%; height: auto; transition: all 0.2s; }
              ul { list-style-type: disc; padding-left: 2rem; }
              ol { list-style-type: decimal; padding-left: 2rem; }
            </style>
          </head>
          <body>
            <div id="capture-root" ${isVisualEdit ? 'contenteditable="true"' : ''}>${sanitizedHTML}</div>
            <script>
              const root = document.getElementById('capture-root');
              let timeout;
              
              const assignIds = () => {
                root.querySelectorAll('img').forEach((img, i) => {
                  if (!img.id) img.id = 'img-slide-' + i;
                });
              };

              assignIds();
              try { document.execCommand('styleWithCSS', false, 'true'); } catch (e) {}

              const sync = () => {
                assignIds();
                initIcons();
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  window.parent.postMessage({
                    type: 'SYNC_HTML',
                    html: root.innerHTML
                  }, '*');
                }, 400);
              };

              root.addEventListener('input', sync);

              // Initialize Lucide icons
              const initIcons = () => {
                if (window.lucide) {
                  window.lucide.createIcons();
                }
              };
              initIcons();

              window.addEventListener('message', (event) => {
                const { type, command, value, id, src, width } = event.data;
                if (type === 'EXEC_COMMAND') {
                  root.focus();
                  document.execCommand(command, false, value);
                  sync();
                } else if (type === 'UPDATE_IMAGE') {
                  const img = document.getElementById(id);
                  if (img) {
                    if (src) img.src = src;
                    if (width) img.style.width = width.includes('%') || width.includes('px') ? width : width + 'px';
                    sync();
                  }
                }
                initIcons();
              });

              document.addEventListener('click', (e) => {
                const img = e.target.closest('img');
                if (img && root.contains(img)) {
                  root.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
                  img.classList.add('selected');
                  window.parent.postMessage({ type: 'IMAGE_SELECTED', id: img.id }, '*');
                } else {
                  root.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
                  window.parent.postMessage({ type: 'IMAGE_DESELECTED' }, '*');
                }
                if (window.name === 'visual-edit') {
                  const link = e.target.closest('a');
                  if (link) e.preventDefault();
                }
              });
            </script>
          </body>
        </html>
      `;
      setSrcDoc(newSrcDoc);
    }
  }, [code, isVisualEdit, isReady]);

  return (
    <div className="flex flex-col gap-6">
      {isVisualEdit && (
        <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
          <VisualToolbar 
            onCommand={executeCommand}
            onInsertImage={handleInsertImage}
            onChangeImage={handleChangeImage}
            onSetImageWidth={handleSetImageWidth}
            selectedImage={!!selectedImageId}
          />
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="relative bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-300"
        style={{ width: '100%', paddingTop: `${(1 / ASPECT_RATIO) * 100}%` }}
      >
        <div 
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: `${WIDTH}px`, height: `${HEIGHT}px`, transform: `scale(${scale})`, opacity: isReady ? 1 : 0 }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            name={isVisualEdit ? 'visual-edit' : 'preview'}
            onLoad={() => setTimeout(() => setIsReady(true), 300)}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {isVisualEdit && (
          <div className="absolute top-4 right-4 animate-pulse">
            <div className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              Editing Mode
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewFrame;
