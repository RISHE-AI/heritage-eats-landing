import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = "warm-red" | "royal-purple" | "forest-green" | "saffron-orange" | "deep-blue";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  themeColor: "warm-red",
  setThemeColor: () => { },
});

export const useThemeColor = () => useContext(ThemeColorContext);

const THEME_COLOR_KEY = "homemade-delights-theme-color";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(THEME_COLOR_KEY) as ThemeColor) || "warm-red";
    }
    return "warm-red";
  });

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_COLOR_KEY, color);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme-color", themeColor);
  }, [themeColor]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeColorContext.Provider>
  );
}
