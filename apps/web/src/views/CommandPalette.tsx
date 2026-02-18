import { useEffect, useRef } from "react";
import type { CommandPaletteViewModelValue } from "../viewmodels/CommandPaletteViewModel";

interface CommandPaletteProps {
  readonly vm: CommandPaletteViewModelValue;
}

export function CommandPalette({ vm }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vm.isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [vm.isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[vm.selectedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: "nearest" });
  }, [vm.selectedIndex]);

  if (!vm.isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") { e.preventDefault(); vm.moveUp(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); vm.moveDown(); }
    else if (e.key === "Enter") { e.preventDefault(); vm.executeSelected(); }
    else if (e.key === "Escape") { e.preventDefault(); vm.close(); }
  };

  return (
    <div className="template-overlay" onClick={vm.close}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          placeholder="Type a command..."
          value={vm.query}
          onChange={e => vm.setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-list" ref={listRef}>
          {vm.filteredCommands.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`command-palette-item${i === vm.selectedIndex ? " command-palette-item-selected" : ""}`}
              onClick={() => { vm.close(); cmd.action(); }}
              onMouseEnter={() => vm.setQuery(vm.query)} // keep query, just update hover
            >
              <span className="command-palette-label">
                <span className="command-palette-category">{cmd.category}</span>
                {cmd.label}
              </span>
              {cmd.shortcut && (
                <span className="shortcut-keys">
                  {cmd.shortcut.map((k, j) => (
                    <span key={j}>
                      {j > 0 && <span className="shortcut-plus">+</span>}
                      <kbd className="kbd">{k}</kbd>
                    </span>
                  ))}
                </span>
              )}
            </button>
          ))}
          {vm.filteredCommands.length === 0 && (
            <div className="command-palette-empty">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
}
