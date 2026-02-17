import { useState, useEffect, useRef, useCallback, type RefObject, type WheelEvent, type PointerEvent } from "react";
import { parseSvgDimensions } from "../models";

export interface PreviewViewModelValue {
  zoom: number;
  pan: { x: number; y: number };
  viewportRef: RefObject<HTMLDivElement | null>;
  handlers: {
    onWheel: (e: WheelEvent) => void;
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: () => void;
  };
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
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffset = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // Only auto-fit when svgHtml transitions from empty → non-empty
  // (first render / tab switch), not on every keystroke edit
  const prevSvgRef = useRef("");
  useEffect(() => {
    const wasEmpty = !prevSvgRef.current;
    prevSvgRef.current = svgHtml;
    if (wasEmpty && svgHtml) {
      requestAnimationFrame(() => fitToView());
    }
  }, [svgHtml, fitToView]);

  // Fullscreen escape handler
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(Math.max(0.1, z + delta), 10));
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOffset.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({
      x: panOffset.current.x + dx,
      y: panOffset.current.y + dy,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 10)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.1)), []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  return {
    zoom,
    pan,
    viewportRef,
    handlers: {
      onWheel: handleWheel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    controls: { zoomIn, zoomOut, fitToView, fitToWidth },
    isFullscreen,
    toggleFullscreen,
  };
}
