/**
 * Multi-Theme Configuration System
 * Supports 8 professional themes with light/dark mode variants
 */

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  backgroundMain: string;
  backgroundSecondary: string;
  textMain: string;
  textMuted: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDefault?: boolean;
}

export const themes: Theme[] = [
  {
    id: 'classic-red',
    name: 'Classic Red',
    isDefault: true,
    colors: {
      primary: '#C0392B',
      primaryDark: '#8B0000',
      primaryLight: '#E74C3C',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#F8F6F4',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    colors: {
      primary: '#8E44AD',
      primaryDark: '#6C3483',
      primaryLight: '#AF7AC5',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#F4EBF8',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    colors: {
      primary: '#27AE60',
      primaryDark: '#1E8449',
      primaryLight: '#52BE80',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#EBFAF0',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    colors: {
      primary: '#2980B9',
      primaryDark: '#1F618D',
      primaryLight: '#5DADE2',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#EBF5FB',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    colors: {
      primary: '#E67E22',
      primaryDark: '#D35400',
      primaryLight: '#F39C12',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#FEF5E7',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'chocolate-brown',
    name: 'Chocolate Brown',
    colors: {
      primary: '#7B3F00',
      primaryDark: '#5B2E0B',
      primaryLight: '#A0522D',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#F5E6D3',
      textMain: '#2C3E50',
      textMuted: '#95A5A6'
    }
  },
  {
    id: 'luxury-black-gold',
    name: 'Luxury Black & Gold',
    colors: {
      primary: '#1A1A1A',
      primaryDark: '#000000',
      primaryLight: '#444444',
      backgroundMain: '#FFFFFF',
      backgroundSecondary: '#F0EBE0',
      textMain: '#1A1A1A',
      textMuted: '#888888'
    }
  }
];

// Get theme by ID
export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

// Get default theme
export const getDefaultTheme = (): Theme => {
  return themes.find(theme => theme.isDefault) || themes[0];
};

// Apply theme to document
export const applyTheme = (theme: Theme, darkMode: boolean = false) => {
  const root = document.documentElement;

  // Base colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--color-text-main', theme.colors.textMain);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);

  // Background colors adjust for dark mode
  if (darkMode) {
    const darkenColor = (hex: string, percent: number = 10): string => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.max(0, (num >> 16) - percent);
      const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
      const b = Math.max(0, (num & 0x0000FF) - percent);
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    };

    root.style.setProperty('--color-bg-main', darkenColor(theme.colors.backgroundMain, 15));
    root.style.setProperty('--color-bg-secondary', darkenColor(theme.colors.backgroundSecondary, 20));
  } else {
    root.style.setProperty('--color-bg-main', theme.colors.backgroundMain);
    root.style.setProperty('--color-bg-secondary', theme.colors.backgroundSecondary);
  }

  root.style.setProperty('--transition-smooth', '0.3s ease');
};

// Get all theme IDs for admin dropdown
export const getAllThemeIds = (): string[] => {
  return themes.map(theme => theme.id);
};

// Get all theme names for admin dropdown
export const getAllThemes = (): Array<{ id: string; name: string }> => {
  return themes.map(theme => ({ id: theme.id, name: theme.name }));
};
