import { useEffect, useRef, useCallback, useState, type DragEvent } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState, StateEffect, StateField, RangeSet } from "@codemirror/state";
import { Decoration, type DecorationSet, gutter, GutterMarker } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Upload, AlertTriangle } from "lucide-react";
import { useThemeVM } from "../viewmodels";
import { mermaid } from "../lang/mermaid-lang";
import { parseErrorLine } from "../utils/parseErrorLine";
import { formatError } from "../utils/formatError";

const setErrorLine = StateEffect.define<number | null>();

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value === null) return Decoration.none;
        const line = e.value;
        if (line > 0 && line <= tr.state.doc.lines) {
          const lineObj = tr.state.doc.line(line);
          return Decoration.set([
            Decoration.line({ class: "cm-error-line" }).range(lineObj.from),
          ]);
        }
        return Decoration.none;
      }
    }
    return deco;
  },
});

class ErrorMarker extends GutterMarker {
  override toDOM() {
    const span = document.createElement("span");
    span.className = "cm-error-marker";
    span.textContent = "\u25CF";
    return span;
  }
}

const errorMarkerInstance = new ErrorMarker();

const errorGutterField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(markers, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value === null) return RangeSet.empty;
        const line = e.value;
        if (line > 0 && line <= tr.state.doc.lines) {
          const lineObj = tr.state.doc.line(line);
          return RangeSet.of([errorMarkerInstance.range(lineObj.from)]);
        }
        return RangeSet.empty;
      }
    }
    return markers;
  },
});

const errorGutter = gutter({
  class: "cm-error-gutter",
  markers: (v) => v.state.field(errorGutterField),
});

interface CodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}

export function CodeEditor({ value, onChange, error }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const { theme } = useThemeVM();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  onChangeRef.current = onChange;

  const handleImport = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange]
  );

  const handleFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      if (text) handleImport(text);
    },
    [handleImport]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const extensions = [
      basicSetup,
      mermaid(),
      keymap.of([indentWithTab]),
      updateListener,
      EditorView.lineWrapping,
      errorLineField,
      errorGutterField,
      errorGutter,
    ];

    if (theme === "dark") {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const line = error ? parseErrorLine(error) : null;
    view.dispatch({ effects: setErrorLine.of(line) });
  }, [error]);

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <span className="panel-label">Editor</span>
        <button
          className="btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="Import file"
        >
          <Upload size={14} />
        </button>
      </div>
      {error && (
        <div className="editor-error-banner">
          <AlertTriangle size={14} />
          <span>{formatError(error)}</span>
        </div>
      )}
      <div
        className={`code-editor-wrap${dragOver ? " drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          setDragOver(false);
          handleDrop(e);
        }}
      >
        <div ref={containerRef} className="code-editor" />
        {dragOver && (
          <div className="editor-drop-overlay">
            <p>Drop file here</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mmd,.mermaid,.md,.txt"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
