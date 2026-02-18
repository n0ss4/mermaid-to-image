import type { IExportService } from "./interfaces";
import type { Exporter, ExportOptions } from "@repo/core";
import { pngExporter } from "../export/png";
import { svgExporter } from "../export/svg";
import { clipboardExporter } from "../export/clipboard";
import { clipboardSvgExporter } from "../export/clipboard-svg";
import { pdfExporter } from "../export/pdf";
import { embedImgExporter, embedIframeExporter } from "../export/embed";

export class ExportService implements IExportService {
  private readonly exporters: Exporter[] = [
    pngExporter,
    svgExporter,
    pdfExporter,
    clipboardExporter,
    clipboardSvgExporter,
    embedImgExporter,
    embedIframeExporter,
  ];

  getExporters(): Exporter[] {
    return this.exporters;
  }

  async runExport(exporter: Exporter, options: ExportOptions): Promise<void> {
    await exporter.export(options);
  }
}
