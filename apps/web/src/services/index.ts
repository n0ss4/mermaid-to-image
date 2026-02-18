export type {
  IStorageService,
  IRenderService,
  IShareService,
  IExportService,
  IFileService,
  IClipboardService,
  IHistoryService,
  ICustomTemplateService,
  IDiagramDocumentService,
} from "./interfaces";

export { StorageService } from "./StorageService";
export { MermaidRenderService } from "./MermaidRenderService";
export { ShareService } from "./ShareService";
export { ExportService } from "./ExportService";
export { FileService } from "./FileService";
export { ClipboardService } from "./ClipboardService";
export { HistoryService } from "./HistoryService";
export { CustomTemplateService } from "./CustomTemplateService";
export { DiagramDocumentService } from "./DiagramDocumentService";

export type { ServiceRegistry } from "./registry";
export { createServiceRegistry } from "./registry";
