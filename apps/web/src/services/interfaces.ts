import type { TabState, MermaidTheme, Theme, ShareState, ExportOptions, Exporter, Template } from "@repo/core";
import type { DiagramSnapshot } from "@repo/core";
import type { DiagramDocument, ParseResult, ValidationIssue } from "@repo/core";

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

export interface IHistoryService {
  getSnapshots(tabId: string): DiagramSnapshot[];
  addSnapshot(tabId: string, code: string): void;
  clearHistory(tabId: string): void;
}

export interface ICustomTemplateService {
  getTemplates(): Template[];
  addTemplate(template: Template): void;
  deleteTemplate(name: string): void;
}

export interface IDiagramDocumentService {
  parseFlowchart(code: string): ParseResult;
  serializeFlowchart(doc: DiagramDocument): string;
  validate(doc: DiagramDocument): ValidationIssue[];
}
