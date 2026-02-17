import { useEffect, useRef, useCallback } from "react";
import type { ShareState, ExportOptions } from "../models";
import type { IShareService } from "../services";
import { pngExporter } from "../export/png";

export function useUrlHydration(
  shareService: IShareService,
): ShareState | null {
  const ref = useRef<ShareState | null>(undefined as unknown as ShareState | null);

  if (ref.current === undefined) {
    ref.current = shareService.decodeFromUrl(window.location.href);
  }

  useEffect(() => {
    if (ref.current) {
      shareService.clearUrlParams();
    }
  }, [shareService]);

  return ref.current;
}

interface KeyboardShortcutHandlers {
  onNewTab: () => void;
  onCloseTab: () => void;
  onPrevTab: () => void;
  onNextTab: () => void;
  getExportOptions: () => ExportOptions | null;
}

export function useKeyboardShortcuts({
  onNewTab,
  onCloseTab,
  onPrevTab,
  onNextTab,
  getExportOptions,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "s") {
        e.preventDefault();
        const opts = getExportOptions();
        if (opts) pngExporter.export(opts);
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        onNewTab();
        return;
      }

      if (e.key === "w") {
        e.preventDefault();
        onCloseTab();
        return;
      }

      if (e.shiftKey && e.key === "[") {
        e.preventDefault();
        onPrevTab();
        return;
      }

      if (e.shiftKey && e.key === "]") {
        e.preventDefault();
        onNextTab();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNewTab, onCloseTab, onPrevTab, onNextTab, getExportOptions]);
}
