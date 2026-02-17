import { useState, useEffect, useRef, useCallback } from "react";
import type { MermaidTheme, DiagramType } from "../models";
import { detectDiagramType } from "../models";
import type { IRenderService, IShareService, IClipboardService } from "../services";

export interface EditorViewModelValue {
  code: string;
  setCode: (code: string) => void;
  svgHtml: string;
  error: string;
  diagramType: DiagramType;
  mermaidTheme: MermaidTheme;
  setMermaidTheme: (theme: MermaidTheme) => void;
  exportScale: number;
  setExportScale: (scale: number) => void;
  handleShare: () => void;
  handleTemplateSelect: (templateCode: string) => void;
}

export function useEditorViewModel(
  activeTabId: string,
  activeCode: string,
  activeMermaidTheme: MermaidTheme,
  activeExportScale: number,
  updateTab: (id: string, changes: Record<string, unknown>) => void,
  renderService: IRenderService,
  shareService: IShareService,
  clipboardService: IClipboardService,
): EditorViewModelValue {
  const [svgHtml, setSvgHtml] = useState("");
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const code = activeCode;
  const mermaidTheme = activeMermaidTheme;
  const exportScale = activeExportScale;

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
      const result = await renderService.render(code, mermaidTheme);
      setSvgHtml(result.svg);
      setError(result.error);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [code, mermaidTheme, renderService]);

  const diagramType = detectDiagramType(code);

  const handleShare = useCallback(() => {
    const url = shareService.encodeAndApply({ code, mermaidTheme });
    clipboardService.writeText(url);
  }, [code, mermaidTheme, shareService, clipboardService]);

  const handleTemplateSelect = useCallback(
    (templateCode: string) => {
      setCode(templateCode);
    },
    [setCode]
  );

  return {
    code,
    setCode,
    svgHtml,
    error,
    diagramType,
    mermaidTheme,
    setMermaidTheme,
    exportScale,
    setExportScale,
    handleShare,
    handleTemplateSelect,
  };
}
