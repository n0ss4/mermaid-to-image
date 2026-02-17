import React, { createContext, useContext } from "react";
import { useTabViewModel } from "../TabViewModel";
import type { TabViewModelValue } from "../TabViewModel";
import { useServices } from "./ServiceProvider";

const TabContext = createContext<TabViewModelValue | null>(null);

export function useTabVM(): TabViewModelValue {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTabVM must be used within TabProvider");
  return ctx;
}

export function TabProvider({ children }: { children: React.ReactNode }) {
  const { storage } = useServices();
  const vm = useTabViewModel(storage);

  return (
    <TabContext.Provider value={vm}>
      {children}
    </TabContext.Provider>
  );
}
