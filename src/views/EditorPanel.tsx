import { useEditorVM } from "../viewmodels";
import { CodeEditor } from "./CodeEditor";
import { SyntaxReference } from "./SyntaxReference";

export function EditorPanel() {
  const { code, setCode, error, diagramType, parsedElements } = useEditorVM();

  return (
    <div className="editor-column">
      <CodeEditor value={code} onChange={setCode} error={error} />
      <SyntaxReference diagramType={diagramType} parsedElements={parsedElements} />
    </div>
  );
}
