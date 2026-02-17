import React from "react";
import { LayoutGrid, Share2 } from "lucide-react";
import { useEditorVM } from "../viewmodels";
import { useExportViewModel } from "../viewmodels";
import { useServices } from "../viewmodels";
import { ExportDropdown } from "./ExportDropdown";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onShowTemplates: () => void;
}

export function Header({ onShowTemplates }: HeaderProps) {
  const editor = useEditorVM();
  const { export: exportService } = useServices();
  const exportVM = useExportViewModel(editor.svgHtml, editor.exportScale, exportService);

  return (
    <header className="app-header">
      <h1>Mermaid Editor</h1>
      <div className="header-controls">
        <button
          className="btn-secondary btn-sm"
          onClick={onShowTemplates}
        >
          <LayoutGrid size={14} /> Templates
        </button>
        <button className="btn-secondary btn-sm" onClick={editor.handleShare}>
          <Share2 size={14} /> Share
        </button>
        <ExportDropdown
          vm={exportVM}
          exportScale={editor.exportScale}
          onScaleChange={editor.setExportScale}
          mermaidTheme={editor.mermaidTheme}
          onMermaidThemeChange={editor.setMermaidTheme}
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
