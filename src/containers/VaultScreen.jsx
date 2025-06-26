import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Lock as LockIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import VaultList from '../components/VaultList';
import CategoryFilter from '../components/CategoryFilter';
import AddPasswordDialog from '../components/AddPasswordDialog';
import ImportExportDialogs from '../components/ImportExportDialogs';
import SecurityStatus from '../components/SecurityStatus';
import AdminSidebar from '../components/AdminSidebar';

const VaultScreen = () => {
  const { handleManualLock } = useAuth();
  const { search, setSearch, filteredVault } = useVault();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Password Vault
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
          <Tooltip title="Account Settings">
            <IconButton
              onClick={() => setShowAdminSidebar(true)}
              sx={{ 
                border: 1, 
                borderColor: 'primary.main', 
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Search passwords..."
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site, username, category, or tags..."
          />
          <CategoryFilter />
        </Stack>
      </Paper>

      {/* Security Status */}
      <SecurityStatus />

      {/* Vault List */}
      <VaultList />

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

      <AdminSidebar
        open={showAdminSidebar}
        onClose={() => setShowAdminSidebar(false)}
      />
    </Container>
  );
};

export default VaultScreen; 