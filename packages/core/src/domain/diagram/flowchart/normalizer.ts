import type { DiagramDocument, DiagramEdge, DiagramNode } from "../types";

function sortNodes(nodes: DiagramNode[]): DiagramNode[] {
  return [...nodes].sort((a, b) => a.id.localeCompare(b.id));
}

function sortEdges(edges: DiagramEdge[]): DiagramEdge[] {
  const withFallbackIds = [...edges].map((edge, index) => ({
    ...edge,
    id: edge.id?.trim() || `e-${index + 1}`,
  }));

  const used = new Set<string>();
  const unique = withFallbackIds.map((edge, index) => {
    let candidate = edge.id;
    if (used.has(candidate)) {
      let seq = index + 1;
      while (used.has(`e-${seq}`)) seq += 1;
      candidate = `e-${seq}`;
    }
    used.add(candidate);
    return { ...edge, id: candidate };
  });

  return unique.sort((a, b) => a.id.localeCompare(b.id));
}

export function normalizeFlowchartDocument(doc: DiagramDocument): DiagramDocument {
  return {
    ...doc,
    nodes: sortNodes(doc.nodes),
    edges: sortEdges(doc.edges),
    subgraphs: [...doc.subgraphs].sort((a, b) => a.id.localeCompare(b.id)),
    rawBlocks: [...doc.rawBlocks].sort((a, b) => a.id.localeCompare(b.id)),
  };
}
