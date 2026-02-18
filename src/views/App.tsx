import { useState, useEffect, useRef, useCallback } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";
import type { MermaidTheme } from "../models";
import { useEditorVM, useTabVM, useServices, usePreviewViewModel, useUrlHydration, useKeyboardShortcuts } from "../viewmodels";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ResizeHandle } from "./ResizeHandle";
import { PanelToggle } from "./PanelToggle";
import { TemplateGallery } from "./TemplateGallery";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

export function App() {
  const { tabs, activeTabId, addTab, closeTab, setActive, updateTab } = useTabVM();
  const editor = useEditorVM();
  const { share } = useServices();
  const preview = usePreviewViewModel(editor.svgHtml);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
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
    return { svgHtml: editor.svgHtml, scale: editor.exportScale };
  }, [editor.svgHtml, editor.exportScale]);
  const handleShowShortcuts = useCallback(() => setShowShortcuts(true), []);

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
        />
      )}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
