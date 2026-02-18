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
  DiagramType,
  ParsedElement,
} from "./domain/diagram";

export {
  parseFlowchart,
  serializeFlowchart,
  normalizeFlowchartDocument,
  validateFlowchartDocument,
  detectDiagramType,
  parseSvgDimensions,
  parseDiagramElements,
} from "./domain/diagram";

export type { Tab, TabState, TabAction, EditorMode } from "./domain/tab";
export { MAX_TABS, createTab, tabReducer } from "./domain/tab";

export type { Theme, MermaidTheme } from "./domain/theme";
export { MERMAID_THEMES } from "./domain/theme";

export type { DiagramSnapshot } from "./domain/history";
export { MAX_SNAPSHOTS_PER_TAB } from "./domain/history";

export type { ShareState } from "./domain/share";
export { encodeShareState, decodeShareState } from "./domain/shareCodec";

export type { Command } from "./domain/command";

export type { ExportOptions, Exporter } from "./domain/export";

export type { Template } from "./domain/templates";
export { TEMPLATES } from "./domain/templates";

export type { SyntaxEntry } from "./domain/syntaxReference";
export { SYNTAX_REFERENCE } from "./domain/syntaxReference";

export { parseErrorLine } from "./domain/errorLine";
export { formatError } from "./domain/errorFormat";

export { SAMPLE_DIAGRAM } from "./domain/starter";

export type { ComposerSelection } from "./usecases/flowchartComposer";
export {
  addNode,
  addNodeAt,
  updateNodePosition,
  updateNodeLabel,
  removeSelection,
  connectNodes,
  updateDirection,
  nextNodeId,
  nextEdgeId,
} from "./usecases/flowchartComposer";
