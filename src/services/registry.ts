import type {
  IStorageService,
  IRenderService,
  IShareService,
  IExportService,
  IFileService,
  IClipboardService,
} from "./interfaces";
import { StorageService } from "./StorageService";
import { MermaidRenderService } from "./MermaidRenderService";
import { ShareService } from "./ShareService";
import { ExportService } from "./ExportService";
import { FileService } from "./FileService";
import { ClipboardService } from "./ClipboardService";

export interface ServiceRegistry {
  storage: IStorageService;
  render: IRenderService;
  share: IShareService;
  export: IExportService;
  file: IFileService;
  clipboard: IClipboardService;
}

export function createServiceRegistry(): ServiceRegistry {
  return {
    storage: new StorageService(),
    render: new MermaidRenderService(),
    share: new ShareService(),
    export: new ExportService(),
    file: new FileService(),
    clipboard: new ClipboardService(),
  };
}
