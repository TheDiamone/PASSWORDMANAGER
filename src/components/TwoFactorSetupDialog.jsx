import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Box,
  TextField,
  Tooltip,
  Alert,
  Chip
} from '@mui/material';
import { 
  ContentCopy as ContentCopyIcon,
  NavigateNext as NextIcon,
  Check as CompleteIcon,
  Cancel as CancelIcon,
  Visibility as ShowIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import { useAuth } from '../context/AuthContext';
import { useClipboard } from '../hooks/useClipboard';
import { 
  generateTOTPSecret, 
  generateTOTPQRCode, 
  generateBackupCodes,
  generateCurrentTOTP
} from '../services/crypto';

const TwoFactorSetupDialog = ({ open, onClose }) => {
  const { save2FASettings } = useAuth();
  const { copyToClipboard } = useClipboard();
  
  const [setupStep, setSetupStep] = useState(1);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQRCode, setTwoFactorQRCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !twoFactorSecret) {
      handleSetup2FA();
    }
  }, [open]);

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      console.log('Starting 2FA setup...');
      
      const secret = generateTOTPSecret();
      console.log('Generated secret:', secret);
      
      const qrCode = await generateTOTPQRCode(secret);
      console.log('Generated QR code');
      
      const codes = generateBackupCodes();
      console.log('Generated backup codes:', codes);
      
      setTwoFactorSecret(secret);
      setTwoFactorQRCode(qrCode);
      setBackupCodes(codes);
    } catch (error) {
      console.error('Error in 2FA setup:', error);
      copyToClipboard('Error setting up 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAComplete = () => {
    save2FASettings({
      secret: twoFactorSecret,
      backupCodes: backupCodes
    });
    
    setSetupStep(1);
    setTwoFactorSecret('');
    setTwoFactorQRCode('');
    setBackupCodes([]);
    onClose();
    
    copyToClipboard('Two-Factor Authentication setup complete!');
  };

  const handleCopySecret = () => {
    copyToClipboard('Secret copied!', twoFactorSecret);
  };

  const handleCopyBackupCodes = () => {
    copyToClipboard('Backup codes copied!', backupCodes.join('\n'));
  };

  const handleShowCurrentCode = async () => {
    try {
      const currentCode = await generateCurrentTOTP(twoFactorSecret);
      if (currentCode) {
        alert(`Current expected code: ${currentCode}\n\nThis should match the code in your authenticator app right now.`);
      }
    } catch (error) {
      console.error('Error generating current TOTP:', error);
    }
  };

  const handleClose = () => {
    setSetupStep(1);
    setTwoFactorSecret('');
    setTwoFactorQRCode('');
    setBackupCodes([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            {setupStep === 1 && (
              <Stack spacing={3}>
                <Typography>
                  1. Scan this QR code with your authenticator app:
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Recommended apps:</strong> Okta Verify, Google Authenticator, Authy, Microsoft Authenticator
                  </Typography>
                </Alert>
                
                {twoFactorQRCode && (
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <img 
                      src={twoFactorQRCode} 
                      alt="QR Code" 
                      style={{ maxWidth: '256px', width: '100%' }} 
                    />
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  If scanning doesn't work, manually enter this secret in your authenticator app:
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={twoFactorSecret}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    size="small"
                  />
                  <ActionButton
                    iconOnly
                    onClick={handleCopySecret}
                    tooltip="Copy secret to clipboard"
                    size="small"
                  >
                    <ContentCopyIcon />
                  </ActionButton>
                </Box>
                
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Manual Setup Instructions:</strong><br/>
                    • Issuer/App Name: Password Manager<br/>
                    • Account Name: user<br/>
                    • Secret Key: {twoFactorSecret}<br/>
                    • Algorithm: SHA1<br/>
                    • Digits: 6<br/>
                    • Time Period: 30 seconds
                  </Typography>
                </Alert>
                
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>For Okta Verify users:</strong><br/>
                    1. Open Okta Verify app<br/>
                    2. Tap "Add Account" → "Company" → "Other"<br/>
                    3. If QR scan fails, tap "Can't scan?" → "Enter manually"<br/>
                    4. Enter: Account name: "Password Manager", Key: {twoFactorSecret.substring(0, 8)}...<br/>
                    5. Save and verify the 6-digit code works
                  </Typography>
                </Alert>
                
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Test your setup:</strong> After adding to your authenticator app, verify it shows a 6-digit code that updates every 30 seconds.
                  </Typography>
                  <ActionButton 
                    variant="outlined" 
                    size="small"
                    startIcon={<ShowIcon />}
                    onClick={handleShowCurrentCode}
                    tooltip="Test that your authenticator app is working correctly"
                  >
                    Show Current Expected Code
                  </ActionButton>
                </Box>
                
                <ActionButton 
                  variant="contained" 
                  endIcon={<NextIcon />}
                  onClick={() => setSetupStep(2)}
                  tooltip="Continue to backup codes setup"
                >
                  Next: Backup Codes
                </ActionButton>
              </Stack>
            )}
            
            {setupStep === 2 && (
              <Stack spacing={3}>
                <Typography>
                  2. Save these backup codes in a secure location. You can use them to recover your account:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {backupCodes.map((code, index) => (
                    <Chip key={index} label={code} variant="outlined" />
                  ))}
                </Box>
                
                <ActionButton 
                  variant="outlined" 
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyBackupCodes}
                  tooltip="Copy all backup codes to clipboard"
                >
                  Copy All Codes
                </ActionButton>
                
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Important:</strong> Store these backup codes securely. Each code can only be used once to recover your account if you lose access to your authenticator app.
                  </Typography>
                </Alert>
                
                <ActionButton 
                  variant="contained" 
                  startIcon={<CompleteIcon />}
                  onClick={handle2FAComplete}
                  tooltip="Finish two-factor authentication setup"
                >
                  Complete Setup
                </ActionButton>
              </Stack>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <ActionButton 
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={handleClose}
          tooltip="Cancel two-factor authentication setup"
        >
          Cancel
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorSetupDialog; 