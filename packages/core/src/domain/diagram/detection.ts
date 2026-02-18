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
  | "c4"
  | "architecture"
  | "block"
  | "requirement"
  | "quadrant"
  | "sankey"
  | "xychart"
  | "radar"
  | "kanban"
  | "journey"
  | "packet"
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
  [/^C4Context\b|^C4Container\b|^C4Component\b|^C4Dynamic\b|^C4Deployment\b/i, "c4"],
  [/^architecture-beta\b/i, "architecture"],
  [/^block-beta\b/i, "block"],
  [/^requirementDiagram\b/i, "requirement"],
  [/^quadrantChart\b/i, "quadrant"],
  [/^sankey-beta\b/i, "sankey"],
  [/^xychart-beta\b/i, "xychart"],
  [/^radar-beta\b/i, "radar"],
  [/^kanban\b/i, "kanban"],
  [/^journey\b/i, "journey"],
  [/^packet-beta\b/i, "packet"],
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
