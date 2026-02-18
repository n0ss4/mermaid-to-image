import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EditorMode, ComposerSelection, DiagramDocument, ParseWarning } from "@repo/core";
import {
  addNode as addNodeToDoc,
  addNodeAt as addNodeAtToDoc,
  connectNodes as connectNodesInDoc,
  normalizeFlowchartDocument,
  removeSelection as removeSelectionFromDoc,
  updateDirection as updateDirectionInDoc,
  updateNodeLabel as updateNodeLabelInDoc,
  updateNodePosition as updateNodePositionInDoc,
} from "@repo/core";
import type { IDiagramDocumentService } from "../services";

export type { ComposerSelection } from "@repo/core";

export interface DiagramComposerViewModelValue {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  document: DiagramDocument;
  warnings: ParseWarning[];
  selection: ComposerSelection;
  setSelection: (selection: ComposerSelection) => void;
  addNode: () => string;
  addNodeAt: (x: number, y: number) => string;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeLabel: (id: string, label: string) => void;
  removeSelected: () => void;
  connectNodes: (sourceId: string, targetId: string) => void;
  setDirection: (direction: DiagramDocument["direction"]) => void;
}

interface DiagramComposerDeps {
  activeTabId: string;
  code: string;
  editorMode: EditorMode;
  docCache?: DiagramDocument;
  updateTab: (id: string, changes: Record<string, unknown>) => void;
  diagramDocumentService: IDiagramDocumentService;
}

const EMPTY_DOC: DiagramDocument = {
  version: "1",
  kind: "flowchart",
  direction: "TD",
  nodes: [],
  edges: [],
  subgraphs: [],
  rawBlocks: [],
};

export function useDiagramComposerViewModel({
  activeTabId,
  code,
  editorMode,
  docCache,
  updateTab,
  diagramDocumentService,
}: DiagramComposerDeps): DiagramComposerViewModelValue {
  const parsedFromCode = useMemo(() => diagramDocumentService.parseFlowchart(code), [code, diagramDocumentService]);
  const resolveDoc = useCallback(
    (sourceCode: string, parsedDoc: DiagramDocument, cached?: DiagramDocument): DiagramDocument => {
      const normalizedParsed = normalizeFlowchartDocument(parsedDoc);
      if (!cached) return normalizedParsed;
      const serializedCached = diagramDocumentService.serializeFlowchart(cached);
      return serializedCached === sourceCode
        ? normalizeFlowchartDocument(cached)
        : normalizedParsed;
    },
    [diagramDocumentService]
  );

  const [document, setDocument] = useState<DiagramDocument>(
    resolveDoc(code, parsedFromCode.doc ?? EMPTY_DOC, docCache)
  );
  const [warnings, setWarnings] = useState<ParseWarning[]>(parsedFromCode.warnings);
  const [selection, setSelection] = useState<ComposerSelection>(null);
  const prevTabIdRef = useRef(activeTabId);

  useEffect(() => {
    setDocument(resolveDoc(code, parsedFromCode.doc, docCache));
    setWarnings(parsedFromCode.warnings);
  }, [code, docCache, parsedFromCode, resolveDoc]);

  useEffect(() => {
    if (prevTabIdRef.current !== activeTabId) {
      prevTabIdRef.current = activeTabId;
      setSelection(null);
    }
  }, [activeTabId]);

  const commit = useCallback(
    (next: DiagramDocument) => {
      const normalized = normalizeFlowchartDocument(next);
      const nextCode = diagramDocumentService.serializeFlowchart(normalized);
      setDocument(normalized);
      setWarnings(diagramDocumentService.parseFlowchart(nextCode).warnings);
      updateTab(activeTabId, { code: nextCode, docCache: normalized });
    },
    [activeTabId, updateTab, diagramDocumentService]
  );

  const setMode = useCallback(
    (mode: EditorMode) => {
      updateTab(activeTabId, { editorMode: mode });
    },
    [activeTabId, updateTab]
  );

  const addNode = useCallback(() => {
    const next = addNodeToDoc(document);
    commit(next.doc);
    setSelection({ kind: "node", id: next.nodeId });
    return next.nodeId;
  }, [document, commit]);

  const addNodeAt = useCallback(
    (x: number, y: number) => {
      const next = addNodeAtToDoc(document, x, y);
      commit(next.doc);
      setSelection({ kind: "node", id: next.nodeId });
      return next.nodeId;
    },
    [document, commit]
  );

  const updateNodePosition = useCallback(
    (id: string, x: number, y: number) => {
      setDocument(updateNodePositionInDoc(document, id, x, y));
    },
    [document]
  );

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      commit(updateNodeLabelInDoc(document, id, label));
    },
    [document, commit]
  );

  const removeSelected = useCallback(() => {
    if (!selection) return;
    commit(removeSelectionFromDoc(document, selection));
    setSelection(null);
  }, [selection, document, commit]);

  const connectNodes = useCallback(
    (sourceId: string, targetId: string) => {
      const next = connectNodesInDoc(document, sourceId, targetId);
      if (next.edgeId === null) return;
      commit(next.doc);
      setSelection({ kind: "edge", id: next.edgeId });
    },
    [document, commit]
  );

  const setDirection = useCallback(
    (direction: DiagramDocument["direction"]) => {
      commit(updateDirectionInDoc(document, direction));
    },
    [document, commit]
  );

  useEffect(() => {
    // Persist position changes after drag ends through a short idle debounce.
    const timer = setTimeout(() => {
      const currentCache = docCache ? JSON.stringify(docCache) : "";
      const nextCache = JSON.stringify(document);
      if (currentCache === nextCache) return;
      updateTab(activeTabId, { docCache: document });
    }, 120);
    return () => clearTimeout(timer);
  }, [document, docCache, activeTabId, updateTab]);

  return {
    mode: editorMode,
    setMode,
    document,
    warnings,
    selection,
    setSelection,
    addNode,
    addNodeAt,
    updateNodePosition,
    updateNodeLabel,
    removeSelected,
    connectNodes,
    setDirection,
  };
}
