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
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress
} from '@mui/material';
import { 
  Fingerprint as FingerprintIcon,
  TouchApp as TouchAppIcon,
  Security as SecurityIcon,
  Check as CheckIcon
} from '@mui/icons-material';
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
  const [setupStep, setSetupStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);

  const steps = [
    {
      label: 'Verify Compatibility',
      description: 'Checking if your device supports Touch ID'
    },
    {
      label: 'Register Fingerprint',
      description: 'Follow the system prompt to register your fingerprint'
    },
    {
      label: 'Complete Setup',
      description: 'Finalize biometric authentication setup'
    }
  ];

  const setupBiometric = async () => {
    console.log('Starting biometric setup...');
    setSetting(true);
    setSetupStep(0);
    
    if (!biometricSupported) {
      console.log('Biometric not supported, showing alert');
      alert('Biometric authentication is not supported on this device.');
      setSetting(false);
      return;
    }

    try {
      setSetupStep(1);
      console.log('Generating challenge for biometric registration...');
      
      // Generate a challenge for registration
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Generate a unique user ID
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      console.log('Creating public key options for registration...');
      const publicKeyOptions = {
        challenge: challenge,
        rp: {
          name: "Password Manager",
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: "user@passwordmanager.local",
          displayName: "Password Manager User"
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7 // ES256
          },
          {
            type: "public-key", 
            alg: -257 // RS256
          }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred"
        },
        attestation: "none",
        timeout: 60000
      };

      console.log('Public key options:', publicKeyOptions);
      console.log('Calling navigator.credentials.create...');

      setSetupStep(2);
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
      
      setSetupComplete(true);
      copyToClipboard('Touch ID setup complete! You can now unlock with your fingerprint.');

    } catch (error) {
      console.error('Biometric setup error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = '';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Touch ID setup was cancelled. Please try again if you want to enable fingerprint unlock.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Touch ID is not supported in this browser. Please use Chrome, Safari, or Firefox.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Security error: Please ensure you are using HTTPS or localhost.';
      } else {
        errorMessage = `Touch ID setup error: ${error.message}`;
      }
      
      alert(errorMessage);
      setSetupStep(0);
    } finally {
      setSetting(false);
    }
  };

  const handleClose = () => {
    if (!setting) {
      setSetupStep(0);
      setSetupComplete(false);
      onClose();
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TouchAppIcon color="primary" />
          <Typography variant="h6">Setup Touch ID Authentication</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {!biometricSupported ? (
            <Alert severity="warning">
              <AlertTitle>Touch ID Not Available</AlertTitle>
              <Typography variant="body2">
                Touch ID authentication is not supported on this device or browser.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="600">Requirements:</Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
                  <li>macOS with Touch ID or Face ID</li>
                  <li>Supported browser (Chrome, Safari, Firefox)</li>
                  <li>Secure connection (HTTPS or localhost)</li>
                </Typography>
              </Box>
            </Alert>
          ) : setupComplete ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="success.main">
                Touch ID Setup Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You can now unlock your password manager using your fingerprint.
                This will bypass 2FA verification for faster access.
              </Typography>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Next time you log in:</strong><br/>
                  Look for the "Touch ID Available" card on the login screen
                  and tap it to unlock instantly with your fingerprint.
                </Typography>
              </Alert>
            </Box>
          ) : (
            <>
              <Alert severity="info">
                <AlertTitle>What is Touch ID Authentication?</AlertTitle>
                <Typography variant="body2">
                  Touch ID allows you to unlock your password manager using your MacBook's fingerprint sensor
                  instead of typing your master password every time. This provides:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  <Typography component="li" variant="body2">Faster login (no typing required)</Typography>
                  <Typography component="li" variant="body2">Bypasses 2FA verification</Typography>
                  <Typography component="li" variant="body2">Secure biometric authentication</Typography>
                  <Typography component="li" variant="body2">No passwords stored in memory</Typography>
                </Box>
              </Alert>

              {setting && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Setting up Touch ID...
                  </Typography>
                  <Stepper activeStep={setupStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel>
                          <Typography variant="body2" fontWeight="600">
                            {step.label}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                          {index === setupStep && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress />
                            </Box>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                  
                  {setupStep === 2 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Touch ID Prompt Active</strong><br/>
                        Please follow the system prompt and place your finger on the Touch ID sensor
                        when requested. This may take a few moments.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
              
              {!setting && (
                <Box sx={{ textAlign: 'center' }}>
                  <TouchAppIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Ready to Setup Touch ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Click the button below to start the setup process.
                    You'll be prompted to use your fingerprint.
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    onClick={setupBiometric}
                    fullWidth
                    disabled={setting}
                    startIcon={<FingerprintIcon />}
                    size="large"
                  >
                    Setup Touch ID Authentication
                  </Button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      variant="outlined" 
                      onClick={handleDebugInfo}
                      fullWidth
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Debug Biometric Info
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={setting}>
          {setupComplete ? 'Done' : 'Cancel'}
        </Button>
        {setupComplete && (
          <Button 
            variant="contained" 
            onClick={handleClose}
            startIcon={<CheckIcon />}
          >
            Continue to Vault
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BiometricSetupDialog; 