import { useState, useCallback } from "react";
import { LayoutGrid, Share2, Keyboard, Menu } from "lucide-react";
import { useEditorVM, useExportViewModel, useServices, useTabVM } from "../viewmodels";
import { useToast } from "../viewmodels/providers/ToastProvider";
import { ExportDropdown } from "./ExportDropdown";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { exportAllTabsAsZip } from "../export/batch";
import type { Exporter } from "@repo/core";

interface HeaderProps {
  readonly onShowTemplates: () => void;
  readonly onShowShortcuts: () => void;
}

export function Header({ onShowTemplates, onShowShortcuts }: HeaderProps) {
  const editor = useEditorVM();
  const { export: exportService, render: renderService } = useServices();
  const { tabs } = useTabVM();
  const exportVM = useExportViewModel(editor.svgHtml, editor.exportScale, exportService, editor.transparentBg);
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleShare = async () => {
    await editor.handleShare();
    showToast("Link copied!");
  };

  const handleMobileExport = (exporter: Exporter) => {
    exportVM.runExport(exporter);
    if (exporter.extension) {
      showToast("Downloaded!");
    } else {
      showToast("Copied to clipboard!");
    }
  };

  const handleBatchExport = useCallback(() => {
    exportAllTabsAsZip(tabs, renderService, {
      scale: editor.exportScale,
      transparent: editor.transparentBg,
    });
  }, [tabs, renderService, editor.exportScale, editor.transparentBg]);

  return (
    <header className="app-header">
      <h1>Mermaid Editor</h1>
      <div className="header-controls">
        <button
          className="btn-secondary btn-sm header-desktop-only"
          onClick={onShowTemplates}
        >
          <LayoutGrid size={14} /> Templates
        </button>
        <button className="btn-secondary btn-sm header-desktop-only" onClick={handleShare}>
          <Share2 size={14} /> Share
        </button>
        <div className="header-desktop-only">
          <ExportDropdown
            vm={exportVM}
            transparentBg={editor.transparentBg}
            onToggleTransparent={() => editor.setTransparentBg(!editor.transparentBg)}
            onBatchExport={handleBatchExport}
          />
        </div>
        <button
          className="btn-icon header-desktop-only"
          onClick={onShowShortcuts}
          title="Keyboard shortcuts (⌘/)"
        >
          <Keyboard size={14} />
        </button>
        <ThemeToggle />
        <div className="header-mobile-only" style={{ position: "relative" }}>
          <button
            className="btn-icon"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <Menu size={16} />
          </button>
          {menuOpen && (
            <MobileMenu
              onShowTemplates={onShowTemplates}
              onShare={handleShare}
              onShowShortcuts={onShowShortcuts}
              exportVM={exportVM}
              onExport={handleMobileExport}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
