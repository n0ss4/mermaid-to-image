import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Maximize, Minimize } from "lucide-react";
import { useDiagramComposerVM, useEditorVM } from "../viewmodels";
import { CodeEditor } from "./CodeEditor";
import { SyntaxReference } from "./SyntaxReference";
import { OutlinePanel } from "./OutlinePanel";
import { DiagramCanvas } from "./diagram-canvas/DiagramCanvas";

export function EditorPanel() {
  const { code, setCode, error, diagramType, parsedElements } = useEditorVM();
  const composer = useDiagramComposerVM();
  const [showOutline, setShowOutline] = useState(false);
  const [isComposerFullscreen, setIsComposerFullscreen] = useState(false);
  const [showComposerTools, setShowComposerTools] = useState(false);
  const visualSupported = diagramType === "flowchart" || code.trim() === "";

  useEffect(() => {
    if (!visualSupported && composer.mode !== "text") {
      composer.setMode("text");
    }
  }, [visualSupported, composer.mode, composer.setMode]);

  useEffect(() => {
    if (composer.mode === "text") {
      setShowComposerTools(false);
    }
  }, [composer.mode]);

  useEffect(() => {
    if (!isComposerFullscreen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      const isEditingField = !!target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );
      if (isEditingField) return;
      setIsComposerFullscreen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isComposerFullscreen]);

  const directionOptions: Array<{
    value: typeof composer.document.direction;
    label: string;
    icon: typeof ArrowDown;
  }> = [
    { value: "TD", label: "Down", icon: ArrowDown },
    { value: "BT", label: "Up", icon: ArrowUp },
    { value: "LR", label: "Right", icon: ArrowRight },
    { value: "RL", label: "Left", icon: ArrowLeft },
  ];

  return (
    <div className="editor-column">
      <div className="editor-mode-toggle">
        <button
          className={`btn-secondary btn-sm${composer.mode === "text" ? " active" : ""}`}
          onClick={() => composer.setMode("text")}
        >
          Text
        </button>
        <button
          className={`btn-secondary btn-sm${composer.mode === "split" ? " active" : ""}`}
          disabled={!visualSupported}
          onClick={() => composer.setMode("split")}
        >
          Split
        </button>
        <button
          className={`btn-secondary btn-sm${composer.mode === "visual" ? " active" : ""}`}
          disabled={!visualSupported}
          onClick={() => composer.setMode("visual")}
        >
          Visual
        </button>
      </div>
      {!visualSupported && (
        <p className="composer-warnings-inline">
          Visual/Split is only available for flowcharts (`flowchart` or `graph`).
        </p>
      )}

      {(composer.mode === "text" || composer.mode === "split") && (
        <CodeEditor value={code} onChange={setCode} error={error} />
      )}

      {visualSupported && (composer.mode === "visual" || composer.mode === "split") && (
        <div className={`panel editor-panel visual-panel${composer.mode === "split" ? " split-panel" : ""}${isComposerFullscreen ? " composer-fullscreen" : ""}`}>
          <div className="panel-header">
            <span className="panel-label">Flowchart Composer</span>
            <div className={`preview-settings composer-controls${showComposerTools ? " open" : ""}`}>
              <div className="direction-toggle" role="radiogroup" aria-label="Flow direction">
                {directionOptions.map((option) => {
                  const Icon = option.icon;
                  const active = composer.document.direction === option.value;
                  return (
                    <button
                      key={option.value}
                      className={`btn-secondary btn-sm${active ? " active" : ""}`}
                      type="button"
                      aria-checked={active}
                      role="radio"
                      title={`Direction: ${option.label}`}
                      onClick={() => {
                        composer.setDirection(option.value);
                        setShowComposerTools(false);
                      }}
                    >
                      <Icon size={12} /> <span className="direction-label">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <button className="btn-secondary btn-sm" onClick={() => { composer.addNode(); setShowComposerTools(false); }}>New Node</button>
              <button className="btn-secondary btn-sm" onClick={() => { composer.removeSelected(); setShowComposerTools(false); }} disabled={!composer.selection}>
                Delete
              </button>
              <button
                className="btn-icon"
                type="button"
                onClick={() => {
                  setIsComposerFullscreen((v) => !v);
                  setShowComposerTools(false);
                }}
                title={isComposerFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isComposerFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
            </div>
            <button
              className="btn-secondary btn-sm composer-tools-btn"
              type="button"
              onClick={() => setShowComposerTools((v) => !v)}
              aria-expanded={showComposerTools}
            >
              Tools
            </button>
          </div>
          <DiagramCanvas
            document={composer.document}
            selection={composer.selection}
            onSelect={composer.setSelection}
            onNodeMove={composer.updateNodePosition}
            onConnectNodes={composer.connectNodes}
            onUpdateNodeLabel={composer.updateNodeLabel}
            onCreateNodeAt={composer.addNodeAt}
          />
          {composer.warnings.length > 0 && (
            <div className="composer-warnings">
              {composer.warnings.slice(0, 3).map((w, i) => (
                <p key={`${w.code}-${i}`}>{w.line ? `Line ${w.line}: ` : ""}{w.message}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {composer.mode !== "visual" && showOutline ? (
        <div className="syntax-ref">
          <button
            className="syntax-ref-toggle"
            onClick={() => setShowOutline(false)}
          >
            <span>Outline</span>
          </button>
          <OutlinePanel elements={parsedElements} />
        </div>
      ) : composer.mode !== "visual" ? (
        <SyntaxReference
          diagramType={diagramType}
          parsedElements={parsedElements}
          onToggleOutline={() => setShowOutline(true)}
        />
      ) : null}
    </div>
  );
}
