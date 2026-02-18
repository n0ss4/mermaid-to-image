import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Command } from "@repo/core";

export interface CommandPaletteViewModelValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (q: string) => void;
  filteredCommands: Command[];
  selectedIndex: number;
  moveUp: () => void;
  moveDown: () => void;
  executeSelected: () => void;
}

export function useCommandPaletteViewModel(commands: Command[]): CommandPaletteViewModelValue {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prevOpenRef = useRef(false);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      c => c.label.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset query when opening
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setQuery("");
      setSelectedIndex(0);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const moveUp = useCallback(() => {
    setSelectedIndex(i => (i > 0 ? i - 1 : i));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex(i => (i < filteredCommands.length - 1 ? i + 1 : i));
  }, [filteredCommands.length]);

  const executeSelected = useCallback(() => {
    const cmd = filteredCommands[selectedIndex];
    if (cmd) {
      close();
      cmd.action();
    }
  }, [filteredCommands, selectedIndex, close]);

  return {
    isOpen, open, close, toggle,
    query, setQuery,
    filteredCommands,
    selectedIndex,
    moveUp, moveDown, executeSelected,
  };
}
