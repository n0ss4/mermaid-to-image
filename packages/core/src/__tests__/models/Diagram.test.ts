import { test, expect, describe } from "bun:test";
import { detectDiagramType, parseSvgDimensions } from "../../index";

describe("detectDiagramType", () => {
  test("detects flowchart", () => {
    expect(detectDiagramType("flowchart TD\n  A --> B")).toBe("flowchart");
  });

  test("detects graph as flowchart", () => {
    expect(detectDiagramType("graph LR\n  A --> B")).toBe("flowchart");
  });

  test("detects sequence diagram", () => {
    expect(detectDiagramType("sequenceDiagram\n  Alice->>Bob: Hi")).toBe("sequence");
  });

  test("detects class diagram", () => {
    expect(detectDiagramType("classDiagram\n  class Animal")).toBe("class");
  });

  test("detects state diagram", () => {
    expect(detectDiagramType("stateDiagram-v2\n  [*] --> Idle")).toBe("state");
  });

  test("detects ER diagram", () => {
    expect(detectDiagramType("erDiagram\n  CUSTOMER ||--o{ ORDER : places")).toBe("er");
  });

  test("detects gantt", () => {
    expect(detectDiagramType("gantt\n  title Plan")).toBe("gantt");
  });

  test("detects pie chart", () => {
    expect(detectDiagramType('pie title Share\n  "A" : 50')).toBe("pie");
  });

  test("detects git graph", () => {
    expect(detectDiagramType("gitGraph\n  commit")).toBe("git");
  });

  test("detects mindmap", () => {
    expect(detectDiagramType("mindmap\n  root((Topic))")).toBe("mindmap");
  });

  test("detects timeline", () => {
    expect(detectDiagramType("timeline\n  2023 : Event")).toBe("timeline");
  });

  test("skips comments", () => {
    expect(detectDiagramType("%% this is a comment\nflowchart TD")).toBe("flowchart");
  });

  test("skips whitespace lines", () => {
    expect(detectDiagramType("  \n\n  gantt\n  title Plan")).toBe("gantt");
  });

  test("returns unknown for unrecognized input", () => {
    expect(detectDiagramType("hello world")).toBe("unknown");
  });

  test("returns unknown for empty input", () => {
    expect(detectDiagramType("")).toBe("unknown");
  });

  test("returns unknown for only comments", () => {
    expect(detectDiagramType("%% just a comment")).toBe("unknown");
  });

  test("detects C4Context", () => {
    expect(detectDiagramType('C4Context\n  Person(user, "User")')).toBe("c4");
  });

  test("detects C4Container", () => {
    expect(detectDiagramType('C4Container\n  Container(web, "Web")')).toBe("c4");
  });

  test("detects C4Component", () => {
    expect(detectDiagramType('C4Component\n  Component(api, "API")')).toBe("c4");
  });

  test("detects C4Dynamic", () => {
    expect(detectDiagramType("C4Dynamic\n  Rel(a, b, msg)")).toBe("c4");
  });

  test("detects C4Deployment", () => {
    expect(detectDiagramType("C4Deployment\n  Node(n, label)")).toBe("c4");
  });

  test("detects architecture-beta", () => {
    expect(detectDiagramType("architecture-beta\n  group cloud")).toBe("architecture");
  });

  test("detects block-beta", () => {
    expect(detectDiagramType("block-beta\n  columns 3")).toBe("block");
  });

  test("detects requirementDiagram", () => {
    expect(detectDiagramType("requirementDiagram\n  requirement r1")).toBe("requirement");
  });

  test("detects quadrantChart", () => {
    expect(detectDiagramType("quadrantChart\n  title Chart")).toBe("quadrant");
  });

  test("detects sankey-beta", () => {
    expect(detectDiagramType("sankey-beta\n\n  A,B,10")).toBe("sankey");
  });

  test("detects xychart-beta", () => {
    expect(detectDiagramType('xychart-beta\n  title "Chart"')).toBe("xychart");
  });

  test("detects radar-beta", () => {
    expect(detectDiagramType('radar-beta\n  title "Skills"')).toBe("radar");
  });

  test("detects kanban", () => {
    expect(detectDiagramType("kanban\n  Todo\n    Task 1")).toBe("kanban");
  });

  test("detects journey", () => {
    expect(detectDiagramType("journey\n  title My Journey")).toBe("journey");
  });

  test("detects packet-beta", () => {
    expect(detectDiagramType('packet-beta\n  0-15: "Source Port"')).toBe("packet");
  });
});

describe("parseSvgDimensions", () => {
  test("parses viewBox dimensions", () => {
    const svg = `<svg viewBox="0 0 800 600"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(800);
    expect(h).toBe(600);
  });

  test("parses width/height attributes when no viewBox", () => {
    const svg = `<svg width="1024" height="768"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(1024);
    expect(h).toBe(768);
  });

  test("falls back to defaults when no dimensions", () => {
    const svg = `<svg></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(800);
    expect(h).toBe(600);
  });

  test("uses viewBox over width/height when both present", () => {
    const svg = `<svg viewBox="0 0 400 300" width="800" height="600"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(400);
    expect(h).toBe(300);
  });

  test("handles viewBox with non-zero origin", () => {
    const svg = `<svg viewBox="10 20 500 400"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(500);
    expect(h).toBe(400);
  });
});
