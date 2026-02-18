import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SYNTAX_REFERENCE, type DiagramType, type ParsedElement } from "@repo/core";

interface SyntaxReferenceProps {
  readonly diagramType: DiagramType;
  readonly parsedElements: ParsedElement[];
  readonly onToggleOutline?: () => void;
}

const TYPE_LABELS: Record<DiagramType, string> = {
  flowchart: "Flowchart",
  sequence: "Sequence",
  class: "Class",
  state: "State",
  er: "ER",
  gantt: "Gantt",
  pie: "Pie",
  git: "Git Graph",
  mindmap: "Mindmap",
  timeline: "Timeline",
  c4: "C4",
  architecture: "Architecture",
  block: "Block",
  requirement: "Requirement",
  quadrant: "Quadrant",
  sankey: "Sankey",
  xychart: "XY Chart",
  radar: "Radar",
  kanban: "Kanban",
  journey: "Journey",
  packet: "Packet",
  unknown: "Diagram",
};

export function SyntaxReference({ diagramType, parsedElements, onToggleOutline }: SyntaxReferenceProps) {
  const [open, setOpen] = useState(false);
  const entries = SYNTAX_REFERENCE[diagramType] ?? [];

  return (
    <div className="syntax-ref">
      <button
        className="syntax-ref-toggle"
        onClick={() => setOpen(!open)}
      >
        <HelpCircle size={13} />
        <span>{TYPE_LABELS[diagramType]} Syntax</span>
        <span style={{ flex: 1 }} />
        {onToggleOutline && (
          <span
            className="syntax-ref-outline-link"
            onClick={(e) => { e.stopPropagation(); onToggleOutline(); }}
          >
            Outline
          </span>
        )}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="syntax-ref-body">
          {parsedElements.length > 0 && (
            <>
              <div className="syntax-ref-section-title">Detected</div>
              <div className="syntax-ref-grid">
                {parsedElements.map((el, i) => (
                  <div key={`${el.kind}-${el.name}-${i}`} className="syntax-ref-entry">
                    <span className="syntax-ref-label">{el.kind}</span>
                    <code className="syntax-ref-code">
                      {el.name}{el.detail ? ` — ${el.detail}` : ""}
                    </code>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="syntax-ref-section-title">Reference</div>
          <div className="syntax-ref-grid">
            {entries.map((entry) => (
              <div key={entry.label} className="syntax-ref-entry">
                <span className="syntax-ref-label">{entry.label}</span>
                <code className="syntax-ref-code">{entry.syntax}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
