import { useCallback } from "react";
import type { Exporter } from "../models";
import type { IExportService } from "../services";

export interface ExportViewModelValue {
  exporters: Exporter[];
  canExport: boolean;
  runExport: (exporter: Exporter) => void;
}

export function useExportViewModel(
  svgHtml: string,
  exportScale: number,
  exportService: IExportService,
): ExportViewModelValue {
  const exporters = exportService.getExporters();
  const canExport = !!svgHtml;

  const runExport = useCallback(
    (exporter: Exporter) => {
      if (!svgHtml) return;
      exportService.runExport(exporter, { svgHtml, scale: exportScale });
    },
    [svgHtml, exportScale, exportService]
  );

  return { exporters, canExport, runExport };
}
