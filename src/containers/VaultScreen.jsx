import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Timer as TimerIcon,
  Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import VaultList from '../components/VaultList';
import CategoryFilter from '../components/CategoryFilter';
import PasswordGenerator from '../components/PasswordGenerator';
import AddPasswordDialog from '../components/AddPasswordDialog';
import ImportExportDialogs from '../components/ImportExportDialogs';
import AutoLockSettings from '../components/AutoLockSettings';
import SecurityStatus from '../components/SecurityStatus';
import BiometricSetupDialog from '../components/BiometricSetupDialog';

const VaultScreen = () => {
  const { 
    handleManualLock, 
    twoFactorEnabled, 
    reset2FA,
    biometricSupported,
    biometricEnabled
  } = useAuth();
  const { search, setSearch, filteredVault } = useVault();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Password Vault
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setShowImportDialog(true)}
              startIcon={<UploadIcon />}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowExportDialog(true)}
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowAddDialog(true)}
              startIcon={<AddIcon />}
            >
              Add Password
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleManualLock}
              startIcon={<LockIcon />}
            >
              Lock
            </Button>
          </Box>
        </Box>

        {/* Security Status */}
        <SecurityStatus />

        {/* Auto-lock Settings */}
        <AutoLockSettings />

        {/* 2FA Status */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color={twoFactorEnabled ? "success" : "disabled"} />
          <Typography variant="body2" color="text.secondary">
            Two-Factor Authentication: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Typography>
          {twoFactorEnabled && (
            <Button 
              variant="text" 
              size="small" 
              color="warning"
              onClick={reset2FA}
              sx={{ ml: 'auto' }}
            >
              Reset 2FA
            </Button>
          )}
          {twoFactorEnabled && (
            <Button 
              variant="outlined" 
              size="small" 
              color="error"
              onClick={() => {
                if (confirm('This will completely clear your 2FA setup and you will need to set it up again. Are you sure?')) {
                  // Clear all 2FA related data
                  localStorage.removeItem('twoFactor');
                  localStorage.removeItem('biometricEnabled');
                  localStorage.removeItem('biometricCredentials');
                  localStorage.removeItem('biometricMasterPassword');
                  // Reset state
                  reset2FA();
                  // Refresh to ensure clean state
                  window.location.reload();
                }
              }}
              sx={{ ml: 1 }}
            >
              Clear All 2FA Data
            </Button>
          )}
        </Box>

        {/* Biometric Authentication Status */}
        {biometricSupported && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintIcon color={biometricEnabled ? "success" : "disabled"} />
            <Typography variant="body2" color="text.secondary">
              Biometric Authentication: {biometricEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
            {!biometricEnabled && (
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={() => setShowBiometricSetup(true)}
                sx={{ ml: 'auto' }}
                startIcon={<FingerprintIcon />}
              >
                Setup Touch ID
              </Button>
            )}
            {biometricEnabled && (
              <Button 
                variant="text" 
                size="small" 
                color="warning"
                onClick={() => {
                  if (confirm('This will disable biometric authentication. You will need to set it up again to use Touch ID. Are you sure?')) {
                    localStorage.removeItem('biometricEnabled');
                    localStorage.removeItem('biometricCredentials');
                    localStorage.removeItem('biometricMasterPassword');
                    window.location.reload();
                  }
                }}
                sx={{ ml: 'auto' }}
              >
                Disable Touch ID
              </Button>
            )}
          </Box>
        )}

        {/* Search */}
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Category Filter */}
        <CategoryFilter />

        {/* Vault List */}
        <VaultList />

        {/* Password Generator */}
        <PasswordGenerator />

        {/* Dialogs */}
        <AddPasswordDialog 
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
        
        <ImportExportDialogs
          showImport={showImportDialog}
          showExport={showExportDialog}
          onCloseImport={() => setShowImportDialog(false)}
          onCloseExport={() => setShowExportDialog(false)}
        />

        <BiometricSetupDialog
          open={showBiometricSetup}
          onClose={() => setShowBiometricSetup(false)}
        />
      </Paper>
    </Container>
  );
};

export default VaultScreen; 