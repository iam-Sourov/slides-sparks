import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Slide } from '../types';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Pre-load all 1500+ solid FontAwesome SVG paths offline so the exporter evaluates them transparently 
// as standard native XML elements instead of inaccessible remote CDN fonts.
library.add(fas);

/**
 * Robustly saves a blob with a specific filename by attaching an anchor to the actual DOM.
 * This prevents browsers from ignoring the download attribute and falling back to the Blob UUID.
 */
const saveFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

// PowerPoint 16:9 Standard dimensions in inches
const PPT_WIDTH_IN = 10;
const PPT_HEIGHT_IN = 5.625;
const HTML_WIDTH_PX = 1280;
const HTML_HEIGHT_PX = 720;

/**
 * Converts pixels to inches for PPT conversion
 */
const pxToIn = (px: number) => (px * PPT_WIDTH_IN) / HTML_WIDTH_PX;
const pxToInH = (px: number) => (px * PPT_HEIGHT_IN) / HTML_HEIGHT_PX;

/**
 * Converts CSS RGB/RGBA strings to PPT Hex
 */
const rgbToHex = (rgb: string) => {
  if (!rgb || rgb === 'transparent' || rgb.includes('rgba(0, 0, 0, 0)')) return undefined;
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/) || rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (!match) return undefined;
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

/**
 * Robustly converts an image URL to a Base64 string for PPTX.
 * Uses a proxy to bypass CORS and force PNG conversion for PPTX compatibility.
 */
