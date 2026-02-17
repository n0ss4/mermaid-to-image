import type { IExportService } from "./interfaces";
import type { Exporter, ExportOptions } from "../models";
import { pngExporter } from "../export/png";
import { svgExporter } from "../export/svg";
import { clipboardExporter } from "../export/clipboard";
import { clipboardSvgExporter } from "../export/clipboard-svg";

export class ExportService implements IExportService {
  private readonly exporters: Exporter[] = [
    pngExporter,
    svgExporter,
    clipboardExporter,
    clipboardSvgExporter,
  ];

  getExporters(): Exporter[] {
    return this.exporters;
  }

  async runExport(exporter: Exporter, options: ExportOptions): Promise<void> {
    await exporter.export(options);
  }
}
