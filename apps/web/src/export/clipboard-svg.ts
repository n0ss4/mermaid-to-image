import type { Exporter, ExportOptions } from "@repo/core";

export const clipboardSvgExporter: Exporter = {
  name: "SVG",
  async export({ svgHtml }: ExportOptions) {
    const blob = new Blob([svgHtml], { type: "text/html" });
    const textBlob = new Blob([svgHtml], { type: "text/plain" });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": blob,
        "text/plain": textBlob,
      }),
    ]);
  },
};
