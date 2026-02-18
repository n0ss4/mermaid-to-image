import { useCallback } from "react";
import type { Exporter } from "@repo/core";
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
  transparent = false,
): ExportViewModelValue {
  const exporters = exportService.getExporters();
  const canExport = !!svgHtml;

  const runExport = useCallback(
    (exporter: Exporter) => {
      if (!svgHtml) return;
      exportService.runExport(exporter, { svgHtml, scale: exportScale, transparent });
    },
    [svgHtml, exportScale, transparent, exportService]
  );

  return { exporters, canExport, runExport };
}
