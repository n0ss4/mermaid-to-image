import { Code, Eye } from "lucide-react";

interface PanelToggleProps {
  readonly activePanel: "editor" | "preview";
  readonly onToggle: (panel: "editor" | "preview") => void;
}

export function PanelToggle({ activePanel, onToggle }: PanelToggleProps) {
  return (
    <div className="panel-toggle">
      <button
        className={`panel-toggle-btn${activePanel === "editor" ? " panel-toggle-active" : ""}`}
        onClick={() => onToggle("editor")}
      >
        <Code size={14} /> Editor
      </button>
      <button
        className={`panel-toggle-btn${activePanel === "preview" ? " panel-toggle-active" : ""}`}
        onClick={() => onToggle("preview")}
      >
        <Eye size={14} /> Preview
      </button>
    </div>
  );
}
