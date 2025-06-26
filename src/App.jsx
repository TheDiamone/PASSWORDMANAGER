import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { ThemeProvider } from './context/ThemeContext';
import { useClipboard } from './hooks/useClipboard';
import { useAutoLock } from './hooks/useAutoLock';
import LoginScreen from './containers/LoginScreen';
import VaultScreen from './containers/VaultScreen';
import AutoLockWarningDialog from './components/AutoLockWarningDialog';

// Main app content component
const AppContent = () => {
  const { unlocked } = useAuth();
  const { copyAlert, copyMessage, closeCopyAlert } = useClipboard();
  
  // Initialize auto-lock functionality
  useAutoLock();

  return (
    <>
      {!unlocked ? <LoginScreen /> : <VaultScreen />}
      
      {/* Global notification snackbar */}
      <Snackbar 
        open={copyAlert} 
        autoHideDuration={2000} 
        onClose={closeCopyAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {copyMessage}
        </Alert>
      </Snackbar>

      {/* Auto-lock warning dialog */}
      <AutoLockWarningDialog />
    </>
  );
};

// Main App component with providers
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VaultProvider>
          <AppContent />
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}