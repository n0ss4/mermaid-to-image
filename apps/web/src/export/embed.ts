import type { Exporter, ExportOptions } from "@repo/core";

export const embedImgExporter: Exporter = {
  name: "HTML <img>",
  async export({ svgHtml }: ExportOptions) {
    const base64 = btoa(unescape(encodeURIComponent(svgHtml)));
    const dataUri = `data:image/svg+xml;base64,${base64}`;
    const tag = `<img src="${dataUri}" alt="Mermaid diagram" />`;
    await navigator.clipboard.writeText(tag);
  },
};

export const embedIframeExporter: Exporter = {
  name: "HTML <iframe>",
  async export({ svgHtml }: ExportOptions) {
    const escaped = svgHtml.replaceAll('"', "&quot;");
    const tag = `<iframe srcdoc="${escaped}" style="border:none; width:100%; height:400px;" title="Mermaid diagram"></iframe>`;
    await navigator.clipboard.writeText(tag);
  },
};
