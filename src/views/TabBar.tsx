import React, { useState, useRef, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { useTabVM } from "../viewmodels";

export function TabBar() {
  const { tabs, activeTabId, setActive, closeTab, addTab, renameTab } = useTabVM();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editRef = useRef<HTMLSpanElement>(null);

  const handleDoubleClick = useCallback((id: string) => {
    setEditingId(id);
    requestAnimationFrame(() => {
      const el = editRef.current;
      if (el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }, []);

  const commitRename = useCallback(
    (id: string) => {
      const el = editRef.current;
      if (el) {
        const name = el.textContent?.trim() || "Untitled";
        renameTab(id, name);
      }
      setEditingId(null);
    },
    [renameTab]
  );

  return (
    <div className="tab-bar">
      <div className="tab-bar-scroll">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab${tab.id === activeTabId ? " tab-active" : ""}`}
            onClick={() => setActive(tab.id)}
            onDoubleClick={() => handleDoubleClick(tab.id)}
          >
            {editingId === tab.id ? (
              <span
                ref={editRef}
                className="tab-name"
                contentEditable
                suppressContentEditableWarning
                onBlur={() => commitRename(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitRename(tab.id);
                  }
                  if (e.key === "Escape") setEditingId(null);
                }}
              >
                {tab.name}
              </span>
            ) : (
              <span className="tab-name">{tab.name}</span>
            )}
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                title="Close tab"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="tab-add" onClick={() => addTab()} title="New tab">
        <Plus size={14} />
      </button>
    </div>
  );
}
