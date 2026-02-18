import { useState, useEffect, useCallback } from "react";
import type { Theme } from "@repo/core";
import type { IStorageService } from "../services";

export interface ThemeViewModelValue {
  theme: Theme;
  toggle: () => void;
}

export function useThemeViewModel(storage: IStorageService): ThemeViewModelValue {
  const [theme, setTheme] = useState<Theme>(() => storage.loadTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.saveTheme(theme);
  }, [theme, storage]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggle };
}
