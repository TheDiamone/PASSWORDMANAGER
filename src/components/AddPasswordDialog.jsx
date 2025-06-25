import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const AddPasswordDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Password Entry</DialogTitle>
      <DialogContent>
        <Typography>
          Add password dialog will be implemented here.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPasswordDialog; 