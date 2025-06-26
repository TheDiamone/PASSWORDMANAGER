import React from 'react';
import {
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Box,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ variant = 'icon' }) => {
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  if (variant === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={darkMode}
            onChange={toggleTheme}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightModeIcon fontSize="small" />
            <DarkModeIcon fontSize="small" />
          </Box>
        }
        labelPlacement="start"
      />
    );
  }

  if (variant === 'button') {
    return (
      <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            border: 1,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            },
          }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  // Default icon variant
  return (
    <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 