import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { useVault } from '../context/VaultContext';

const SecurityStatus = () => {
  const { checkingBreaches, vault } = useVault();

  const handleCheckAllBreaches = () => {
    // This would implement the breach checking logic
    console.log('Check all breaches');
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
      <SecurityIcon color="primary" />
      <Typography variant="body2" color="text.secondary">
        Password Security:
      </Typography>
      <Button 
        variant="outlined" 
        size="small"
        onClick={handleCheckAllBreaches}
        disabled={checkingBreaches || vault.length === 0}
        startIcon={checkingBreaches ? <CircularProgress size={16} /> : <SecurityIcon />}
      >
        {checkingBreaches ? 'Checking...' : 'Check All Passwords'}
      </Button>
    </Box>
  );
};

export default SecurityStatus; 