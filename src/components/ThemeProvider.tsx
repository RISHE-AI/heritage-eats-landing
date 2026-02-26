import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import { Theme, getThemeById, getDefaultTheme, applyTheme, themes, getAllThemes } from "@/config/themes";

export type ThemeColor = "warm-red" | "royal-purple" | "forest-green" | "saffron-orange" | "deep-blue";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  darkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  allThemes: Theme[];
  availableThemesList: Array<{ id: string; name: string }>;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  themeColor: "warm-red",
  setThemeColor: () => { },
});

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeColor = () => useContext(ThemeColorContext);
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const THEME_COLOR_KEY = "homemade-delights-theme-color";
const SELECTED_THEME_KEY = "maghizam-theme";
const DARK_MODE_KEY = "maghizam-theme-dark";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(THEME_COLOR_KEY) as ThemeColor) || "warm-red";
    }
    return "warm-red";
  });

  const [currentTheme, setCurrentThemeState] = useState<Theme>(getDefaultTheme());
  const [darkMode, setDarkModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_COLOR_KEY, color);
  };

  // Initialize theme and dark mode from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem(SELECTED_THEME_KEY);
    const storedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme) {
      const theme = getThemeById(storedTheme);
      if (theme) {
        setCurrentThemeState(theme);
      }
    }

    const isDark = storedDarkMode ? JSON.parse(storedDarkMode) : prefersDark;
    setDarkModeState(isDark);
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    applyTheme(currentTheme, darkMode);
    localStorage.setItem(SELECTED_THEME_KEY, currentTheme.id);
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode));

    // Update HTML data attributes for CSS selectors
    document.documentElement.setAttribute("data-theme", currentTheme.id);
    document.documentElement.setAttribute("data-dark", darkMode ? "true" : "false");
  }, [currentTheme, darkMode, mounted]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme-color", themeColor);
  }, [themeColor]);

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      setCurrentThemeState(theme);
    }
  };

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
  };

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      <ThemeContext.Provider
        value={{
          currentTheme,
          setTheme,
          darkMode,
          setDarkMode,
          allThemes: themes,
          availableThemesList: getAllThemes(),
        }}
      >
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </ThemeContext.Provider>
    </ThemeColorContext.Provider>
  );
}
