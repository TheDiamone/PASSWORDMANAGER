import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
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

const PasswordCard = ({ 
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
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          borderColor: 'primary.main'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with Category and Site */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
                         sx={{ 
               bgcolor: category?.color || theme.palette.neutral[500],
              width: 48,
              height: 48
            }}
          >
            {getCategoryIcon(entry.category)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}
                         >
               {entry.site || 'Untitled Entry'}
             </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {category?.name || 'Other'}
            </Typography>
          </Box>
        </Box>

        {/* Username */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Username
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
                             noWrap
             >
               {entry.user || 'No username'}
             </Typography>
            <Tooltip title="Copy Username">
              <IconButton 
                size="small" 
                onClick={handleCopyUsername}
                sx={{ p: 0.5 }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Password */}
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
              noWrap
            >
              {getPasswordDisplay()}
            </Typography>
            <Tooltip title={isPasswordVisible ? "Hide Password" : "Show Password"}>
              <IconButton 
                size="small" 
                onClick={() => onTogglePassword(index)}
                sx={{ p: 0.5 }}
              >
                {isPasswordVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Password">
              <IconButton 
                size="small" 
                onClick={handleCopyPassword}
                sx={{ p: 0.5 }}
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
              {entry.tags.slice(0, 3).map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              ))}
              {entry.tags.length > 3 && (
                <Chip
                  label={`+${entry.tags.length - 3} more`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.75rem', height: 20 }}
                />
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Status Indicators */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            label={passwordStrength.strength}
            size="small"
            color={getStrengthColor(passwordStrength.strength)}
            variant="filled"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
          
          {breachStatus && (
            <Chip
              icon={getBreachIcon(breachStatus)}
              label={breachStatus.found ? 'Breached' : 'Secure'}
              size="small"
              color={getBreachColor(breachStatus)}
              variant={breachStatus.found ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Entry">
            <IconButton 
              size="small" 
              onClick={() => onEdit(index)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

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
      </CardActions>
    </Card>
  );
};

export default PasswordCard;  