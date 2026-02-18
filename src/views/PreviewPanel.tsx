import { ZoomIn, ZoomOut, Scan, MoveHorizontal, Maximize, Minimize, AlertTriangle } from "lucide-react";
import type { PreviewViewModelValue } from "../viewmodels";
import type { MermaidTheme } from "../models";
import { MERMAID_THEMES, parseSvgDimensions } from "../models";
import { formatError } from "../utils/formatError";

interface PreviewPanelProps {
  readonly preview: PreviewViewModelValue;
  readonly svgHtml: string;
  readonly error: string;
  readonly mermaidTheme: MermaidTheme;
  readonly onMermaidThemeChange: (theme: MermaidTheme) => void;
  readonly exportScale: number;
  readonly onScaleChange: (scale: number) => void;
}

export function PreviewPanel({ preview, svgHtml, error, mermaidTheme, onMermaidThemeChange, exportScale, onScaleChange }: PreviewPanelProps) {
  const { zoom, pan, viewportRef, handlers, controls, isFullscreen, toggleFullscreen } = preview;
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={`panel preview-panel${isFullscreen ? " preview-fullscreen" : ""}`}
    >
      <div className="panel-header">
        <span className="panel-label">Preview</span>
        <div className="preview-settings">
          <select
            value={mermaidTheme}
            onChange={(e) => onMermaidThemeChange(e.target.value as MermaidTheme)}
          >
            {MERMAID_THEMES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={exportScale}
            onChange={(e) => onScaleChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 6, 8].map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
        </div>
        <div className="zoom-controls">
          <button
            className="btn-icon"
            onClick={controls.zoomOut}
            title="Zoom out (⌘-)"
          >
            <ZoomOut size={14} />
          </button>
          <span className="zoom-label">{zoomPercent}%</span>
          <button
            className="btn-icon"
            onClick={controls.zoomIn}
            title="Zoom in (⌘+)"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={controls.fitToView}
            title="Fit to view (⌘0)"
          >
            <Scan size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={controls.fitToWidth}
            title="Fit width"
          >
            <MoveHorizontal size={14} />
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
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
      >
        {error && (
          <p className="error-msg">
            <AlertTriangle size={14} /> {formatError(error)}
          </p>
        )}
        {!error && svgHtml && (
          <div
            className="preview-canvas"
            style={{
              ...(() => { const d = parseSvgDimensions(svgHtml); return { width: d.w, height: d.h }; })(),
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
        {!error && !svgHtml && (
          <p className="placeholder">Diagram will appear here</p>
        )}
      </div>
    </div>
  );
}
