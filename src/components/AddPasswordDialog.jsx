import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  LinearProgress,
  FormHelperText,
  Alert
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  AutoAwesome as GenerateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { checkPasswordStrength } from '../services/crypto';
import PasswordGenerator from './PasswordGenerator';

const AddPasswordDialog = ({ open, onClose, editEntry = null, editIndex = null }) => {
  const { categories, addEntry, updateEntry } = useVault();
  const { copyToClipboard } = useClipboard();
  const { generatePassword } = usePasswordGenerator();
  
  const isEditMode = editEntry !== null;
  
  const [entry, setEntry] = useState({ 
    site: '', 
    user: '', 
    pass: '', 
    category: 'other', 
    tags: [] 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Refs for managing focus
  const siteInputRef = useRef(null);

  // Initialize form data when dialog opens or edit entry changes
  useEffect(() => {
    if (open) {
      if (isEditMode && editEntry) {
        setEntry({
          site: editEntry.site || '',
          user: editEntry.user || '',
          pass: editEntry.pass || '',
          category: editEntry.category || 'other',
          tags: editEntry.tags || []
        });
      } else {
        setEntry({ 
          site: '', 
          user: '', 
          pass: '', 
          category: 'other', 
          tags: [] 
        });
      }
      setErrors({});
      setTouched({});
      setShowPassword(false);
      setShowGenerator(false);
      setIsSubmitting(false);
    }
  }, [open, isEditMode, editEntry]);

  // Focus the first input when dialog opens
  useEffect(() => {
    if (open && siteInputRef.current) {
      const timer = setTimeout(() => {
        siteInputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Validation functions
  const validateSite = (value) => {
    if (!value || !value.trim()) {
      return 'Site/Service name is required';
    }
    if (value.trim().length < 2) {
      return 'Site/Service name must be at least 2 characters';
    }
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return ''; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateURL = (value) => {
    if (!value) return ''; // URL is optional
    try {
      // Try to construct URL to validate format
      new URL(value.startsWith('http') ? value : `https://${value}`);
      return '';
    } catch {
      return 'Please enter a valid URL format (e.g., google.com or https://google.com)';
    }
  };

  const validatePassword = (value) => {
    if (!value || !value.trim()) {
      return 'Password is required';
    }
    if (value.length < 1) {
      return 'Password cannot be empty';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'site':
        return validateSite(value);
      case 'user':
        // Check if it looks like an email or just a username
        if (value && value.includes('@')) {
          return validateEmail(value);
        }
        return '';
      case 'pass':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    setEntry({ ...entry, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleFieldBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, entry[field]);
    setErrors({ ...errors, [field]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    newErrors.site = validateSite(entry.site);
    newErrors.pass = validatePassword(entry.pass);
    
    // Validate optional fields if they have values
    if (entry.user) {
      if (entry.user.includes('@')) {
        newErrors.user = validateEmail(entry.user);
      }
    }

    setErrors(newErrors);
    setTouched({ site: true, user: true, pass: true });
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      copyToClipboard('Please fix the errors below before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let success;
      if (isEditMode && editIndex !== null) {
        success = await updateEntry(editIndex, entry);
        if (success) {
          copyToClipboard('Password entry updated successfully!');
        }
      } else {
        success = await addEntry(entry);
        if (success) {
          copyToClipboard('Password entry added successfully!');
        }
      }
      
      if (success) {
        handleClose();
      } else {
        copyToClipboard('Error saving password entry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      copyToClipboard('Error saving password entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowGenerator(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleUseGenerated = (password) => {
    handleFieldChange('pass', password);
    setShowGenerator(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isSubmitting && validateForm()) {
        handleSubmit();
      }
    }
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const entryStrength = checkPasswordStrength(entry.pass);
  const hasErrors = Object.values(errors).some(error => error !== '');

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      onKeyDown={handleKeyDown}
      aria-labelledby="password-dialog-title"
      aria-describedby="password-dialog-description"
    >
      <DialogTitle id="password-dialog-title">
        {isEditMode ? 'Edit Password Entry' : 'Add New Entry'}
      </DialogTitle>
      <DialogContent>
        <Typography id="password-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isEditMode 
            ? 'Update the information for your password entry.' 
            : 'Enter the details for your new password entry. Required fields are marked with *.'}
        </Typography>
        
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            inputRef={siteInputRef}
            label="Site/Service Name *"
            value={entry.site}
            onChange={(e) => handleFieldChange('site', e.target.value)}
            onBlur={() => handleFieldBlur('site')}
            fullWidth
            placeholder="e.g., Google, GitHub, Amazon"
            error={touched.site && !!errors.site}
            helperText={touched.site && errors.site ? errors.site : 'Enter the name of the website or service'}
            required
            disabled={isSubmitting}
          />
          
          <TextField
            label="Username/Email"
            value={entry.user}
            onChange={(e) => handleFieldChange('user', e.target.value)}
            onBlur={() => handleFieldBlur('user')}
            fullWidth
            placeholder="e.g., user@example.com or username"
            error={touched.user && !!errors.user}
            helperText={touched.user && errors.user ? errors.user : 'Enter your username or email address for this site'}
            disabled={isSubmitting}
          />
          
          <FormControl fullWidth disabled={isSubmitting}>
            <InputLabel>Category</InputLabel>
            <Select
              value={entry.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
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
            <FormHelperText>Choose a category to help organize your passwords</FormHelperText>
          </FormControl>
          
          <TextField
            label="Tags (comma separated)"
            value={(entry.tags || []).join(', ')}
            onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
            fullWidth
            placeholder="e.g., important, personal, work"
            helperText="Optional: Add tags to help search and organize your passwords"
            disabled={isSubmitting}
          />
          
          <Box>
            <TextField
              label="Password *"
              value={entry.pass}
              onChange={(e) => handleFieldChange('pass', e.target.value)}
              onBlur={() => handleFieldBlur('pass')}
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              error={touched.pass && !!errors.pass}
              helperText={touched.pass && errors.pass ? errors.pass : 'Must include a mix of letters, numbers, and symbols for best security'}
              required
              disabled={isSubmitting}
                             InputProps={{
                 endAdornment: (
                   <InputAdornment position="end">
                     <ActionButton
                       iconOnly
                       onClick={() => setShowPassword(!showPassword)}
                       disabled={isSubmitting}
                       tooltip={showPassword ? "Hide password" : "Show password"}
                       size="small"
                     >
                       {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                     </ActionButton>
                   </InputAdornment>
                 )
               }}
            />
            
                         <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
               <ActionButton 
                 variant="outlined" 
                 size="small"
                 startIcon={<GenerateIcon />}
                 onClick={() => setShowGenerator(!showGenerator)}
                 disabled={isSubmitting}
                 tooltip="Open password generator"
               >
                 {showGenerator ? 'Hide Generator' : 'Generate Password'}
               </ActionButton>
               <ActionButton 
                 variant="outlined" 
                 size="small"
                 startIcon={<RefreshIcon />}
                 onClick={() => handleFieldChange('pass', generatePassword())}
                 disabled={isSubmitting}
                 tooltip="Generate a random password instantly"
               >
                 Quick Generate
               </ActionButton>
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {entryStrength.score < 3 && "Consider using a stronger password with more characters and symbols"}
                {entryStrength.score >= 3 && entryStrength.score < 5 && "Good password strength"}
                {entryStrength.score >= 5 && "Excellent password strength!"}
              </Typography>
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

          {hasErrors && Object.values(touched).some(t => t) && (
            <Alert severity="error">
              <Typography variant="body2">
                Please fix the errors above before submitting.
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
             <DialogActions sx={{ px: 3, pb: 2 }}>
         <ActionButton 
           variant="outlined"
           startIcon={<CancelIcon />}
           onClick={handleClose}
           disabled={isSubmitting}
           tooltip="Cancel and close dialog"
         >
           Cancel
         </ActionButton>
         <ActionButton 
           variant="contained" 
           startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
           onClick={handleSubmit}
           disabled={isSubmitting || hasErrors || !entry.site?.trim() || !entry.pass?.trim()}
           loading={isSubmitting}
           tooltip={isEditMode ? "Save changes to password entry" : "Add new password entry"}
         >
           {isEditMode ? 'Update Entry' : 'Add Entry'}
         </ActionButton>
       </DialogActions>
    </Dialog>
  );
};

export default AddPasswordDialog; 