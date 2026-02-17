import type { Exporter, ExportOptions } from "../models";

export const svgExporter: Exporter = {
  name: "SVG",
  extension: "svg",
  async export({ svgHtml }: ExportOptions) {
    const blob = new Blob([svgHtml], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
