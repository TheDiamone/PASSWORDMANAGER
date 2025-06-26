import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import ActionButton from '../ActionButton';
import ImportExportDialogs from '../ImportExportDialogs';
import { useVault } from '../../context/VaultContext';

const ImportExportTab = () => {
  const { vault } = useVault();
  const [dialogOpen, setDialogOpen] = useState('');

  const handleImport = () => {
    setDialogOpen('import');
  };

  const handleExport = () => {
    setDialogOpen('export');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Import & Export
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Backup your vault or import passwords from other password managers
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Import Passwords
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Import passwords from CSV files or other password managers
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleImport}
                  sx={{ mb: 2 }}
                >
                  Import Data
                </ActionButton>
                
                <Alert severity="info" variant="outlined">
                  <AlertTitle>Supported Formats</AlertTitle>
                  CSV files from 1Password, LastPass, Bitwarden, and other managers
                </Alert>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Export Passwords
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a backup of your vault in CSV format
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  disabled={vault.length === 0}
                  tooltip={vault.length === 0 ? "Add some passwords to your vault before exporting" : "Export your vault data"}
                  sx={{ mb: 2 }}
                >
                  Export Data
                </ActionButton>
                
                <Alert severity="warning" variant="outlined">
                  <AlertTitle>Security Notice</AlertTitle>
                  Exported files contain unencrypted passwords. Store securely!
                </Alert>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Alert severity="info" icon={<SecurityIcon />}>
            <AlertTitle>Security & Privacy</AlertTitle>
            <Typography variant="body2">
              All import/export operations happen locally on your device. Your passwords are never sent to any server during these operations.
            </Typography>
          </Alert>
        </Box>

        <ImportExportDialogs
          showImport={dialogOpen === 'import'}
          showExport={dialogOpen === 'export'}
          onCloseImport={() => setDialogOpen('')}
          onCloseExport={() => setDialogOpen('')}
        />
      </Paper>
    </Container>
  );
};

export default ImportExportTab; 