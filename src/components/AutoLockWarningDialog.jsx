import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Stack,
  Box
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AutoLockWarningDialog = () => {
  const {
    showAutoLockWarning,
    setShowAutoLockWarning,
    handleExtendSession,
    handleManualLock,
    setAutoLockTimeout
  } = useAuth();

  return (
    <Dialog open={showAutoLockWarning} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon color="warning" />
          <Typography>Auto-lock Warning</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography>
              Your vault will automatically lock in <strong>1 minute</strong> due to inactivity.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            To prevent auto-lock, simply interact with the application (move mouse, type, etc.).
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="text" 
          color="secondary" 
          onClick={() => setAutoLockTimeout(0)}
        >
          Disable Auto-lock
        </Button>
        <Button variant="outlined" onClick={handleExtendSession}>
          Extend Session
        </Button>
        <Button variant="contained" color="primary" onClick={handleManualLock}>
          Lock Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoLockWarningDialog; 