import { useEffect, useRef, useState } from "react";
import { X, Trash2 } from "lucide-react";
import mermaid from "mermaid";
import { TEMPLATES, type Template } from "@repo/core";
import { DEFAULT_MERMAID_CONFIG } from "../utils/constants";

interface TemplateGalleryProps {
  readonly onSelect: (code: string) => void;
  readonly onClose: () => void;
  readonly customTemplates?: Template[];
  readonly onDeleteCustom?: (name: string) => void;
  readonly onSaveCurrent?: (name: string) => void;
  readonly currentCode?: string;
}

export function TemplateGallery({ onSelect, onClose, customTemplates, onDeleteCustom, onSaveCurrent, currentCode }: TemplateGalleryProps) {
  const allTemplates = [...(customTemplates ?? []), ...TEMPLATES];
  const categories = [...new Set(allTemplates.map((t) => t.category))];
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [rendered, setRendered] = useState<Map<string, string>>(new Map());
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function renderAll() {
      mermaid.initialize({ ...DEFAULT_MERMAID_CONFIG, theme: "default" });
      for (const t of allTemplates) {
        if (cacheRef.current.has(t.name)) continue;
        try {
          const id = `tmpl-${t.name.replace(/\s+/g, "-")}-${Date.now()}`;
          const { svg } = await mermaid.render(id, t.code.trim());
          cacheRef.current.set(t.name, svg);
          if (!cancelled) {
            setRendered(new Map(cacheRef.current));
          }
        } catch { /* template render failures are expected and silently skipped */ }
      }
    }
    renderAll();
    return () => { cancelled = true; };
  }, [customTemplates]);

  const handleSave = () => {
    if (saveName.trim() && currentCode?.trim() && onSaveCurrent) {
      onSaveCurrent(saveName.trim());
      setSaveName("");
    }
  };

  return (
    <div className="template-overlay" role="presentation" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-header">
          <h2>Templates</h2>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>
        <div className="template-body">
          {onSaveCurrent && currentCode?.trim() && (
            <div className="template-save-row">
              <input
                className="template-save-input"
                type="text"
                placeholder="Save current as..."
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
              />
              <button className="btn-secondary btn-sm" onClick={handleSave} disabled={!saveName.trim()}>
                Save
              </button>
            </div>
          )}
          {categories.map((cat) => (
            <div key={cat} className="template-category">
              <h3>{cat}</h3>
              <div className="template-grid">
                {allTemplates.filter((t) => t.category === cat).map((t) => {
                  const isCustom = customTemplates?.some(ct => ct.name === t.name);
                  return (
                    <button
                      key={t.name}
                      className="template-card"
                      onClick={() => {
                        onSelect(t.code);
                        onClose();
                      }}
                    >
                      <div className="template-thumbnail">
                        {rendered.has(t.name) ? (
                          <div
                            className="template-thumbnail-svg"
                            dangerouslySetInnerHTML={{ __html: rendered.get(t.name)! }}
                          />
                        ) : (
                          <div className="template-thumbnail-shimmer" />
                        )}
                      </div>
                      <span className="template-card-name">
                        {t.name}
                        {isCustom && onDeleteCustom && (
                          <span
                            className="template-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustom(t.name);
                            }}
                          >
                            <Trash2 size={11} />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
