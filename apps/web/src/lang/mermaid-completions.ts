import { autocompletion, type CompletionContext, type CompletionResult, snippet } from "@codemirror/autocomplete";

const DIAGRAM_TYPES = [
  { label: "flowchart TD", detail: "Top-down flowchart" },
  { label: "flowchart LR", detail: "Left-right flowchart" },
  { label: "sequenceDiagram", detail: "Sequence diagram" },
  { label: "classDiagram", detail: "Class diagram" },
  { label: "stateDiagram-v2", detail: "State diagram" },
  { label: "erDiagram", detail: "Entity-relationship diagram" },
  { label: "gantt", detail: "Gantt chart" },
  { label: "pie", detail: "Pie chart" },
  { label: "gitGraph", detail: "Git graph" },
  { label: "mindmap", detail: "Mindmap" },
  { label: "timeline", detail: "Timeline" },
  { label: "journey", detail: "User journey" },
  { label: "C4Context", detail: "C4 context diagram" },
  { label: "C4Container", detail: "C4 container diagram" },
  { label: "C4Component", detail: "C4 component diagram" },
  { label: "architecture-beta", detail: "Architecture diagram" },
  { label: "block-beta", detail: "Block diagram" },
  { label: "requirementDiagram", detail: "Requirement diagram" },
  { label: "quadrantChart", detail: "Quadrant chart" },
  { label: "sankey-beta", detail: "Sankey diagram" },
  { label: "xychart-beta", detail: "XY chart" },
  { label: "radar-beta", detail: "Radar chart" },
  { label: "kanban", detail: "Kanban board" },
  { label: "packet-beta", detail: "Packet diagram" },
];

interface ContextKeyword {
  label: string;
  detail?: string;
  type?: string;
  apply?: string;
}

const CONTEXT_KEYWORDS: Record<string, ContextKeyword[]> = {
  flowchart: [
    { label: "subgraph", detail: "Subgraph block", apply: "subgraph ${title}\n    ${ }\nend" },
    { label: "direction", detail: "Set direction" },
    { label: "style", detail: "Style a node" },
    { label: "linkStyle", detail: "Style a link" },
    { label: "classDef", detail: "Define a class" },
    { label: "click", detail: "Click handler" },
  ],
  sequence: [
    { label: "participant", detail: "Define participant" },
    { label: "actor", detail: "Define actor" },
    { label: "loop", detail: "Loop block", apply: "loop ${Every time}\n    ${ }\nend" },
    { label: "alt", detail: "Alternative block", apply: "alt ${Condition}\n    ${ }\nelse ${Other}\n    ${ }\nend" },
    { label: "opt", detail: "Optional block", apply: "opt ${Condition}\n    ${ }\nend" },
    { label: "par", detail: "Parallel block", apply: "par ${Action A}\n    ${ }\nand ${Action B}\n    ${ }\nend" },
    { label: "critical", detail: "Critical block", apply: "critical ${Action}\n    ${ }\noption ${Failure}\n    ${ }\nend" },
    { label: "break", detail: "Break block", apply: "break ${Condition}\n    ${ }\nend" },
    { label: "rect", detail: "Highlight region", apply: "rect rgb(200, 220, 255)\n    ${ }\nend" },
    { label: "note over", detail: "Note over actors" },
    { label: "note left of", detail: "Note left of actor" },
    { label: "note right of", detail: "Note right of actor" },
    { label: "activate", detail: "Activate actor" },
    { label: "deactivate", detail: "Deactivate actor" },
    { label: "autonumber", detail: "Auto-number messages" },
  ],
  class: [
    { label: "class", detail: "Define class", apply: "class ${ClassName} {\n    ${ }\n}" },
    { label: "<<interface>>", detail: "Interface annotation" },
    { label: "<<abstract>>", detail: "Abstract annotation" },
    { label: "<<enumeration>>", detail: "Enum annotation" },
    { label: "namespace", detail: "Namespace block", apply: "namespace ${Name} {\n    ${ }\n}" },
  ],
  state: [
    { label: "state", detail: "Define state" },
    { label: "note right of", detail: "Note on state" },
    { label: "note left of", detail: "Note on state" },
    { label: "<<fork>>", detail: "Fork pseudo-state" },
    { label: "<<join>>", detail: "Join pseudo-state" },
    { label: "<<choice>>", detail: "Choice pseudo-state" },
  ],
  gantt: [
    { label: "title", detail: "Chart title" },
    { label: "dateFormat", detail: "Date format string" },
    { label: "axisFormat", detail: "Axis format string" },
    { label: "section", detail: "Section heading" },
    { label: "excludes", detail: "Exclude dates" },
    { label: "todayMarker", detail: "Today marker style" },
  ],
  er: [
    { label: "string", detail: "String attribute type", type: "type" },
    { label: "int", detail: "Integer attribute type", type: "type" },
    { label: "date", detail: "Date attribute type", type: "type" },
    { label: "float", detail: "Float attribute type", type: "type" },
    { label: "boolean", detail: "Boolean attribute type", type: "type" },
  ],
  pie: [
    { label: "title", detail: "Chart title" },
    { label: "showData", detail: "Show data values" },
  ],
  git: [
    { label: "commit", detail: "Add commit" },
    { label: "branch", detail: "Create branch" },
    { label: "checkout", detail: "Switch branch" },
    { label: "merge", detail: "Merge branch" },
    { label: "cherry-pick", detail: "Cherry-pick commit" },
  ],
  c4: [
    { label: "Person", detail: "Person element", apply: 'Person(${alias}, "${Label}", "${Description}")' },
    { label: "Person_Ext", detail: "External person", apply: 'Person_Ext(${alias}, "${Label}")' },
    { label: "System", detail: "System element", apply: 'System(${alias}, "${Label}", "${Description}")' },
    { label: "System_Ext", detail: "External system", apply: 'System_Ext(${alias}, "${Label}")' },
    { label: "System_Boundary", detail: "System boundary", apply: 'System_Boundary(${id}, "${Label}") {\n    ${ }\n}' },
    { label: "Container", detail: "Container element", apply: 'Container(${alias}, "${Label}", "${Tech}")' },
    { label: "ContainerDb", detail: "Database container", apply: 'ContainerDb(${alias}, "${Label}", "${Tech}")' },
    { label: "Container_Boundary", detail: "Container boundary", apply: 'Container_Boundary(${id}, "${Label}") {\n    ${ }\n}' },
    { label: "Component", detail: "Component element", apply: 'Component(${alias}, "${Label}", "${Tech}")' },
    { label: "Rel", detail: "Relationship", apply: 'Rel(${from}, ${to}, "${Label}")' },
  ],
  architecture: [
    { label: "group", detail: "Group of services", apply: "group ${name}(${icon})[${Label}]" },
    { label: "service", detail: "Service node", apply: "service ${name}(${icon})[${Label}] in ${group}" },
    { label: "junction", detail: "Junction point", apply: "junction ${name} in ${group}" },
  ],
  requirement: [
    { label: "requirement", detail: "Requirement block", apply: "requirement ${name} {\n    id: ${1}\n    text: ${description}\n    risk: ${medium}\n    verifymethod: ${test}\n}" },
    { label: "element", detail: "Element block", apply: "element ${name} {\n    type: ${module}\n    docref: ${doc.md}\n}" },
  ],
  xychart: [
    { label: "title", detail: "Chart title" },
    { label: "x-axis", detail: "X axis definition" },
    { label: "y-axis", detail: "Y axis definition" },
    { label: "bar", detail: "Bar data series" },
    { label: "line", detail: "Line data series" },
  ],
  quadrant: [
    { label: "title", detail: "Chart title" },
    { label: "x-axis", detail: "X axis labels" },
    { label: "y-axis", detail: "Y axis labels" },
    { label: "quadrant-1", detail: "Top-right label" },
    { label: "quadrant-2", detail: "Top-left label" },
    { label: "quadrant-3", detail: "Bottom-left label" },
    { label: "quadrant-4", detail: "Bottom-right label" },
  ],
  radar: [
    { label: "title", detail: "Chart title" },
    { label: "axis", detail: "Axis labels" },
    { label: "curve", detail: "Data curve", apply: 'curve ${a}["${Label}"] { ${ } }' },
  ],
};

