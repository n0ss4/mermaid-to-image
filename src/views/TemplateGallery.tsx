import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import mermaid from "mermaid";
import { TEMPLATES } from "../utils/templates";
import { DEFAULT_MERMAID_CONFIG } from "../utils/constants";

interface TemplateGalleryProps {
  onSelect: (code: string) => void;
  onClose: () => void;
}

export function TemplateGallery({ onSelect, onClose }: TemplateGalleryProps) {
  const categories = [...new Set(TEMPLATES.map((t) => t.category))];
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [rendered, setRendered] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function renderAll() {
      mermaid.initialize({ ...DEFAULT_MERMAID_CONFIG, theme: "default" });
      for (const t of TEMPLATES) {
        if (cacheRef.current.has(t.name)) continue;
        try {
          const id = `tmpl-${t.name.replace(/\s+/g, "-")}-${Date.now()}`;
          const { svg } = await mermaid.render(id, t.code.trim());
          cacheRef.current.set(t.name, svg);
          if (!cancelled) {
            setRendered(new Map(cacheRef.current));
          }
        } catch {}
      }
    }
    renderAll();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="template-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-header">
          <h2>Templates</h2>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>
        <div className="template-body">
          {categories.map((cat) => (
            <div key={cat} className="template-category">
              <h3>{cat}</h3>
              <div className="template-grid">
                {TEMPLATES.filter((t) => t.category === cat).map((t) => (
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
                    <span className="template-card-name">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
