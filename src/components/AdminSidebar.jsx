import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
  Alert,
  Collapse,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  Stack
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Timer as TimerIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Backup as BackupIcon,
  Palette as PaletteIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useTheme } from '../context/ThemeContext';
import { useClipboard } from '../hooks/useClipboard';
import TwoFactorSetupDialog from './TwoFactorSetupDialog';
import BiometricSetupDialog from './BiometricSetupDialog';
import ImportExportDialogs from './ImportExportDialogs';
import ThemeToggle from './ThemeToggle';

const AdminSidebar = ({ open, onClose }) => {
  const {
    twoFactorEnabled,
    biometricEnabled,
    biometricSupported,
    reset2FA,
    autoLockTimeout,
    setAutoLockTimeout,
    handleManualLock
  } = useAuth();
  
  const { vault } = useVault();
  const { darkMode, toggleTheme } = useTheme();
  const { copyToClipboard } = useClipboard();
  
  // Dialog states
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    security: true,
    ui: false,
    data: false,
    advanced: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleReset2FA = () => {
    if (confirm('Are you sure you want to reset Two-Factor Authentication? You will need to set it up again.')) {
      reset2FA();
      copyToClipboard('2FA has been reset. You can now set it up again.');
    }
  };

  const handleClearAll2FA = () => {
    if (confirm('This will completely clear your 2FA setup and biometric data. You will need to set everything up again. Are you sure?')) {
      localStorage.removeItem('twoFactor');
      localStorage.removeItem('biometricEnabled');
      localStorage.removeItem('biometricCredentials');
      localStorage.removeItem('biometricMasterPassword');
      reset2FA();
      window.location.reload();
    }
  };

  const handleDisableBiometric = () => {
    if (confirm('Are you sure you want to disable biometric authentication? You will need to set it up again to use Touch ID.')) {
      localStorage.removeItem('biometricEnabled');
      localStorage.removeItem('biometricCredentials');
      localStorage.removeItem('biometricMasterPassword');
      copyToClipboard('Biometric authentication disabled.');
      window.location.reload();
    }
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL your password data, 2FA, and biometric settings. This action cannot be undone. Are you absolutely sure?')) {
      if (confirm('Last chance! This will permanently delete everything. Type YES to confirm.') && 
          prompt('Type "DELETE ALL" to confirm permanent deletion:') === 'DELETE ALL') {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const sidebarWidth = 360;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: sidebarWidth,
            bgcolor: 'background.paper',
            borderLeft: 1,
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              <Typography variant="h6">Account Settings</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {/* Security Section */}
              <ListItemButton onClick={() => toggleSection('security')}>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Security & Authentication" />
                {expandedSections.security ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={expandedSections.security} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
                  {/* 2FA Status */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <VpnKeyIcon color={twoFactorEnabled ? "success" : "disabled"} fontSize="small" />
                      <Typography variant="body2" fontWeight="medium">
                        Two-Factor Authentication
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                    
                    {!twoFactorEnabled ? (
                      <ListItemButton 
                        onClick={() => setShow2FASetup(true)}
                        sx={{ borderRadius: 1, bgcolor: 'action.hover' }}
                      >
                        <ListItemText primary="Setup 2FA" secondary="Secure your account with TOTP" />
                      </ListItemButton>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ListItemButton 
                          onClick={handleReset2FA}
                          sx={{ borderRadius: 1, bgcolor: 'warning.light', color: 'warning.contrastText' }}
                        >
                          <ListItemText primary="Reset 2FA" secondary="Generate new secret" />
                        </ListItemButton>
                        <ListItemButton 
                          onClick={handleClearAll2FA}
                          sx={{ borderRadius: 1, bgcolor: 'error.light', color: 'error.contrastText' }}
                        >
                          <ListItemText primary="Clear All 2FA Data" secondary="Complete 2FA removal" />
                        </ListItemButton>
                      </Box>
                    )}
                  </Paper>

                  {/* Biometric Status */}
                  {biometricSupported && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FingerprintIcon color={biometricEnabled ? "success" : "disabled"} fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          Biometric Authentication
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Status: {biometricEnabled ? 'Enabled (Touch ID)' : 'Disabled'}
                      </Typography>
                      
                      {!biometricEnabled ? (
                        <ListItemButton 
                          onClick={() => setShowBiometricSetup(true)}
                          sx={{ borderRadius: 1, bgcolor: 'action.hover' }}
                        >
                          <ListItemText primary="Setup Touch ID" secondary="Quick unlock with fingerprint" />
                        </ListItemButton>
                      ) : (
                        <ListItemButton 
                          onClick={handleDisableBiometric}
                          sx={{ borderRadius: 1, bgcolor: 'warning.light', color: 'warning.contrastText' }}
                        >
                          <ListItemText primary="Disable Touch ID" secondary="Remove biometric access" />
                        </ListItemButton>
                      )}
                    </Paper>
                  )}

                  {/* Auto-lock Settings */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TimerIcon color="primary" fontSize="small" />
                      <Typography variant="body2" fontWeight="medium">
                        Auto-lock Timeout
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Lock vault after {autoLockTimeout} minutes of inactivity
                    </Typography>
                    <Slider
                      value={autoLockTimeout}
                      onChange={(_, value) => setAutoLockTimeout(value)}
                      min={1}
                      max={60}
                      marks={[
                        { value: 1, label: '1m' },
                        { value: 15, label: '15m' },
                        { value: 30, label: '30m' },
                        { value: 60, label: '1h' }
                      ]}
                      valueLabelDisplay="auto"
                      sx={{ mt: 1 }}
                    />
                  </Paper>

                  {/* Manual Lock */}
                  <ListItemButton 
                    onClick={handleManualLock}
                    sx={{ borderRadius: 1, bgcolor: 'error.main', color: 'error.contrastText', mb: 1 }}
                  >
                    <ListItemIcon>
                      <LockIcon sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText primary="Lock Vault Now" secondary="Immediately lock and require re-authentication" />
                  </ListItemButton>
                </Box>
              </Collapse>

              <Divider />

              {/* UI Customization */}
              <ListItemButton onClick={() => toggleSection('ui')}>
                <ListItemIcon>
                  <PaletteIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="UI & Appearance" />
                {expandedSections.ui ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={expandedSections.ui} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
                  {/* Theme Controls */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Theme Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Choose your preferred appearance
                    </Typography>
                    
                    <Stack spacing={2}>
                      {/* Icon Toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Quick Toggle</Typography>
                        <ThemeToggle variant="icon" />
                      </Box>
                      
                      {/* Button Toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Button Style</Typography>
                        <ThemeToggle variant="button" />
                      </Box>
                      
                      {/* Switch Toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Switch Style</Typography>
                        <ThemeToggle variant="switch" />
                      </Box>
                      
                      {/* Menu Toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Full Options</Typography>
                        <ThemeToggle variant="menu" />
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </Collapse>

              <Divider />

              {/* Data Management Section */}
              <ListItemButton onClick={() => toggleSection('data')}>
                <ListItemIcon>
                  <BackupIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Data Management" />
                {expandedSections.data ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={expandedSections.data} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      Vault Statistics
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total entries: {vault.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Categories: Social, Banking, Work, Shopping, Email, Gaming, Other
                    </Typography>
                  </Paper>

                  <ListItemButton 
                    onClick={() => setShowImportDialog(true)}
                    sx={{ borderRadius: 1, bgcolor: 'success.light', color: 'success.contrastText', mb: 1 }}
                  >
                    <ListItemIcon>
                      <UploadIcon sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText primary="Import Passwords" secondary="From CSV, JSON, or other managers" />
                  </ListItemButton>

                  <ListItemButton 
                    onClick={() => setShowExportDialog(true)}
                    sx={{ borderRadius: 1, bgcolor: 'info.light', color: 'info.contrastText', mb: 1 }}
                  >
                    <ListItemIcon>
                      <DownloadIcon sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText primary="Export Passwords" secondary="Backup as encrypted or CSV format" />
                  </ListItemButton>
                </Box>
              </Collapse>

              <Divider />

              {/* Advanced Section */}
              <ListItemButton onClick={() => toggleSection('advanced')}>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText primary="Advanced / Danger Zone" />
                {expandedSections.advanced ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={expandedSections.advanced} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 1 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="caption">
                      <strong>Danger Zone:</strong> These actions are permanent and cannot be undone.
                    </Typography>
                  </Alert>

                  <ListItemButton 
                    onClick={handleClearAllData}
                    sx={{ borderRadius: 1, bgcolor: 'error.dark', color: 'error.contrastText', mb: 1 }}
                  >
                    <ListItemIcon>
                      <DeleteIcon sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Delete All Data" 
                      secondary="Permanently delete vault, 2FA, and all settings" 
                    />
                  </ListItemButton>
                </Box>
              </Collapse>
            </List>
          </Box>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Password Manager v1.0
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Secure • Private • Open Source
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Dialogs */}
      <TwoFactorSetupDialog 
        open={show2FASetup}
        onClose={() => setShow2FASetup(false)}
      />
      
      <BiometricSetupDialog
        open={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
      />

      <ImportExportDialogs
        showImport={showImportDialog}
        showExport={showExportDialog}
        onCloseImport={() => setShowImportDialog(false)}
        onCloseExport={() => setShowExportDialog(false)}
      />
    </>
  );
};

export default AdminSidebar; 