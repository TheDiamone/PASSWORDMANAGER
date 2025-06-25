import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { checkPasswordStrength } from '../services/crypto';

const PasswordStrengthIndicator = ({ password, sx = {} }) => {
  if (!password) return null;

  const strength = checkPasswordStrength(password);

  return (
    <Box sx={{ mt: 1, ...sx }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Strength: {strength.strength}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {strength.score}/{strength.maxScore}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(strength.score / strength.maxScore) * 100}
        color={strength.color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

export default PasswordStrengthIndicator; 