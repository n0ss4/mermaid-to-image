import type {
  DiagramDocument,
  DiagramEdge,
  DiagramNode,
  FlowDirection,
  NodeShape,
  ParseResult,
  ParseWarning,
  UnsupportedBlock,
} from "../types";
import { normalizeFlowchartDocument } from "./normalizer";

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 72;

function nodeShapeFromToken(token: string): NodeShape {
  if (token === "{") return "diamond";
  if (token === "(") return "round";
  if (token === "[[") return "stadium";
  return "rect";
}

function normalizeLabel(raw: string | undefined, fallback: string): string {
  const label = raw?.trim();
  return label ? label : fallback;
}

function positionForIndex(index: number): { x: number; y: number } {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return {
    x: 120 + col * 240,
    y: 100 + row * 140,
  };
}

interface ParsedEndpoint {
  id: string;
  label?: string;
  shape: NodeShape;
}

function parseEndpoint(input: string): ParsedEndpoint | null {
  const trimmed = input.trim();
  const withLabelMatch = /^([A-Za-z_][\w-]*)\s*(\[\[|\[|\{|\()\s*([^\]\)\}]+?)\s*(\]\]|\]|\}|\))$/.exec(trimmed);
  if (withLabelMatch) {
    const [, id, left, label] = withLabelMatch;
    return {
      id: id!,
      label: label!.trim(),
      shape: nodeShapeFromToken(left!),
    };
  }

  const idMatch = /^([A-Za-z_][\w-]*)$/.exec(trimmed);
  if (idMatch) {
    return { id: idMatch[1]!, shape: "rect" };
  }

  return null;
}

function parseDirection(line: string): FlowDirection | null {
  const match = /^(?:flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/i.exec(line.trim());
  if (!match) return null;
  return match[1]!.toUpperCase() as FlowDirection;
}

function parseNodeDeclaration(line: string): ParsedEndpoint | null {
  const m = /^\s*([A-Za-z_][\w-]*)\s*(\[\[|\[|\{|\()\s*([^\]\)\}]+?)\s*(\]\]|\]|\}|\))\s*$/.exec(line);
  if (!m) return null;
  const [, id, left, label] = m;
  return {
    id: id!,
    label: label!.trim(),
    shape: nodeShapeFromToken(left!),
  };
}

function parseEdge(line: string): {
  from: ParsedEndpoint;
  to: ParsedEndpoint;
  label?: string;
  style?: DiagramEdge["style"];
} | null {
  const arrowPattern = /(?:-->|==>|-.->)/;
  if (!arrowPattern.test(line)) return null;

  const cleaned = line.trim();
  const parts = cleaned.split(arrowPattern);
  if (parts.length !== 2) return null;

  const arrowMatch = cleaned.match(arrowPattern);
  const arrow = arrowMatch?.[0];
  const style: DiagramEdge["style"] = arrow === "==>" ? "thick" : arrow === "-.->" ? "dotted" : "solid";

  const left = parts[0]!.trim();
  const rightWithLabel = parts[1]!.trim();

  const labelMatch = /^\|([^|]+)\|\s*(.+)$/.exec(rightWithLabel);
  const right = labelMatch ? labelMatch[2]!.trim() : rightWithLabel;
  const label = labelMatch?.[1]?.trim();

  const from = parseEndpoint(left);
  const to = parseEndpoint(right);
  if (!from || !to) return null;

  return { from, to, label, style };
}

export function parseFlowchart(code: string): ParseResult {
  const lines = code.split("\n");
  const warnings: ParseWarning[] = [];
  const rawBlocks: UnsupportedBlock[] = [];
  const nodesById = new Map<string, DiagramNode>();
  const edges: DiagramEdge[] = [];

  let direction: FlowDirection = "TD";
  let firstDirectiveSeen = false;

  const ensureNode = (endpoint: ParsedEndpoint): DiagramNode => {
    const existing = nodesById.get(endpoint.id);
    if (existing) {
      if (endpoint.label) existing.label = endpoint.label;
      if (endpoint.shape !== "rect") existing.shape = endpoint.shape;
      return existing;
    }
    const pos = positionForIndex(nodesById.size);
    const node: DiagramNode = {
      id: endpoint.id,
      label: normalizeLabel(endpoint.label, endpoint.id),
      shape: endpoint.shape,
      x: pos.x,
      y: pos.y,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    };
    nodesById.set(node.id, node);
    return node;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("%%")) return;

    const maybeDirection = parseDirection(line);
    if (maybeDirection) {
      direction = maybeDirection;
      firstDirectiveSeen = true;
      return;
    }

    if (!firstDirectiveSeen) {
      warnings.push({
        line: index + 1,
        code: "LOSSY_PARSE",
        message: "Missing flowchart/graph directive; assuming TD",
      });
      firstDirectiveSeen = true;
    }

    const nodeDeclaration = parseNodeDeclaration(line);
    if (nodeDeclaration) {
      ensureNode(nodeDeclaration);
      return;
    }

    const edge = parseEdge(line);
    if (edge) {
      ensureNode(edge.from);
      ensureNode(edge.to);
      edges.push({
        id: `e-${edges.length + 1}`,
        source: edge.from.id,
        target: edge.to.id,
        ...(edge.label ? { label: edge.label } : {}),
        ...(edge.style ? { style: edge.style } : {}),
      });
      return;
    }

    rawBlocks.push({
      id: `raw-${rawBlocks.length + 1}`,
      sourceText: line,
      reason: "unsupported_feature",
      line: index + 1,
    } satisfies UnsupportedBlock);
    warnings.push({
      line: index + 1,
      code: "UNSUPPORTED_BLOCK",
      message: "Line is preserved in text mode but not editable in visual mode.",
    });
  });

  const doc: DiagramDocument = {
    version: "1",
    kind: "flowchart",
    direction,
    nodes: [...nodesById.values()],
    edges,
    subgraphs: [],
    rawBlocks,
  };

  return {
    doc: normalizeFlowchartDocument(doc),
    warnings,
  };
}
