import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Palette } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, darkMode, setDarkMode, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 
                   hover:bg-primary/10 text-primary hover:text-primary-dark"
        title="Change Theme"
      >
        <Palette size={20} />
        <span className="text-sm font-medium hidden sm:inline">Theme</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl 
                        shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-3 animate-in fade-in slide-in-from-top-2">
          {/* Dark Mode Toggle */}
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className={`w-10 h-6 rounded-full transition-all ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}>
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                />
              </div>
            </button>
          </div>

          {/* Theme Options */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-3 mb-2">
              SELECT THEME
            </p>
            {allThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-left
                             ${currentTheme.id === theme.id
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {/* Color Preview */}
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: theme.colors.primaryLight }}
                  />
                </div>
                <span className="text-sm flex-1">{theme.name}</span>
                {currentTheme.id === theme.id && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
