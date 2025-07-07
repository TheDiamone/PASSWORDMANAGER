import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  Alert,
  Paper,
  CssBaseline,
  Container,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Security as SecurityIcon, Fingerprint as FingerprintIcon, TouchApp as TouchAppIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import TwoFactorSetupDialog from '../components/TwoFactorSetupDialog';
import TwoFactorVerificationDialog from '../components/TwoFactorVerificationDialog';
import BiometricSetupDialog from '../components/BiometricSetupDialog';
import ThemeToggle from '../components/ThemeToggle';
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
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isBiometricUnlocking, setIsBiometricUnlocking] = useState(false);

  // Check if biometric is actually ready to use
  const isBiometricReady = () => {
    if (!biometricEnabled || !biometricSupported) return false;
    
    const biometricCredentials = localStorage.getItem('biometricCredentials');
    const storedMasterPassword = localStorage.getItem('biometricMasterPassword');
    
    return biometricCredentials && storedMasterPassword;
  };

  // Auto-prompt for biometric setup after successful password unlock
  useEffect(() => {
    const shouldPromptBiometric = () => {
      if (!biometricSupported || biometricEnabled) return false;
      
      // Only prompt if user has successfully unlocked before
      const hasUnlockedBefore = localStorage.getItem('vault') !== null;
      const hasPromptedBefore = localStorage.getItem('biometricPrompted') === 'true';
      
      return hasUnlockedBefore && !hasPromptedBefore;
    };

    if (shouldPromptBiometric()) {
      // Mark as prompted so we don't keep asking
      localStorage.setItem('biometricPrompted', 'true');
    }
  }, [biometricSupported, biometricEnabled]);

  const handleUnlock = async () => {
    if (!masterPassword) {
      alert('Please enter your master password');
      return;
    }

    setIsUnlocking(true);
    try {
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
        
        // Auto-prompt for biometric setup for new users
        if (biometricSupported && !biometricEnabled) {
          setTimeout(() => {
            setShowBiometricSetup(true);
          }, 1000);
        }
        return;
      }
      
      const key = await deriveKey(masterPassword);
      try {
        const data = await decryptVault(JSON.parse(vaultData), key);
        setVault(data);
        setUnlocked(true);
        
        // Auto-prompt for biometric setup for existing users who haven't set it up
        if (biometricSupported && !biometricEnabled && localStorage.getItem('biometricPrompted') !== 'true') {
          setTimeout(() => {
            setShowBiometricSetup(true);
            localStorage.setItem('biometricPrompted', 'true');
          }, 1000);
        }
      } catch {
        alert('Wrong password or corrupted vault');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBiometricUnlock = async () => {
    console.log('Starting biometric unlock...');
    setIsBiometricUnlocking(true);
    
    if (!biometricEnabled || !biometricSupported) {
      alert('Biometric authentication is not enabled or supported.');
      setIsBiometricUnlocking(false);
      return;
    }
    
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      alert('WebAuthn is not supported in this browser. Please use your master password.');
      setIsBiometricUnlocking(false);
      return;
    }
    
    try {
      // Get stored biometric credentials
      const biometricCredentials = localStorage.getItem('biometricCredentials');
      const storedMasterPassword = localStorage.getItem('biometricMasterPassword');
      
      if (!biometricCredentials || !storedMasterPassword) {
        alert('Biometric credentials not found. Please set up biometric authentication again.');
        setIsBiometricUnlocking(false);
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
        userVerification: "preferred",
        timeout: 30000
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
          
          // Show success message
          setTimeout(async () => {
            try {
              await copyToClipboard('Successfully unlocked with Touch ID!');
            } catch (clipboardError) {
              console.log('Clipboard notification failed, but unlock was successful');
            }
          }, 100);
          
          return;
        } catch (error) {
          console.error('Error decrypting vault with stored password:', error);
          alert('Error accessing vault data. Please use master password instead.');
          return;
        }
      } else {
        // No vault data, just unlock
        setUnlocked(true);
        
        // Show success message
        setTimeout(async () => {
          try {
            await copyToClipboard('Successfully unlocked with Touch ID!');
          } catch (clipboardError) {
            console.log('Clipboard notification failed, but unlock was successful');
          }
        }, 100);
        
        return;
      }
      
    } catch (error) {
      console.error('Biometric authentication error:', error);
      
      // Handle different types of errors gracefully
      if (error.name === 'NotAllowedError') {
        // User cancelled or timeout occurred
        console.log('Biometric authentication was cancelled or timed out');
        return;
      } else if (error.name === 'NotSupportedError') {
        alert('Biometric authentication is not supported in this browser or device.');
      } else if (error.name === 'SecurityError') {
        alert('Security error during biometric authentication. Please try again or use your master password.');
      } else if (error.name === 'InvalidStateError') {
        alert('Biometric authentication is not properly configured. Please set it up again.');
      } else if (error.name === 'UnknownError') {
        alert('Unknown error during biometric authentication. Please use your master password.');
      } else {
        console.error('Full error details:', error);
        alert(`Biometric authentication failed: ${error.message}. Please use your master password instead.`);
      }
    } finally {
      setIsBiometricUnlocking(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      
      {/* Theme Toggle in top right corner */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
      
      {/* Main Content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 3
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Password Manager
            </Typography>
            
            {/* Biometric Quick Access Card */}
            {isBiometricReady() && (
              <Card 
                sx={{ 
                  width: '100%', 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={handleBiometricUnlock}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <TouchAppIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Touch ID Available
                  </Typography>
                  <Typography variant="body2">
                    Use your fingerprint to unlock instantly
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                  <Button 
                    variant="contained"
                    color="secondary"
                    startIcon={<FingerprintIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBiometricUnlock();
                    }}
                    disabled={isBiometricUnlocking}
                    sx={{ mb: 1 }}
                  >
                    {isBiometricUnlocking ? 'Authenticating...' : 'Unlock with Touch ID'}
                  </Button>
                </CardActions>
              </Card>
            )}

            {/* Biometric Setup Offer */}
            {biometricSupported && !biometricEnabled && (
              <Alert severity="info" sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Touch ID Detected
                    </Typography>
                    <Typography variant="caption">
                      Set up fingerprint unlock for faster access
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FingerprintIcon />}
                    onClick={() => setShowBiometricSetup(true)}
                  >
                    Setup
                  </Button>
                </Box>
              </Alert>
            )}

            <Divider sx={{ width: '100%' }}>
              <Chip label="Or use password" size="small" />
            </Divider>
            
            <TextField
              label="Master Password"
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
              type="password"
              fullWidth
              autoFocus={!isBiometricReady()}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock();
                }
              }}
              sx={{ mt: 2 }}
            />
            
            <Button 
              variant="contained" 
              onClick={handleUnlock} 
              fullWidth
              disabled={!masterPassword || isUnlocking}
              size="large"
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
            </Button>
            
            {/* Additional Setup Options */}
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              {!twoFactorEnabled && (
                <Button 
                  variant="outlined" 
                  startIcon={<SecurityIcon />}
                  onClick={() => setShow2FASetup(true)}
                  fullWidth
                  size="small"
                >
                  Setup 2FA
                </Button>
              )}
              
              {biometricSupported && !biometricEnabled && (
                <Button 
                  variant="outlined" 
                  startIcon={<FingerprintIcon />}
                  onClick={() => setShowBiometricSetup(true)}
                  fullWidth
                  size="small"
                >
                  Setup Touch ID
                </Button>
              )}
            </Stack>

            {/* Status Indicators */}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              {twoFactorEnabled && (
                <Chip 
                  icon={<SecurityIcon />} 
                  label="2FA Enabled" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              )}
              {biometricEnabled && (
                <Chip 
                  icon={<FingerprintIcon />} 
                  label="Touch ID Enabled" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              )}
            </Stack>
            
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
          </Stack>
        </Paper>
      </Container>

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
          if (biometricSupported && !biometricEnabled && localStorage.getItem('biometricPrompted') !== 'true') {
            console.log('Showing biometric setup dialog...');
            setTimeout(() => {
              setShowBiometricSetup(true);
              localStorage.setItem('biometricPrompted', 'true');
            }, 500);
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