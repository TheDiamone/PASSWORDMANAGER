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
  Timer as TimerIcon
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

const VaultScreen = () => {
  const { handleManualLock, twoFactorEnabled, reset2FA } = useAuth();
  const { search, setSearch, filteredVault } = useVault();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

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
        </Box>

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
      </Paper>
    </Container>
  );
};

export default VaultScreen; 