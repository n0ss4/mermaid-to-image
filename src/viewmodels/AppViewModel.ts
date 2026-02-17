import { useEffect, useRef } from "react";
import type { ShareState, ExportOptions } from "../models";
import type { IShareService } from "../services";
import { pngExporter } from "../export/png";

export function useUrlHydration(
  shareService: IShareService,
): ShareState | null {
  const ref = useRef<ShareState | null>(undefined as unknown as ShareState | null);

  if (ref.current === undefined) {
    ref.current = shareService.decodeFromUrl(globalThis.location.href);
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
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onShowShortcuts: () => void;
  getExportOptions: () => ExportOptions | null;
}

export function useKeyboardShortcuts({
  onNewTab,
  onCloseTab,
  onPrevTab,
  onNextTab,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onShowShortcuts,
  getExportOptions,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Alt-based shortcuts — use e.code (physical key) because
      // macOS Option+key produces special characters in e.key
      if (e.altKey) {
        if (e.code === "KeyS") {
          e.preventDefault();
          const opts = getExportOptions();
          if (opts) pngExporter.export(opts);
          return;
        }

        if (e.code === "KeyN") {
          e.preventDefault();
          onNewTab();
          return;
        }

        if (e.code === "KeyW") {
          e.preventDefault();
          onCloseTab();
          return;
        }

        if (e.code === "Equal") {
          e.preventDefault();
          onZoomIn();
          return;
        }

        if (e.code === "Minus") {
          e.preventDefault();
          onZoomOut();
          return;
        }

        if (e.code === "Digit0") {
          e.preventDefault();
          onZoomReset();
          return;
        }
      }

      // Ctrl/⌘-based shortcuts — use e.code for consistency
      if (mod) {
        if (e.shiftKey && e.code === "BracketLeft") {
          e.preventDefault();
          onPrevTab();
          return;
        }

        if (e.shiftKey && e.code === "BracketRight") {
          e.preventDefault();
          onNextTab();
          return;
        }

        if (e.code === "Slash") {
          e.preventDefault();
          onShowShortcuts();
        }
      }
    };

    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [onNewTab, onCloseTab, onPrevTab, onNextTab, onZoomIn, onZoomOut, onZoomReset, onShowShortcuts, getExportOptions]);
}
