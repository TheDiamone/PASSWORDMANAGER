import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  AlertTitle,
  Tooltip
} from '@mui/material';
import { 
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';
import { useClipboard } from '../hooks/useClipboard';
import { checkPasswordBreach, checkMultiplePasswords } from '../services/crypto';

const SecurityStatus = () => {
  const { vault, breachResults, setBreachResults, checkingBreaches, setCheckingBreaches } = useVault();
  const { copyToClipboard } = useClipboard();
  const [showBreachDialog, setShowBreachDialog] = useState(false);

  const handleCheckAllBreaches = async () => {
    setCheckingBreaches(true);
    try {
      // Collect all passwords from vault
      const passwords = {};
      vault.forEach((item, index) => {
        if (item.pass) {
          passwords[`vault_${index}`] = item.pass;
        }
      });
      
      const results = await checkMultiplePasswords(passwords);
      setBreachResults(results);
      setShowBreachDialog(true);
      copyToClipboard('Password breach check completed');
    } catch (error) {
      console.error('Error checking all breaches:', error);
      copyToClipboard('Error checking password breaches');
    } finally {
      setCheckingBreaches(false);
    }
  };

  const getBreachStatus = (id) => {
    return breachResults[id] || null;
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          Password Security:
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleCheckAllBreaches}
          disabled={checkingBreaches || vault.length === 0}
          startIcon={checkingBreaches ? <CircularProgress size={16} /> : <SecurityIcon />}
        >
          {checkingBreaches ? 'Checking...' : 'Check All Passwords'}
        </Button>
      </Box>

      {/* Password Breach Results Dialog */}
      <Dialog open={showBreachDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography>Password Breach Check Results</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {Object.keys(breachResults).length === 0 ? (
              <Typography>No passwords checked yet.</Typography>
            ) : (
              <>
                {vault.map((item, idx) => {
                  const breachStatus = getBreachStatus(`vault_${idx}`);
                  if (!breachStatus) return null;
                  
                  return (
                    <Box key={idx} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.site}
                        </Typography>
                        {breachStatus.breached ? (
                          <Tooltip title={`Compromised in ${breachStatus.count} data breaches`}>
                            <WarningIcon color="error" fontSize="small" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="No breaches found">
                            <CheckCircleIcon color="success" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {breachStatus.breached 
                          ? `⚠️ This password was found in ${breachStatus.count} data breaches`
                          : '✅ No breaches found for this password'
                        }
                      </Typography>
                    </Box>
                  );
                })}
                
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Note:</strong> This check uses the HaveIBeenPwned API with k-anonymity. 
                    Only the first 5 characters of your password hash are sent to the API for security.
                  </Typography>
                </Alert>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBreachDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SecurityStatus; 