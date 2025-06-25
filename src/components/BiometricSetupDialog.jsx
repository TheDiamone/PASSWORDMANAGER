import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
  AlertTitle,
  Box
} from '@mui/material';
import { Fingerprint as FingerprintIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useClipboard } from '../hooks/useClipboard';

const BiometricSetupDialog = ({ open, onClose }) => {
  const { 
    biometricSupported,
    setBiometricEnabled,
    setBiometricCredentials,
    masterPassword
  } = useAuth();
  const { copyToClipboard } = useClipboard();
  const [setting, setSetting] = useState(false);

  const setupBiometric = async () => {
    console.log('Starting biometric setup...');
    setSetting(true);
    
    if (!biometricSupported) {
      console.log('Biometric not supported, showing alert');
      alert('Biometric authentication is not supported on this device.');
      setSetting(false);
      return;
    }

    try {
      console.log('Generating challenge for biometric registration...');
      // Generate a challenge for registration
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      console.log('Creating public key options for registration...');
      const publicKeyOptions = {
        challenge: challenge,
        rp: {
          name: "Password Manager",
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: "user@passwordmanager.local",
          displayName: "Password Manager User"
        },
        pubKeyCredParams: [{
          type: "public-key",
          alg: -7 // ES256
        }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      };

      console.log('Public key options:', publicKeyOptions);
      console.log('Calling navigator.credentials.create...');

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      });

      console.log('Credential created successfully:', credential);

      // Store the credential ID and challenge
      const biometricData = {
        credentialId: Array.from(new Uint8Array(credential.rawId)),
        challenge: Array.from(challenge)
      };

      console.log('Storing biometric data:', biometricData);
      setBiometricCredentials(biometricData);
      localStorage.setItem('biometricCredentials', JSON.stringify(biometricData));
      setBiometricEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      
      // Store master password for biometric authentication
      if (masterPassword) {
        localStorage.setItem('biometricMasterPassword', masterPassword);
      }
      
      onClose();
      copyToClipboard('Biometric authentication setup complete!');

    } catch (error) {
      console.error('Biometric setup error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'NotAllowedError') {
        alert('Biometric setup was cancelled or failed. Please try again.');
      } else if (error.name === 'NotSupportedError') {
        alert('Biometric authentication is not supported in this browser. Please use Chrome, Safari, or Firefox.');
      } else if (error.name === 'SecurityError') {
        alert('Security error: Please ensure you are using HTTPS or localhost.');
      } else {
        alert(`Biometric setup error: ${error.message}`);
      }
    } finally {
      setSetting(false);
    }
  };

  const handleDebugInfo = () => {
    console.log('=== BIOMETRIC DEBUG INFO ===');
    console.log('biometricSupported:', biometricSupported);
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    console.log('Location:', window.location.href);
    console.log('Is HTTPS:', window.location.protocol === 'https:');
    console.log('Is localhost:', window.location.hostname === 'localhost');
    alert('Check console for biometric debug information');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FingerprintIcon />
          <Typography>Setup Biometric Authentication</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Typography>
            Use your fingerprint (Touch ID) to unlock the password manager and skip 2FA verification.
          </Typography>
          
          {!biometricSupported ? (
            <Alert severity="warning">
              <AlertTitle>Not Supported</AlertTitle>
              Biometric authentication is not supported on this device or browser.
              <br />
              Requirements: macOS with Touch ID, supported browser (Chrome, Safari, Firefox)
            </Alert>
          ) : (
            <>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Setup Instructions:</strong><br/>
                  • Click "Setup Biometric" below<br/>
                  • Follow the system prompt to register your fingerprint<br/>
                  • You'll be able to unlock the vault with Touch ID<br/>
                  • 2FA will be skipped when using biometric authentication
                </Typography>
              </Alert>
              
              <Button 
                variant="contained" 
                onClick={setupBiometric}
                fullWidth
                disabled={setting}
                startIcon={<FingerprintIcon />}
              >
                {setting ? 'Setting up...' : 'Setup Biometric Authentication'}
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="outlined" 
                  onClick={handleDebugInfo}
                  fullWidth
                  size="small"
                >
                  Debug Biometric Info
                </Button>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={setting}>
          {biometricSupported ? 'Cancel' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BiometricSetupDialog; 