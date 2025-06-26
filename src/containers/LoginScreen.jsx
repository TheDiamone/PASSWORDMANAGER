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

  // Check if biometric is actually ready to use
  const isBiometricReady = () => {
    if (!biometricEnabled || !biometricSupported) return false;
    
    const biometricCredentials = localStorage.getItem('biometricCredentials');
    const storedMasterPassword = localStorage.getItem('biometricMasterPassword');
    
    return biometricCredentials && storedMasterPassword;
  };

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
    console.log('Starting biometric unlock...');
    
    if (!biometricEnabled || !biometricSupported) {
      alert('Biometric authentication is not enabled or supported.');
      return;
    }
    
    try {
      // Get stored biometric credentials
      const biometricCredentials = localStorage.getItem('biometricCredentials');
      const storedMasterPassword = localStorage.getItem('biometricMasterPassword');
      
      if (!biometricCredentials || !storedMasterPassword) {
        alert('Biometric credentials not found. Please set up biometric authentication again.');
        return;
      }
      
      const credentials = JSON.parse(biometricCredentials);
      console.log('Retrieved biometric credentials:', credentials);
      
      // Create challenge for authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const publicKeyOptions = {
        challenge: challenge,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(credentials.credentialId)
        }],
        userVerification: "required",
        timeout: 60000
      };
      
      console.log('Requesting biometric authentication...');
      
      // Request biometric authentication
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions
      });
      
      console.log('Biometric authentication successful:', assertion);
      
      // If biometric auth succeeds, use stored master password to unlock
      setMasterPassword(storedMasterPassword);
      
      // Load vault data
      const vaultData = localStorage.getItem('vault');
      if (vaultData) {
        const key = await deriveKey(storedMasterPassword);
        try {
          const data = await decryptVault(JSON.parse(vaultData), key);
          setVault(data);
          setUnlocked(true);
          
          console.log('Vault unlocked with biometric authentication - 2FA bypassed');
          
          // Try to show success message, but don't fail if clipboard doesn't work
          try {
            await copyToClipboard('Successfully unlocked with biometric authentication!');
          } catch (clipboardError) {
            console.log('Clipboard notification failed, but unlock was successful');
          }
          
          return;
        } catch (error) {
          console.error('Error decrypting vault with stored password:', error);
          alert('Error accessing vault data. Please use master password instead.');
          return;
        }
      } else {
        // No vault data, just unlock
        setUnlocked(true);
        
        // Try to show success message, but don't fail if clipboard doesn't work
        try {
          await copyToClipboard('Successfully unlocked with biometric authentication!');
        } catch (clipboardError) {
          console.log('Clipboard notification failed, but unlock was successful');
        }
        
        return;
      }
      
    } catch (error) {
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        copyToClipboard('Biometric authentication cancelled or failed.');
      } else if (error.name === 'NotSupportedError') {
        alert('Biometric authentication is not supported in this browser.');
      } else if (error.name === 'SecurityError') {
        alert('Security error during biometric authentication.');
      } else {
        console.error('Full error details:', error);
        alert(`Biometric authentication failed: ${error.message}. Please use your master password instead.`);
      }
    }
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
          
          {isBiometricReady() && (
            <Button 
              variant="outlined" 
              onClick={handleBiometricUnlock}
              fullWidth
              startIcon={<FingerprintIcon />}
            >
              Unlock with Touch ID
            </Button>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="text" 
              onClick={() => {
                console.log('=== BIOMETRIC DEBUG INFO ===');
                console.log('biometricEnabled:', biometricEnabled);
                console.log('biometricSupported:', biometricSupported);
                console.log('isBiometricReady():', isBiometricReady());
                
                const credentials = localStorage.getItem('biometricCredentials');
                const masterPwd = localStorage.getItem('biometricMasterPassword');
                
                console.log('Stored biometric credentials:', credentials ? 'Present' : 'Missing');
                console.log('Stored master password:', masterPwd ? 'Present' : 'Missing');
                console.log('Current master password:', masterPassword ? 'Present' : 'Missing');
                
                if (credentials) {
                  try {
                    const parsed = JSON.parse(credentials);
                    console.log('Credential ID length:', parsed.credentialId?.length);
                  } catch (e) {
                    console.log('Error parsing credentials:', e);
                  }
                }
                
                alert('Check console for biometric debug info');
              }}
              size="small"
            >
              Debug Biometric
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
          console.log('2FA verification successful!');
          console.log('biometricSupported:', biometricSupported);
          console.log('biometricEnabled:', biometricEnabled);
          console.log('Should show biometric setup:', biometricSupported && !biometricEnabled);
          
          setShow2FAVerification(false);
          setUnlocked(true);
          
          // Show biometric setup if supported and not enabled
          if (biometricSupported && !biometricEnabled) {
            console.log('Showing biometric setup dialog...');
            setTimeout(() => {
              setShowBiometricSetup(true);
            }, 500); // Small delay to ensure 2FA dialog closes first
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