import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const TwoFactorVerificationDialog = ({ open, onClose, onSuccess }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Two-Factor Authentication</DialogTitle>
      <DialogContent>
        <Typography>
          Two-Factor Authentication verification dialog will be implemented here.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSuccess} variant="contained">Verify</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorVerificationDialog; 