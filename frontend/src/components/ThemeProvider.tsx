import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { themes, getSavedTheme, saveTheme, applyTheme, isThemeDark } from "@/config/themes";
import type { ThemeInfo } from "@/config/themes";

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  themeInfo: ThemeInfo;
  isDark: boolean;
  allThemes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<string>(() => getSavedTheme());
  const [mounted, setMounted] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    const saved = getSavedTheme();
    setCurrentTheme(saved);
    applyTheme(saved);
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;
    applyTheme(currentTheme);
    saveTheme(currentTheme);
  }, [currentTheme, mounted]);

  const setTheme = useCallback((themeId: string) => {
    const exists = themes.find((t) => t.id === themeId);
    if (exists) {
      setCurrentTheme(themeId);
    }
  }, []);

  const themeInfo = themes.find((t) => t.id === currentTheme) || themes[0];
  const isDark = isThemeDark(currentTheme);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeInfo,
        isDark,
        allThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
