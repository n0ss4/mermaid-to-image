export type Theme = "light" | "dark";

export const MERMAID_THEMES = ["default", "dark", "forest", "neutral"] as const;
export type MermaidTheme = (typeof MERMAID_THEMES)[number];
