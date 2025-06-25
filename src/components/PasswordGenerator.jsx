import React, { useState } from 'react';
import {
  Typography,
  Stack,
  Box,
  Slider,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { useClipboard } from '../hooks/useClipboard';
import { checkPasswordStrength } from '../services/crypto';

const PasswordGenerator = ({ onGenerate, showUseButton = false }) => {
  const { generatePassword, genOptions, setGenOptions } = usePasswordGenerator();
  const { copyToClipboard } = useClipboard();
  const [generated, setGenerated] = useState('');

  const handleGenerate = () => {
    const newPassword = generatePassword(genOptions);
    setGenerated(newPassword);
    if (onGenerate) {
      onGenerate(newPassword);
    }
  };

  const handleCopy = () => {
    copyToClipboard('Password copied!', generated);
  };

  const handleUse = () => {
    if (onGenerate) {
      onGenerate(generated);
    }
  };

  const generatedStrength = checkPasswordStrength(generated);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Password Generator</Typography>
      <Stack spacing={2}>
        {/* Length Slider */}
        <Box display="flex" alignItems="center">
          <Typography sx={{ minWidth: 100 }}>Length</Typography>
          <Slider
            min={6}
            max={32}
            value={genOptions.length}
            onChange={(_, v) => setGenOptions(o => ({ ...o, length: v }))}
            valueLabelDisplay="auto"
            sx={{ ml: 2, flex: 1 }}
          />
          <Typography sx={{ ml: 2, minWidth: 30 }}>{genOptions.length}</Typography>
        </Box>

        {/* Character Type Options */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox 
                checked={genOptions.symbols} 
                onChange={e => setGenOptions(o => ({ ...o, symbols: e.target.checked }))} 
              />
            }
            label="Symbols (!@#$%^&*)"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={genOptions.numbers} 
                onChange={e => setGenOptions(o => ({ ...o, numbers: e.target.checked }))} 
              />
            }
            label="Numbers (0-9)"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={genOptions.uppercase} 
                onChange={e => setGenOptions(o => ({ ...o, uppercase: e.target.checked }))} 
              />
            }
            label="Uppercase (A-Z)"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={genOptions.lowercase} 
                onChange={e => setGenOptions(o => ({ ...o, lowercase: e.target.checked }))} 
              />
            }
            label="Lowercase (a-z)"
          />
        </Box>

        {/* Generated Password Display */}
        <TextField
          label="Generated Password"
          value={generated}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Copy">
                  <IconButton onClick={handleCopy} disabled={!generated}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
          fullWidth
          placeholder="Generated password will appear here"
        />

        {/* Password Strength Indicator */}
        {generated && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Strength: {generatedStrength.strength}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {generatedStrength.score}/{generatedStrength.maxScore}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(generatedStrength.score / generatedStrength.maxScore) * 100}
              color={generatedStrength.color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleGenerate}>
            Generate
          </Button>
          {showUseButton && generated && (
            <Button variant="contained" onClick={handleUse}>
              Use This Password
            </Button>
          )}
        </Stack>

        {/* Options Summary */}
        <Typography variant="caption" color="text.secondary">
          Options: {genOptions.length} characters, {
            [
              genOptions.lowercase && 'lowercase',
              genOptions.uppercase && 'uppercase', 
              genOptions.numbers && 'numbers',
              genOptions.symbols && 'symbols'
            ].filter(Boolean).join(', ')
          }
        </Typography>
      </Stack>
    </Box>
  );
};

export default PasswordGenerator; 