import React, { useState } from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
  Tooltip,
  Collapse,
  Divider,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as BankingIcon,
  Work as WorkIcon,
  ShoppingCart as ShoppingIcon,
  Email as EmailIcon,
  SportsEsports as GamingIcon,
  Public as SocialIcon,
  Category as OtherIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { checkPasswordStrength } from '../services/crypto';

const PasswordListItem = ({ 
  entry, 
  index, 
  onEdit, 
  onDelete, 
  isPasswordVisible, 
  onTogglePassword 
}) => {
  const { getCategoryById, getBreachStatus } = useVault();
  const { copyToClipboard } = useClipboard();
  const theme = useTheme();
  
  const [expanded, setExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const category = getCategoryById(entry.category);
  const breachStatus = getBreachStatus(entry.id);
  const passwordStrength = checkPasswordStrength(entry.password || '');

  const getCategoryIcon = (categoryId) => {
    const iconProps = { 
      sx: { 
        color: 'white',
        fontSize: 20
      } 
    };
    
    switch (categoryId) {
      case 'banking': return <BankingIcon {...iconProps} />;
      case 'work': return <WorkIcon {...iconProps} />;
      case 'shopping': return <ShoppingIcon {...iconProps} />;
      case 'email': return <EmailIcon {...iconProps} />;
      case 'gaming': return <GamingIcon {...iconProps} />;
      case 'social': return <SocialIcon {...iconProps} />;
      default: return <OtherIcon {...iconProps} />;
    }
  };

  const getPasswordDisplay = () => {
    if (!entry.password) {
      return '••••••••';
    }
    if (isPasswordVisible) {
      return entry.password;
    }
    return '•'.repeat(Math.min(entry.password.length, 12));
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Very Strong': return 'success';
      case 'Strong': return 'info';
      case 'Medium': return 'warning';
      case 'Weak': return 'error';
      default: return 'default';
    }
  };

  const getBreachColor = (status) => {
    if (!status) return 'default';
    return status.found ? 'error' : 'success';
  };

  const getBreachIcon = (status) => {
    if (!status) return <SecurityIcon />;
    return status.found ? <WarningIcon /> : <CheckCircleIcon />;
  };

  const handleCopyPassword = () => {
    if (entry.password) {
      copyToClipboard('Password copied!', entry.password);
    }
  };

  const handleCopyUsername = () => {
    if (entry.user) {
      copyToClipboard('Username copied!', entry.user);
    }
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(index);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  return (
    <>
      <ListItem
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          mb: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar
                         sx={{ 
               bgcolor: category?.color || theme.palette.neutral[500],
              width: 48,
              height: 48
            }}
          >
            {getCategoryIcon(entry.category)}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 600, flexGrow: 1 }}
                noWrap
                             >
                 {entry.site || 'Untitled Entry'}
               </Typography>
              <Chip
                label={category?.name || 'Other'}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          }
          primaryTypographyProps={{ component: 'div' }}
          secondary={
            <Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                                 noWrap
               >
                 {entry.user || 'No username'}
               </Typography>
              
              {/* Status Indicators */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={passwordStrength.strength}
                  size="small"
                  color={getStrengthColor(passwordStrength.strength)}
                  variant="filled"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
                
                {breachStatus && (
                  <Chip
                    icon={getBreachIcon(breachStatus)}
                    label={breachStatus.found ? 'Breached' : 'Secure'}
                    size="small"
                    color={getBreachColor(breachStatus)}
                    variant={breachStatus.found ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Stack>
            </Box>
          }
          secondaryTypographyProps={{ component: 'div' }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Copy Username">
            <IconButton 
              size="small" 
              onClick={handleCopyUsername}
              color="primary"
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isPasswordVisible ? "Hide Password" : "Show Password"}>
            <IconButton 
              size="small" 
              onClick={() => onTogglePassword(index)}
              color="primary"
            >
              {isPasswordVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Entry">
            <IconButton 
              size="small" 
              onClick={() => onEdit(index)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={showConfirmDelete ? "Click again to confirm delete" : "Delete Entry"}>
            <IconButton 
              size="small" 
              onClick={handleDelete}
              color={showConfirmDelete ? "error" : "default"}
              sx={{
                backgroundColor: showConfirmDelete ? 'error.light' : 'transparent',
                '&:hover': {
                  backgroundColor: showConfirmDelete ? 'error.main' : 'action.hover'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={expanded ? "Show Less" : "Show More"}>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>

      {/* Expanded Details */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ 
          ml: 9, 
          mr: 2, 
          mb: 2, 
          p: 2, 
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0
        }}>
          {/* Password Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Password
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  flexGrow: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {getPasswordDisplay()}
              </Typography>
              <Tooltip title="Copy Password">
                <IconButton 
                  size="small" 
                  onClick={handleCopyPassword}
                  color="primary"
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {entry.tags.map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 20 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Additional Info */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Password Strength: {passwordStrength.strength} • 
              {breachStatus ? 
                (breachStatus.found ? ' Security: Breached' : ' Security: Secure') : 
                ' Security: Not Checked'
              }
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </>
  );
};

export default PasswordListItem; 