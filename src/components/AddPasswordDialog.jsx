import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon 
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { checkPasswordStrength } from '../services/crypto';
import PasswordGenerator from './PasswordGenerator';

const AddPasswordDialog = ({ open, onClose }) => {
  const { categories, addEntry } = useVault();
  const { copyToClipboard } = useClipboard();
  const { generatePassword } = usePasswordGenerator();
  
  const [entry, setEntry] = useState({ 
    site: '', 
    user: '', 
    pass: '', 
    category: 'other', 
    tags: [] 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const handleAdd = async () => {
    if (!entry.site || !entry.pass) {
      alert('Please enter at least a site name and password');
      return;
    }
    
    const success = await addEntry(entry);
    if (success) {
      setEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
      onClose();
      copyToClipboard('Password entry added successfully!');
    } else {
      alert('Error saving password entry. Please try again.');
    }
  };

  const handleClose = () => {
    setEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
    setShowPassword(false);
    setShowGenerator(false);
    onClose();
  };

  const handleUseGenerated = (password) => {
    setEntry({ ...entry, pass: password });
    setShowGenerator(false);
  };

  const entryStrength = checkPasswordStrength(entry.pass);

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Password Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Site/Service Name"
              value={entry.site}
              onChange={e => setEntry({ ...entry, site: e.target.value })}
              fullWidth
              autoFocus
              placeholder="e.g., google.com, GitHub, Amazon"
            />
            
            <TextField
              label="Username/Email"
              value={entry.user}
              onChange={e => setEntry({ ...entry, user: e.target.value })}
              fullWidth
              placeholder="e.g., user@example.com"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={entry.category}
                onChange={e => setEntry({ ...entry, category: e.target.value })}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color
                        }}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Tags (comma separated)"
              value={(entry.tags || []).join(', ')}
              onChange={e => setEntry({ 
                ...entry, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              fullWidth
              placeholder="e.g., important, personal, work"
              helperText="Optional: Add tags to help organize and search your passwords"
            />
            
            <Box>
              <TextField
                label="Password"
                value={entry.pass}
                onChange={e => setEntry({ ...entry, pass: e.target.value })}
                fullWidth
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setShowGenerator(!showGenerator)}
                >
                  {showGenerator ? 'Hide Generator' : 'Generate Password'}
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => setEntry({ ...entry, pass: generatePassword() })}
                >
                  Quick Generate
                </Button>
              </Box>
            </Box>
            
            {entry.pass && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Password Strength: {entryStrength.strength}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entryStrength.score}/{entryStrength.maxScore}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(entryStrength.score / entryStrength.maxScore) * 100}
                  color={entryStrength.color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
            
            {showGenerator && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <PasswordGenerator 
                  onGenerate={handleUseGenerated}
                  showUseButton={true}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAdd}
            disabled={!entry.site || !entry.pass}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPasswordDialog; 