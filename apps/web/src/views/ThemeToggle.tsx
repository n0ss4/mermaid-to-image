import { Moon, Sun } from "lucide-react";
import { useThemeVM } from "../viewmodels";

export function ThemeToggle() {
  const { theme, toggle } = useThemeVM();

  return (
    <button
      className="btn-icon theme-toggle"
      onClick={toggle}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
