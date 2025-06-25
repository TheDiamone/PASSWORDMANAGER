import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { checkPasswordStrength, checkPasswordBreach } from '../services/crypto';

const VaultList = () => {
  const { 
    filteredVault, 
    categories,
    updateEntry,
    deleteEntry,
    isPasswordVisible,
    handleTogglePassword,
    handleToggleAllPasswords,
    showAllPasswords,
    getBreachStatus,
    setBreachStatus
  } = useVault();
  const { copyToClipboard } = useClipboard();
  const { generatePassword } = usePasswordGenerator();

  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState({ site: '', user: '', pass: '', category: 'other', tags: [] });
  const [showEditPassword, setShowEditPassword] = useState(false);

  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories.find(c => c.id === 'other');
  };

  const handleStartEdit = (index, item) => {
    const actualIndex = filteredVault.findIndex(vaultItem => vaultItem === item);
    setEditingIndex(actualIndex);
    setEditEntry({ ...item, tags: item.tags || [] });
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    
    const success = await updateEntry(editingIndex, editEntry);
    if (success) {
      setEditingIndex(null);
      setEditEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
      
      // Re-check breach status for the updated password
      if (editEntry.pass) {
        handleCheckBreach(editEntry.pass, `vault_${editingIndex}`);
      }
      
      copyToClipboard('Entry updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
  };

  const handleDeleteEntry = async (index) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    const success = await deleteEntry(index);
    if (success) {
      copyToClipboard('Entry deleted successfully');
    }
  };

  const handleCheckBreach = async (password, id) => {
    try {
      const result = await checkPasswordBreach(password);
      setBreachStatus(id, result);
      return result;
    } catch (error) {
      console.error('Error checking breach:', error);
      return { breached: false, count: 0, error: error.message };
    }
  };

  const handleCopyPassword = (password) => {
    copyToClipboard('Password copied to clipboard!', password);
  };

  const handleCopyUsername = (username) => {
    copyToClipboard('Username copied to clipboard!', username);
  };

  return (
    <>
      {/* Password Visibility Toggle */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Password Visibility:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleToggleAllPasswords}
          startIcon={showAllPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
        >
          {showAllPasswords ? 'Hide All' : 'Show All'}
        </Button>
      </Box>

      <List sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        {filteredVault.length === 0 && (
          <ListItem>
            <ListItemText primary="No entries found." />
          </ListItem>
        )}
        {filteredVault.map((item, idx) => (
          <React.Fragment key={idx}>
            <ListItem>
              {editingIndex === idx ? (
                // Edit mode
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Editing: {item.site}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Site"
                      value={editEntry.site}
                      onChange={(e) => setEditEntry({ ...editEntry, site: e.target.value })}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Username"
                      value={editEntry.user}
                      onChange={(e) => setEditEntry({ ...editEntry, user: e.target.value })}
                      fullWidth
                      size="small"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editEntry.category || 'other'}
                        onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
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
                      value={(editEntry.tags || []).join(', ')}
                      onChange={(e) => setEditEntry({ 
                        ...editEntry, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      fullWidth
                      size="small"
                      placeholder="e.g., important, personal, work"
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        label="Password"
                        value={editEntry.pass}
                        onChange={(e) => setEditEntry({ ...editEntry, pass: e.target.value })}
                        fullWidth
                        size="small"
                        type={showEditPassword ? "text" : "password"}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showEditPassword ? "Hide password" : "Show password"}>
                                <IconButton
                                  onClick={() => setShowEditPassword(!showEditPassword)}
                                  edge="end"
                                  size="small"
                                >
                                  {showEditPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                      <Tooltip title="Generate new password">
                        <IconButton 
                          size="small" 
                          onClick={() => setEditEntry({ ...editEntry, pass: generatePassword() })}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {editEntry.pass && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Strength: {checkPasswordStrength(editEntry.pass).strength}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {checkPasswordStrength(editEntry.pass).score}/{checkPasswordStrength(editEntry.pass).maxScore}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(checkPasswordStrength(editEntry.pass).score / checkPasswordStrength(editEntry.pass).maxScore) * 100}
                          color={checkPasswordStrength(editEntry.pass).color}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={handleSaveEdit}
                        startIcon={<SaveIcon />}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleCancelEdit}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ) : (
                // View mode
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.site}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={getCategoryById(item.category)?.name || 'Other'}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryById(item.category)?.color || '#607D8B',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                    {item.tags && item.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {item.tags.slice(0, 2).map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        ))}
                        {item.tags.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{item.tags.length - 2}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      <strong>User:</strong> {item.user}
                    </Typography>
                    <Tooltip title="Copy username">
                      <IconButton size="small" onClick={() => handleCopyUsername(item.user)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      <strong>Pass:</strong> {isPasswordVisible(idx) ? item.pass : '••••••••••••'}
                    </Typography>
                    {getBreachStatus(`vault_${idx}`) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getBreachStatus(`vault_${idx}`).breached ? (
                          <Tooltip title={`Compromised in ${getBreachStatus(`vault_${idx}`).count} data breaches`}>
                            <WarningIcon color="error" fontSize="small" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="No breaches found">
                            <CheckCircleIcon color="success" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    )}
                    <Tooltip title={isPasswordVisible(idx) ? "Hide password" : "Show password"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleTogglePassword(idx)}
                      >
                        {isPasswordVisible(idx) ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy password">
                      <IconButton size="small" onClick={() => handleCopyPassword(item.pass)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit entry">
                      <IconButton size="small" onClick={() => handleStartEdit(idx, item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete entry">
                      <IconButton size="small" onClick={() => handleDeleteEntry(idx)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </ListItem>
            {idx < filteredVault.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </>
  );
};

export default VaultList; 