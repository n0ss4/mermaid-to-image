export { MERMAID_THEMES } from "../models/Theme";
export type { MermaidTheme } from "../models/Theme";

export const SAMPLE = `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[Alternative]
  C --> E[Result]
  D --> E
  E --> F[End]`;

export const DEFAULT_MERMAID_CONFIG = {
  startOnLoad: false,
  suppressErrorRendering: true,
  securityLevel: "loose" as const,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};