const toBase64 = async (url: string): Promise<string | null> => {
  if (!url || url.startsWith('data:')) return url;

  // Use a proxy service that handles CORS and allows conversion.
  // We force &output=png because PowerPoint handles PNGs more reliably than WebP.
  const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=png`;

  const fetchAsBase64 = async (targetUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(targetUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn(`Fetch failed for ${targetUrl}:`, e);
      return null;
    }
  };

  // 1. Try proxy first (most reliable for external/CORS-heavy domains like gensparksite.com)
  let result = await fetchAsBase64(proxiedUrl);
  if (result) return result;

  // 2. Try direct fetch if proxy fails
  result = await fetchAsBase64(url);
  if (result) return result;

  // 3. Last-ditch canvas fallback (may fail due to taint)
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch (e) {
        console.warn('Canvas fallback failed:', e);
      }
      resolve(null);
    };
    img.onerror = () => {
      console.warn('Image load failed for canvas fallback:', url);
      resolve(null);
    };
    img.src = url;
  });
};


/**
 * Detects specialized WebFont and Icon containers
 */
const isIconFont = (el: HTMLElement) => {
  return el.tagName === 'I' || el.classList.contains('material-icons') || Array.from(el.classList).some(c => c.startsWith('fa-') || c.startsWith('lucide'));
};

/**
 * Extracts unified text arrays to allow PowerPoint to handle native text flow correctly (bolding, spacing)
 * without utilizing explicit independent geometry shapes that cause overlaps.
 */
const extractTextSegments = (el: HTMLElement, segments: any[] = []) => {
  const style = window.getComputedStyle(el);
  const color = rgbToHex(style.color) || '000000';
  const isBold = parseInt(style.fontWeight) >= 600;
  const isItalic = style.fontStyle === 'italic';
  const fontSizeFactor = (PPT_WIDTH_IN * 72) / HTML_WIDTH_PX;
  const fontSize = Math.max(6, parseFloat(style.fontSize) * fontSizeFactor);
  let fontFace = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      let text = child.textContent || '';
      if (text.trim().length > 0 || text.includes(' ')) {
        text = text.replace(/\s+/g, ' ');
        if (style.textTransform === 'uppercase') text = text.toUpperCase();
        else if (style.textTransform === 'lowercase') text = text.toLowerCase();

        segments.push({
          text,
          options: { color, bold: isBold, italic: isItalic, fontSize, fontFace }
        });
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as HTMLElement;
      if (isIconFont(childEl) || childEl.tagName === 'SVG' || childEl.tagName === 'IMG') {
        continue;
      }
      const disp = window.getComputedStyle(childEl).display;
      if (disp.includes('inline')) {
        extractTextSegments(childEl, segments);
      } else if (childEl.tagName === 'BR') {
        segments.push({ text: '\n', options: {} });
      }
    }
  }
  return segments;
};

/**
 * Synchronously translates external WebFont icons (like FontAwesome/Material) into pure transparent PNGs natively.
 * Bypasses cross-origin CSS security policies and offline PowerPoint WebFont unavailability.
 */
const rasterizeFontIconToDataUrl = (element: HTMLElement): string | undefined => {
  const win = element.ownerDocument.defaultView || window;
  let pseudo = '::before';
  let compStyle = win.getComputedStyle(element, pseudo);
  let content = compStyle.getPropertyValue('content');

  if (!content || content === 'none' || content === 'normal') {
    pseudo = '::after';
    compStyle = win.getComputedStyle(element, pseudo);
    content = compStyle.getPropertyValue('content');
  }

  if (!content || content === 'none' || content === 'normal') {
    compStyle = win.getComputedStyle(element);
    content = element.innerText?.trim();
  } else {
    // Strip quotes from evaluated computed styles (e.g. '"\f1ec"' -> '\f1ec')
    content = content.replace(/^["']|["']$/g, '');
  }

  if (!content) return undefined;

  const canvas = document.createElement('canvas');
  const scale = 4;
  const size = parseFloat(compStyle.fontSize) || 16;
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, size);
  const height = Math.max(rect.height, size);

  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) return undefined;

  ctx.scale(scale, scale);
  // Reconstruct exact WebFont syntax explicitly mapping to the loaded document buffer
  ctx.font = `${compStyle.fontWeight} ${size}px ${compStyle.fontFamily}`;
  ctx.fillStyle = compStyle.color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.fillText(content, width / 2, height / 2);

  return canvas.toDataURL('image/png');
};

/**
 * Bulletproof pure XML SVG embed generator.
 * Sidesteps all Canvas distortion bugs natively by passing the strictly formatted ASCII SVG binary direct to PowerPoint vector engine.
 */
const getSvgDataUrl = (svgElement: SVGElement, rect: DOMRect, color: string): string | undefined => {
  try {
    const clone = svgElement.cloneNode(true) as SVGElement;
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const w = parseInt(clone.getAttribute('width') || String(rect.width)) || 24;
    const h = parseInt(clone.getAttribute('height') || String(rect.height)) || 24;
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // Explicit sizing isolates bounds so PowerPoint does not squish the geometry into a simple hyphen (-) 
    clone.setAttribute('width', String(Math.max(w, 10)));
    clone.setAttribute('height', String(Math.max(h, 10)));

    const replaceColor = (el: Element) => {
      if (el.getAttribute('stroke') === 'currentColor') el.setAttribute('stroke', color);
      if (el.getAttribute('fill') === 'currentColor') el.setAttribute('fill', color);
      const st = (el as SVGElement).style;
      if (st) {
        if (st.stroke === 'currentColor') st.stroke = color;
        if (st.fill === 'currentColor') st.fill = color;
      }
      for (let i = 0; i < el.children.length; i++) replaceColor(el.children[i]);
    };
    replaceColor(clone);

    const svgData = new XMLSerializer().serializeToString(clone);
    const encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
    return `data:image/svg+xml;base64,${encodedData}`;
  } catch (e) {
    return undefined;
  }
};

/**
 * Maps an element and its children to native PPTX objects recursively to maintain 100% editability.
 */
const mapHtmlToNativePpt = async (
  element: HTMLElement,
  pptSlide: any,
  rootRect: DOMRect,
  pres: any,
  imageCache: Map<string, string>
) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

  const win = element.ownerDocument.defaultView || window;
  const style = win.getComputedStyle(element);

  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

  const rect = element.getBoundingClientRect();
  const relX = pxToIn(rect.left - rootRect.left);
  const relY = pxToInH(rect.top - rootRect.top);
  const relW = pxToIn(rect.width);
  const relH = pxToInH(rect.height);

  if (rect.width < 1 || rect.height < 1) return;

  // 1. Fully Editable Backgrounds, Borders & Shadows (Layout Rectangles)
  const bgColor = rgbToHex(style.backgroundColor);
  const btWidth = parseFloat(style.borderTopWidth) || 0;
  const bbWidth = parseFloat(style.borderBottomWidth) || 0;
  const blWidth = parseFloat(style.borderLeftWidth) || 0;
  const brWidth = parseFloat(style.borderRightWidth) || 0;
  
  const hasUniformBorder = btWidth > 0 && btWidth === bbWidth && btWidth === blWidth && btWidth === brWidth;
  const hasAsymmetricBorder = !hasUniformBorder && (btWidth > 0 || bbWidth > 0 || blWidth > 0 || brWidth > 0);
  
  let shadowOptions: any = undefined;
  if (style.boxShadow && style.boxShadow !== 'none') {
    const shadowStr = style.boxShadow;
    const shadowMatch = shadowStr.match(/(rgba?\([^)]+\)|#[a-fA-F0-9]+)\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/);
    if (shadowMatch) {
      const colorStr = shadowMatch[1];
      const offsetX = parseFloat(shadowMatch[2]);
      const offsetY = parseFloat(shadowMatch[3]);
      const blur = parseFloat(shadowMatch[4]);
      
      let hexColor = '000000';
      let opacity = 0.15;
      
      const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        hexColor = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        if (rgbMatch[4]) opacity = parseFloat(rgbMatch[4]);
      }
      
      const ptOffsetX = pxToIn(offsetX) * 72;
      const ptOffsetY = pxToInH(offsetY) * 72;
      const ptBlur = pxToIn(blur) * 72;
      
      const angle = Math.atan2(ptOffsetY, ptOffsetX) * (180 / Math.PI);
      const normalizedAngle = angle < 0 ? angle + 360 : angle;
      const offset = Math.sqrt(ptOffsetX * ptOffsetX + ptOffsetY * ptOffsetY);
      
      shadowOptions = {
        type: 'outer',
        color: hexColor,
        opacity: opacity,
        blur: ptBlur || 4,
        offset: offset || 2,
        angle: normalizedAngle || 45
      };
    } else {
      shadowOptions = { type: 'outer', color: '000000', opacity: 0.08, blur: 5, offset: 3, angle: 45 };
    }
  }

  if (bgColor || hasUniformBorder || shadowOptions) {
    const rx = parseFloat(style.borderRadius) || 0;
    pptSlide.addShape(rx > 0 ? pres.ShapeType.roundRect : pres.ShapeType.rect, {
      x: relX, y: relY, w: relW, h: relH,
      fill: bgColor ? { color: bgColor } : undefined,
      line: hasUniformBorder ? {
        color: rgbToHex(style.borderTopColor) || rgbToHex(style.borderColor) || '000000',
        width: Math.max(0.5, btWidth * ((PPT_WIDTH_IN * 72) / HTML_WIDTH_PX))
      } : undefined,
      shadow: shadowOptions,
      rectRadius: rx > 0 ? Math.min(rx / rect.width, 0.5) : undefined
    });
  } else if (hasAsymmetricBorder && (bgColor || shadowOptions)) {
    const rx = parseFloat(style.borderRadius) || 0;
    pptSlide.addShape(rx > 0 ? pres.ShapeType.roundRect : pres.ShapeType.rect, {
      x: relX, y: relY, w: relW, h: relH,
      fill: bgColor ? { color: bgColor } : undefined,
      shadow: shadowOptions,
      rectRadius: rx > 0 ? Math.min(rx / rect.width, 0.5) : undefined
    });
  }

  if (hasAsymmetricBorder) {
    const drawLine = (w: number, colorStyle: string, lx: number, ly: number, lengthX: number, lengthY: number) => {
      if (w <= 0 || colorStyle === 'transparent' || colorStyle.includes('rgba(0, 0, 0, 0)')) return;
      const ptWidth = Math.max(0.5, w * ((PPT_WIDTH_IN * 72) / HTML_WIDTH_PX));
      const lColor = rgbToHex(colorStyle) || '000000';
      pptSlide.addShape(pres.ShapeType.line, {
        x: lx, y: ly, w: lengthX, h: lengthY,
        line: { color: lColor, width: ptWidth }
      });
    };
    drawLine(btWidth, style.borderTopColor, relX, relY, relW, 0);
    drawLine(bbWidth, style.borderBottomColor, relX, relY + relH, relW, 0);
    drawLine(blWidth, style.borderLeftColor, relX, relY, 0, relH);
    drawLine(brWidth, style.borderRightColor, relX + relW, relY, 0, relH);
  }

  // 2. Native Table Translation
  if (element.tagName === 'TABLE') {
    const tableEl = element as HTMLTableElement;
    // PPTX addTable doesn't support complex inline vectors cleanly, 
    // so if the table has icons, fallback to the super-accurate shape visualizer
    const hasGraphics = element.querySelector('img, svg, i, [class*="fa-"], .material-icons, [class*="lucide"]');
    
    if (!hasGraphics && tableEl.rows.length > 0) {
      const pptRows: any[][] = [];
      Array.from(tableEl.rows).forEach((row) => {
        const pptRow: any[] = [];
        Array.from(row.cells).forEach((cell) => {
          const cellStyle = win.getComputedStyle(cell);
          const cellBgColor = rgbToHex(cellStyle.backgroundColor);
          
          const ptTop = (parseFloat(cellStyle.paddingTop) || 0) * 0.75;
          const ptRight = (parseFloat(cellStyle.paddingRight) || 0) * 0.75;
          const ptBottom = (parseFloat(cellStyle.paddingBottom) || 0) * 0.75;
          const ptLeft = (parseFloat(cellStyle.paddingLeft) || 0) * 0.75;
          
          let cellBorder: any = undefined;
          const bw = parseFloat(cellStyle.borderWidth);
          if (bw > 0) {
            cellBorder = { type: 'solid', pt: bw * 0.75, color: rgbToHex(cellStyle.borderColor) || '000000' };
          }

          const segments = extractTextSegments(cell);
          pptRow.push({
             text: segments,
             options: {
                 fill: cellBgColor ? { color: cellBgColor } : undefined,
                 margin: [ptTop, ptRight, ptBottom, ptLeft],
                 border: cellBorder,
                 colspan: cell.colSpan || 1,
                 rowspan: cell.rowSpan || 1,
                 valign: cellStyle.verticalAlign === 'middle' ? 'middle' : (cellStyle.verticalAlign === 'bottom' ? 'bottom' : 'top'),
                 align: cellStyle.textAlign === 'center' ? 'center' : (cellStyle.textAlign === 'right' ? 'right' : 'left'),
             }
          });
        });
        if (pptRow.length > 0) pptRows.push(pptRow);
      });
      
      const colWidths: number[] = [];
      Array.from(tableEl.rows[0].cells).forEach((cell) => {
          colWidths.push(pxToIn(cell.getBoundingClientRect().width));
      });

      if (pptRows.length > 0) {
        pptSlide.addTable(pptRows, {
            x: relX, y: relY, w: relW, h: relH,
            colW: colWidths.length > 0 ? colWidths : undefined
        });
        return; // Skip shape traversal, exported as native table
      }
    }
  }

  // 3. Layout Background Images
  const bgImage = style.backgroundImage;
  if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
    const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
    if (urlMatch) {
      const url = urlMatch[1];
      const data = imageCache.get(url);
      if (data) pptSlide.addImage({ data, x: relX, y: relY, w: relW, h: relH, sizing: { type: 'cover' } });
    }
  }

  // 4. Robust Icon & SVG Handling (Prevents [] missing text boxes & CORS errors)
  if (element.tagName === 'IMG' || element.tagName === 'SVG' || isIconFont(element)) {
    let data: string | undefined;
    if (element.tagName === 'IMG') {
      data = imageCache.get((element as HTMLImageElement).src);
    } else if (element.tagName === 'SVG') {
      const iconColor = style.color || '#000000';
      data = getSvgDataUrl(element as unknown as SVGElement, rect, iconColor);
    } else {
      data = rasterizeFontIconToDataUrl(element);
    }

    if (data) {
      pptSlide.addImage({ data, x: relX, y: relY, w: relW, h: relH, sizing: { type: 'contain' } });
    }
    return; // Stop recursive text mapping for visual objects
  }

  // 4. Aggregated Inline Text Formatting (Fixes inline overlap natively)
  let hasInlineText = false;
  const childNodes = Array.from(element.childNodes);

  for (const child of childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim().length) hasInlineText = true;
    else if (child.nodeType === Node.ELEMENT_NODE) {
      const childEl = child as HTMLElement;
      if (!isIconFont(childEl) && childEl.tagName !== 'SVG' && childEl.tagName !== 'IMG') {
        if (win.getComputedStyle(childEl).display.includes('inline')) {
          if (childEl.innerText && childEl.innerText.trim().length) hasInlineText = true;
        }
      }
    }
  }

  if (hasInlineText) {
    const segments = extractTextSegments(element);
    if (segments.length > 0) {
      const textAlign = (['left', 'center', 'right', 'justify'].includes(style.textAlign) ? style.textAlign : 'left') as any;
      let valign: 'top' | 'middle' | 'bottom' = 'top';
      if (style.display === 'flex' || style.display === 'inline-flex') {
        if (style.alignItems === 'center') valign = 'middle';
        else if (style.alignItems === 'flex-end' || style.alignItems === 'end') valign = 'bottom';
      }

      const ptTop = (parseFloat(style.paddingTop) || 0) * 0.75;
      const ptRight = (parseFloat(style.paddingRight) || 0) * 0.75;
      const ptBottom = (parseFloat(style.paddingBottom) || 0) * 0.75;
      const ptLeft = (parseFloat(style.paddingLeft) || 0) * 0.75;

      pptSlide.addText(segments, {
        x: relX, y: relY, w: relW, h: relH,
        align: textAlign,
        valign: valign,
        breakLine: true,
        margin: [ptTop, ptRight, ptBottom, ptLeft],
        wrap: true
      });
    }
  }

  // 5. Recursive traversal (ONLY for structural non-inline block elements)
  for (const child of Array.from(element.children)) {
    const childEl = child as HTMLElement;
    const disp = win.getComputedStyle(childEl).display;
    const isGraphic = isIconFont(childEl) || childEl.tagName === 'SVG' || childEl.tagName === 'IMG';

    // Explicitly bypass inlined text structures here as they were formatted directly above
    if (!disp.includes('inline') || isGraphic) {
      await mapHtmlToNativePpt(childEl, pptSlide, rootRect, pres, imageCache);
    }
  }
};

/**
 * Capture sequence for PDF / PPTX Background
 */
const captureAsImage = async (iframe: HTMLIFrameElement, transparentText = false): Promise<string> => {
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) throw new Error("Iframe inaccessible");

  const root = doc.getElementById('capture-root') || doc.body;

  // OPTION A FIX: Guarantee all arbitrary FontAwesome WebFonts are dynamically pre-inlined 
  // into pure interactive <svg> DOM nodes containing physical path data prior to reading.
  await dom.i2svg({ node: root });

  // Freeze animations momentarily to prevent html2canvas from rendering mid-pulse (vanishing icons)
  const styleBlock = doc.createElement('style');
  styleBlock.innerHTML = `* { animation: none !important; transition: none !important; }`;
  doc.head.appendChild(styleBlock);

  // High Fidelity SVG fix: html2canvas drops SVGs because it strips the "currentColor" CSS context.
  // We hot-swap every SVG into a fully isolated Data-URI Image just for the snapshot.
  const svgs = Array.from(root.querySelectorAll('svg'));
  const originalSvgStates = svgs.map((svg) => {
    const compStyle = win.getComputedStyle(svg);
    const color = compStyle.color || '#000000';
    const width = compStyle.width || '24px';
    const height = compStyle.height || '24px';

    const clone = svg.cloneNode(true) as SVGElement;
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const replaceColor = (el: Element) => {
      if (el.getAttribute('stroke') === 'currentColor') el.setAttribute('stroke', color);
      if (el.getAttribute('fill') === 'currentColor') el.setAttribute('fill', color);
      if ((el as SVGElement).style) {
        if ((el as SVGElement).style.stroke === 'currentColor') (el as SVGElement).style.stroke = color;
        if ((el as SVGElement).style.fill === 'currentColor') (el as SVGElement).style.fill = color;
      }
      for (let i = 0; i < el.children.length; i++) replaceColor(el.children[i]);
    };
    replaceColor(clone);

    const svgString = new XMLSerializer().serializeToString(clone);
    const encodedData = win.btoa(unescape(encodeURIComponent(svgString)));

    const img = doc.createElement('img');
    img.src = `data:image/svg+xml;base64,${encodedData}`;
    img.className = svg.className;
    img.style.cssText = compStyle.cssText;
    img.style.width = width;
    img.style.height = height;
    img.style.margin = '0';
    img.style.padding = '0';

    const parent = svg.parentNode;
    const nextSibling = svg.nextSibling;
    parent?.insertBefore(img, svg);
    parent?.removeChild(svg);

    return { parent, nextSibling, svg, img };
  });

  // High Fidelity WebFont fix: html2canvas strictly isolates CDNs.
  // Rasterize all FontAwesome and generic layout symbols immediately to bypass cross-origin restrictions.
  const iconFonts = Array.from(root.querySelectorAll('i, .material-icons, [class*="fa-"]')).filter(el => {
    return el.tagName !== 'SVG' && el.tagName !== 'IMG' && isIconFont(el as HTMLElement);
  });

  const originalIconStates = iconFonts.map((iconNode) => {
    const el = iconNode as HTMLElement;
    const dataUrl = rasterizeFontIconToDataUrl(el);
    if (!dataUrl) return null;

    const img = doc.createElement('img');
    img.src = dataUrl;
    img.className = el.className;
    const compStyle = win.getComputedStyle(el);
    img.style.cssText = compStyle.cssText;
    const boundedW = el.getBoundingClientRect().width;
    const boundedH = el.getBoundingClientRect().height;
    img.style.width = compStyle.width !== 'auto' && boundedW > 0 ? compStyle.width : `${Math.max(boundedW, parseFloat(compStyle.fontSize))}px`;
    img.style.height = compStyle.height !== 'auto' && boundedH > 0 ? compStyle.height : `${Math.max(boundedH, parseFloat(compStyle.fontSize))}px`;
    img.style.objectFit = 'contain';
    img.style.margin = '0';
    img.style.padding = '0';

    const parent = el.parentNode;
    const nextSibling = el.nextSibling;
    parent?.insertBefore(img, el);
    parent?.removeChild(el);

    return { parent, nextSibling, icon: el, img };
  }).filter(Boolean) as any[];

  // Temporarily wipe text visually if requested (hybrid layout mode)
  const textWrappers: HTMLElement[] = [];
  if (transparentText) {
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 0) {
        const span = doc.createElement('span');
        span.style.color = 'transparent';
        span.style.textShadow = 'none';
        node.parentNode?.insertBefore(span, node);
        span.appendChild(node);
        textWrappers.push(span);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toLowerCase();
        if (tag !== 'svg' && tag !== 'img' && tag !== 'style' && tag !== 'script') {
          Array.from(node.childNodes).forEach(walk);
        }
      }
    };
    walk(root);
  }

  // Pre-process images to base64 to avoid CORS issues in html2canvas
  const images = Array.from(doc.querySelectorAll('img')).filter(img => !img.src.startsWith('data:'));
  await Promise.all(images.map(async (img) => {
    try {
      const base64 = await toBase64(img.src);
      if (base64) {
        img.src = base64;
      }
    } catch (e) {
      console.warn('Failed to pre-base64 image for PDF:', img.src);
    }
  }));

  // Wait for all images to be fully loaded (now as base64)
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  }));

  const canvas = await html2canvas(root, {
    window: win,
    document: doc,
    width: HTML_WIDTH_PX,
    height: HTML_HEIGHT_PX,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  } as any);

  // Restore DOM
  doc.head.removeChild(styleBlock);
  originalSvgStates.forEach(({ parent, nextSibling, svg, img }) => {
    if (parent && img.parentNode === parent) {
      parent.insertBefore(svg, nextSibling);
      parent.removeChild(img);
    }
  });

  originalIconStates.forEach(({ parent, nextSibling, icon, img }) => {
    if (parent && img.parentNode === parent) {
      parent.insertBefore(icon, nextSibling);
      parent.removeChild(img);
    }
  });

  if (transparentText) {
    textWrappers.forEach(span => {
      const parent = span.parentNode;
      if (parent) {
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      }
    });
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Main Export Orchestrator
 */
export const exportSlides = async (
  slides: Slide[],
  refMap: Map<string, HTMLIFrameElement>,
  type: 'PDF' | 'PPTX'
) => {
  const timestamp = Date.now();
  const fileName = `presentation_${timestamp}`;

  if (type === 'PDF') {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167.0625] });
    for (let i = 0; i < slides.length; i++) {
      const ref = refMap.get(slides[i].id);
      if (ref) {
        const imgData = await captureAsImage(ref);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 167.0625);
      }
    }
    const blob = pdf.output('blob');
    saveFile(blob, `${fileName}.pdf`);
  } else {
    // PPTX Logic
    // PPTX Logic: 100% Native Layout Mapping for strict editability
    const PptxGen = (pptxgen as any).default || pptxgen;
    const pres = new PptxGen();
    pres.layout = 'LAYOUT_16x9';

    for (let i = 0; i < slides.length; i++) {
      try {
        const ref = refMap.get(slides[i].id);
        const doc = ref?.contentDocument;
        const win = ref?.contentWindow;
        if (!ref || !doc || !win) continue;

        const root = doc.getElementById('capture-root');
        if (!root) continue;

        const pptSlide = pres.addSlide();
        const rootRect = root.getBoundingClientRect();

        const imgElements = Array.from(doc.querySelectorAll('img'));
        const imageCache = new Map<string, string>();

        const allElements = Array.from(doc.querySelectorAll('*'));
        const bgImageUrls: string[] = [];
        allElements.forEach(el => {
          const style = win.getComputedStyle(el);
          const bgImage = style.backgroundImage;
          if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
            const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
            if (urlMatch) bgImageUrls.push(urlMatch[1]);
          }
        });

        const uniqueUrls = Array.from(new Set([...imgElements.map(img => img.src), ...bgImageUrls]));

        await Promise.all(uniqueUrls.map(async (url) => {
          const base64 = await toBase64(url);
          if (base64) imageCache.set(url, base64);
        }));

        await mapHtmlToNativePpt(root as HTMLElement, pptSlide, rootRect, pres, imageCache);

      } catch (err) {
        console.error(`Failed to process slide ${slides[i].id}:`, err);
      }
    }

    const arrayBuffer = await pres.write({ outputType: 'ARRAYBUFFER' }) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    saveFile(blob, `${fileName}.pptx`);
  }
};