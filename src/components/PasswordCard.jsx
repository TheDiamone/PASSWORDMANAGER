import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
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
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import ActionDropdown from './ActionDropdown';
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
  const passwordStrength = checkPasswordStrength(entry.pass || '');

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
    if (!entry.pass) {
      return '••••••••';
    }
    if (isPasswordVisible) {
      return entry.pass;
    }
    return '•'.repeat(Math.min(entry.pass.length, 12));
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
    if (entry.pass) {
      copyToClipboard('Password copied!', entry.pass);
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
            <ActionButton
              iconOnly
              size="small"
              onClick={handleCopyUsername}
              tooltip="Copy username to clipboard"
              disabled={!entry.user}
            >
              <PersonIcon fontSize="small" />
            </ActionButton>
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
            <ActionButton
              iconOnly
              size="small"
              onClick={() => onTogglePassword(index)}
              tooltip={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </ActionButton>
            <ActionButton
              iconOnly
              size="small"
              onClick={handleCopyPassword}
              tooltip="Copy password to clipboard"
              disabled={!entry.pass}
            >
              <CopyIcon fontSize="small" />
            </ActionButton>
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

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
        <ActionDropdown
          size="small"
          tooltip="Password entry actions"
          actions={[
            {
              id: 'edit',
              label: 'Edit Entry',
              description: 'Modify password details',
              icon: <EditIcon />,
              onClick: () => onEdit(index),
              shortcut: 'E'
            },
            {
              id: 'copy-username',
              label: 'Copy Username',
              description: 'Copy username to clipboard',
              icon: <PersonIcon />,
              onClick: handleCopyUsername,
              disabled: !entry.user,
              shortcut: 'U'
            },
            {
              id: 'copy-password',
              label: 'Copy Password',
              description: 'Copy password to clipboard',
              icon: <CopyIcon />,
              onClick: handleCopyPassword,
              disabled: !entry.pass,
              shortcut: 'P'
            },
            {
              id: 'toggle-visibility',
              label: isPasswordVisible ? 'Hide Password' : 'Show Password',
              description: isPasswordVisible ? 'Hide password from view' : 'Show password in clear text',
              icon: isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />,
              onClick: () => onTogglePassword(index),
              shortcut: 'V'
            },
            { divider: true },
            {
              id: 'delete',
              label: showConfirmDelete ? 'Confirm Delete' : 'Delete Entry',
              description: showConfirmDelete ? 'Click to permanently delete' : 'Remove this password entry',
              icon: <DeleteIcon />,
              onClick: handleDelete,
              color: 'error',
              shortcut: 'Del'
            }
          ]}
        />
      </CardActions>
    </Card>
  );
};

export default PasswordCard;  