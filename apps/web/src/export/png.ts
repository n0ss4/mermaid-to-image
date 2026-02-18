import type { Exporter, ExportOptions } from "@repo/core";
import { parseSvgDimensions } from "@repo/core";

export { parseSvgDimensions };

export function renderToCanvas(
  svgHtml: string,
  w: number,
  h: number,
  scale: number,
  transparent = false
): Promise<HTMLCanvasElement> {
  const container = document.createElement("div");
  container.innerHTML = svgHtml;
  const svgEl = container.querySelector("svg")!;
  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!transparent) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.src = url;
  });
}

export const pngExporter: Exporter = {
  name: "PNG",
  extension: "png",
  async export({ svgHtml, scale, transparent }: ExportOptions) {
    const { w, h } = parseSvgDimensions(svgHtml);
    const canvas = await renderToCanvas(svgHtml, w, h, scale, transparent);

    canvas.toBlob(
      (pngBlob) => {
        if (!pngBlob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = "diagram.png";
        a.click();
        URL.revokeObjectURL(a.href);
      },
      "image/png"
    );
  },
};
