import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AutoLockSettings = () => {
  const { autoLockTimeout, setAutoLockTimeout } = useAuth();

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
      <TimerIcon color="primary" />
      <Typography variant="body2" color="text.secondary">
        Auto-lock after:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={autoLockTimeout}
          onChange={(e) => setAutoLockTimeout(e.target.value)}
          displayEmpty
        >
          <MenuItem value={5}>5 minutes</MenuItem>
          <MenuItem value={10}>10 minutes</MenuItem>
          <MenuItem value={15}>15 minutes</MenuItem>
          <MenuItem value={30}>30 minutes</MenuItem>
          <MenuItem value={60}>1 hour</MenuItem>
          <MenuItem value={0}>Never</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default AutoLockSettings; 