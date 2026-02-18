import { createContext, useContext, type ReactNode } from "react";
import { useDiagramComposerViewModel } from "../DiagramComposerViewModel";
import type { DiagramComposerViewModelValue } from "../DiagramComposerViewModel";
import { useServices } from "./ServiceProvider";
import { useTabVM } from "./TabProvider";

const DiagramComposerContext = createContext<DiagramComposerViewModelValue | null>(null);

export function useDiagramComposerVM(): DiagramComposerViewModelValue {
  const ctx = useContext(DiagramComposerContext);
  if (!ctx) throw new Error("useDiagramComposerVM must be used within DiagramComposerProvider");
  return ctx;
}

export function DiagramComposerProvider({ children }: { readonly children: ReactNode }) {
  const { diagramDocument } = useServices();
  const { activeTabId, activeTab, updateTab } = useTabVM();

  const vm = useDiagramComposerViewModel({
    activeTabId,
    code: activeTab.code,
    editorMode: activeTab.editorMode ?? "text",
    docCache: activeTab.docCache,
    updateTab,
    diagramDocumentService: diagramDocument,
  });

  return <DiagramComposerContext.Provider value={vm}>{children}</DiagramComposerContext.Provider>;
}
