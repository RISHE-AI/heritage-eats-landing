/**
 * DaisyUI-inspired Theme Configuration
 * 10 themes: light, dark, valentine, halloween, garden, forest, black, luxury, silk, abyss
 * Uses CSS custom properties via data-theme attribute on <html>
 */

export interface ThemeInfo {
  id: string;
  name: string;
  isDark: boolean;
  preview: string; // primary color hex for preview dot
}

export const themes: ThemeInfo[] = [
  { id: "light", name: "Light", isDark: false, preview: "#d32f2f" },
  { id: "dark", name: "Dark", isDark: true, preview: "#d32f2f" },
  { id: "valentine", name: "Valentine", isDark: false, preview: "#e96d7b" },
  { id: "halloween", name: "Halloween", isDark: true, preview: "#f28c18" },
  { id: "garden", name: "Garden", isDark: false, preview: "#5c7f67" },
  { id: "forest", name: "Forest", isDark: true, preview: "#1eb854" },
  { id: "black", name: "Black", isDark: true, preview: "#343232" },
  { id: "luxury", name: "Luxury", isDark: true, preview: "#dca54c" },
  { id: "silk", name: "Silk", isDark: false, preview: "#8b6f4e" },
  { id: "abyss", name: "Abyss", isDark: true, preview: "#6C63FF" },
];

const THEME_STORAGE_KEY = "maghizam-theme";
const DEFAULT_THEME = "light";

/** Get saved theme ID from localStorage */
export const getSavedTheme = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
};

/** Save theme ID to localStorage */
export const saveTheme = (themeId: string): void => {
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
};

/** Get theme info by ID */
export const getThemeById = (id: string): ThemeInfo | undefined => {
  return themes.find((t) => t.id === id);
};

/** Apply theme to document */
export const applyTheme = (themeId: string): void => {
  const theme = getThemeById(themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);

  // Set dark class for components that use it
  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Smooth transition
  root.classList.add("theme-transition");
  requestAnimationFrame(() => {
    setTimeout(() => root.classList.remove("theme-transition"), 350);
  });
};

/** Check if a theme is dark */
export const isThemeDark = (themeId: string): boolean => {
  const theme = getThemeById(themeId);
  return theme?.isDark ?? false;
};

/** Get all themes list (for admin settings compatibility) */
export const getAllThemes = (): Array<{ id: string; name: string; preview: string; enabled: boolean }> => {
  return themes.map((t) => ({ id: t.id, name: t.name, preview: t.preview, enabled: true }));
};
