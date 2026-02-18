import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";
import type { MermaidTheme } from "@repo/core";
import type { Command } from "@repo/core";
import { useEditorVM, useTabVM, useServices, usePreviewViewModel, useUrlHydration, useKeyboardShortcuts } from "../viewmodels";
import { useCommandPaletteViewModel } from "../viewmodels/CommandPaletteViewModel";
import { useHistoryViewModel } from "../viewmodels/HistoryViewModel";
import { useCustomTemplateViewModel } from "../viewmodels/CustomTemplateViewModel";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ResizeHandle } from "./ResizeHandle";
import { PanelToggle } from "./PanelToggle";
import { TemplateGallery } from "./TemplateGallery";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { CommandPalette } from "./CommandPalette";
import { HistoryPanel } from "./HistoryPanel";
import { pngExporter } from "../export/png";
import { pdfExporter } from "../export/pdf";
import { exportAllTabsAsZip } from "../export/batch";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "\u2318" : "Ctrl";
const alt = isMac ? "\u2325" : "Alt";

export function App() {
  const { tabs, activeTabId, addTab, closeTab, setActive, updateTab } = useTabVM();
  const editor = useEditorVM();
  const { share, render: renderService, history: historyService, customTemplates: customTemplateService } = useServices();
  const preview = usePreviewViewModel(editor.svgHtml);
  const customTemplateVM = useCustomTemplateViewModel(customTemplateService);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [splitFraction, setSplitFraction] = useState(0.42);
  const [activePanel, setActivePanel] = useState<"editor" | "preview">("editor");

  // URL hydration
  const shared = useUrlHydration(share);
  const sharedApplied = useRef(false);

  useEffect(() => {
    if (shared && !sharedApplied.current) {
      sharedApplied.current = true;
      updateTab(activeTabId, {
        code: shared.code,
        ...(shared.mermaidTheme ? { mermaidTheme: shared.mermaidTheme as MermaidTheme } : {}),
      });
    }
  }, [shared, activeTabId, updateTab]);

  // History
  const historyVM = useHistoryViewModel(
    activeTabId,
    editor.code,
    historyService,
    (code: string) => editor.setCode(code),
  );

  // Keyboard shortcuts
  const handleNewTab = useCallback(() => addTab(), [addTab]);
  const handleCloseTab = useCallback(() => closeTab(activeTabId), [closeTab, activeTabId]);
  const handlePrevTab = useCallback(() => {
    const idx = tabs.findIndex((t) => t.id === activeTabId);
    if (idx > 0) setActive(tabs[idx - 1]!.id);
  }, [tabs, activeTabId, setActive]);
  const handleNextTab = useCallback(() => {
    const idx = tabs.findIndex((t) => t.id === activeTabId);
    if (idx < tabs.length - 1) setActive(tabs[idx + 1]!.id);
  }, [tabs, activeTabId, setActive]);
  const getExportOptions = useCallback(() => {
    if (!editor.svgHtml) return null;
    return { svgHtml: editor.svgHtml, scale: editor.exportScale, transparent: editor.transparentBg };
  }, [editor.svgHtml, editor.exportScale, editor.transparentBg]);
  const handleShowShortcuts = useCallback(() => setShowShortcuts(true), []);

  // Command palette commands
  const commands: Command[] = useMemo(() => [
    { id: "new-tab", label: "New Tab", category: "Tabs", shortcut: [alt, "N"], action: handleNewTab },
    { id: "close-tab", label: "Close Tab", category: "Tabs", shortcut: [alt, "W"], action: handleCloseTab },
    { id: "prev-tab", label: "Previous Tab", category: "Tabs", shortcut: [mod, "Shift", "["], action: handlePrevTab },
    { id: "next-tab", label: "Next Tab", category: "Tabs", shortcut: [mod, "Shift", "]"], action: handleNextTab },
    { id: "export-png", label: "Export PNG", category: "Export", shortcut: [alt, "S"], action: () => { const opts = getExportOptions(); if (opts) pngExporter.export(opts); } },
    { id: "export-pdf", label: "Export PDF", category: "Export", shortcut: [alt, "Shift", "S"], action: () => { const opts = getExportOptions(); if (opts) pdfExporter.export(opts); } },
    { id: "export-all", label: "Export All (ZIP)", category: "Export", action: () => { exportAllTabsAsZip(tabs, renderService, { scale: editor.exportScale, transparent: editor.transparentBg }); } },
    { id: "toggle-transparent", label: "Toggle Transparent Background", category: "Export", shortcut: [alt, "T"], action: () => editor.setTransparentBg(!editor.transparentBg) },
    { id: "zoom-in", label: "Zoom In", category: "View", shortcut: [alt, "+"], action: preview.controls.zoomIn },
    { id: "zoom-out", label: "Zoom Out", category: "View", shortcut: [alt, "\u2212"], action: preview.controls.zoomOut },
    { id: "zoom-fit", label: "Fit to View", category: "View", shortcut: [alt, "0"], action: preview.controls.fitToView },
    { id: "zoom-width", label: "Fit to Width", category: "View", action: preview.controls.fitToWidth },
    { id: "fullscreen", label: "Toggle Fullscreen", category: "View", action: preview.toggleFullscreen },
    { id: "templates", label: "Open Templates", category: "General", action: () => setShowTemplates(true) },
    { id: "save-template", label: "Save as Template", category: "General", shortcut: [alt, "Shift", "T"], action: () => {
      const name = prompt("Template name:");
      if (name?.trim()) customTemplateVM.saveTemplate(name.trim(), editor.code);
    }},
    { id: "history", label: "Version History", category: "General", shortcut: [alt, "H"], action: () => setShowHistory(true) },
    { id: "shortcuts", label: "Keyboard Shortcuts", category: "General", shortcut: [mod, "/"], action: handleShowShortcuts },
  ], [handleNewTab, handleCloseTab, handlePrevTab, handleNextTab, getExportOptions, preview.controls, preview.toggleFullscreen, handleShowShortcuts, tabs, renderService, editor, customTemplateVM]);

  const commandPalette = useCommandPaletteViewModel(commands);

  useKeyboardShortcuts({
    onNewTab: handleNewTab,
    onCloseTab: handleCloseTab,
    onPrevTab: handlePrevTab,
    onNextTab: handleNextTab,
    onZoomIn: preview.controls.zoomIn,
    onZoomOut: preview.controls.zoomOut,
    onZoomReset: preview.controls.fitToView,
    onShowShortcuts: handleShowShortcuts,
    getExportOptions,
    onCommandPalette: commandPalette.toggle,
    onToggleTransparent: () => editor.setTransparentBg(!editor.transparentBg),
    onExportPdf: () => { const opts = getExportOptions(); if (opts) pdfExporter.export(opts); },
    onShowHistory: () => setShowHistory(true),
    onSaveTemplate: () => {
      const name = prompt("Template name:");
      if (name?.trim()) customTemplateVM.saveTemplate(name.trim(), editor.code);
    },
  });

  const gridColumns = `${splitFraction}fr 8px ${1 - splitFraction}fr`;

  return (
    <>
      <Header
        onShowTemplates={() => setShowTemplates(true)}
        onShowShortcuts={handleShowShortcuts}
      />
      <TabBar />
      <PanelToggle activePanel={activePanel} onToggle={setActivePanel} />
      <div className="layout" data-active-panel={activePanel} style={{ gridTemplateColumns: gridColumns }}>
        <EditorPanel />
        <ResizeHandle onResize={setSplitFraction} />
        <PreviewPanel
          preview={preview}
          svgHtml={editor.svgHtml}
          error={editor.error}
          mermaidTheme={editor.mermaidTheme}
          onMermaidThemeChange={editor.setMermaidTheme}
          exportScale={editor.exportScale}
          onScaleChange={editor.setExportScale}
        />
      </div>
      <footer className="app-footer">
        <span>Nossair &copy; 2026</span>
        <div className="footer-socials">
          <a href="https://github.com/n0ss4" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={16} />
          </a>
          <a href="https://linkedin.com/in/nghazouani" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={16} />
          </a>
          <a href="https://x.com/nossairdev" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter size={16} />
          </a>
        </div>
      </footer>
      {showTemplates && (
        <TemplateGallery
          onSelect={editor.handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
          customTemplates={customTemplateVM.customTemplates}
          onDeleteCustom={customTemplateVM.deleteTemplate}
          onSaveCurrent={(name) => customTemplateVM.saveTemplate(name, editor.code)}
          currentCode={editor.code}
        />
      )}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
      {showHistory && (
        <HistoryPanel vm={historyVM} onClose={() => setShowHistory(false)} />
      )}
      <CommandPalette vm={commandPalette} />
    </>
  );
}
