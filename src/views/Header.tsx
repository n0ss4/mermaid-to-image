import { LayoutGrid, Share2, Keyboard } from "lucide-react";
import { useEditorVM, useExportViewModel, useServices } from "../viewmodels";
import { useToast } from "../viewmodels/providers/ToastProvider";
import { ExportDropdown } from "./ExportDropdown";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  readonly onShowTemplates: () => void;
  readonly onShowShortcuts: () => void;
}

export function Header({ onShowTemplates, onShowShortcuts }: HeaderProps) {
  const editor = useEditorVM();
  const { export: exportService } = useServices();
  const exportVM = useExportViewModel(editor.svgHtml, editor.exportScale, exportService);
  const { showToast } = useToast();

  const handleShare = async () => {
    await editor.handleShare();
    showToast("Link copied!");
  };

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
        <button className="btn-secondary btn-sm" onClick={handleShare}>
          <Share2 size={14} /> Share
        </button>
        <ExportDropdown vm={exportVM} />
        <button
          className="btn-icon"
          onClick={onShowShortcuts}
          title="Keyboard shortcuts (⌘/)"
        >
          <Keyboard size={14} />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
