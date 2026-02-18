import { zipSync, strToU8 } from "fflate";
import type { Tab } from "@repo/core";
import type { IRenderService } from "../services/interfaces";
import type { MermaidTheme } from "@repo/core";
import { parseSvgDimensions } from "@repo/core";
import { renderToCanvas } from "./png";

export async function exportAllTabsAsZip(
  tabs: Tab[],
  renderService: IRenderService,
  options?: { scale?: number; transparent?: boolean }
): Promise<void> {
  const scale = options?.scale ?? 2;
  const transparent = options?.transparent ?? false;
  const files: Record<string, Uint8Array> = {};

  for (const tab of tabs) {
    if (!tab.code.trim()) continue;
    try {
      const { svg } = await renderService.render(tab.code, tab.mermaidTheme as MermaidTheme);
      if (!svg) continue;

      const { w, h } = parseSvgDimensions(svg);
      const canvas = await renderToCanvas(svg, w, h, scale, transparent);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });
      const buffer = new Uint8Array(await blob.arrayBuffer());
      const safeName = tab.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      files[`${safeName}.png`] = buffer;
    } catch {
      // Skip tabs that fail to render
    }
  }

  if (Object.keys(files).length === 0) return;

  const zipped = zipSync(files);
  const zipBytes = new Uint8Array(zipped.length);
  zipBytes.set(zipped);
  const blob = new Blob([zipBytes], { type: "application/zip" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "diagrams.zip";
  a.click();
  URL.revokeObjectURL(a.href);
}
