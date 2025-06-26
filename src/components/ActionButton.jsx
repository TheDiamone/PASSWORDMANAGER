import React from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';

const ActionButton = ({
  children,
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  startIcon = null,
  endIcon = null,
  tooltip = '',
  onClick,
  fullWidth = false,
  iconOnly = false,
  sx = {},
  ...props
}) => {
  const buttonSx = {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 500,
    minHeight: iconOnly ? 'auto' : 36,
    ...sx
  };

  const ButtonComponent = iconOnly ? IconButton : Button;

  // Separate props for IconButton vs Button
  const commonProps = {
    color,
    size,
    disabled: disabled || loading,
    onClick,
    sx: buttonSx
  };

  let buttonProps;
  
  if (iconOnly) {
    // IconButton specific props - exclude fullWidth, variant, startIcon, endIcon
    buttonProps = {
      ...commonProps,
      // Filter out Button-specific props from ...props
      ...Object.fromEntries(
        Object.entries(props).filter(([key]) => 
          !['variant', 'startIcon', 'endIcon', 'fullWidth'].includes(key)
        )
      )
    };
  } else {
    // Button specific props
    buttonProps = {
      ...commonProps,
      variant,
      fullWidth,
      ...props
    };
    
    if (startIcon && !loading) buttonProps.startIcon = startIcon;
    if (endIcon && !loading) buttonProps.endIcon = endIcon;
  }

  const buttonContent = (
    <ButtonComponent {...buttonProps}>
      {loading && !iconOnly && (
        <CircularProgress size={16} sx={{ mr: 1 }} />
      )}
      {loading && iconOnly ? (
        <CircularProgress size={16} />
      ) : (
        children
      )}
    </ButtonComponent>
  );

  if (tooltip && !disabled) {
    return (
      <Tooltip title={tooltip} arrow>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default ActionButton; 