import { describe, expect, test } from "bun:test";
import {
  addNode,
  addNodeAt,
  connectNodes,
  removeSelection,
  updateNodeLabel,
  updateNodePosition,
} from "../../usecases/flowchartComposer";
import type { DiagramDocument } from "../../domain/diagram";

const emptyDoc = (): DiagramDocument => ({
  version: "1",
  kind: "flowchart",
  direction: "TD",
  nodes: [],
  edges: [],
  subgraphs: [],
  rawBlocks: [],
});

describe("flowchart composer usecases", () => {
  test("addNodeAt snaps to grid", () => {
    const { doc } = addNodeAt(emptyDoc(), 103, 117);
    expect(doc.nodes[0]?.x).toBe(100);
    expect(doc.nodes[0]?.y).toBe(120);
  });

  test("connectNodes avoids duplicates", () => {
    const first = addNode(emptyDoc());
    const second = addNode(first.doc);

    const one = connectNodes(second.doc, first.nodeId, second.nodeId);
    const two = connectNodes(one.doc, first.nodeId, second.nodeId);

    expect(one.doc.edges).toHaveLength(1);
    expect(two.doc.edges).toHaveLength(1);
  });

  test("removeSelection removes node and attached edges", () => {
    const a = addNode(emptyDoc());
    const b = addNode(a.doc);
    const linked = connectNodes(b.doc, a.nodeId, b.nodeId);

    const next = removeSelection(linked.doc, { kind: "node", id: a.nodeId });
    expect(next.nodes).toHaveLength(1);
    expect(next.edges).toHaveLength(0);
  });

  test("update node operations are applied", () => {
    const added = addNode(emptyDoc());
    const moved = updateNodePosition(added.doc, added.nodeId, 251, 251);
    const relabeled = updateNodeLabel(moved, added.nodeId, "Hello");

    expect(relabeled.nodes[0]?.x).toBe(250);
    expect(relabeled.nodes[0]?.label).toBe("Hello");
  });
});
