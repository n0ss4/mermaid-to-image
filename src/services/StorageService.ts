import type { IStorageService } from "./interfaces";
import type { TabState, Theme } from "../models";
import { createTab } from "../models";
import { SAMPLE } from "../utils/constants";

const TAB_STORAGE_KEY = "mermaid-editor-tabs";
const THEME_STORAGE_KEY = "theme";

export class StorageService implements IStorageService {
  loadTabState(): TabState {
    try {
      const raw = localStorage.getItem(TAB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TabState;
        if (parsed.tabs?.length > 0 && parsed.activeTabId) {
          return parsed;
        }
      }
    } catch {}
    const tab = createTab({ name: "Diagram 1", code: SAMPLE });
    return { tabs: [tab], activeTabId: tab.id };
  }

  saveTabState(state: TabState): void {
    localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(state));
  }

  loadTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  saveTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
