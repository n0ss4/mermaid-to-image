import { List } from "lucide-react";
import type { ParsedElement } from "@repo/core";

interface OutlinePanelProps {
  readonly elements: ParsedElement[];
}

export function OutlinePanel({ elements }: OutlinePanelProps) {
  if (elements.length === 0) {
    return (
      <div className="outline-panel">
        <p className="outline-empty">No elements detected</p>
      </div>
    );
  }

  // Group by kind
  const groups = new Map<string, ParsedElement[]>();
  for (const el of elements) {
    const list = groups.get(el.kind) ?? [];
    list.push(el);
    groups.set(el.kind, list);
  }

  return (
    <div className="outline-panel">
      {[...groups.entries()].map(([kind, items]) => (
        <div key={kind} className="outline-group">
          <div className="outline-group-title">
            <List size={11} />
            {kind} ({items.length})
          </div>
          {items.map((el, i) => (
            <div key={`${el.name}-${i}`} className="outline-item">
              <span className="outline-item-name">{el.name}</span>
              {el.detail && <span className="outline-item-detail">{el.detail}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
