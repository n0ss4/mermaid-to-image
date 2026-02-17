export type DiagramType =
  | "flowchart"
  | "sequence"
  | "class"
  | "state"
  | "er"
  | "gantt"
  | "pie"
  | "git"
  | "mindmap"
  | "timeline"
  | "unknown";

const DIAGRAM_PATTERNS: [RegExp, DiagramType][] = [
  [/^flowchart\b|^graph\b/i, "flowchart"],
  [/^sequenceDiagram\b/i, "sequence"],
  [/^classDiagram\b/i, "class"],
  [/^stateDiagram\b|^stateDiagram-v2\b/i, "state"],
  [/^erDiagram\b/i, "er"],
  [/^gantt\b/i, "gantt"],
  [/^pie\b/i, "pie"],
  [/^gitGraph\b/i, "git"],
  [/^mindmap\b/i, "mindmap"],
  [/^timeline\b/i, "timeline"],
];

export function detectDiagramType(code: string): DiagramType {
  const lines = code.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("%%")) continue;
    for (const [pattern, type] of DIAGRAM_PATTERNS) {
      if (pattern.test(trimmed)) return type;
    }
    return "unknown";
  }
  return "unknown";
}

export function parseSvgDimensions(svgHtml: string): { w: number; h: number } {
  const viewBoxMatch = svgHtml.match(/viewBox=["']([^"']+)["']/);
  if (viewBoxMatch?.[1]) {
    const parts = viewBoxMatch[1].split(/[\s,]+/).map(Number);
    return { w: parts[2] ?? 800, h: parts[3] ?? 600 };
  }

  const widthMatch = svgHtml.match(/\bwidth=["']([^"']+)["']/);
  const heightMatch = svgHtml.match(/\bheight=["']([^"']+)["']/);
  return {
    w: widthMatch?.[1] ? Number.parseFloat(widthMatch[1]) : 800,
    h: heightMatch?.[1] ? Number.parseFloat(heightMatch[1]) : 600,
  };
}
