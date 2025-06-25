import React, { createContext, useContext, useState, useEffect } from 'react';
import { deriveKey } from '../services/crypto';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricCredentials, setBiometricCredentials] = useState(null);
  const [biometricSupported, setBiometricSupported] = useState(false);

  // Auto-lock functionality
  const [autoLockTimeout, setAutoLockTimeout] = useState(5); // minutes
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showAutoLockWarning, setShowAutoLockWarning] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState(null);
  const [warningTimer, setWarningTimer] = useState(null);

  // Check for existing 2FA data when component mounts
  useEffect(() => {
    const twoFactorData = localStorage.getItem('twoFactor');
    if (twoFactorData) {
      try {
        const parsed = JSON.parse(twoFactorData);
        setTwoFactorEnabled(parsed.enabled);
        setTwoFactorSecret(parsed.secret);
        setBackupCodes(parsed.backupCodes || []);
      } catch (error) {
        console.error('Error loading 2FA data:', error);
        localStorage.removeItem('twoFactor');
      }
    }
    
    // Load auto-lock timeout from localStorage
    const savedTimeout = localStorage.getItem('autoLockTimeout');
    if (savedTimeout) {
      setAutoLockTimeout(parseInt(savedTimeout));
    }

    // Load biometric settings
    loadBiometricSettings();
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = () => {
    const supported = window.PublicKeyCredential && 
                     PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
                     PublicKeyCredential.isConditionalMediationAvailable;
    
    if (supported) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          setBiometricSupported(available);
        })
        .catch(() => {
          setBiometricSupported(false);
        });
    } else {
      setBiometricSupported(false);
    }
  };

  const loadBiometricSettings = () => {
    const enabled = localStorage.getItem('biometricEnabled') === 'true';
    const credentials = localStorage.getItem('biometricCredentials');
    
    if (enabled && credentials) {
      try {
        setBiometricCredentials(JSON.parse(credentials));
        setBiometricEnabled(true);
      } catch (error) {
        console.error('Error loading biometric settings:', error);
        localStorage.removeItem('biometricCredentials');
        localStorage.removeItem('biometricEnabled');
      }
    }
  };

  const handleAutoLock = () => {
    setUnlocked(false);
    setMasterPassword('');
    setShowAutoLockWarning(false);
    // Clear any open dialogs or sensitive state
  };

  const handleExtendSession = () => {
    setLastActivity(Date.now());
    setShowAutoLockWarning(false);
  };

  const handleAutoLockTimeoutChange = (newTimeout) => {
    setAutoLockTimeout(newTimeout);
    localStorage.setItem('autoLockTimeout', newTimeout.toString());
    setLastActivity(Date.now());
  };

  const handleManualLock = () => {
    handleAutoLock();
  };

  const save2FASettings = (settings) => {
    const twoFactorInfo = {
      secret: settings.secret,
      backupCodes: settings.backupCodes,
      enabled: true
    };
    localStorage.setItem('twoFactor', JSON.stringify(twoFactorInfo));
    setTwoFactorEnabled(true);
    setTwoFactorSecret(settings.secret);
    setBackupCodes(settings.backupCodes);
  };

  const reset2FA = () => {
    localStorage.removeItem('twoFactor');
    setTwoFactorEnabled(false);
    setTwoFactorSecret('');
    setBackupCodes([]);
  };

  const disableBiometric = () => {
    setBiometricEnabled(false);
    setBiometricCredentials(null);
    localStorage.removeItem('biometricCredentials');
    localStorage.removeItem('biometricEnabled');
    localStorage.removeItem('biometricMasterPassword');
  };

  const value = {
    // Auth state
    masterPassword,
    setMasterPassword,
    unlocked,
    setUnlocked,
    
    // 2FA state
    twoFactorEnabled,
    setTwoFactorEnabled,
    twoFactorSecret,
    setTwoFactorSecret,
    backupCodes,
    setBackupCodes,
    save2FASettings,
    reset2FA,

    // Biometric state
    biometricEnabled,
    setBiometricEnabled,
    biometricCredentials,
    setBiometricCredentials,
    biometricSupported,
    disableBiometric,

    // Auto-lock state
    autoLockTimeout,
    setAutoLockTimeout: handleAutoLockTimeoutChange,
    lastActivity,
    setLastActivity,
    showAutoLockWarning,
    setShowAutoLockWarning,
    autoLockTimer,
    setAutoLockTimer,
    warningTimer,
    setWarningTimer,

    // Auth actions
    handleAutoLock,
    handleExtendSession,
    handleManualLock,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 