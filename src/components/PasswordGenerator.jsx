import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';

const PasswordGenerator = () => {
  const { generated, handleGenerate } = usePasswordGenerator();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Password Generator
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Generated Password"
          value={generated}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <Button variant="outlined" onClick={handleGenerate}>
          Generate
        </Button>
      </Box>
    </Box>
  );
};

export default PasswordGenerator; 