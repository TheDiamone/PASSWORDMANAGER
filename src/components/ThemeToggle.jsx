import React from 'react';
import {
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme as useMuiTheme,
  alpha
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  SettingsBrightness as SettingsBrightnessIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ variant = 'icon', showSystemOption = false }) => {
  const { darkMode, toggleTheme, setTheme, resetTheme, isSystemTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (themeMode) => {
    if (themeMode === 'system') {
      resetTheme();
    } else {
      setTheme(themeMode === 'dark');
    }
    handleMenuClose();
  };

  // Enhanced switch variant with system preference indicator
  if (variant === 'switch') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              color="primary"
              sx={{
                '& .MuiSwitch-thumb': {
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brightness7Icon 
                fontSize="small" 
                sx={{ 
                  color: !darkMode ? 'warning.main' : 'text.disabled',
                  transition: 'color 0.2s ease-in-out'
                }} 
              />
              <Brightness4Icon 
                fontSize="small" 
                sx={{ 
                  color: darkMode ? 'info.main' : 'text.disabled',
                  transition: 'color 0.2s ease-in-out'
                }} 
              />
              {isSystemTheme && (
                <Tooltip title="Following system preference">
                  <SettingsBrightnessIcon 
                    fontSize="small" 
                    sx={{ color: 'primary.main' }} 
                  />
                </Tooltip>
              )}
            </Box>
          }
          labelPlacement="start"
        />
      </Box>
    );
  }

  // Enhanced button variant with border and hover effects
  if (variant === 'button') {
    return (
      <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            border: 1,
            borderColor: 'primary.main',
            color: 'primary.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'scale(1.05)',
            },
          }}
        >
          {darkMode ? (
            <Brightness7Icon sx={{ transition: 'transform 0.2s ease-in-out' }} />
          ) : (
            <Brightness4Icon sx={{ transition: 'transform 0.2s ease-in-out' }} />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  // Menu variant with system preference option
  if (variant === 'menu' || showSystemOption) {
    return (
      <>
        <Tooltip title="Theme options">
          <Button
            onClick={handleMenuOpen}
            startIcon={darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            endIcon={<ExpandMoreIcon />}
            variant="outlined"
            size="small"
            sx={{
              minWidth: 'auto',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {isSystemTheme ? 'System' : (darkMode ? 'Dark' : 'Light')}
          </Button>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 160,
              borderRadius: 2,
              mt: 1,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={() => handleThemeSelect('light')}
            selected={!darkMode && !isSystemTheme}
          >
            <ListItemIcon>
              <LightModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Light" />
            {!darkMode && !isSystemTheme && <CheckIcon fontSize="small" />}
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleThemeSelect('dark')}
            selected={darkMode && !isSystemTheme}
          >
            <ListItemIcon>
              <DarkModeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dark" />
            {darkMode && !isSystemTheme && <CheckIcon fontSize="small" />}
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={() => handleThemeSelect('system')}
            selected={isSystemTheme}
          >
            <ListItemIcon>
              <SettingsBrightnessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="System" 
              secondary={`Currently ${darkMode ? 'dark' : 'light'}`}
            />
            {isSystemTheme && <CheckIcon fontSize="small" />}
          </MenuItem>
        </Menu>
      </>
    );
  }

  // Enhanced default icon variant with smooth animations
  return (
    <Tooltip 
      title={
        isSystemTheme 
          ? `Following system (${darkMode ? 'dark' : 'light'}) - Click to toggle`
          : `Switch to ${darkMode ? 'light' : 'dark'} mode`
      }
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'text.primary',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {darkMode ? (
            <Brightness7Icon 
              sx={{ 
                color: 'warning.main',
                transition: 'all 0.3s ease-in-out',
                animation: darkMode ? 'fadeIn 0.3s ease-in-out' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'rotate(-180deg) scale(0.8)' },
                  '100%': { opacity: 1, transform: 'rotate(0deg) scale(1)' },
                },
              }} 
            />
          ) : (
            <Brightness4Icon 
              sx={{ 
                color: 'info.main',
                transition: 'all 0.3s ease-in-out',
                animation: !darkMode ? 'fadeIn 0.3s ease-in-out' : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'rotate(180deg) scale(0.8)' },
                  '100%': { opacity: 1, transform: 'rotate(0deg) scale(1)' },
                },
              }} 
            />
          )}
          
          {/* System preference indicator */}
          {isSystemTheme && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: `1px solid ${muiTheme.palette.background.paper}`,
              }}
            />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 