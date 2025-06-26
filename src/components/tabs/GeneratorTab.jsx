import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography
} from '@mui/material';
import {
  VpnKey as GenerateIcon
} from '@mui/icons-material';
import PasswordGenerator from '../PasswordGenerator';

const GeneratorTab = () => {
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
            <GenerateIcon color="primary" />
            <Typography variant="h6" component="h2" fontWeight="600">
              Password Generator
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <PasswordGenerator showUseButton={false} />
        </Box>
      </Paper>
    </Container>
  );
};

export default GeneratorTab; 