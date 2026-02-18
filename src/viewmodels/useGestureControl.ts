import { useEffect, useRef, useCallback, type RefObject, type Dispatch, type SetStateAction, type PointerEvent } from "react";

interface Point { x: number; y: number }

export interface GestureHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: (e: PointerEvent) => void;
}

export function useGestureControl(
  viewportRef: RefObject<HTMLDivElement | null>,
  pan: Point,
  setZoom: Dispatch<SetStateAction<number>>,
  setPan: Dispatch<SetStateAction<Point>>,
): GestureHandlers {
  const pointersRef = useRef(new Map<number, Point>());
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchCenter = useRef<Point | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef<Point>({ x: 0, y: 0 });
  const panOffset = useRef<Point>({ x: 0, y: 0 });

  // Attach wheel listener imperatively with { passive: false }
  // so preventDefault() works (React's onWheel is passive by default).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(Math.max(0.1, z + delta), 10));
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [viewportRef, setZoom]);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      const vp = viewportRef.current;
      if (vp) vp.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 1) {
        // Single pointer — start panning
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        panOffset.current = { ...pan };
      } else if (pointersRef.current.size === 2) {
        // Second pointer — switch to pinch mode
        isPanning.current = false;
        const pts = [...pointersRef.current.values()];
        const a = pts[0]!, b = pts[1]!;
        lastPinchDist.current = Math.hypot(b.x - a.x, b.y - a.y);
        lastPinchCenter.current = {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2,
        };
      }
    },
    [pan, viewportRef]
  );

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1 && isPanning.current) {
      // Single-finger pan
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({
        x: panOffset.current.x + dx,
        y: panOffset.current.y + dy,
      });
    } else if (pointersRef.current.size === 2) {
      // Pinch-to-zoom + two-finger pan
      const pts = [...pointersRef.current.values()];
      const a = pts[0]!, b = pts[1]!;
      const newDist = Math.hypot(b.x - a.x, b.y - a.y);
      const newCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      if (lastPinchDist.current != null && lastPinchCenter.current != null) {
        const ratio = newDist / lastPinchDist.current;
        setZoom((z) => Math.min(Math.max(0.1, z * ratio), 10));

        const dx = newCenter.x - lastPinchCenter.current.x;
        const dy = newCenter.y - lastPinchCenter.current.y;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      }

      lastPinchDist.current = newDist;
      lastPinchCenter.current = newCenter;
    }
  }, [setPan, setZoom]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const vp = viewportRef.current;
    if (vp) {
      try { vp.releasePointerCapture(e.pointerId); } catch {}
    }
    const wasPinching = pointersRef.current.size === 2;
    pointersRef.current.delete(e.pointerId);

    if (wasPinching && pointersRef.current.size === 1) {
      // Dropping from 2→1: reset pinch state, restart pan from remaining pointer
      lastPinchDist.current = null;
      lastPinchCenter.current = null;
      const remaining = [...pointersRef.current.values()][0]!;
      isPanning.current = true;
      panStart.current = { x: remaining.x, y: remaining.y };
      setPan((p) => {
        panOffset.current = { ...p };
        return p;
      });
    } else if (pointersRef.current.size === 0) {
      isPanning.current = false;
      lastPinchDist.current = null;
      lastPinchCenter.current = null;
    }
  }, [viewportRef, setPan]);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  };
}
