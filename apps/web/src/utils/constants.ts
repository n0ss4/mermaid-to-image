export { MERMAID_THEMES } from "@repo/core";
export type { MermaidTheme } from "@repo/core";

export const DEFAULT_MERMAID_CONFIG = {
  startOnLoad: false,
  suppressErrorRendering: true,
  securityLevel: "loose" as const,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};
