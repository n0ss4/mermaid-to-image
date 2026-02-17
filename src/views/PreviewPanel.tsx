import React from "react";
import { ZoomIn, ZoomOut, Scan, Maximize, Minimize } from "lucide-react";
import type { PreviewViewModelValue } from "../viewmodels";

interface PreviewPanelProps {
  preview: PreviewViewModelValue;
  svgHtml: string;
  error: string;
}

export function PreviewPanel({ preview, svgHtml, error }: PreviewPanelProps) {
  const { zoom, pan, viewportRef, handlers, controls, isFullscreen, toggleFullscreen } = preview;
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={`panel preview-panel${isFullscreen ? " preview-fullscreen" : ""}`}
    >
      <div className="panel-header">
        <span className="panel-label">Preview</span>
        <div className="zoom-controls">
          <button
            className="btn-icon"
            onClick={controls.zoomOut}
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="zoom-label">{zoomPercent}%</span>
          <button
            className="btn-icon"
            onClick={controls.zoomIn}
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={controls.fitToView}
            title="Fit to view"
          >
            <Scan size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>
      <div
        className="preview-viewport"
        ref={viewportRef}
        onWheel={handlers.onWheel}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
      >
        {error ? (
          <p className="error-msg">{error}</p>
        ) : svgHtml ? (
          <div
            className="preview-canvas"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <p className="placeholder">Diagram will appear here</p>
        )}
      </div>
    </div>
  );
}
