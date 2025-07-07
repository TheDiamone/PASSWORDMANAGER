import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, injectGlobalThemeStyles } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Constants for theme management
const THEME_STORAGE_KEY = 'theme-preference';
const THEME_ATTRIBUTE = 'data-theme';

// Utility functions
const getSystemPreference = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getStoredPreference = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored theme preference:', error);
    return null;
  }
};

const setStoredPreference = (darkMode) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
  } catch (error) {
    console.warn('Failed to store theme preference:', error);
  }
};

const setGlobalThemeAttribute = (darkMode) => {
  if (typeof document === 'undefined') return;
  const theme = darkMode ? 'dark' : 'light';
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
};

// Initialize theme before React renders to prevent FOUC
const initializeTheme = () => {
  if (typeof window === 'undefined') return false;
  
  // Inject global theme styles immediately
  injectGlobalThemeStyles();
  
  const storedPreference = getStoredPreference();
  const initialDarkMode = storedPreference !== null ? storedPreference : getSystemPreference();
  
  // Set the attribute immediately to prevent FOUC
  setGlobalThemeAttribute(initialDarkMode);
  
  return initialDarkMode;
};

export const ThemeProvider = ({ children }) => {
  // Initialize state with the pre-calculated value to prevent FOUC
  const [darkMode, setDarkMode] = useState(() => initializeTheme());

  // Use useLayoutEffect to set theme before paint to prevent FOUC
  useLayoutEffect(() => {
    // Ensure global styles are injected
    injectGlobalThemeStyles();
    
    const storedPreference = getStoredPreference();
    const systemPreference = getSystemPreference();
    
    let initialDarkMode;
    if (storedPreference !== null) {
      // User has a stored preference
      initialDarkMode = storedPreference;
    } else {
      // No stored preference, use system preference
      initialDarkMode = systemPreference;
    }
    
    setDarkMode(initialDarkMode);
    setGlobalThemeAttribute(initialDarkMode);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemPreferenceChange = (e) => {
      // Only update if user hasn't set a manual preference
      const storedPreference = getStoredPreference();
      if (storedPreference === null) {
        const newDarkMode = e.matches;
        setDarkMode(newDarkMode);
        setGlobalThemeAttribute(newDarkMode);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemPreferenceChange);
      return () => mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemPreferenceChange);
      return () => mediaQuery.removeListener(handleSystemPreferenceChange);
    }
  }, []);

  // Sync theme across tabs using storage events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue !== null) {
        try {
          const newDarkMode = JSON.parse(e.newValue);
          setDarkMode(newDarkMode);
          setGlobalThemeAttribute(newDarkMode);
        } catch (error) {
          console.warn('Failed to sync theme from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update global attribute when darkMode changes
  useEffect(() => {
    setGlobalThemeAttribute(darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newDarkMode = !prev;
      setStoredPreference(newDarkMode);
      return newDarkMode;
    });
  };

  const setTheme = (isDark) => {
    setDarkMode(isDark);
    setStoredPreference(isDark);
  };

  const resetTheme = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      const systemPreference = getSystemPreference();
      setDarkMode(systemPreference);
    } catch (error) {
      console.warn('Failed to reset theme preference:', error);
    }
  };

  const currentTheme = darkMode ? darkTheme : lightTheme;

  const value = {
    darkMode,
    toggleTheme,
    setTheme,
    resetTheme,
    theme: currentTheme,
    isSystemTheme: getStoredPreference() === null,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 