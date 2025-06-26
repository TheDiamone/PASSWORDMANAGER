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

  const buttonProps = {
    variant: iconOnly ? undefined : variant,
    color,
    size,
    disabled: disabled || loading,
    onClick,
    fullWidth: iconOnly ? undefined : fullWidth,
    sx: buttonSx,
    ...props
  };

  if (iconOnly) {
    buttonProps.size = size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium';
  } else {
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