import type { DiagramType } from "../models";

export interface ParsedElement {
  kind: string;
  name: string;
  detail?: string;
}

type Parser = (code: string) => ParsedElement[];

function parseFlowchart(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const seen = new Set<string>();

  // Direction
  const dirMatch = /^(?:flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/im.exec(code);
  if (dirMatch) {
    elements.push({ kind: "Direction", name: dirMatch[1]! });
  }

  // Subgraphs
  for (const m of code.matchAll(/^\s*subgraph\s+(.+)/gim)) {
    elements.push({ kind: "Subgraph", name: m[1]!.trim() });
  }

  // Nodes: A[Text], B{Text}, C(Text), D((Text)), E>Text], F[[Text]], G[(Text)], H{{Text}}
  for (const m of code.matchAll(/\b([A-Za-z_]\w*)(?:\[([^\]]*)\]|\{([^}]*)\}|\(([^)]*)\))/g)) {
    const id = m[1]!;
    const label = m[2] ?? m[3] ?? m[4] ?? "";
    const key = `Node:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "Node", name: id, detail: label || undefined });
    }
  }

  // Connections: A --> B, A -->|text| B, A -- text --> B
  for (const m of code.matchAll(/([A-Za-z_]\w*)\s*(?:--+>|==+>|--+|-.->|-\.->|~~+>)\|?([^|]*)\|?\s*([A-Za-z_]\w*)/g)) {
    const label = m[2]?.trim();
    elements.push({
      kind: "Connection",
      name: `${m[1]} -> ${m[3]}`,
      detail: label || undefined,
    });
  }

  return elements;
}

function parseSequence(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const seen = new Set<string>();

  // Participants / actors
  for (const m of code.matchAll(/^\s*(?:participant|actor)\s+(.+?)(?:\s+as\s+(.+))?$/gim)) {
    const name = m[2]?.trim() ?? m[1]!.trim();
    const key = `Actor:${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "Actor", name });
    }
  }

  // Messages: Alice->>Bob: Hello
  for (const m of code.matchAll(/^\s*(\w[\w ]*?)\s*(->>?|-->>?|-)>?\s*(\w[\w ]*?)\s*:\s*(.+)/gm)) {
    const from = m[1]!.trim();
    const to = m[3]!.trim();
    // Also add actors discovered from messages
    for (const actor of [from, to]) {
      const key = `Actor:${actor}`;
      if (!seen.has(key)) {
        seen.add(key);
        elements.push({ kind: "Actor", name: actor });
      }
    }
    elements.push({
      kind: "Message",
      name: `${from} -> ${to}`,
      detail: m[4]!.trim(),
    });
  }

  // Loops, alt, opt, par
  for (const m of code.matchAll(/^\s*(loop|alt|opt|par|critical|break)\s+(.+)/gim)) {
    elements.push({ kind: m[1]![0]!.toUpperCase() + m[1]!.slice(1).toLowerCase(), name: m[2]!.trim() });
  }

  // Notes
  for (const m of code.matchAll(/^\s*Note\s+(?:over|left of|right of)\s+(.+?):\s*(.+)/gim)) {
    elements.push({ kind: "Note", name: m[1]!.trim(), detail: m[2]!.trim() });
  }

  return elements;
}

