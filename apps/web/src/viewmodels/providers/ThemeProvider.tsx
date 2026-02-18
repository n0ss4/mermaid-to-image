import { createContext, useContext, type ReactNode } from "react";
import { useThemeViewModel } from "../ThemeViewModel";
import type { ThemeViewModelValue } from "../ThemeViewModel";
import { useServices } from "./ServiceProvider";

const ThemeContext = createContext<ThemeViewModelValue>({
  theme: "light",
  toggle: () => {},
});

export function useThemeVM(): ThemeViewModelValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const { storage } = useServices();
  const vm = useThemeViewModel(storage);

  return (
    <ThemeContext.Provider value={vm}>
      {children}
    </ThemeContext.Provider>
  );
}
