import { createContext, useContext, type ReactNode } from "react";
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

export function EditorProvider({ children }: { readonly children: ReactNode }) {
  const { render, share, clipboard } = useServices();
  const { activeTabId, activeTab, updateTab } = useTabVM();

  const vm = useEditorViewModel({
    activeTabId,
    activeCode: activeTab.code,
    activeMermaidTheme: activeTab.mermaidTheme,
    activeExportScale: activeTab.exportScale,
    updateTab,
    renderService: render,
    shareService: share,
    clipboardService: clipboard,
  });

  return (
    <EditorContext.Provider value={vm}>
      {children}
    </EditorContext.Provider>
  );
}
