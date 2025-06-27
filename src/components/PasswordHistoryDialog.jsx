import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Box,
  Chip,
  Alert,
  AlertTitle,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  History as HistoryIcon,
  Close as CloseIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';

const PasswordHistoryDialog = ({ 
  open, 
  onClose, 
  entryIndex, 
  entryTitle = "Password Entry" 
}) => {
  const { 
    getPasswordHistory, 
    restorePasswordFromHistory, 
    deletePasswordFromHistory 
  } = useVault();
  const { copyToClipboard } = useClipboard();
  
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(null);

  const history = entryIndex !== null ? getPasswordHistory(entryIndex) : [];

  const handleClose = () => {
    setVisiblePasswords(new Set());
    setMenuAnchor(null);
    setSelectedHistoryId(null);
    setShowConfirmRestore(null);
    onClose();
  };

  const togglePasswordVisibility = (historyId) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(historyId)) {
      newVisible.delete(historyId);
    } else {
      newVisible.add(historyId);
    }
    setVisiblePasswords(newVisible);
  };

  const handleMenuOpen = (event, historyId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedHistoryId(historyId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedHistoryId(null);
  };

  const handleCopyPassword = (password) => {
    copyToClipboard('Password copied to clipboard!', password);
    handleMenuClose();
  };

  const handleRestorePassword = async (historyId) => {
    if (showConfirmRestore === historyId) {
      setIsRestoring(true);
      try {
        const success = await restorePasswordFromHistory(entryIndex, historyId);
        if (success) {
          copyToClipboard('Password restored successfully!');
          setShowConfirmRestore(null);
          handleMenuClose();
        } else {
          copyToClipboard('Failed to restore password');
        }
      } catch (error) {
        copyToClipboard('Error restoring password');
        console.error('Error restoring password:', error);
      } finally {
        setIsRestoring(false);
      }
    } else {
      setShowConfirmRestore(historyId);
      handleMenuClose();
      // Auto-cancel confirmation after 5 seconds
      setTimeout(() => {
        if (showConfirmRestore === historyId) {
          setShowConfirmRestore(null);
        }
      }, 5000);
    }
  };

  const handleDeleteFromHistory = async (historyId) => {
    try {
      const success = await deletePasswordFromHistory(entryIndex, historyId);
      if (success) {
        copyToClipboard('Password removed from history');
        handleMenuClose();
      } else {
        copyToClipboard('Failed to remove password from history');
      }
    } catch (error) {
      copyToClipboard('Error removing password from history');
      console.error('Error deleting from history:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const maskPassword = (password) => {
    return '•'.repeat(Math.min(password.length, 12));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon color="primary" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Password History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {entryTitle}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {history.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>No Password History</AlertTitle>
            This entry doesn't have any previous passwords. Password history will be 
            maintained automatically when you update passwords in the future.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {history.length} previous password{history.length !== 1 ? 's' : ''}. 
              You can restore any previous password or remove it from history.
            </Typography>
            
            <List sx={{ width: '100%' }}>
              {history
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((historyItem, index) => (
                <Paper 
                  key={historyItem.id}
                  variant="outlined"
                  sx={{ mb: 1, overflow: 'hidden' }}
                >
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <TimeIcon color="action" />
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontSize: '0.9rem'
                            }}
                          >
                            {visiblePasswords.has(historyItem.id) 
                              ? historyItem.password 
                              : maskPassword(historyItem.password)
                            }
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => togglePasswordVisibility(historyItem.id)}
                          >
                            {visiblePasswords.has(historyItem.id) ? 
                              <VisibilityOffIcon fontSize="small" /> : 
                              <VisibilityIcon fontSize="small" />
                            }
                          </IconButton>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Changed on {formatTimestamp(historyItem.timestamp)}
                          </Typography>
                          {showConfirmRestore === historyItem.id && (
                            <Chip 
                              label="Click restore again to confirm" 
                              size="small" 
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, historyItem.id)}
                        size="small"
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
            </List>
          </>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor) && selectedHistoryId}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 200, borderRadius: 2 }
          }}
        >
          <MenuItem 
            onClick={() => {
              const historyItem = history.find(h => h.id === selectedHistoryId);
              if (historyItem) {
                handleCopyPassword(historyItem.password);
              }
            }}
          >
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            Copy Password
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleRestorePassword(selectedHistoryId)}
            sx={{ 
              color: showConfirmRestore === selectedHistoryId ? 'warning.main' : 'primary.main' 
            }}
          >
            <ListItemIcon>
              <RestoreIcon 
                fontSize="small" 
                color={showConfirmRestore === selectedHistoryId ? 'warning' : 'primary'}
              />
            </ListItemIcon>
            {showConfirmRestore === selectedHistoryId ? 'Confirm Restore' : 'Restore Password'}
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={() => handleDeleteFromHistory(selectedHistoryId)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Remove from History
          </MenuItem>
        </Menu>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <ActionButton
          variant="outlined"
          onClick={handleClose}
        >
          Close
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordHistoryDialog; 