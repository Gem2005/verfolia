"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageHelpers } from '@/utils/storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // Resolved theme (system -> light/dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Load theme from cookies on mount
  useEffect(() => {
    const savedTheme = storageHelpers.getUserTheme() as Theme;
    setThemeState(savedTheme);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const isDark = mediaQuery.matches;
        setActualTheme(isDark ? 'dark' : 'light');
        updateDocumentTheme(isDark ? 'dark' : 'light');
      }
    };

    // Set initial theme
    handleChange();

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Update theme when theme state changes
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActualTheme(isDark ? 'dark' : 'light');
      updateDocumentTheme(isDark ? 'dark' : 'light');
    } else {
      setActualTheme(theme);
      updateDocumentTheme(theme);
    }
  }, [theme]);

  const updateDocumentTheme = (resolvedTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storageHelpers.setUserTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      default:
        return '🖥️';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
      title={`Current theme: ${getThemeLabel()}. Click to switch.`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="text-sm font-medium">{getThemeLabel()}</span>
    </button>
  );
}