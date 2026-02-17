import React, { useState, useEffect, useRef, useCallback } from "react";
import type { MermaidTheme } from "../models";
import { useEditorVM, useTabVM, useServices, usePreviewViewModel, useUrlHydration, useKeyboardShortcuts } from "../viewmodels";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { ResizeHandle } from "./ResizeHandle";
import { TemplateGallery } from "./TemplateGallery";

export function App() {
  const { tabs, activeTabId, activeTab, addTab, closeTab, setActive, updateTab } = useTabVM();
  const editor = useEditorVM();
  const { share } = useServices();
  const preview = usePreviewViewModel(editor.svgHtml);

  const [showTemplates, setShowTemplates] = useState(false);
  const [splitFraction, setSplitFraction] = useState(0.42);

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

  useKeyboardShortcuts({
    onNewTab: handleNewTab,
    onCloseTab: handleCloseTab,
    onPrevTab: handlePrevTab,
    onNextTab: handleNextTab,
    getExportOptions,
  });

  const gridColumns = `${splitFraction}fr 6px ${1 - splitFraction}fr`;

  return (
    <>
      <Header onShowTemplates={() => setShowTemplates(true)} />
      <TabBar />
      <div className="layout" style={{ gridTemplateColumns: gridColumns }}>
        <EditorPanel />
        <ResizeHandle onResize={setSplitFraction} />
        <PreviewPanel
          preview={preview}
          svgHtml={editor.svgHtml}
          error={editor.error}
        />
      </div>
      {showTemplates && (
        <TemplateGallery
          onSelect={editor.handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  );
}
