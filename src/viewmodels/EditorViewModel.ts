import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { MermaidTheme, DiagramType } from "../models";
import { detectDiagramType } from "../models";
import type { IRenderService, IShareService, IClipboardService } from "../services";
import { parseDiagramElements, type ParsedElement } from "../utils/parseDiagramElements";

export interface EditorViewModelValue {
  code: string;
  setCode: (code: string) => void;
  svgHtml: string;
  error: string;
  diagramType: DiagramType;
  parsedElements: ParsedElement[];
  mermaidTheme: MermaidTheme;
  setMermaidTheme: (theme: MermaidTheme) => void;
  exportScale: number;
  setExportScale: (scale: number) => void;
  handleShare: () => void;
  handleTemplateSelect: (templateCode: string) => void;
}

interface EditorViewModelDeps {
  activeTabId: string;
  activeCode: string;
  activeMermaidTheme: MermaidTheme;
  activeExportScale: number;
  updateTab: (id: string, changes: Record<string, unknown>) => void;
  renderService: IRenderService;
  shareService: IShareService;
  clipboardService: IClipboardService;
}

export function useEditorViewModel({
  activeTabId,
  activeCode,
  activeMermaidTheme,
  activeExportScale,
  updateTab,
  renderService,
  shareService,
  clipboardService,
}: EditorViewModelDeps): EditorViewModelValue {
  const [svgHtml, setSvgHtml] = useState("");
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setCode = useCallback(
    (c: string) => updateTab(activeTabId, { code: c }),
    [activeTabId, updateTab]
  );

  const setExportScale = useCallback(
    (s: number) => updateTab(activeTabId, { exportScale: s }),
    [activeTabId, updateTab]
  );

  const setMermaidTheme = useCallback(
    (t: MermaidTheme) => updateTab(activeTabId, { mermaidTheme: t }),
    [activeTabId, updateTab]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await renderService.render(activeCode, activeMermaidTheme);
      setSvgHtml(result.svg);
      setError(result.error);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [activeCode, activeMermaidTheme, renderService]);

  const diagramType = detectDiagramType(activeCode);
  const parsedElements = useMemo(() => parseDiagramElements(activeCode, diagramType), [activeCode, diagramType]);

  const handleShare = useCallback(() => {
    const url = shareService.encodeAndApply({ code: activeCode, mermaidTheme: activeMermaidTheme });
    clipboardService.writeText(url);
  }, [activeCode, activeMermaidTheme, shareService, clipboardService]);

  const handleTemplateSelect = useCallback(
    (templateCode: string) => {
      setCode(templateCode);
    },
    [setCode]
  );

  return {
    code: activeCode,
    setCode,
    svgHtml,
    error,
    diagramType,
    parsedElements,
    mermaidTheme: activeMermaidTheme,
    setMermaidTheme,
    exportScale: activeExportScale,
    setExportScale,
    handleShare,
    handleTemplateSelect,
  };
}
