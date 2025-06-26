import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Typography
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';

const ActionDropdown = ({
  actions = [],
  disabled = false,
  size = 'medium',
  orientation = 'vertical', // 'vertical' or 'horizontal'
  tooltip = 'More actions',
  sx = {},
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action) => {
    if (action.onClick && !action.disabled) {
      action.onClick();
    }
    
    // Only close the dropdown if the action doesn't have a keepOpen flag
    // This allows confirmation actions to keep the dropdown open
    if (!action.keepOpen) {
      handleClose();
    }
  };

  const IconComponent = orientation === 'horizontal' ? MoreHorizIcon : MoreVertIcon;

  // Filter out actions that should be hidden
  const visibleActions = actions.filter(action => !action.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={handleClick}
            disabled={disabled}
            size={size}
            sx={{
              borderRadius: 2,
              ...sx
            }}
            aria-label="action menu"
            aria-controls={open ? 'action-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            {...props}
          >
            <IconComponent />
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'action-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 180,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            mt: 1
          }
        }}
      >
        {visibleActions.map((action, index) => {
          if (action.divider) {
            return <Divider key={`divider-${index}`} />;
          }

          return (
            <MenuItem
              key={action.id || index}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                minHeight: 40,
                '&:hover': {
                  backgroundColor: action.color === 'error' ? 'error.light' : 'action.hover',
                  color: action.color === 'error' ? 'error.contrastText' : 'inherit'
                },
                ...(action.color === 'error' && {
                  color: 'error.main'
                })
              }}
            >
              {action.icon && (
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 36
                  }}
                >
                  {action.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={action.label}
                secondary={action.description}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary'
                }}
              />
              {action.shortcut && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 2, opacity: 0.7 }}
                >
                  {action.shortcut}
                </Typography>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ActionDropdown; 