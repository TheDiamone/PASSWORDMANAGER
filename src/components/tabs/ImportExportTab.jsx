import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import ImportExportDialogs from '../ImportExportDialogs';

const ImportExportTab = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'neutral.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon color="primary" />
            <Typography variant="h6" component="h2" fontWeight="600">
              Import & Export
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Import Section */}
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <UploadIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'success.main',
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="600">
                    Import Passwords
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Import your passwords from CSV files, JSON exports, or other password managers like 1Password, LastPass, and Keeper.
                  </Typography>
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary">
                      • Supported formats: CSV, JSON, 1Password, LastPass, Keeper
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Auto-format detection
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Secure processing - data never leaves your device
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<UploadIcon />}
                    onClick={() => setShowImportDialog(true)}
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Import Data
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Export Section */}
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <DownloadIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'info.main',
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="600">
                    Export Passwords
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create secure backups of your password vault in multiple formats. Choose encrypted or plain text exports.
                  </Typography>
                  <Stack spacing={1} sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary">
                      • Encrypted vault backup (recommended)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • CSV format for migration
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Password-protected exports
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<DownloadIcon />}
                    onClick={() => setShowExportDialog(true)}
                    size="large"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Export Data
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Dialogs */}
      <ImportExportDialogs
        showImport={showImportDialog}
        showExport={showExportDialog}
        onCloseImport={() => setShowImportDialog(false)}
        onCloseExport={() => setShowExportDialog(false)}
      />
    </Container>
  );
};

export default ImportExportTab; 