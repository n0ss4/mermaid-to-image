import { describe, expect, test } from "bun:test";
import { normalizeFlowchartDocument, parseFlowchart, serializeFlowchart, validateFlowchartDocument } from "../../domain/diagram";

describe("flowchart document parser", () => {
  test("parses nodes and edges", () => {
    const code = `flowchart LR
  A[Start] --> B{Check}
  B --> C[Done]`;

    const result = parseFlowchart(code);

    expect(result.doc.direction).toBe("LR");
    expect(result.doc.nodes.length).toBe(3);
    expect(result.doc.edges.length).toBe(2);
    expect(result.warnings.length).toBe(0);
  });

  test("preserves unsupported lines as raw blocks", () => {
    const code = `flowchart TD
  A --> B
  classDef default fill:#f9f,stroke:#333,stroke-width:2px`;

    const result = parseFlowchart(code);

    expect(result.doc.rawBlocks.length).toBe(1);
    expect(result.doc.rawBlocks[0]?.sourceText).toContain("classDef");
    expect(result.warnings[0]?.code).toBe("UNSUPPORTED_BLOCK");
  });

  test("serializes a parsed document", () => {
    const code = `flowchart TD
  A[Node A] --> B[Node B]`;
    const result = parseFlowchart(code);

    const serialized = serializeFlowchart(result.doc);

    expect(serialized).toContain("flowchart TD");
    expect(serialized).toContain("A[Node A]");
    expect(serialized).toContain("A --> B");
  });

  test("validator catches missing nodes", () => {
    const result = parseFlowchart("flowchart TD\n  A --> B");
    result.doc.edges.push({ id: "e-x", source: "A", target: "MISSING" });

    const issues = validateFlowchartDocument(result.doc);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]?.message).toContain("Unknown target node");
  });

  test("normalizer rewrites duplicate edge ids", () => {
    const result = parseFlowchart("flowchart TD\n  A --> B\n  B --> C");
    result.doc.edges[1] = { ...result.doc.edges[1]!, id: result.doc.edges[0]!.id };

    const normalized = normalizeFlowchartDocument(result.doc);
    const ids = normalized.edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
