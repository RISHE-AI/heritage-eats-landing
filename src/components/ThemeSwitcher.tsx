import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Palette, Check } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setTheme, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lightThemes = allThemes.filter((t) => !t.isDark);
  const darkThemes = allThemes.filter((t) => t.isDark);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 
                   hover:bg-primary/10 text-foreground hover:text-primary"
        title="Change Theme"
        aria-label="Theme Selector"
      >
        <Palette size={20} />
        <span className="text-sm font-medium hidden sm:inline">Theme</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-card rounded-2xl 
                     shadow-lg border border-border z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Light Themes */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground px-3 mb-2 uppercase">
              ☀️ Light Themes
            </p>
            <div className="space-y-1">
              {lightThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group
                    ${
                      currentTheme === theme.id
                        ? 'bg-primary/10 ring-1 ring-primary/30'
                        : 'hover:bg-muted'
                    }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-110 shrink-0"
                    style={{ backgroundColor: theme.preview }}
                  />
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {theme.emoji} {theme.name}
                  </span>
                  {currentTheme === theme.id && (
                    <Check size={16} className="text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="my-3 border-t border-border" />

          {/* Dark Themes */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground px-3 mb-2 uppercase">
              🌙 Dark Themes
            </p>
            <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 scrollbar-hide">
              {darkThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group
                    ${
                      currentTheme === theme.id
                        ? 'bg-primary/10 ring-1 ring-primary/30'
                        : 'hover:bg-muted'
                    }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-110 shrink-0"
                    style={{ backgroundColor: theme.preview }}
                  />
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {theme.emoji} {theme.name}
                  </span>
                  {currentTheme === theme.id && (
                    <Check size={16} className="text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
