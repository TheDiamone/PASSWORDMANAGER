import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy } from '@mui/icons-material';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { generatePassword } from '../services/crypto';

const PasswordField = ({ 
  value, 
  onChange, 
  label = "Password",
  showStrength = true,
  showGenerate = false,
  showCopy = false,
  genOptions = {},
  onCopy,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGenerate = () => {
    const newPassword = generatePassword(genOptions);
    onChange({ target: { value: newPassword } });
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(value);
    }
  };

  const endAdornment = (
    <InputAdornment position="end">
      {showGenerate && (
        <Tooltip title="Generate password">
          <IconButton onClick={handleGenerate} size="small">
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showCopy && value && (
        <Tooltip title="Copy password">
          <IconButton onClick={handleCopy} size="small">
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={showPassword ? "Hide password" : "Show password"}>
        <IconButton onClick={handleToggleVisibility} edge="end">
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );

  return (
    <>
      <TextField
        {...props}
        label={label}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        InputProps={{
          endAdornment,
          ...props.InputProps
        }}
      />
      {showStrength && <PasswordStrengthIndicator password={value} />}
    </>
  );
};

export default PasswordField; 