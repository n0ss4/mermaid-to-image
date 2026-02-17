import type { TabState, MermaidTheme, Theme, ShareState, ExportOptions, Exporter } from "../models";

export interface IStorageService {
  loadTabState(): TabState;
  saveTabState(state: TabState): void;
  loadTheme(): Theme;
  saveTheme(theme: Theme): void;
}

export interface IRenderService {
  render(code: string, theme: MermaidTheme): Promise<{ svg: string; error: string }>;
}

export interface IShareService {
  encodeAndApply(state: ShareState): string;
  decodeFromUrl(url: string): ShareState | null;
  clearUrlParams(): void;
}

export interface IExportService {
  getExporters(): Exporter[];
  runExport(exporter: Exporter, options: ExportOptions): Promise<void>;
}

export interface IFileService {
  readFile(file: File): Promise<string>;
}

export interface IClipboardService {
  writeText(text: string): Promise<void>;
}
