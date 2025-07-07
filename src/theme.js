import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
};

// Custom shadows for depth
const shadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
  '0px 1px 5px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.12)',
  '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 1px 8px rgba(0, 0, 0, 0.12)',
  '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 2px 12px rgba(0, 0, 0, 0.12)',
  '0px 5px 5px rgba(0, 0, 0, 0.08), 0px 3px 14px rgba(0, 0, 0, 0.12)',
  '0px 5px 6px rgba(0, 0, 0, 0.08), 0px 4px 20px rgba(0, 0, 0, 0.12)',
  '0px 7px 8px rgba(0, 0, 0, 0.08), 0px 5px 22px rgba(0, 0, 0, 0.12)',
  '0px 8px 10px rgba(0, 0, 0, 0.08), 0px 6px 30px rgba(0, 0, 0, 0.12)',
  '0px 9px 12px rgba(0, 0, 0, 0.08), 0px 7px 35px rgba(0, 0, 0, 0.12)',
  '0px 10px 14px rgba(0, 0, 0, 0.08), 0px 8px 38px rgba(0, 0, 0, 0.12)',
  '0px 11px 16px rgba(0, 0, 0, 0.08), 0px 9px 46px rgba(0, 0, 0, 0.12)',
  '0px 12px 18px rgba(0, 0, 0, 0.08), 0px 10px 50px rgba(0, 0, 0, 0.12)',
  '0px 13px 20px rgba(0, 0, 0, 0.08), 0px 11px 55px rgba(0, 0, 0, 0.12)',
  '0px 14px 22px rgba(0, 0, 0, 0.08), 0px 12px 60px rgba(0, 0, 0, 0.12)',
  '0px 15px 24px rgba(0, 0, 0, 0.08), 0px 13px 65px rgba(0, 0, 0, 0.12)',
  '0px 16px 26px rgba(0, 0, 0, 0.08), 0px 14px 70px rgba(0, 0, 0, 0.12)',
  '0px 17px 28px rgba(0, 0, 0, 0.08), 0px 15px 75px rgba(0, 0, 0, 0.12)',
  '0px 18px 30px rgba(0, 0, 0, 0.08), 0px 16px 80px rgba(0, 0, 0, 0.12)',
  '0px 19px 32px rgba(0, 0, 0, 0.08), 0px 17px 85px rgba(0, 0, 0, 0.12)',
  '0px 20px 34px rgba(0, 0, 0, 0.08), 0px 18px 90px rgba(0, 0, 0, 0.12)',
  '0px 21px 36px rgba(0, 0, 0, 0.08), 0px 19px 95px rgba(0, 0, 0, 0.12)',
  '0px 22px 38px rgba(0, 0, 0, 0.08), 0px 20px 100px rgba(0, 0, 0, 0.12)',
  '0px 23px 40px rgba(0, 0, 0, 0.08), 0px 21px 105px rgba(0, 0, 0, 0.12)',
  '0px 24px 42px rgba(0, 0, 0, 0.08), 0px 22px 110px rgba(0, 0, 0, 0.12)'
];

