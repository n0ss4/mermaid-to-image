import { useReducer, useEffect, useRef, useCallback } from "react";
import type { Tab, TabState } from "@repo/core";
import { tabReducer } from "@repo/core";
import type { IStorageService } from "../services";

export interface TabViewModelValue {
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  addTab: (tab?: Partial<Tab>) => void;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  updateTab: (id: string, changes: Partial<Tab>) => void;
  renameTab: (id: string, name: string) => void;
}

export function useTabViewModel(storage: IStorageService): TabViewModelValue {
  const [state, dispatch] = useReducer(
    tabReducer,
    null,
    () => storage.loadTabState()
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      storage.saveTabState(state);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [state, storage]);

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0]!;

  const addTab = useCallback((tab?: Partial<Tab>) => dispatch({ type: "ADD_TAB", tab }), []);
  const closeTab = useCallback((id: string) => dispatch({ type: "CLOSE_TAB", id }), []);
  const setActive = useCallback((id: string) => dispatch({ type: "SET_ACTIVE", id }), []);
  const updateTab = useCallback(
    (id: string, changes: Partial<Tab>) => dispatch({ type: "UPDATE_TAB", id, changes }),
    []
  );
  const renameTab = useCallback(
    (id: string, name: string) => dispatch({ type: "RENAME_TAB", id, name }),
    []
  );

  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    activeTab,
    addTab,
    closeTab,
    setActive,
    updateTab,
    renameTab,
  };
}
