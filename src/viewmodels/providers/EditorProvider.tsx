import React, { createContext, useContext } from "react";
import { useEditorViewModel } from "../EditorViewModel";
import type { EditorViewModelValue } from "../EditorViewModel";
import { useServices } from "./ServiceProvider";
import { useTabVM } from "./TabProvider";

const EditorContext = createContext<EditorViewModelValue | null>(null);

export function useEditorVM(): EditorViewModelValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorVM must be used within EditorProvider");
  return ctx;
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { render, share, clipboard } = useServices();
  const { activeTabId, activeTab, updateTab } = useTabVM();

  const vm = useEditorViewModel(
    activeTabId,
    activeTab.code,
    activeTab.mermaidTheme,
    activeTab.exportScale,
    updateTab,
    render,
    share,
    clipboard,
  );

  return (
    <EditorContext.Provider value={vm}>
      {children}
    </EditorContext.Provider>
  );
}