// Global CSS injection for data-theme support
export const injectGlobalThemeStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'global-theme-styles';
  let styleElement = document.getElementById(styleId);
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    /* Root variables for theme consistency */
    [data-theme="light"] {
      --scrollbar-track: #f1f3f4;
      --scrollbar-thumb: #c1c8cd;
      --scrollbar-thumb-hover: #a8b0b5;
      --selection-bg: rgba(33, 150, 243, 0.15);
      --backdrop-color: rgba(0, 0, 0, 0.5);
      --focus-ring: rgba(33, 150, 243, 0.25);
    }

    [data-theme="dark"] {
      --scrollbar-track: #2d3748;
      --scrollbar-thumb: #4a5568;
      --scrollbar-thumb-hover: #718096;
      --selection-bg: rgba(66, 165, 245, 0.25);
      --backdrop-color: rgba(0, 0, 0, 0.75);
      --focus-ring: rgba(66, 165, 245, 0.4);
    }

    /* Smooth transitions for theme changes */
    * {
      transition: background-color 0.2s ease-in-out, 
                  border-color 0.2s ease-in-out, 
                  color 0.2s ease-in-out;
    }

    /* Custom scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 4px;
      transition: background 0.2s ease-in-out;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--scrollbar-thumb-hover);
    }

    ::-webkit-scrollbar-corner {
      background: var(--scrollbar-track);
    }

    /* Firefox scrollbar */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
    }

    /* Text selection */
    ::selection {
      background: var(--selection-bg);
    }

    /* Focus outline improvements */
    *:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    /* Backdrop for modals */
    .MuiBackdrop-root {
      background-color: var(--backdrop-color) !important;
      backdrop-filter: blur(4px);
    }

    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Theme transition for entire page */
    html {
      transition: background-color 0.3s ease-in-out;
    }

    /* Enhanced autofill styling */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--text-primary);
      -webkit-box-shadow: 0 0 0px 1000px var(--input-bg) inset;
      transition: background-color 5000s ease-in-out 0s;
    }

    /* Print styles */
    @media print {
      [data-theme="dark"] {
        filter: invert(1) hue-rotate(180deg);
      }
    }
  `;
};

// Base theme configuration
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
        },
        elevation1: {
          border: '1px solid',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[600],
      light: colors.secondary[400],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[600],
      light: colors.success[400],
      dark: colors.success[700],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning[600],
      light: colors.warning[400],
      dark: colors.warning[700],
      contrastText: '#000000',
    },
    error: {
      main: colors.error[600],
      light: colors.error[400],
      dark: colors.error[700],
      contrastText: '#ffffff',
    },
    neutral: {
      ...colors.neutral
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: colors.neutral[300],
      disabledBackground: colors.neutral[100],
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiCard.styleOverrides.root,
          borderColor: colors.neutral[200],
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiPaper.styleOverrides.root,
          backgroundColor: '#ffffff',
        },
        elevation1: {
          ...baseTheme.components.MuiPaper.styleOverrides.elevation1,
          borderColor: colors.neutral[200],
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary[400],
      light: colors.primary[300],
      dark: colors.primary[600],
      contrastText: '#000000',
    },
    secondary: {
      main: colors.secondary[400],
      light: colors.secondary[300],
      dark: colors.secondary[600],
      contrastText: '#000000',
    },
    success: {
      main: colors.success[400],
      light: colors.success[300],
      dark: colors.success[600],
      contrastText: '#000000',
    },
    warning: {
      main: colors.warning[400],
      light: colors.warning[300],
      dark: colors.warning[600],
      contrastText: '#000000',
    },
    error: {
      main: colors.error[400],
      light: colors.error[300],
      dark: colors.error[600],
      contrastText: '#000000',
    },
    neutral: {
      ...colors.neutral
    },
    background: {
      default: '#0a0e13',
      paper: '#1a1f29',
    },
    text: {
      primary: '#e4e7ec',
      secondary: '#9ca3af',
      disabled: '#6b7280',
    },
    divider: '#374151',
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: '#4b5563',
      disabledBackground: '#374151',
    },
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiCard.styleOverrides.root,
          borderColor: '#374151',
          backgroundColor: '#1f2937',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiPaper.styleOverrides.root,
          backgroundColor: '#1f2937',
        },
        elevation1: {
          ...baseTheme.components.MuiPaper.styleOverrides.elevation1,
          borderColor: '#374151',
        },
      },
    },
  },
});

// Category colors that work well in both themes
export const categoryColors = {
  light: [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
    '#8BC34A', // Light Green
    '#FFC107', // Amber
    '#673AB7', // Deep Purple
  ],
  dark: [
    '#64B5F6', // Light Blue
    '#81C784', // Light Green
    '#FFB74D', // Light Orange
    '#BA68C8', // Light Purple
    '#E57373', // Light Red
    '#4DD0E1', // Light Cyan
    '#A1887F', // Light Brown
    '#90A4AE', // Light Blue Grey
    '#F06292', // Light Pink
    '#AED581', // Light Light Green
    '#FFD54F', // Light Amber
    '#9575CD', // Light Deep Purple
  ],
};

export default lightTheme; 