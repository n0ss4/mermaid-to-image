import type { DiagramDocument } from "../types";
import { normalizeFlowchartDocument } from "./normalizer";

function nodeSyntax(id: string, label: string, shape: string): string {
  if (shape === "diamond") return `${id}{${label}}`;
  if (shape === "round") return `${id}(${label})`;
  if (shape === "stadium") return `${id}[[${label}]]`;
  return `${id}[${label}]`;
}

function edgeArrow(style?: string): string {
  if (style === "dotted") return "-.->";
  if (style === "thick") return "==>";
  return "-->";
}

export function serializeFlowchart(doc: DiagramDocument): string {
  const normalized = normalizeFlowchartDocument(doc);
  const lines: string[] = [`flowchart ${normalized.direction}`];

  for (const node of normalized.nodes) {
    lines.push(`  ${nodeSyntax(node.id, node.label, node.shape)}`);
  }

  for (const edge of normalized.edges) {
    const label = edge.label ? `|${edge.label}| ` : "";
    lines.push(`  ${edge.source} ${edgeArrow(edge.style)} ${label}${edge.target}`);
  }

  if (normalized.rawBlocks.length > 0) {
    lines.push("", "%% Preserved unsupported lines");
    for (const block of normalized.rawBlocks) {
      lines.push(block.sourceText);
    }
  }

  return lines.join("\n");
}
