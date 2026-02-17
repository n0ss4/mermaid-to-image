import React, { useCallback, useRef, useState } from "react";

interface ResizeHandleProps {
  onResize: (fraction: number) => void;
}

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const layout = containerRef.current?.parentElement;
      if (!layout) return;
      const rect = layout.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = Math.min(Math.max(x / rect.width, 0.2), 0.8);
      onResize(fraction);
    },
    [dragging, onResize]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`resize-handle${dragging ? " resize-dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
