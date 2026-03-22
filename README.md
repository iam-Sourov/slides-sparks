<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Slides Sparks 

A powerful **WYSIWYG Visual Editor** and **High-Fidelity Presentation Exporter** built with React & Vite. Create beautiful, highly-styled Tailwind CSS slides and export them mathematically as native, 100% editable PowerPoint `.pptx` documents or crisp `.pdf` files.
</div>

## ✨ Core Features

- **WYSIWYG Visual Editing:** A robust editing frame preventing cross-boundary focus-loss, ensuring real-time structural edits (bold, underline, font resizing) and real-time color picking natively in the browser frame.
- **Advanced HTML-to-PPTX Calculus:**
  - **Native Geometry Translations:** Parses raw CSS `.class` styling into native `.pptx` polygons.
  - **Asymmetric Borders Mapping:** Accurately converts non-uniform CSS boundaries (e.g. `border-b-4`) to individual explicit layout lines in PowerPoint.
  - **Drop-Shadow Precision:** Custom regex algorithm that computes real horizontal/vertical CSS vectors into authentic radial PowerPoint shadows.
  - **Translucent RGBA Arrays:** Correctly calculates HTML alpha strings inside `background-colors` and applies pure native scale transparency settings to output objects.
- **Auto-Adaptive Native Tables:** Intelligently checks `<table>` arrays for nested vectors. If standard, exports as purely interactive PowerPoint tables inside the `.pptx`. If graphics/SVGs are identified internally, safely falls back to geometric shape visual rendering to guarantee zero data loss.
- **High-Fidelity Vector & Font Support:** Instantly rasterizes icon stacks organically prior to PPT serialization to avoid broken remote CDN font faces.

## 🚀 Technical Stack

- **React / TypeScript:** Frontend interface and component tree.
- **Tailwind CSS:** Slide template visual structure framework.
- **PptxGenJS:** Foundation structural mapping framework for raw `.pptx` XML generation.
- **html2canvas / jsPDF:** Fallback PDF artifact generator.

## 🛠️ Local Development

**Prerequisites:** Node.js v16+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Environment (Optional):
   Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key if required by local scripts.
3. Run the application:
   ```bash
   npm run dev
   ```

*Your interface will initialize. Click **Add Slide**, start typing inside the visual window to experience full structural editing, and then test the accuracy by pressing **Export to PPTX** in the global navigation bar.*