function parseClass(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const seen = new Set<string>();

  // class ClassName { ... }
  for (const m of code.matchAll(/^\s*class\s+(\w+)\s*\{?/gm)) {
    const key = `Class:${m[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "Class", name: m[1]! });
    }
  }

  // Members: +method() or +field
  for (const m of code.matchAll(/^\s*([+\-#~])(\w[\w().: ]*)/gm)) {
    const vis = { "+": "public", "-": "private", "#": "protected", "~": "package" }[m[1]!] ?? "";
    elements.push({ kind: "Member", name: m[2]!.trim(), detail: vis });
  }

  // Relationships: A --|> B, A --> B, etc.
  for (const m of code.matchAll(/(\w+)\s+(?:<\|--|--\|>|<\.\.|\.\.\>|<--|-->|--\*|o--|--o|\.\.|--|<|>)\s+(\w+)/g)) {
    elements.push({ kind: "Relationship", name: `${m[1]} -- ${m[2]}` });
  }

  return elements;
}

function parseState(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const seen = new Set<string>();

  // state "Name" as alias, or state Name
  for (const m of code.matchAll(/^\s*state\s+"?([^"\n]+?)"?\s+as\s+(\w+)/gim)) {
    const key = `State:${m[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "State", name: m[2]!, detail: m[1]!.trim() });
    }
  }
  for (const m of code.matchAll(/^\s*state\s+(\w+)/gim)) {
    const key = `State:${m[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "State", name: m[1]! });
    }
  }

  // Transitions: StateA --> StateB : label
  for (const m of code.matchAll(/^\s*(\[?\*?\]?|\w+)\s*-->\s*(\[?\*?\]?|\w+)\s*(?::\s*(.+))?/gm)) {
    elements.push({
      kind: "Transition",
      name: `${m[1]} -> ${m[2]}`,
      detail: m[3]?.trim() || undefined,
    });
  }

  return elements;
}

function parseER(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const seen = new Set<string>();

  // ENTITY ||--o{ OTHER : "label"
  for (const m of code.matchAll(/^\s*(\w[\w ]*?)\s+(\|[|o{]--[|o{]|\}[|o]--[|o{])\s+(\w[\w ]*?)\s*:\s*(.+)/gm)) {
    const e1 = m[1]!.trim();
    const e2 = m[3]!.trim();
    for (const entity of [e1, e2]) {
      const key = `Entity:${entity}`;
      if (!seen.has(key)) {
        seen.add(key);
        elements.push({ kind: "Entity", name: entity });
      }
    }
    elements.push({
      kind: "Relationship",
      name: `${e1} -- ${e2}`,
      detail: m[4]!.trim().replace(/"/g, ""),
    });
  }

  // Also catch entities from attribute blocks
  for (const m of code.matchAll(/^\s*(\w+)\s*\{/gm)) {
    const key = `Entity:${m[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      elements.push({ kind: "Entity", name: m[1]! });
    }
  }

  return elements;
}

function parseGantt(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Title
  const titleMatch = /^\s*title\s+(.+)/im.exec(code);
  if (titleMatch) {
    elements.push({ kind: "Title", name: titleMatch[1]!.trim() });
  }

  // Date format
  const dfMatch = /^\s*dateFormat\s+(.+)/im.exec(code);
  if (dfMatch) {
    elements.push({ kind: "Date Format", name: dfMatch[1]!.trim() });
  }

  // Sections
  for (const m of code.matchAll(/^\s*section\s+(.+)/gim)) {
    elements.push({ kind: "Section", name: m[1]!.trim() });
  }

  // Tasks: name :tag, date, duration  or name :date, duration
  for (const m of code.matchAll(/^\s*([^:\n]+?)\s*:([^:\n]*(?:,[^:\n]*)*)$/gm)) {
    const name = m[1]!.trim();
    if (/^(?:title|dateFormat|axisFormat|todayMarker|excludes|includes|section|gantt|%%)/i.test(name)) continue;
    elements.push({ kind: "Task", name, detail: m[2]!.trim() });
  }

  return elements;
}

function parsePie(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Title
  const titleMatch = /^\s*(?:pie\s+)?title\s+(.+)/im.exec(code);
  if (titleMatch) {
    elements.push({ kind: "Title", name: titleMatch[1]!.trim() });
  }

  // Slices: "Label" : value
  for (const m of code.matchAll(/^\s*"([^"]+)"\s*:\s*([\d.]+)/gm)) {
    elements.push({ kind: "Slice", name: m[1]!, detail: m[2] });
  }

  return elements;
}

function parseGit(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  for (const m of code.matchAll(/^\s*commit(?:\s+id:\s*"([^"]+)")?(?:\s+tag:\s*"([^"]+)")?/gim)) {
    const id = m[1] ?? "";
    const tag = m[2];
    elements.push({ kind: "Commit", name: id || "(anonymous)", detail: tag ? `tag: ${tag}` : undefined });
  }

  for (const m of code.matchAll(/^\s*branch\s+(\S+)/gim)) {
    elements.push({ kind: "Branch", name: m[1]! });
  }

  for (const m of code.matchAll(/^\s*merge\s+(\S+)/gim)) {
    elements.push({ kind: "Merge", name: m[1]! });
  }

  for (const m of code.matchAll(/^\s*checkout\s+(\S+)/gim)) {
    elements.push({ kind: "Checkout", name: m[1]! });
  }

  return elements;
}

function parseMindmap(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  const lines = code.split("\n");
  for (const line of lines) {
    if (/^\s*mindmap/i.test(line) || !line.trim() || line.trim().startsWith("%%")) continue;
    const indent = line.search(/\S/);
    const text = line.trim().replace(/^[)(\[\]{}]+|[)(\[\]{}]+$/g, "").trim();
    if (!text) continue;
    const depth = Math.floor(indent / 2);
    elements.push({
      kind: depth === 0 ? "Root" : `Level ${depth}`,
      name: text,
    });
  }

  return elements;
}

function parseTimeline(code: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Title
  const titleMatch = /^\s*title\s+(.+)/im.exec(code);
  if (titleMatch) {
    elements.push({ kind: "Title", name: titleMatch[1]!.trim() });
  }

  // Sections
  for (const m of code.matchAll(/^\s*section\s+(.+)/gim)) {
    elements.push({ kind: "Section", name: m[1]!.trim() });
  }

  // Periods/events — lines with colon that aren't title/section/timeline
  for (const m of code.matchAll(/^\s+(\S[^:\n]*?)\s*:\s*(.+)/gm)) {
    const name = m[1]!.trim();
    if (/^(?:title|section|timeline)/i.test(name)) continue;
    elements.push({ kind: "Period", name, detail: m[2]!.trim() });
  }

  return elements;
}

const parsers: Partial<Record<DiagramType, Parser>> = {
  flowchart: parseFlowchart,
  sequence: parseSequence,
  class: parseClass,
  state: parseState,
  er: parseER,
  gantt: parseGantt,
  pie: parsePie,
  git: parseGit,
  mindmap: parseMindmap,
  timeline: parseTimeline,
};

export function parseDiagramElements(code: string, type: DiagramType): ParsedElement[] {
  const parser = parsers[type];
  if (!parser) return [];
  try {
    return parser(code);
  } catch {
    return [];
  }
}
