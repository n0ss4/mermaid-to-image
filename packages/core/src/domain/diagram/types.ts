export type FlowDirection = "TB" | "TD" | "BT" | "RL" | "LR";

export type NodeShape = "rect" | "round" | "diamond" | "stadium";
export type EdgeStyle = "solid" | "dotted" | "thick";

export interface DiagramNode {
  id: string;
  label: string;
  shape: NodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: EdgeStyle;
}

export interface DiagramSubgraph {
  id: string;
  title: string;
  nodeIds: string[];
}

export interface UnsupportedBlock {
  id: string;
  sourceText: string;
  reason: "unknown_syntax" | "unsupported_feature";
  line?: number;
}

export interface DiagramDocument {
  version: "1";
  kind: "flowchart";
  direction: FlowDirection;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  subgraphs: DiagramSubgraph[];
  rawBlocks: UnsupportedBlock[];
}

export interface ParseWarning {
  line?: number;
  message: string;
  code: "UNSUPPORTED_BLOCK" | "LOSSY_PARSE";
}

export interface ParseResult {
  doc: DiagramDocument;
  warnings: ParseWarning[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}