function detectCurrentDiagram(doc: string): string | null {
  const lines = doc.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("%%")) continue;
    if (/^flowchart\b|^graph\b/i.test(trimmed)) return "flowchart";
    if (/^sequenceDiagram\b/i.test(trimmed)) return "sequence";
    if (/^classDiagram\b/i.test(trimmed)) return "class";
    if (/^stateDiagram/i.test(trimmed)) return "state";
    if (/^erDiagram\b/i.test(trimmed)) return "er";
    if (/^gantt\b/i.test(trimmed)) return "gantt";
    if (/^pie\b/i.test(trimmed)) return "pie";
    if (/^gitGraph\b/i.test(trimmed)) return "git";
    if (/^C4/i.test(trimmed)) return "c4";
    if (/^architecture-beta\b/i.test(trimmed)) return "architecture";
    if (/^requirementDiagram\b/i.test(trimmed)) return "requirement";
    if (/^xychart-beta\b/i.test(trimmed)) return "xychart";
    if (/^quadrantChart\b/i.test(trimmed)) return "quadrant";
    if (/^radar-beta\b/i.test(trimmed)) return "radar";
    return null;
  }
  return null;
}

function mermaidCompletionSource(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[\w-]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const doc = context.state.doc.toString();
  const lineNumber = context.state.doc.lineAt(context.pos).number;
  const options: Array<{ label: string; detail?: string; type?: string; apply?: string | ReturnType<typeof snippet> }> = [];

  // On first non-comment line, suggest diagram types
  let firstContentLine = 0;
  for (let i = 1; i <= context.state.doc.lines; i++) {
    const l = context.state.doc.line(i).text.trim();
    if (l && !l.startsWith("%%")) { firstContentLine = i; break; }
  }

  if (lineNumber === firstContentLine || firstContentLine === 0) {
    for (const dt of DIAGRAM_TYPES) {
      options.push({ label: dt.label, detail: dt.detail, type: "keyword" });
    }
  }

  // Context-aware keywords based on detected diagram type
  const diagramType = detectCurrentDiagram(doc);
  if (diagramType && lineNumber > firstContentLine) {
    const keywords = CONTEXT_KEYWORDS[diagramType];
    if (keywords) {
      for (const kw of keywords) {
        const opt: typeof options[number] = {
          label: kw.label,
          detail: kw.detail,
          type: kw.type ?? "keyword",
        };
        if (kw.apply) {
          opt.apply = snippet(kw.apply);
        }
        options.push(opt);
      }
    }
  }

  if (options.length === 0) return null;

  return {
    from: word.from,
    options,
    validFor: /^[\w-]*$/,
  };
}

export function mermaidAutocomplete() {
  return autocompletion({
    override: [mermaidCompletionSource],
    icons: false,
  });
}
