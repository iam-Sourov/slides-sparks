import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

interface PreviewFrameProps {
  code: string;
  isVisualEdit?: boolean;
  showGridlines?: boolean;
  onCodeChange?: (newCode: string) => void;
  onRegisterRef?: (ref: HTMLIFrameElement | null) => void;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ code, isVisualEdit = false, showGridlines = false, onCodeChange, onRegisterRef }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [hasElementSelected, setHasElementSelected] = useState(false);

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
      } else if (event.data?.type === 'ELEMENT_SELECTED') {
        setHasElementSelected(event.data.hasSelection);
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

  const handleDeleteImage = () => {
    if (!selectedImageId) return;
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'DELETE_IMAGE', 
        id: selectedImageId 
      }, '*');
    }
    setSelectedImageId(null);
  };

  useEffect(() => {
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
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Montserrat:wght@400;700;900&family=Outfit:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&family=Poppins:wght@400;700;900&family=Lora:ital,wght@0,500;1,700&family=Roboto:wght@400;700&family=Fira+Code:wght@400;700&display=swap" rel="stylesheet">
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
                ${showGridlines ? `
                  background-image: radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 0);
                  background-size: 24px 24px;
                ` : ''}
              }
              ${isVisualEdit ? `
                /* direct children of slide-container represent canvas layout elements */
                .slide-container > *:not(style):not(script):not(#canvas-selection-overlay) {
                  transition: outline 0.15s, outline-offset 0.15s;
                }
                .slide-container > *:not(style):not(script):not(#canvas-selection-overlay):hover {
                  outline: 2.5px dashed rgba(99, 102, 241, 0.6) !important;
                  outline-offset: 2px;
                  cursor: move !important;
                }
                #capture-root *:focus { 
                  outline: none !important;
                  background: rgba(99, 102, 241, 0.02);
                }
                #canvas-selection-overlay {
                  position: absolute;
                  border: 2.5px solid #4f46e5;
                  pointer-events: none;
                  z-index: 99999;
                  box-sizing: border-box;
                }
                .canvas-resize-handle {
                  position: absolute;
                  width: 12px;
                  height: 12px;
                  background-color: white;
                  border: 2.5px solid #4f46e5;
                  border-radius: 50%;
                  pointer-events: auto;
                  box-sizing: border-box;
                  z-index: 100000;
                  transition: transform 0.1s;
                }
                .canvas-resize-handle:hover {
                  transform: scale(1.25);
                }
                .handle-tl { top: -6px; left: -6px; cursor: nwse-resize; }
                .handle-tr { top: -6px; right: -6px; cursor: nesw-resize; }
                .handle-bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
                .handle-br { bottom: -6px; right: -6px; cursor: nwse-resize; }
              ` : ''}
              img { 
                max-width: 100%; 
                height: auto; 
                transition: all 0.2s; 
                user-select: none !important; 
                -webkit-user-drag: none !important; 
              }
              ul { list-style-type: disc; padding-left: 2rem; }
              ol { list-style-type: decimal; padding-left: 2rem; }
            </style>
          </head>
          <body>
            <div id="capture-root">${sanitizedHTML}</div>
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
                  // Clone root to strip out temporary canvas editor helpers
                  const clone = root.cloneNode(true);
                  clone.querySelectorAll('#canvas-selection-overlay, .canvas-edit-overlay, .selected-canvas-item').forEach(el => el.remove());
                  window.parent.postMessage({
                    type: 'SYNC_HTML',
                    html: clone.innerHTML
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

              let savedRange = null;
              document.addEventListener('selectionchange', () => {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0);
                  if (root.contains(range.commonAncestorContainer)) {
                    savedRange = range.cloneRange();
                  }
                }
              });

              window.addEventListener('message', (event) => {
                const { type, command, value, id, src, width } = event.data;
                if (type === 'EXEC_COMMAND') {
                  root.focus();
                  if (savedRange) {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(savedRange);
                  }
                  
                  // PowerPoint-style commands and operations
                  if (command === 'insertTextBox') {
                    const div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = '100px';
                    div.style.top = '100px';
                    div.style.width = '300px';
                    div.style.minHeight = '50px';
                    div.style.padding = '8px';
                    div.style.boxSizing = 'border-box';
                    div.style.zIndex = '10';
                    
                    const bgStyle = window.getComputedStyle(slideContainer);
                    const isDark = bgStyle.backgroundColor.includes('rgba(0, 0, 0, 0)') || 
                                   bgStyle.backgroundImage.includes('linear-gradient') || 
                                   (parseFloat(bgStyle.backgroundColor.match(/\\d+/g)?.[0] || '255') < 100);
                    div.style.color = isDark ? '#ffffff' : '#0f172a';
                    div.style.fontSize = '24px';
                    div.style.fontFamily = 'Inter, sans-serif';
                    div.innerHTML = 'Double click to edit text';
                    slideContainer.appendChild(div);
                    
                    selectedElement = div;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  } else if (command === 'insertShape') {
                    const div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = '150px';
                    div.style.top = '150px';
                    div.style.width = '200px';
                    div.style.height = '150px';
                    div.style.backgroundColor = '#4f46e5';
                    div.style.boxSizing = 'border-box';
                    div.style.zIndex = '5';
                    
                    if (value === 'circle') {
                      div.style.borderRadius = '50%';
                      div.style.width = '150px';
                      div.style.height = '150px';
                    } else if (value === 'rectangle') {
                      div.style.borderRadius = '8px';
                    } else if (value === 'triangle') {
                      div.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                      div.style.width = '150px';
                      div.style.height = '150px';
                    } else if (value === 'star') {
                      div.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                      div.style.backgroundColor = '#eab308';
                      div.style.width = '160px';
                      div.style.height = '160px';
                    } else if (value === 'arrow') {
                      div.style.clipPath = 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)';
                      div.style.backgroundColor = '#ef4444';
                      div.style.width = '180px';
                      div.style.height = '100px';
                    } else if (value === 'card') {
                      div.className = 'card p-6 bg-slate-900/80 border border-slate-800 backdrop-blur rounded-2xl shadow-xl';
                      div.style.color = '#ffffff';
                      div.style.width = '350px';
                      div.style.height = '200px';
                      div.innerHTML = '<h3 class="text-xl font-bold mb-2">Card Title</h3><p class="text-slate-400 text-sm">Add details...</p>';
                    } else if (value === 'callout') {
                      div.className = 'card p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl';
                      div.style.color = '#ffffff';
                      div.style.width = '240px';
                      div.style.height = '120px';
                      div.innerHTML = '<p class="text-xs text-slate-300">💡 Double click to type callout...</p>';
                    }
                    slideContainer.appendChild(div);
                    
                    selectedElement = div;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  } else if (command === 'insertIcon') {
                    // Render emojis directly as native CDNs-free lightweight scalable symbols
                    const div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = '200px';
                    div.style.top = '200px';
                    div.style.fontSize = '64px';
                    div.style.lineHeight = '1';
                    div.style.zIndex = '10';
                    div.style.cursor = 'move';
                    div.innerHTML = value;
                    slideContainer.appendChild(div);
                    
                    selectedElement = div;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  } else if (command === 'insertImage') {
                    const img = document.createElement('img');
                    img.src = value;
                    img.style.position = 'absolute';
                    img.style.left = '100px';
                    img.style.top = '100px';
                    img.style.maxWidth = '350px';
                    img.style.height = 'auto';
                    img.style.zIndex = '8';
                    slideContainer.appendChild(img);
                    
                    selectedElement = img;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  } else if (command === 'insertTable') {
                    const div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = '100px';
                    div.style.top = '100px';
                    div.style.width = '500px';
                    div.style.zIndex = '10';
                    div.style.boxSizing = 'border-box';
                    div.innerHTML = value;
                    slideContainer.appendChild(div);
                    
                    selectedElement = div;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  } else if (command === 'bringToFront') {
                    if (selectedElement) {
                      const siblings = Array.from(selectedElement.parentNode.children).filter(el => el !== overlay);
                      let maxZ = 0;
                      siblings.forEach(el => {
                        const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
                        if (z > maxZ && z < 99999) maxZ = z;
                      });
                      selectedElement.style.zIndex = maxZ + 1;
                    }
                  } else if (command === 'sendToBack') {
                    if (selectedElement) {
                      const siblings = Array.from(selectedElement.parentNode.children).filter(el => el !== overlay);
                      let minZ = 0;
                      siblings.forEach(el => {
                        const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
                        if (z < minZ) minZ = z;
                      });
                      selectedElement.style.zIndex = Math.max(0, minZ - 1);
                    }
                  } else if (command === 'duplicate') {
                    if (selectedElement) {
                      const clone = selectedElement.cloneNode(true);
                      clone.classList.remove('selected-canvas-item');
                      const left = (parseFloat(clone.style.left) || 0) + 20;
                      const top = (parseFloat(clone.style.top) || 0) + 20;
                      clone.style.left = left + 'px';
                      clone.style.top = top + 'px';
                      selectedElement.parentNode.appendChild(clone);
                      selectedElement = clone;
                      updateOverlay();
                      window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                    }
                  } else if (command === 'deleteElement') {
                    if (selectedElement) {
                      selectedElement.remove();
                      selectedElement = null;
                      updateOverlay();
                      window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: false }, '*');
                    }
                   } else if (command === 'setElementStyle') {
                    const data = JSON.parse(value);
                    const isBgProp = data.property === 'background' || data.property === 'backgroundImage' || data.property === 'backgroundColor';
                    const target = isBgProp ? slideContainer : (selectedElement || slideContainer);
                    if (target) {
                      target.style[data.property] = data.value;
                      if (selectedElement) updateOverlay();
                    }
                  } else {
                    const cmd = command === 'hiliteColor' ? 'backColor' : command;
                    
                    // Format selectedElement properties if active and no text selection highlighted
                    const activeSel = window.getSelection();
                    const hasTextSelection = activeSel && activeSel.toString().length > 0;
                    
                    if (selectedElement && !hasTextSelection) {
                      if (cmd === 'bold') {
                        selectedElement.style.fontWeight = selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold';
                      } else if (cmd === 'italic') {
                        selectedElement.style.fontStyle = selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
                      } else if (cmd === 'underline') {
                        selectedElement.style.textDecoration = selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline';
                      } else if (cmd === 'strikeThrough') {
                        selectedElement.style.textDecoration = selectedElement.style.textDecoration === 'line-through' ? 'none' : 'line-through';
                      } else if (cmd === 'foreColor') {
                        selectedElement.style.color = value;
                      } else if (cmd === 'fontName') {
                        selectedElement.style.fontFamily = value;
                      } else if (cmd === 'fontSize') {
                        const sizes = { '1': '12px', '2': '14px', '3': '16px', '4': '20px', '5': '24px', '6': '32px', '7': '48px' };
                        selectedElement.style.fontSize = sizes[value] || value;
                      } else if (cmd === 'justifyLeft' || cmd === 'justifyCenter' || cmd === 'justifyRight') {
                        const aligns = { 'justifyLeft': 'left', 'justifyCenter': 'center', 'justifyRight': 'right' };
                        selectedElement.style.textAlign = aligns[cmd];
                      } else if (cmd === 'insertUnorderedList') {
                        selectedElement.innerHTML = '<ul><li>' + selectedElement.innerHTML + '</li></ul>';
                      } else if (cmd === 'createLink') {
                        selectedElement.innerHTML = '<a href="' + value + '" target="_blank" style="color: inherit; text-decoration: underline;">' + selectedElement.innerHTML + '</a>';
                      } else {
                        document.execCommand(cmd, false, value);
                      }
                      if (selectedElement) updateOverlay();
                    } else {
                      document.execCommand(cmd, false, value);
                    }
                  }
                  sync();
                } else if (type === 'UPDATE_IMAGE') {
                  const img = document.getElementById(id);
                  if (img) {
                    if (src) img.src = src;
                    if (width) img.style.width = width.includes('%') || width.includes('px') ? width : width + 'px';
                    sync();
                  }
                } else if (type === 'DELETE_IMAGE') {
                  const img = document.getElementById(id);
                  if (img) {
                    img.remove();
                    sync();
                    window.parent.postMessage({ type: 'IMAGE_DESELECTED' }, '*');
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

              ${isVisualEdit ? `
              // Canva-like canvas overlay resizer and positioning editor
              const slideContainer = root.querySelector('.slide-container') || root;
              let selectedElement = null;
              let dragTarget = null;
              let resizeMode = null; // 'tl' | 'tr' | 'bl' | 'br'

              let startX, startY;
              let startLeft, startTop;
              let startWidth, startHeight;
              let isDraggingInitiated = false;

              // Dynamically build Canva Selection Overlay Overlay layer inside the Slide Container
              const overlay = document.createElement('div');
              overlay.id = 'canvas-selection-overlay';
              overlay.className = 'canvas-edit-overlay';
              overlay.style.display = 'none';

              const positions = ['tl', 'tr', 'bl', 'br'];
              positions.forEach(pos => {
                const handle = document.createElement('div');
                handle.className = 'canvas-resize-handle handle-' + pos + ' canvas-edit-overlay';
                handle.dataset.handle = pos;
                overlay.appendChild(handle);
              });
              slideContainer.appendChild(overlay);

              // Helper function to update selector overlay box relative to selectedElement bounds
              const updateOverlay = () => {
                if (!selectedElement || !selectedElement.parentNode) {
                  overlay.style.display = 'none';
                  return;
                }
                const rect = selectedElement.getBoundingClientRect();
                const parentRect = slideContainer.getBoundingClientRect();

                overlay.style.display = 'block';
                overlay.style.left = (rect.left - parentRect.left) + 'px';
                overlay.style.top = (rect.top - parentRect.top) + 'px';
                overlay.style.width = rect.width + 'px';
                overlay.style.height = rect.height + 'px';
              };

              // Walk up to find logical content elements (cards, headings, paragraphs, buttons, lists)
              const getLogicalElement = (el) => {
                let target = el;
                const isLogical = (node) => {
                  const tag = node.tagName.toLowerCase();
                  if (tag === 'img' || tag === 'svg' || tag === 'button' || tag === 'table' || tag === 'li' || tag === 'a') return true;
                  if (node.classList.contains('card') || node.classList.contains('item') || node.classList.contains('badge') || node.classList.contains('section-tag')) return true;
                  if (/^h[1-6]$/.test(tag) || tag === 'p' || tag === 'blockquote') return true;
                  if (tag === 'div' && !node.classList.contains('slide-container') && !node.classList.contains('comparison-grid') && !node.classList.contains('grid') && !node.classList.contains('accent-ring') && !node.classList.contains('accent-ring-2') && !node.classList.contains('canvas-edit-overlay') && !node.classList.contains('canvas-resize-handle')) {
                    return true;
                  }
                  return false;
                };

                while (target && target.parentNode !== slideContainer && target.parentNode !== root && target.parentNode !== document.body) {
                  if (isLogical(target)) return target;
                  target = target.parentNode;
                }
                return (target !== slideContainer && target !== root && target !== document.body) ? target : null;
              };

              document.addEventListener('mousedown', (e) => {
                // Ignore right clicks or clicks on handles/overlay
                if (e.button !== 0) return;

                // Clicked a corner handle
                if (e.target.classList.contains('canvas-resize-handle')) {
                  resizeMode = e.target.dataset.handle;
                  startX = e.clientX;
                  startY = e.clientY;

                  const rect = selectedElement.getBoundingClientRect();
                  const parentRect = slideContainer.getBoundingClientRect();

                  startLeft = parseFloat(selectedElement.style.left) || (rect.left - parentRect.left);
                  startTop = parseFloat(selectedElement.style.top) || (rect.top - parentRect.top);
                  startWidth = rect.width;
                  startHeight = rect.height;

                  e.stopPropagation();
                  e.preventDefault();
                  return;
                }

                // If user clicked inside active contenteditable text, ignore so cursor works
                const isTextEditing = e.target.getAttribute('contenteditable') === 'true' || e.target.closest('[contenteditable="true"]');
                if (isTextEditing) return; // Allow placing cursors inside active text frame!

                // Identify logical component target
                const target = getLogicalElement(e.target);
                if (!target) {
                  // Clicked off any logical item -> Deselect
                  if (e.target === root || e.target === document.body || e.target === slideContainer) {
                    selectedElement = null;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: false }, '*');
                  }
                  return;
                }

                selectedElement = target;
                updateOverlay();
                window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');

                dragTarget = target;
                startX = e.clientX;
                startY = e.clientY;

                const rect = dragTarget.getBoundingClientRect();
                const parentRect = slideContainer.getBoundingClientRect();

                startLeft = parseFloat(dragTarget.style.left) || (rect.left - parentRect.left);
                startTop = parseFloat(dragTarget.style.top) || (rect.top - parentRect.top);
                startWidth = rect.width;
                startHeight = rect.height;

                isDraggingInitiated = false;
              });

              document.addEventListener('dblclick', (e) => {
                const target = getLogicalElement(e.target);
                if (target) {
                  // Only make text elements contenteditable
                  const tag = target.tagName.toLowerCase();
                  const isTextTag = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'button', 'a', 'blockquote'].includes(tag) || 
                                    (tag === 'div' && !target.classList.contains('slide-container'));
                  
                  if (isTextTag) {
                    target.setAttribute('contenteditable', 'true');
                    target.focus();
                    
                    // Select all text inside on focus
                    const range = document.createRange();
                    range.selectNodeContents(target);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    
                    target.style.cursor = 'text';
                    
                    target.addEventListener('blur', () => {
                      target.removeAttribute('contenteditable');
                      target.style.cursor = '';
                      sync();
                    }, { once: true });
                  }
                } else {
                  // Clicked on empty slide container background -> create new text box at click coordinates
                  const rect = slideContainer.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const div = document.createElement('div');
                  div.style.position = 'absolute';
                  
                  // Clamp coordinate values to stay fully inside layout canvas
                  const left = Math.max(20, Math.min(x, 1280 - 320));
                  const top = Math.max(20, Math.min(y, 720 - 70));
                  div.style.left = left + 'px';
                  div.style.top = top + 'px';
                  
                  div.style.width = '300px';
                  div.style.minHeight = '50px';
                  div.style.padding = '8px';
                  div.style.boxSizing = 'border-box';
                  div.style.zIndex = '10';
                  
                  const bgStyle = window.getComputedStyle(slideContainer);
                  const isDark = bgStyle.backgroundColor.includes('rgba(0, 0, 0, 0)') || 
                                 bgStyle.backgroundImage.includes('linear-gradient') || 
                                 (parseFloat(bgStyle.backgroundColor.match(/\\d+/g)?.[0] || '255') < 100);
                  div.style.color = isDark ? '#ffffff' : '#0f172a';
                  div.style.fontSize = '24px';
                  div.style.fontFamily = 'Inter, sans-serif';
                  div.innerHTML = 'Double click to type...';
                  slideContainer.appendChild(div);
                  
                  selectedElement = div;
                  updateOverlay();
                  window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: true }, '*');
                  
                  // Focus it immediately
                  div.setAttribute('contenteditable', 'true');
                  div.focus();
                  
                  div.addEventListener('blur', () => {
                    div.removeAttribute('contenteditable');
                    sync();
                  }, { once: true });
                  
                  sync();
                }
              });

              document.addEventListener('mousemove', (e) => {
                // 1. Handling Corners resizing mode
                if (resizeMode && selectedElement) {
                  const dx = e.clientX - startX;
                  const dy = e.clientY - startY;

                  e.preventDefault();

                  if (resizeMode === 'br') {
                    selectedElement.style.width = Math.max(20, startWidth + dx) + 'px';
                    selectedElement.style.height = Math.max(20, startHeight + dy) + 'px';
                  } else if (resizeMode === 'bl') {
                    const newW = Math.max(20, startWidth - dx);
                    if (newW > 20) {
                      selectedElement.style.width = newW + 'px';
                      selectedElement.style.left = (startLeft + dx) + 'px';
                    }
                    selectedElement.style.height = Math.max(20, startHeight + dy) + 'px';
                  } else if (resizeMode === 'tr') {
                    selectedElement.style.width = Math.max(20, startWidth + dx) + 'px';
                    const newH = Math.max(20, startHeight - dy);
                    if (newH > 20) {
                      selectedElement.style.height = newH + 'px';
                      selectedElement.style.top = (startTop + dy) + 'px';
                    }
                  } else if (resizeMode === 'tl') {
                    const newW = Math.max(20, startWidth - dx);
                    if (newW > 20) {
                      selectedElement.style.width = newW + 'px';
                      selectedElement.style.left = (startLeft + dx) + 'px';
                    }
                    const newH = Math.max(20, startHeight - dy);
                    if (newH > 20) {
                      selectedElement.style.height = newH + 'px';
                      selectedElement.style.top = (startTop + dy) + 'px';
                    }
                  }

                  updateOverlay();
                  sync();
                  return;
                }

                // 2. Handling Drag Move Mode
                if (!dragTarget) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (!isDraggingInitiated) {
                  const dist = Math.hypot(dx, dy);
                  if (dist > 5) {
                    isDraggingInitiated = true;

                    // Convert item layout styles to absolute
                    const style = window.getComputedStyle(dragTarget);
                    if (style.position !== 'absolute') {
                      dragTarget.style.position = 'absolute';
                      dragTarget.style.left = startLeft + 'px';
                      dragTarget.style.top = startTop + 'px';
                      dragTarget.style.width = startWidth + 'px';
                      dragTarget.style.height = startHeight + 'px';
                      dragTarget.style.margin = '0';
                    }
                  }
                }

                if (isDraggingInitiated) {
                  e.preventDefault();
                  
                  dragTarget.style.left = (startLeft + dx) + 'px';
                  dragTarget.style.top = (startTop + dy) + 'px';
                  
                  updateOverlay();
                  sync();
                }
              });

              document.addEventListener('mouseup', (e) => {
                if (isDraggingInitiated || resizeMode) {
                  e.preventDefault();
                }
                dragTarget = null;
                resizeMode = null;
                isDraggingInitiated = false;
              });

              // Canva-style Backspace/Delete keyboard element removal
              document.addEventListener('keydown', (e) => {
                if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
                  // Do not delete if editing inside input or editing paragraph characters
                  const active = document.activeElement;
                  const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true');
                  
                  if (!isTyping) {
                    selectedElement.remove();
                    selectedElement = null;
                    updateOverlay();
                    window.parent.postMessage({ type: 'ELEMENT_SELECTED', hasSelection: false }, '*');
                    sync();
                    e.preventDefault();
                  }
                }
              });

              document.addEventListener('dragstart', (e) => {
                e.preventDefault();
              });
              ` : ''}
            </script>
          </body>
        </html>
      `;
      setSrcDoc(newSrcDoc);
    }
  }, [code, isVisualEdit, isReady]);

  return (
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
  );
};

export default PreviewFrame;
