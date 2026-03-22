
export interface Slide {
  id: string;
  code: string;
}

export type ExportType = 'PDF' | 'PPTX';

export interface ExportOptions {
  fileName: string;
}
