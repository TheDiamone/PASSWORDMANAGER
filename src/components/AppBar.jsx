import React, { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Shield as ShieldIcon,
  Fingerprint as FingerprintIcon,
  VpnKey as VpnKeyIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import ThemeToggle from './ThemeToggle';

const AppBar = ({ onOpenSettings }) => {
  const { 
    handleManualLock, 
    twoFactorEnabled, 
    biometricEnabled,
    autoLockTimeout 
  } = useAuth();
  const { vault } = useVault();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    handleManualLock();
  };

  const handleOpenSettings = () => {
    handleMenuClose();
    onOpenSettings();
  };

  const getSecurityLevel = () => {
    let level = 'Basic';
    let color = 'warning';
    let count = 0;

    if (twoFactorEnabled) count++;
    if (biometricEnabled) count++;
    if (autoLockTimeout <= 15) count++;

    if (count >= 3) {
      level = 'Maximum';
      color = 'success';
    } else if (count >= 2) {
      level = 'High';
      color = 'info';
    } else if (count >= 1) {
      level = 'Medium';
      color = 'warning';
    } else {
      level = 'Basic';
      color = 'error';
    }

    return { level, color };
  };

  const securityStatus = getSecurityLevel();

  return (
    <MuiAppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Brand and Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div" fontWeight="600">
              SecureVault
            </Typography>
          </Box>
          
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
          
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 1 
          }}>
            <Chip
              icon={<StorageIcon />}
              label={`${vault ? vault.length : 0} entries`}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<ShieldIcon />}
              label={`${securityStatus.level} Security`}
              size="small"
              color={securityStatus.color}
              variant="filled"
            />
          </Box>
        </Box>

        {/* Right: Actions and User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle variant="icon" />
          
          <Tooltip title="Lock Vault">
            <IconButton onClick={handleManualLock} color="inherit">
              <LockIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account Menu">
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Badge
                color="secondary"
                variant="dot"
                invisible={!twoFactorEnabled && !biometricEnabled}
              >
                <AccountCircleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 280,
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="600">
                Password Manager User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Secure Vault Access
              </Typography>
            </Box>

            {/* Security Status */}
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Security Features:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {twoFactorEnabled && (
                  <Chip
                    icon={<VpnKeyIcon />}
                    label="2FA"
                    size="small"
                    color="success"
                    variant="filled"
                  />
                )}
                {biometricEnabled && (
                  <Chip
                    icon={<FingerprintIcon />}
                    label="TouchID"
                    size="small"
                    color="info"
                    variant="filled"
                  />
                )}
                <Chip
                  label={`Auto-lock: ${autoLockTimeout}m`}
                  size="small"
                  color={autoLockTimeout <= 15 ? "success" : "warning"}
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Menu Items */}
            <MenuItem onClick={handleOpenSettings}>
              <SettingsIcon sx={{ mr: 2 }} />
              Account Settings
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2 }} />
              Lock & Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar; 