import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  readonly onClose: () => void;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "\u2318" : "Ctrl";
const alt = isMac ? "\u2325" : "Alt";

const SHORTCUTS = [
  { description: "Command Palette", keys: [mod, "Shift", "P"] },
  { description: "New tab", keys: [alt, "N"] },
  { description: "Close tab", keys: [alt, "W"] },
  { description: "Previous tab", keys: [mod, "Shift", "["] },
  { description: "Next tab", keys: [mod, "Shift", "]"] },
  { description: "Save as PNG", keys: [alt, "S"] },
  { description: "Export PDF", keys: [alt, "Shift", "S"] },
  { description: "Toggle transparent BG", keys: [alt, "T"] },
  { description: "Save as template", keys: [alt, "Shift", "T"] },
  { description: "Version history", keys: [alt, "H"] },
  { description: "Zoom in", keys: [alt, "+"] },
  { description: "Zoom out", keys: [alt, "\u2212"] },
  { description: "Fit to view", keys: [alt, "0"] },
  { description: "Find / Replace", keys: [mod, "F"] },
  { description: "Keyboard shortcuts", keys: [mod, "/"] },
];

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="template-overlay" onClick={onClose}>
      <div
        className="shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="template-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="shortcuts-body">
          <div className="shortcuts-grid">
            {SHORTCUTS.map((s) => (
              <div key={s.description} className="shortcut-row">
                <span className="shortcut-desc">{s.description}</span>
                <span className="shortcut-keys">
                  {s.keys.map((k, i) => (
                    <span key={i}>
                      {i > 0 && <span className="shortcut-plus">+</span>}
                      <kbd className="kbd">{k}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
