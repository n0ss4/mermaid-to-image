import type { DiagramDocument, DiagramNode } from "../domain/diagram";

export type ComposerSelection =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | null;

const GRID_SIZE = 10;
const DEFAULT_NODE_WIDTH = 160;
const DEFAULT_NODE_HEIGHT = 72;

function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function nextNodeId(nodes: DiagramNode[]): string {
  let index = nodes.length + 1;
  const ids = new Set(nodes.map((n) => n.id));
  while (ids.has(`N${index}`)) index += 1;
  return `N${index}`;
}

export function nextEdgeId(edges: DiagramDocument["edges"]): string {
  let index = edges.length + 1;
  const ids = new Set(edges.map((e) => e.id));
  while (ids.has(`e-${index}`)) index += 1;
  return `e-${index}`;
}

export function addNode(doc: DiagramDocument): { doc: DiagramDocument; nodeId: string } {
  const nodeId = nextNodeId(doc.nodes);
  const col = doc.nodes.length % 4;
  const row = Math.floor(doc.nodes.length / 4);

  const node: DiagramNode = {
    id: nodeId,
    label: nodeId,
    shape: "rect",
    x: 120 + col * 240,
    y: 100 + row * 140,
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  };

  return {
    doc: { ...doc, nodes: [...doc.nodes, node] },
    nodeId,
  };
}

export function addNodeAt(doc: DiagramDocument, x: number, y: number): { doc: DiagramDocument; nodeId: string } {
  const nodeId = nextNodeId(doc.nodes);
  const node: DiagramNode = {
    id: nodeId,
    label: nodeId,
    shape: "rect",
    x: snap(x),
    y: snap(y),
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  };

  return {
    doc: { ...doc, nodes: [...doc.nodes, node] },
    nodeId,
  };
}

export function updateNodePosition(doc: DiagramDocument, id: string, x: number, y: number): DiagramDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => (n.id === id ? { ...n, x: snap(x), y: snap(y) } : n)),
  };
}

export function updateNodeLabel(doc: DiagramDocument, id: string, label: string): DiagramDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => (n.id === id ? { ...n, label } : n)),
  };
}

export function removeSelection(doc: DiagramDocument, selection: ComposerSelection): DiagramDocument {
  if (!selection) return doc;

  if (selection.kind === "node") {
    return {
      ...doc,
      nodes: doc.nodes.filter((n) => n.id !== selection.id),
      edges: doc.edges.filter((e) => e.source !== selection.id && e.target !== selection.id),
    };
  }

  return {
    ...doc,
    edges: doc.edges.filter((e) => e.id !== selection.id),
  };
}

export function connectNodes(doc: DiagramDocument, sourceId: string, targetId: string): { doc: DiagramDocument; edgeId: string | null } {
  if (sourceId === targetId) return { doc, edgeId: null };

  const exists = doc.edges.some((e) => e.source === sourceId && e.target === targetId);
  if (exists) return { doc, edgeId: null };

  const edgeId = nextEdgeId(doc.edges);

  return {
    doc: {
      ...doc,
      edges: [...doc.edges, { id: edgeId, source: sourceId, target: targetId, style: "solid" }],
    },
    edgeId,
  };
}

export function updateDirection(doc: DiagramDocument, direction: DiagramDocument["direction"]): DiagramDocument {
  return {
    ...doc,
    direction,
  };
}
