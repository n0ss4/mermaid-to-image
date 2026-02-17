import type { Exporter, ExportOptions } from "../models";
import { parseSvgDimensions, renderToCanvas } from "./png";

export const clipboardExporter: Exporter = {
  name: "PNG",
  async export({ svgHtml, scale }: ExportOptions) {
    const { w, h } = parseSvgDimensions(svgHtml);
    const canvas = await renderToCanvas(svgHtml, w, h, scale);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });

    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
  },
};
