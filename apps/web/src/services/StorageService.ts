import type { IStorageService } from "./interfaces";
import { createTab, SAMPLE_DIAGRAM, type TabState, type Theme } from "@repo/core";

const TAB_STORAGE_KEY = "mermaid-editor-tabs";
const THEME_STORAGE_KEY = "theme";

export class StorageService implements IStorageService {
  private toPersistedState(state: TabState): TabState {
    return {
      ...state,
      tabs: state.tabs.map((tab) => {
        const { docCache: _docCache, ...rest } = tab;
        return rest;
      }),
    };
  }

  loadTabState(): TabState {
    try {
      const raw = localStorage.getItem(TAB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TabState;
        if (parsed.tabs?.length > 0 && parsed.activeTabId) {
          return parsed;
        }
      }
    } catch { /* ignore corrupted localStorage */ }
    const tab = createTab({ name: "Diagram 1", code: SAMPLE_DIAGRAM });
    return { tabs: [tab], activeTabId: tab.id };
  }

  saveTabState(state: TabState): void {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(this.toPersistedState(state)));
    } catch {
      // Ignore storage quota/security errors; in-memory state remains source of truth.
    }
  }

  loadTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota/security errors.
    }
  }
}
