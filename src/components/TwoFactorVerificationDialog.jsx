import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  TextField,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { verifyTOTP, verifyBackupCode, generateCurrentTOTP, deriveKey, decryptVault } from '../services/crypto';

const TwoFactorVerificationDialog = ({ open, onClose, onSuccess }) => {
  const { 
    masterPassword, 
    twoFactorSecret, 
    backupCodes, 
    setBackupCodes,
    save2FASettings,
    biometricSupported,
    biometricEnabled 
  } = useAuth();
  const { setVault } = useVault();
  const { copyToClipboard } = useClipboard();
  
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handle2FAVerification = async () => {
    setVerifying(true);
    
    console.log('2FA Verification attempt:');
    console.log('- Token entered:', twoFactorToken);
    console.log('- Secret stored:', twoFactorSecret);
    console.log('- Using backup code:', useBackupCode);
    
    let verificationSuccess = false;
    
    try {
      if (useBackupCode) {
        if (verifyBackupCode(backupCodeInput, backupCodes)) {
          // Update stored backup codes (remove used code)
          const twoFactorData = localStorage.getItem('twoFactor');
          if (twoFactorData) {
            const twoFactorInfo = JSON.parse(twoFactorData);
            twoFactorInfo.backupCodes = backupCodes;
            localStorage.setItem('twoFactor', JSON.stringify(twoFactorInfo));
            setBackupCodes(backupCodes);
          }
          verificationSuccess = true;
        } else {
          alert('Invalid backup code');
          return;
        }
      } else {
        const isValid = await verifyTOTP(twoFactorToken, twoFactorSecret);
        console.log('- TOTP verification result:', isValid);
        
        if (isValid) {
          verificationSuccess = true;
        } else {
          alert('Invalid 2FA code');
          return;
        }
      }
      
      if (verificationSuccess) {
        // Load vault data after successful 2FA verification
        const vaultData = localStorage.getItem('vault');
        if (vaultData) {
          const key = await deriveKey(masterPassword);
          try {
            const data = await decryptVault(JSON.parse(vaultData), key);
            setVault(data);
            console.log('Vault data loaded after 2FA verification');
          } catch (error) {
            console.error('Error loading vault after 2FA:', error);
            alert('Error loading vault data');
            return;
          }
        }
        
        // Clear inputs
        setTwoFactorToken('');
        setBackupCodeInput('');
        setUseBackupCode(false);
        
        copyToClipboard('Successfully authenticated with 2FA');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      alert('Error during 2FA verification: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleShowExpectedCode = async () => {
    try {
      const expectedCode = await generateCurrentTOTP(twoFactorSecret);
      console.log('Expected TOTP code:', expectedCode);
      alert(`Expected TOTP code: ${expectedCode}\n\nThis is for debugging only. Compare with your authenticator app.`);
    } catch (error) {
      console.error('Error generating current TOTP:', error);
    }
  };

  const handleClose = () => {
    setTwoFactorToken('');
    setBackupCodeInput('');
    setUseBackupCode(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Two-Factor Authentication</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {!useBackupCode ? (
            <>
              <Typography>
                Enter the 6-digit code from your authenticator app:
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  The code in your authenticator app changes every 30 seconds. Make sure to enter the current code.
                </Typography>
              </Alert>
              
              <TextField
                label="2FA Code"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                fullWidth
                autoFocus
                inputProps={{ maxLength: 6 }}
                helperText="Enter all 6 digits without spaces"
                disabled={verifying}
              />
              
              <Button 
                variant="contained" 
                onClick={handle2FAVerification}
                disabled={!twoFactorToken || twoFactorToken.length !== 6 || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="text" 
                  onClick={handleShowExpectedCode}
                  size="small"
                >
                  Debug: Show Expected Code
                </Button>
              )}
              
              <Button 
                variant="text" 
                onClick={() => setUseBackupCode(true)}
                disabled={verifying}
              >
                Use Backup Code Instead
              </Button>
            </>
          ) : (
            <>
              <Typography>
                Enter one of your backup codes:
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Each backup code can only be used once. After using a backup code, it will be permanently removed from your account.
                </Typography>
              </Alert>
              
              <TextField
                label="Backup Code"
                value={backupCodeInput}
                onChange={(e) => setBackupCodeInput(e.target.value)}
                fullWidth
                autoFocus
                inputProps={{ maxLength: 6 }}
                disabled={verifying}
              />
              
              <Button 
                variant="contained" 
                onClick={handle2FAVerification}
                disabled={!backupCodeInput || backupCodeInput.length !== 6 || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
              
              <Button 
                variant="text" 
                onClick={() => setUseBackupCode(false)}
                disabled={verifying}
              >
                Use 2FA Code Instead
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={verifying}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorVerificationDialog; 