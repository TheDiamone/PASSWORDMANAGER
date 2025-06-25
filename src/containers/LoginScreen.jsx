import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import { Security as SecurityIcon, Fingerprint as FingerprintIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import TwoFactorSetupDialog from '../components/TwoFactorSetupDialog';
import TwoFactorVerificationDialog from '../components/TwoFactorVerificationDialog';
import BiometricSetupDialog from '../components/BiometricSetupDialog';
import { deriveKey, decryptVault } from '../services/crypto';

const LoginScreen = () => {
  const { 
    masterPassword, 
    setMasterPassword, 
    setUnlocked,
    twoFactorEnabled,
    biometricEnabled,
    biometricSupported
  } = useAuth();
  const { setVault } = useVault();
  const { copyToClipboard } = useClipboard();
  
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  const handleUnlock = async () => {
    if (!masterPassword) {
      alert('Please enter your master password');
      return;
    }

    const vaultData = localStorage.getItem('vault');
    const twoFactorData = localStorage.getItem('twoFactor');
    
    // Check if 2FA is enabled
    if (twoFactorData) {
      // Verify master password first before showing 2FA dialog
      if (vaultData) {
        const key = await deriveKey(masterPassword);
        try {
          await decryptVault(JSON.parse(vaultData), key);
        } catch {
          alert('Wrong master password');
          return;
        }
      }
      
      setShow2FAVerification(true);
      return;
    }
    
    // No 2FA enabled - proceed with normal unlock
    if (!vaultData) {
      setUnlocked(true);
      return;
    }
    
    const key = await deriveKey(masterPassword);
    try {
      const data = await decryptVault(JSON.parse(vaultData), key);
      setVault(data);
      setUnlocked(true);
    } catch {
      alert('Wrong password or corrupted vault');
    }
  };

  const handleBiometricUnlock = async () => {
    // Implementation would go here - this is a placeholder
    // The actual biometric logic would be in a hook or service
    console.log('Biometric unlock attempted');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" gutterBottom>
            Enter Master Password
          </Typography>
          
          <TextField
            label="Master Password"
            value={masterPassword}
            onChange={e => setMasterPassword(e.target.value)}
            type="password"
            fullWidth
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUnlock();
              }
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleUnlock} 
            fullWidth
            disabled={!masterPassword}
          >
            Unlock
          </Button>
          
          {biometricEnabled && biometricSupported && (
            <Button 
              variant="outlined" 
              onClick={handleBiometricUnlock}
              fullWidth
              startIcon={<FingerprintIcon />}
            >
              Unlock with Touch ID
            </Button>
          )}
          
          {twoFactorEnabled ? (
            <Alert severity="info" sx={{ width: '100%' }}>
              <Typography variant="body2">
                Two-Factor Authentication is enabled for this account.
              </Typography>
            </Alert>
          ) : (
            <Button 
              variant="outlined" 
              startIcon={<SecurityIcon />}
              onClick={() => setShow2FASetup(true)}
              fullWidth
            >
              Setup Two-Factor Authentication
            </Button>
          )}
        </Stack>
      </Paper>

      <TwoFactorSetupDialog 
        open={show2FASetup}
        onClose={() => setShow2FASetup(false)}
      />
      
      <TwoFactorVerificationDialog
        open={show2FAVerification}
        onClose={() => setShow2FAVerification(false)}
        onSuccess={() => {
          setShow2FAVerification(false);
          setUnlocked(true);
          // Show biometric setup if supported and not enabled
          if (biometricSupported && !biometricEnabled) {
            setShowBiometricSetup(true);
          }
        }}
      />

      <BiometricSetupDialog
        open={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
      />
    </Box>
  );
};

export default LoginScreen; 