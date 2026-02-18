import type { Exporter, ExportOptions } from "@repo/core";

export const pdfExporter: Exporter = {
  name: "PDF",
  extension: "pdf",
  async export({ svgHtml }: ExportOptions) {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head>
<style>
  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  svg { max-width: 100%; height: auto; }
  @media print { body { margin: 0; } }
</style>
</head><body>${svgHtml}</body></html>`);
    doc.close();

    // Wait for content to render before printing
    await new Promise((resolve) => { iframe.contentWindow!.onload = resolve; setTimeout(resolve, 200); });
    iframe.contentWindow!.print();

    // Clean up after a delay to allow print dialog
    setTimeout(() => document.body.removeChild(iframe), 1000);
  },
};
