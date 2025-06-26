import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';
import SecurityStatus from '../SecurityStatus';

const SecurityTab = () => {
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
            <SecurityIcon color="primary" />
            <Typography variant="h6" component="h2" fontWeight="600">
              Security Analysis
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 0 }}>
          <SecurityStatus />
        </Box>
      </Paper>
    </Container>
  );
};

export default SecurityTab; 