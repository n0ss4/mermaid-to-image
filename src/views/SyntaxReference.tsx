import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SYNTAX_REFERENCE } from "../utils/syntaxReference";
import type { DiagramType } from "../models";

interface SyntaxReferenceProps {
  diagramType: DiagramType;
}

export function SyntaxReference({ diagramType }: SyntaxReferenceProps) {
  const [open, setOpen] = useState(false);
  const entries = SYNTAX_REFERENCE[diagramType];

  return (
    <div className="syntax-ref">
      <button
        className="syntax-ref-toggle"
        onClick={() => setOpen(!open)}
      >
        <HelpCircle size={13} />
        <span>Syntax</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="syntax-ref-grid">
          {entries.map((entry) => (
            <div key={entry.label} className="syntax-ref-entry">
              <span className="syntax-ref-label">{entry.label}</span>
              <code className="syntax-ref-code">{entry.syntax}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
