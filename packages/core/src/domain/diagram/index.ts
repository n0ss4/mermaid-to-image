export type {
  DiagramDocument,
  DiagramNode,
  DiagramEdge,
  DiagramSubgraph,
  UnsupportedBlock,
  FlowDirection,
  NodeShape,
  EdgeStyle,
  ParseResult,
  ParseWarning,
  ValidationIssue,
} from "./types";
export type { DiagramType } from "./detection";
export type { ParsedElement } from "./outline";

export { parseFlowchart } from "./flowchart/parser";
export { serializeFlowchart } from "./flowchart/serializer";
export { normalizeFlowchartDocument } from "./flowchart/normalizer";
export { detectDiagramType } from "./detection";
export { parseSvgDimensions } from "./svg";
export { parseDiagramElements } from "./outline";

import type { DiagramDocument, ValidationIssue } from "./types";

export function validateFlowchartDocument(doc: DiagramDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(doc.nodes.map((n) => n.id));

  for (const edge of doc.edges) {
    if (!nodeIds.has(edge.source)) {
      issues.push({ path: `edges.${edge.id}.source`, message: `Unknown source node: ${edge.source}` });
    }
    if (!nodeIds.has(edge.target)) {
      issues.push({ path: `edges.${edge.id}.target`, message: `Unknown target node: ${edge.target}` });
    }
  }

  return issues;
}
