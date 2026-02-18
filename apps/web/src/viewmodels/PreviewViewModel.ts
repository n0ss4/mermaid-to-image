import { useState, useEffect, useLayoutEffect, useRef, useCallback, type RefObject } from "react";
import { parseSvgDimensions } from "@repo/core";
import { useGestureControl, type GestureHandlers } from "./useGestureControl";

export interface PreviewViewModelValue {
  zoom: number;
  pan: { x: number; y: number };
  viewportRef: RefObject<HTMLDivElement | null>;
  handlers: GestureHandlers;
  controls: {
    zoomIn: () => void;
    zoomOut: () => void;
    fitToView: () => void;
    fitToWidth: () => void;
  };
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export function usePreviewViewModel(svgHtml: string): PreviewViewModelValue {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const handlers = useGestureControl(viewportRef, pan, setZoom, setPan);

  const fitToView = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !svgHtml) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    if (vpW === 0 || vpH === 0) return;
    const { w: svgW, h: svgH } = parseSvgDimensions(svgHtml);
    const PADDING = 0.95;
    const scaleX = (vpW / svgW) * PADDING;
    const scaleY = (vpH / svgH) * PADDING;
    const newZoom = Math.min(scaleX, scaleY, 1);
    setZoom(Math.max(newZoom, 0.1));
    setPan({ x: 0, y: 0 });
  }, [svgHtml]);

  const fitToWidth = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !svgHtml) return;
    const vpW = vp.clientWidth;
    const { w: svgW } = parseSvgDimensions(svgHtml);
    const newZoom = (vpW / svgW) * 0.95;
    setZoom(Math.max(Math.min(newZoom, 1), 0.1));
    setPan({ x: 0, y: 0 });
  }, [svgHtml]);

  // Reset to 100% zoom when svgHtml transitions from empty → non-empty
  // (first render / tab switch), not on every keystroke edit.
  const prevSvgRef = useRef("");
  useLayoutEffect(() => {
    const wasEmpty = !prevSvgRef.current;
    prevSvgRef.current = svgHtml;
    if (wasEmpty && svgHtml) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [svgHtml]);

  // Fullscreen escape handler
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 10)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.1)), []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  return {
    zoom,
    pan,
    viewportRef,
    handlers,
    controls: { zoomIn, zoomOut, fitToView, fitToWidth },
    isFullscreen,
    toggleFullscreen,
  };
}
