import type { MermaidTheme } from "./Theme";

export interface Tab {
  id: string;
  name: string;
  code: string;
  mermaidTheme: MermaidTheme;
  exportScale: number;
  createdAt: number;
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string;
}

export type TabAction =
  | { type: "ADD_TAB"; tab?: Partial<Tab> }
  | { type: "CLOSE_TAB"; id: string }
  | { type: "SET_ACTIVE"; id: string }
  | { type: "UPDATE_TAB"; id: string; changes: Partial<Tab> }
  | { type: "RENAME_TAB"; id: string; name: string };

export const MAX_TABS = 20;

export function createTab(overrides?: Partial<Tab>): Tab {
  return {
    id: crypto.randomUUID(),
    name: overrides?.name ?? "Untitled",
    code: overrides?.code ?? "",
    mermaidTheme: overrides?.mermaidTheme ?? "default",
    exportScale: overrides?.exportScale ?? 4,
    createdAt: Date.now(),
    ...overrides,
  };
}

export function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "ADD_TAB": {
      if (state.tabs.length >= MAX_TABS) return state;
      const tab = createTab(action.tab);
      return { tabs: [...state.tabs, tab], activeTabId: tab.id };
    }
    case "CLOSE_TAB": {
      const remaining = state.tabs.filter((t) => t.id !== action.id);
      if (remaining.length === 0) {
        const fresh = createTab();
        return { tabs: [fresh], activeTabId: fresh.id };
      }
      const newActive =
        state.activeTabId === action.id
          ? remaining[Math.min(
              state.tabs.findIndex((t) => t.id === action.id),
              remaining.length - 1
            )]!.id
          : state.activeTabId;
      return { tabs: remaining, activeTabId: newActive };
    }
    case "SET_ACTIVE":
      return { ...state, activeTabId: action.id };
    case "UPDATE_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, ...action.changes } : t
        ),
      };
    case "RENAME_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, name: action.name } : t
        ),
      };
    default:
      return state;
  }
}
