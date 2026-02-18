import { StreamLanguage, StringStream } from "@codemirror/language";

const DIAGRAM_KEYWORDS = new Set([
  "flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram",
  "stateDiagram-v2", "erDiagram", "gantt", "pie", "gitGraph", "mindmap",
  "timeline", "journey", "quadrantChart", "sankey-beta", "xychart-beta",
  "block-beta", "packet-beta", "C4Context", "C4Container", "C4Component",
  "C4Dynamic", "C4Deployment", "architecture-beta", "requirementDiagram",
  "radar-beta", "kanban",
]);

const BLOCK_KEYWORDS = new Set([
  "section", "participant", "actor", "title", "note", "loop", "alt", "else",
  "opt", "par", "critical", "break", "rect", "end", "class", "subgraph",
  "direction", "style", "linkStyle", "classDef", "click", "callback",
  "dateFormat", "axisFormat", "excludes", "todayMarker", "tickInterval",
  "state", "as", "over", "of", "activate", "deactivate", "autonumber",
  "commit", "branch", "checkout", "merge", "cherry-pick",
  "TB", "TD", "BT", "RL", "LR",
  // C4
  "Person", "Person_Ext", "System", "System_Ext", "System_Boundary",
  "Container", "Container_Ext", "Container_Boundary", "ContainerDb",
  "Component", "Component_Ext", "Rel", "Rel_D", "Rel_U", "Rel_L", "Rel_R",
  "BiRel", "UpdateRelStyle", "UpdateElementStyle",
  // Architecture
  "group", "service", "junction",
  // Requirement
  "requirement", "functionalRequirement", "performanceRequirement",
  "interfaceRequirement", "physicalRequirement", "designConstraint",
  "element", "satisfies", "traces", "contains", "copies", "derives",
  "refines", "verifies", "risk", "verifymethod",
  // Quadrant
  "x-axis", "y-axis", "quadrant-1", "quadrant-2", "quadrant-3", "quadrant-4",
  // XY Chart
  "bar", "line",
  // Radar
  "axis", "curve",
  // Kanban
  "columns",
]);

const ARROW_PATTERN = /^(?:-->>|--\)|--x|--o|-->|---|-\.->>|-\.->|-\.-|->>\)|->>\]|==>|==|-.->|-\.\.->>|~~>|<-->|o--o|x--x|--\||\.->|-->|->|---)/;

interface MermaidState {
  inString: boolean;
  inDirective: boolean;
}

function tokenize(stream: StringStream, state: MermaidState): string | null {
  // Directives: %%{init: ...}%%
  if (state.inDirective) {
    if (stream.match(/.*?%%/)) {
      state.inDirective = false;
      return "meta";
    }
    stream.skipToEnd();
    return "meta";
  }

  if (stream.match("%%{")) {
    state.inDirective = true;
    return "meta";
  }

  // Comments: %%
  if (stream.match("%%")) {
    stream.skipToEnd();
    return "comment";
  }

  // Strings: "..."
  if (state.inString) {
    if (stream.skipTo('"')) {
      stream.next();
      state.inString = false;
    } else {
      stream.skipToEnd();
    }
    return "string";
  }

  if (stream.peek() === '"') {
    stream.next();
    state.inString = true;
    if (stream.skipTo('"')) {
      stream.next();
      state.inString = false;
    } else {
      stream.skipToEnd();
    }
    return "string";
  }

  // Bracket labels: [text], (text), {text}, ((text)), [{text}]
  if (stream.match(/^\[\[.*?\]\]/) || stream.match(/^\[\(.*?\)\]/) ||
      stream.match(/^\[\{.*?\}\]/) || stream.match(/^\(\(.*?\)\)/) ||
      stream.match(/^\[\/.*?\/\]/) || stream.match(/^\[\\.*?\\\]/)) {
    return "string";
  }

  // Arrows
  if (stream.match(ARROW_PATTERN)) {
    return "operator";
  }

  // Pipe labels: |text|
  if (stream.match(/^\|[^|]*\|/)) {
    return "string";
  }

  // Numbers
  if (stream.match(/^-?\d+\.?\d*/)) {
    return "number";
  }

  // Colon after keywords
  if (stream.match(/^:/)) {
    return "punctuation";
  }

  // Words / identifiers / keywords
  if (stream.match(/^[\w-]+/)) {
    const word = stream.current();
    if (DIAGRAM_KEYWORDS.has(word)) return "keyword";
    if (BLOCK_KEYWORDS.has(word)) return "keyword";
    return "variableName";
  }

  // Braces and brackets (not labels)
  if (stream.match(/^[{}()\[\]]/)) {
    return "bracket";
  }

  // Semicolons
  if (stream.match(/^;/)) {
    return "punctuation";
  }

  // Skip whitespace and other characters
  stream.next();
  return null;
}

const mermaidStreamLang = StreamLanguage.define<MermaidState>({
  startState: () => ({ inString: false, inDirective: false }),
  token: tokenize,
  languageData: {
    commentTokens: { line: "%%" },
  },
});

export function mermaid() {
  return mermaidStreamLang;
}
