import React, { useState, useEffect } from 'react';
import { deriveKey, encryptVault, decryptVault, generatePassword, checkPasswordStrength, generateTOTPSecret, generateTOTPQRCode, verifyTOTP, generateBackupCodes, verifyBackupCode, generateCurrentTOTP, checkPasswordBreach, checkMultiplePasswords } from './crypto';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
  Slider,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  AlertTitle,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LockIcon from '@mui/icons-material/Lock';

export default function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [vault, setVault] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState({ site: '', user: '', pass: '', category: 'other', tags: [] });
  const [search, setSearch] = useState('');
  const [genOptions, setGenOptions] = useState({
    length: 16,
    symbols: true,
    numbers: true,
    uppercase: true,
    lowercase: true,
  });
  const [generated, setGenerated] = useState('');
  const [copyAlert, setCopyAlert] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQRCode, setTwoFactorQRCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5); // minutes
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showAutoLockWarning, setShowAutoLockWarning] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState(null);
  const [warningTimer, setWarningTimer] = useState(null);
  const [breachResults, setBreachResults] = useState({});
  const [checkingBreaches, setCheckingBreaches] = useState(false);
  const [showBreachDialog, setShowBreachDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState({ site: '', user: '', pass: '' });
  const [categories, setCategories] = useState([
    { id: 'social', name: 'Social Media', color: '#2196F3' },
    { id: 'banking', name: 'Banking', color: '#4CAF50' },
    { id: 'work', name: 'Work', color: '#FF9800' },
    { id: 'shopping', name: 'Shopping', color: '#9C27B0' },
    { id: 'email', name: 'Email', color: '#F44336' },
    { id: 'gaming', name: 'Gaming', color: '#795548' },
    { id: 'other', name: 'Other', color: '#607D8B' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('csv');
  const [exportFormat, setExportFormat] = useState('csv');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [secureExport, setSecureExport] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricCredentials, setBiometricCredentials] = useState(null);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

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
    
    // Check biometric support and load settings
    checkBiometricSupport();
    loadBiometricSettings();
    
    // Load auto-lock timeout from localStorage
    const savedTimeout = localStorage.getItem('autoLockTimeout');
    if (savedTimeout) {
      setAutoLockTimeout(parseInt(savedTimeout));
    }
  }, []);

  // Auto-lock functionality
  useEffect(() => {
    console.log('Auto-lock useEffect triggered:', { unlocked, autoLockTimeout, lastActivity });
    
    if (!unlocked) {
      // Clear timers when locked
      if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        setAutoLockTimer(null);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
        setWarningTimer(null);
      }
      setShowAutoLockWarning(false);
      console.log('Vault locked - cleared all timers');
      return;
    }

    // Don't set timers if auto-lock is disabled
    if (autoLockTimeout === 0) {
      console.log('Auto-lock disabled - no timers set');
      return;
    }

    // Set up auto-lock timer
    const warningTime = (autoLockTimeout - 1) * 60 * 1000; // 1 minute before lock
    const lockTime = autoLockTimeout * 60 * 1000;

    console.log('Setting timers:', { warningTime, lockTime });

    const warningTimerId = setTimeout(() => {
      console.log('Warning timer triggered');
      setShowAutoLockWarning(true);
    }, warningTime);

    const lockTimerId = setTimeout(() => {
      console.log('Lock timer triggered');
      handleAutoLock();
    }, lockTime);

    setWarningTimer(warningTimerId);
    setAutoLockTimer(lockTimerId);

    return () => {
      console.log('Cleaning up timers');
      clearTimeout(warningTimerId);
      clearTimeout(lockTimerId);
    };
  }, [unlocked, lastActivity, autoLockTimeout]);

  // Activity detection
  useEffect(() => {
    if (!unlocked) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
      setShowAutoLockWarning(false);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [unlocked]);

  const handleAutoLock = () => {
    setUnlocked(false);
    setMasterPassword('');
    setVault([]); // Clear vault data from memory
    setShowAutoLockWarning(false);
    setShow2FAVerification(false); // Close any open 2FA dialogs
    setTwoFactorToken(''); // Clear 2FA token
    setBackupCodeInput(''); // Clear backup code input
    setUseBackupCode(false); // Reset backup code flag
    setCopyMessage('Vault auto-locked due to inactivity');
    setCopyAlert(true);
  };

  const handleExtendSession = () => {
    console.log('Extend session clicked - resetting activity timer');
    setLastActivity(Date.now());
    setShowAutoLockWarning(false);
  };

  const handleAutoLockTimeoutChange = (newTimeout) => {
    console.log('Auto-lock timeout changed to:', newTimeout, 'minutes');
    setAutoLockTimeout(newTimeout);
    localStorage.setItem('autoLockTimeout', newTimeout.toString());
    setLastActivity(Date.now()); // Reset timer
  };

  const handleManualLock = () => {
    console.log('Manual lock triggered');
    handleAutoLock();
  };

  const handleCheckBreach = async (password, id) => {
    try {
      const result = await checkPasswordBreach(password);
      setBreachResults(prev => ({ ...prev, [id]: result }));
      return result;
    } catch (error) {
      console.error('Error checking breach:', error);
      return { breached: false, count: 0, error: error.message };
    }
  };

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
      
      // Add current entry if it has a password
      if (entry.pass) {
        passwords['current_entry'] = entry.pass;
      }
      
      const results = await checkMultiplePasswords(passwords);
      setBreachResults(results);
      setShowBreachDialog(true);
    } catch (error) {
      console.error('Error checking all breaches:', error);
      setCopyMessage('Error checking password breaches');
      setCopyAlert(true);
    } finally {
      setCheckingBreaches(false);
    }
  };

  const getBreachStatus = (id) => {
    return breachResults[id] || null;
  };

  const handleStartEdit = (index, item) => {
    setEditingIndex(index);
    setEditEntry({ ...item });
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    
    const newVault = [...vault];
    newVault[editingIndex] = editEntry;
    
    const key = await deriveKey(masterPassword);
    const encrypted = await encryptVault(newVault, key);
    localStorage.setItem('vault', JSON.stringify(encrypted));
    
    setVault(newVault);
    setEditingIndex(null);
    setEditEntry({ site: '', user: '', pass: '' });
    
    // Re-check breach status for the updated password
    if (editEntry.pass) {
      await handleCheckBreach(editEntry.pass, `vault_${editingIndex}`);
    }
    
    setCopyMessage('Entry updated successfully');
    setCopyAlert(true);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditEntry({ site: '', user: '', pass: '' });
  };

  const handleDeleteEntry = async (index) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    const newVault = vault.filter((_, i) => i !== index);
    const key = await deriveKey(masterPassword);
    const encrypted = await encryptVault(newVault, key);
    localStorage.setItem('vault', JSON.stringify(encrypted));
    
    setVault(newVault);
    setCopyMessage('Entry deleted successfully');
    setCopyAlert(true);
  };

  const handleAddCategory = () => {
    setEditingCategory({ id: '', name: '', color: '#607D8B' });
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory.name.trim()) return;
    
    if (editingCategory.id && categories.find(c => c.id === editingCategory.id)) {
      // Update existing category
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id ? editingCategory : c
      ));
    } else {
      // Add new category
      const newCategory = {
        ...editingCategory,
        id: editingCategory.name.toLowerCase().replace(/\s+/g, '_')
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    setShowCategoryDialog(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Entries in this category will be moved to "Other".')) return;
    
    // Move entries to "other" category
    const updatedVault = vault.map(item => 
      item.category === categoryId ? { ...item, category: 'other' } : item
    );
    
    setVault(updatedVault);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    
    // Update localStorage
    if (unlocked) {
      deriveKey(masterPassword).then(key => {
        encryptVault(updatedVault, key).then(encrypted => {
          localStorage.setItem('vault', JSON.stringify(encrypted));
        });
      });
    }
  };

  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories.find(c => c.id === 'other');
  };

  const handleToggleAllPasswords = () => {
    setShowAllPasswords(!showAllPasswords);
    if (!showAllPasswords) {
      // Show all passwords
      const allIndices = new Set(vault.map((_, index) => index));
      setVisiblePasswords(allIndices);
    } else {
      // Hide all passwords
      setVisiblePasswords(new Set());
    }
  };

  const handleTogglePassword = (index) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(index)) {
      newVisiblePasswords.delete(index);
    } else {
      newVisiblePasswords.add(index);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const isPasswordVisible = (index) => {
    return showAllPasswords || visiblePasswords.has(index);
  };

  // Import/Export Functions
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const entries = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      entries.push(entry);
    }
    
    return entries;
  };

  const parse1PasswordCSV = (csvText) => {
    const entries = parseCSV(csvText);
    return entries.map(entry => ({
      site: entry.title || entry.name || '',
      user: entry.username || entry.email || '',
      pass: entry.password || '',
      category: 'other',
      tags: []
    }));
  };

  const parseLastPassCSV = (csvText) => {
    const entries = parseCSV(csvText);
    return entries.map(entry => ({
      site: entry.name || entry.url || '',
      user: entry.username || entry.email || '',
      pass: entry.password || '',
      category: 'other',
      tags: []
    }));
  };

  const parseKeeperCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const entries = [];
    
    console.log('Parsing Keeper CSV with', lines.length, 'lines');
    console.log('First line:', lines[0]);
    
    // Skip header row and process each line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      console.log(`Line ${i}:`, values);
      
      // Keeper format: "", "TITLE", "USERNAME", "PASSWORD", "URL", "", ""
      // We skip the first empty column and map the rest
      if (values.length >= 5) {
        const entry = {
          site: values[1] || '', // Title
          user: values[2] || '', // Username
          pass: values[3] || '', // Password
          category: 'other',
          tags: []
        };
        
        console.log('Created entry:', entry);
        
        // Only add if we have at least a site and password
        if (entry.site && entry.pass) {
          entries.push(entry);
        }
      }
    }
    
    console.log('Total entries found:', entries.length);
    return entries;
  };

  const parseGenericCSV = (csvText) => {
    const entries = parseCSV(csvText);
    return entries.map(entry => ({
      site: entry.site || entry.title || entry.name || entry.url || '',
      user: entry.user || entry.username || entry.email || '',
      pass: entry.pass || entry.password || '',
      category: entry.category || 'other',
      tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : []
    }));
  };

  const handleImport = async () => {
    if (!importData.trim()) return;
    
    // Defensive checks
    if (!unlocked || !masterPassword) {
      alert('You must unlock your vault before importing passwords.');
      return;
    }
    
    setImporting(true);
    try {
      let newEntries = [];
      let parsed = null;
      
      // Check if this is an encrypted export
      try {
        parsed = JSON.parse(importData);
        if (parsed.iv && parsed.data) {
          // This is an encrypted export
          const key = await deriveKey(masterPassword);
          const decrypted = await decryptVault(parsed, key);
          newEntries = decrypted;
        } else {
          // Regular JSON import
          if (importFormat === 'json') {
            newEntries = parsed;
          } else {
            throw new Error('Not encrypted format');
          }
        }
      } catch (parseError) {
        // Not JSON, try CSV formats
        switch (importFormat) {
          case '1password':
            newEntries = parse1PasswordCSV(importData);
            break;
          case 'lastpass':
            newEntries = parseLastPassCSV(importData);
            break;
          case 'keeper':
            newEntries = parseKeeperCSV(importData);
            break;
          case 'json':
            throw new Error('Invalid JSON format');
          default: // csv
            newEntries = parseGenericCSV(importData);
        }
      }
      
      // Filter out empty entries
      newEntries = newEntries.filter(entry => entry.site && entry.pass);
      
      if (newEntries.length === 0) {
        alert('No valid entries found in the import data.');
        return;
      }
      
      // Merge with existing vault
      const mergedVault = [...vault, ...newEntries];
      
      // Encrypt and save
      const key = await deriveKey(masterPassword);
      const encrypted = await encryptVault(mergedVault, key);
      localStorage.setItem('vault', JSON.stringify(encrypted));
      
      setVault(mergedVault);
      setImportData('');
      setShowImportDialog(false);
      
      setCopyMessage(`Successfully imported ${newEntries.length} entries${parsed && parsed.iv ? ' (from encrypted export)' : ''}`);
      setCopyAlert(true);
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Error importing data: ${error.message}. Please check the format and try again.`);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (vault.length === 0) {
      alert('No entries to export.');
      return;
    }
    
    setExporting(true);
    try {
      let exportData = '';
      let filename = '';
      let mimeType = '';
      
      // If secure export is enabled, encrypt the data
      if (secureExport) {
        const key = await deriveKey(masterPassword);
        const encrypted = await encryptVault(vault, key);
        exportData = JSON.stringify(encrypted, null, 2);
        filename = 'password-vault-encrypted.json';
        mimeType = 'application/json';
      } else {
        // Regular export
        switch (exportFormat) {
          case 'json':
            exportData = JSON.stringify(vault, null, 2);
            filename = 'password-vault.json';
            mimeType = 'application/json';
            break;
          case 'csv':
          default:
            const headers = ['site', 'user', 'pass', 'category', 'tags'];
            const csvRows = [headers.join(',')];
            
            vault.forEach(entry => {
              const row = [
                `"${entry.site || ''}"`,
                `"${entry.user || ''}"`,
                `"${entry.pass || ''}"`,
                `"${entry.category || 'other'}"`,
                `"${(entry.tags || []).join(', ')}"`
              ];
              csvRows.push(row.join(','));
            });
            
            exportData = csvRows.join('\n');
            filename = 'password-vault.csv';
            mimeType = 'text/csv';
        }
      }
      
      // Create and download file
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
      setCopyMessage(`Successfully exported ${vault.length} entries${secureExport ? ' (encrypted)' : ''}`);
      setCopyAlert(true);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setImportData(content);
      
      // Auto-detect format based on file content
      try {
        const parsed = JSON.parse(content);
        if (parsed.iv && parsed.data) {
          setImportFormat('encrypted');
        } else {
          setImportFormat('json');
        }
      } catch {
        // Check if it's CSV and try to detect format
        const lines = content.trim().split('\n');
        if (lines.length > 0) {
          const headers = lines[0].toLowerCase();
          if (headers.includes('title') && headers.includes('username')) {
            setImportFormat('1password');
          } else if (headers.includes('name') && headers.includes('username')) {
            setImportFormat('lastpass');
          } else if (lines[0].startsWith('"","') || lines[0].startsWith(',"')) {
            // Keeper format has empty first column
            setImportFormat('keeper');
          } else {
            setImportFormat('csv');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleData = `site,user,pass,category,tags
google.com,user@example.com,MyPassword123,work,important
github.com,username,SecurePass456,personal,development
amazon.com,myemail@amazon.com,AmazonPass789,shopping,online`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Biometric Authentication Functions
  const checkBiometricSupport = () => {
    const supported = window.PublicKeyCredential && 
                     PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
                     PublicKeyCredential.isConditionalMediationAvailable;
    
    console.log('Checking biometric support...');
    console.log('PublicKeyCredential available:', !!window.PublicKeyCredential);
    console.log('isUserVerifyingPlatformAuthenticatorAvailable available:', !!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
    console.log('isConditionalMediationAvailable available:', !!PublicKeyCredential.isConditionalMediationAvailable);
    
    if (supported) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          setBiometricSupported(available);
          console.log('Biometric support:', available);
          if (available) {
            console.log('Touch ID/Face ID is available on this device');
          } else {
            console.log('Touch ID/Face ID is not available on this device');
          }
        })
        .catch(err => {
          console.error('Error checking biometric support:', err);
          setBiometricSupported(false);
        });
    } else {
      console.log('WebAuthn API not supported in this browser');
      setBiometricSupported(false);
    }
  };

  const setupBiometric = async () => {
    console.log('Starting biometric setup...');
    
    if (!biometricSupported) {
      console.log('Biometric not supported, showing alert');
      alert('Biometric authentication is not supported on this device.');
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
      
      setShowBiometricSetup(false);
      setCopyMessage('Biometric authentication setup complete!');
      setCopyAlert(true);

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
    }
  };

  const authenticateWithBiometric = async () => {
    console.log('Starting biometric authentication...');
    
    if (!biometricCredentials || !biometricEnabled) {
      console.log('Biometric not enabled or no credentials stored');
      return false;
    }

    try {
      console.log('Generating challenge for authentication...');
      // Generate a new challenge for authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      console.log('Creating assertion options...');
      const assertionOptions = {
        challenge: challenge,
        rpId: window.location.hostname,
        allowCredentials: [{
          type: "public-key",
          id: new Uint8Array(biometricCredentials.credentialId),
          transports: ["internal"]
        }],
        userVerification: "required",
        timeout: 60000
      };

      console.log('Assertion options:', assertionOptions);
      console.log('Calling navigator.credentials.get...');

      const assertion = await navigator.credentials.get({
        publicKey: assertionOptions
      });

      console.log('Assertion result:', assertion);

      if (assertion) {
        console.log('Biometric authentication successful');
        return true;
      }

      console.log('No assertion returned');
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'NotAllowedError') {
        alert('Biometric authentication was cancelled. Please use your master password.');
      } else if (error.name === 'NotSupportedError') {
        alert('Biometric authentication is not supported in this browser.');
      } else if (error.name === 'SecurityError') {
        alert('Security error: Please ensure you are using HTTPS or localhost.');
      } else if (error.name === 'InvalidStateError') {
        alert('Biometric credential not found. Please set up biometric authentication again.');
        disableBiometric();
      } else {
        alert(`Biometric authentication error: ${error.message}`);
      }
      return false;
    }
  };

  const disableBiometric = () => {
    setBiometricEnabled(false);
    setBiometricCredentials(null);
    localStorage.removeItem('biometricCredentials');
    localStorage.removeItem('biometricEnabled');
    localStorage.removeItem('biometricMasterPassword');
    setCopyMessage('Biometric authentication disabled');
    setCopyAlert(true);
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

  const handleUnlock = async () => {
    // Try biometric authentication first if enabled and we have a master password
    if (biometricEnabled && biometricCredentials && masterPassword) {
      const biometricSuccess = await authenticateWithBiometric();
      if (biometricSuccess) {
        // Biometric authentication successful - load vault and unlock
        const vaultData = localStorage.getItem('vault');
        if (vaultData) {
          const key = await deriveKey(masterPassword);
          try {
            const data = await decryptVault(JSON.parse(vaultData), key);
            setVault(data);
          } catch (error) {
            console.error('Error decrypting vault with biometric:', error);
            alert('Error loading vault data. Please try again.');
            return;
          }
        }
        setUnlocked(true);
        setCopyMessage('Unlocked with biometric authentication');
        setCopyAlert(true);
        return;
      }
    }

    if (!masterPassword) {
      alert('Please enter your master password');
      return;
    }

    const vaultData = localStorage.getItem('vault');
    const twoFactorData = localStorage.getItem('twoFactor');
    
    console.log('Unlock attempt - vaultData exists:', !!vaultData);
    console.log('Unlock attempt - twoFactorData exists:', !!twoFactorData);
    console.log('Unlock attempt - twoFactorEnabled state:', twoFactorEnabled);
    
    // Check if 2FA is enabled first (regardless of vault data)
    if (twoFactorData) {
      const twoFactorInfo = JSON.parse(twoFactorData);
      console.log('2FA data found:', twoFactorInfo);
      setTwoFactorEnabled(true);
      setTwoFactorSecret(twoFactorInfo.secret);
      setBackupCodes(twoFactorInfo.backupCodes || []);
      
      // Verify master password first before showing 2FA dialog
      if (vaultData) {
        const key = await deriveKey(masterPassword);
        try {
          // Test decryption to verify master password is correct
          await decryptVault(JSON.parse(vaultData), key);
          console.log('Master password verified, showing 2FA dialog');
        } catch {
          alert('Wrong master password');
          return;
        }
      }
      
      // Show 2FA verification dialog (vault will be loaded after 2FA verification)
      setShow2FAVerification(true);
      console.log('2FA verification dialog should now be visible');
      return;
    }
    
    // No 2FA enabled - proceed with normal unlock
    console.log('No 2FA data found, unlocking without 2FA');
    setTwoFactorEnabled(false);
    
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

  const handleAdd = async () => {
    if (!entry.site || !entry.pass) {
      alert('Please enter at least a site name and password');
      return;
    }
    
    try {
      const safeEntry = { ...entry, tags: Array.isArray(entry.tags) ? entry.tags : [] };
      const newVault = [...vault, safeEntry];
      const key = await deriveKey(masterPassword);
      const encrypted = await encryptVault(newVault, key);
      localStorage.setItem('vault', JSON.stringify(encrypted));
      setVault(newVault);
      setEntry({ site: '', user: '', pass: '', category: 'other', tags: [] });
      
      setCopyMessage('Password entry added successfully!');
      setCopyAlert(true);
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error saving password entry. Please try again.');
    }
  };

  const handleGenerate = () => {
    setGenerated(generatePassword(genOptions));
  };

  const generatedStrength = checkPasswordStrength(generated);
  const entryStrength = checkPasswordStrength(entry.pass);

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopyMessage('Password copied!');
    setCopyAlert(true);
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password);
    setCopyMessage('Password copied to clipboard!');
    setCopyAlert(true);
  };

  const handleCopyUsername = (username) => {
    navigator.clipboard.writeText(username);
    setCopyMessage('Username copied to clipboard!');
    setCopyAlert(true);
  };

  const handleUseGenerated = () => {
    setEntry({ ...entry, pass: generated });
  };

  const filteredVault = vault.filter(
    item =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.site.toLowerCase().includes(search.toLowerCase()) ||
       item.user.toLowerCase().includes(search.toLowerCase()) ||
       (item.tags && item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))))
  );

  const handle2FASetup = async () => {
    try {
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
      setShow2FASetup(true);
      console.log('2FA setup dialog should now be visible');
    } catch (error) {
      console.error('Error in 2FA setup:', error);
      alert('Error setting up 2FA: ' + error.message);
    }
  };

  const handle2FAVerification = async () => {
    console.log('2FA Verification attempt:');
    console.log('- Token entered:', twoFactorToken);
    console.log('- Secret stored:', twoFactorSecret);
    console.log('- Using backup code:', useBackupCode);
    
    let verificationSuccess = false;
    
    if (useBackupCode) {
      if (verifyBackupCode(backupCodeInput, backupCodes)) {
        // Update stored backup codes
        const twoFactorData = localStorage.getItem('twoFactor');
        if (twoFactorData) {
          const twoFactorInfo = JSON.parse(twoFactorData);
          twoFactorInfo.backupCodes = backupCodes;
          localStorage.setItem('twoFactor', JSON.stringify(twoFactorInfo));
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
      
      setShow2FAVerification(false);
      setUnlocked(true);
      setTwoFactorToken(''); // Clear the token
      setBackupCodeInput(''); // Clear backup code input
      setUseBackupCode(false); // Reset backup code flag
      
      // Prompt biometric setup after successful 2FA if supported and not enabled
      if (biometricSupported && !biometricEnabled) {
        setShowBiometricSetup(true);
      }
      
      setCopyMessage('Successfully authenticated with 2FA');
      setCopyAlert(true);
    }
  };

  const handle2FAComplete = () => {
    const twoFactorInfo = {
      secret: twoFactorSecret,
      backupCodes: backupCodes,
      enabled: true
    };
    localStorage.setItem('twoFactor', JSON.stringify(twoFactorInfo));
    setTwoFactorEnabled(true);
    setShow2FASetup(false);
    setSetupStep(1);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopyMessage('Backup codes copied!');
    setCopyAlert(true);
  };

  const handleReset2FA = () => {
    if (confirm('Are you sure you want to reset Two-Factor Authentication? This will remove the current 2FA setup and allow you to configure a new one.')) {
      localStorage.removeItem('twoFactor');
      setTwoFactorEnabled(false);
      setTwoFactorSecret('');
      setBackupCodes([]);
      setCopyMessage('2FA has been reset. You can now set up a new one.');
      setCopyAlert(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
      {!unlocked ? (
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
                onClick={async () => {
                  const success = await authenticateWithBiometric();
                  if (success) {
                    // Load vault data after successful biometric authentication
                    const vaultData = localStorage.getItem('vault');
                    if (vaultData) {
                      // For biometric unlock, we need to retrieve the stored master password
                      const storedMasterPassword = localStorage.getItem('biometricMasterPassword');
                      if (storedMasterPassword) {
                        try {
                          const key = await deriveKey(storedMasterPassword);
                          const data = await decryptVault(JSON.parse(vaultData), key);
                          setVault(data);
                          setMasterPassword(storedMasterPassword); // Set the master password for session
                        } catch (error) {
                          console.error('Error loading vault with biometric:', error);
                          alert('Error loading vault data. Please use master password.');
                          return;
                        }
                      } else {
                        alert('Master password not found. Please disable and re-enable biometric authentication.');
                        disableBiometric();
                        return;
                      }
                    }
                    setUnlocked(true);
                    setCopyMessage('Unlocked with biometric authentication');
                    setCopyAlert(true);
                  }
                }}
                fullWidth
                startIcon={<FingerprintIcon />}
              >
                Unlock with Touch ID
              </Button>
            )}
            {twoFactorEnabled ? (
              <Alert severity="info" sx={{ width: '100%' }}>
                <Typography variant="body2">
                  Two-Factor Authentication is already enabled for this account.
                </Typography>
              </Alert>
            ) : (
              <Button 
                variant="outlined" 
                startIcon={<SecurityIcon />}
                onClick={handle2FASetup}
                fullWidth
              >
                Setup Two-Factor Authentication
              </Button>
            )}
            <Button 
              variant="text" 
              onClick={() => {
                console.log('Test button clicked, show2FASetup:', show2FASetup);
                setShow2FASetup(true);
              }}
              fullWidth
            >
              Test Dialog (Debug)
            </Button>
          </Stack>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color={twoFactorEnabled ? "success" : "disabled"} />
              <Typography variant="body2" color="text.secondary">
                Two-Factor Authentication: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
              {twoFactorEnabled && (
                <Button 
                  variant="text" 
                  size="small" 
                  color="warning"
                  onClick={handleReset2FA}
                  sx={{ ml: 'auto' }}
                >
                  Reset 2FA
                </Button>
              )}
            </Box>
            {/* Auto-lock Settings */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Auto-lock after:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={autoLockTimeout}
                  onChange={(e) => handleAutoLockTimeoutChange(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={0}>Never</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Password Breach Checking */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h1">
                Password Vault
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowImportDialog(true)}
                  startIcon={<UploadIcon />}
                >
                  Import
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowExportDialog(true)}
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShowAddPassword(true)}
                  startIcon={<AddIcon />}
                >
                  Add Password
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleManualLock}
                  startIcon={<LockIcon />}
                >
                  Lock
                </Button>
              </Box>
            </Box>
            <TextField
              label="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            {/* Category Filter */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Categories:
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={handleAddCategory}
                  startIcon={<AddIcon />}
                >
                  Add Category
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setSelectedCategory('all')}
                  color={selectedCategory === 'all' ? 'primary' : 'default'}
                  variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
                  size="small"
                />
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    onClick={() => setSelectedCategory(category.id)}
                    color={selectedCategory === category.id ? 'primary' : 'default'}
                    variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      borderColor: category.color,
                      '&.MuiChip-colorPrimary': {
                        backgroundColor: category.color,
                        color: 'white'
                      }
                    }}
                    onDelete={category.id !== 'other' ? () => handleDeleteCategory(category.id) : undefined}
                    deleteIcon={category.id !== 'other' ? <DeleteIcon /> : undefined}
                  />
                ))}
              </Box>
            </Box>
            {/* Password Visibility Toggle */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Password Visibility:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleToggleAllPasswords}
                startIcon={showAllPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
              >
                {showAllPasswords ? 'Hide All' : 'Show All'}
              </Button>
            </Box>
            <List sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
              {filteredVault.length === 0 && (
                <ListItem>
                  <ListItemText primary="No entries found." />
                </ListItem>
              )}
              {filteredVault.map((item, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    {editingIndex === idx ? (
                      // Edit mode
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Editing: {item.site}
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            label="Site"
                            value={editEntry.site}
                            onChange={(e) => setEditEntry({ ...editEntry, site: e.target.value })}
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Username"
                            value={editEntry.user}
                            onChange={(e) => setEditEntry({ ...editEntry, user: e.target.value })}
                            fullWidth
                            size="small"
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={editEntry.category || 'other'}
                              onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
                              label="Category"
                            >
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: category.color
                                      }}
                                    />
                                    {category.name}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="Tags (comma separated)"
                            value={(editEntry.tags || []).join(', ')}
                            onChange={(e) => setEditEntry({ 
                              ...editEntry, 
                              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                            })}
                            fullWidth
                            size="small"
                            placeholder="e.g., important, personal, work"
                          />
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              label="Password"
                              value={editEntry.pass}
                              onChange={(e) => setEditEntry({ ...editEntry, pass: e.target.value })}
                              fullWidth
                              size="small"
                              type={showEditPassword ? "text" : "password"}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={showEditPassword ? "Hide password" : "Show password"}>
                                      <IconButton
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        edge="end"
                                        size="small"
                                      >
                                        {showEditPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                )
                              }}
                            />
                            <Tooltip title="Generate new password">
                              <IconButton 
                                size="small" 
                                onClick={() => setEditEntry({ ...editEntry, pass: generatePassword(genOptions) })}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          {editEntry.pass && (
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Strength: {checkPasswordStrength(editEntry.pass).strength}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {checkPasswordStrength(editEntry.pass).score}/{checkPasswordStrength(editEntry.pass).maxScore}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(checkPasswordStrength(editEntry.pass).score / checkPasswordStrength(editEntry.pass).maxScore) * 100}
                                color={checkPasswordStrength(editEntry.pass).color}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={handleSaveEdit}
                              startIcon={<SaveIcon />}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={handleCancelEdit}
                              startIcon={<CancelIcon />}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    ) : (
                      // View mode
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.site}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={getCategoryById(item.category)?.name || 'Other'}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryById(item.category)?.color || '#607D8B',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                          {item.tags && item.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem', height: 18 }}
                                />
                              ))}
                              {item.tags.length > 2 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{item.tags.length - 2}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            <strong>User:</strong> {item.user}
                          </Typography>
                          <Tooltip title="Copy username">
                            <IconButton size="small" onClick={() => handleCopyUsername(item.user)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            <strong>Pass:</strong> {isPasswordVisible(idx) ? item.pass : '••••••••••••'}
                          </Typography>
                          {getBreachStatus(`vault_${idx}`) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {getBreachStatus(`vault_${idx}`).breached ? (
                                <Tooltip title={`Compromised in ${getBreachStatus(`vault_${idx}`).count} data breaches`}>
                                  <WarningIcon color="error" fontSize="small" />
                                </Tooltip>
                              ) : (
                                <Tooltip title="No breaches found">
                                  <CheckCircleIcon color="success" fontSize="small" />
                                </Tooltip>
                              )}
                            </Box>
                          )}
                          <Tooltip title={isPasswordVisible(idx) ? "Hide password" : "Show password"}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleTogglePassword(idx)}
                            >
                              {isPasswordVisible(idx) ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy password">
                            <IconButton size="small" onClick={() => handleCopyPassword(item.pass)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit entry">
                            <IconButton size="small" onClick={() => handleStartEdit(idx, item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete entry">
                            <IconButton size="small" onClick={() => handleDeleteEntry(idx)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                  {idx < filteredVault.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Typography variant="h6" gutterBottom>
              Add Entry
            </Typography>
            <Stack spacing={2} direction="column">
              <TextField
                label="Site"
                value={entry.site}
                onChange={e => setEntry({ ...entry, site: e.target.value })}
                fullWidth
              />
              <TextField
                label="User"
                value={entry.user}
                onChange={e => setEntry({ ...entry, user: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={entry.category}
                  onChange={e => setEntry({ ...entry, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Tags (comma separated)"
                value={(entry.tags || []).join(', ')}
                onChange={e => setEntry({ 
                  ...entry, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                fullWidth
                placeholder="e.g., important, personal, work"
              />
              <TextField
                label="Password"
                value={entry.pass}
                onChange={e => setEntry({ ...entry, pass: e.target.value })}
                fullWidth
                type={showAddPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showAddPassword ? "Hide password" : "Show password"}>
                        <IconButton
                          onClick={() => setShowAddPassword(!showAddPassword)}
                          edge="end"
                        >
                          {showAddPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
              {entry.pass && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Strength: {entryStrength.strength}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entryStrength.score}/{entryStrength.maxScore}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(entryStrength.score / entryStrength.maxScore) * 100}
                    color={entryStrength.color}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}
              <Button variant="contained" color="primary" onClick={handleAdd} fullWidth>
                Add
              </Button>
            </Stack>
            <Typography variant="h6" gutterBottom>Password Generator</Typography>
            <Stack spacing={2} direction="column" sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center">
                <Typography sx={{ minWidth: 100 }}>Length</Typography>
                <Slider
                  min={6}
                  max={32}
                  value={genOptions.length}
                  onChange={(_, v) => setGenOptions(o => ({ ...o, length: v }))}
                  valueLabelDisplay="auto"
                  sx={{ ml: 2, flex: 1 }}
                />
                <Typography sx={{ ml: 2 }}>{genOptions.length}</Typography>
              </Box>
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={genOptions.symbols} onChange={e => setGenOptions(o => ({ ...o, symbols: e.target.checked }))} />}
                  label="Symbols (!@#...)"
                />
                <FormControlLabel
                  control={<Checkbox checked={genOptions.numbers} onChange={e => setGenOptions(o => ({ ...o, numbers: e.target.checked }))} />}
                  label="Numbers (0-9)"
                />
                <FormControlLabel
                  control={<Checkbox checked={genOptions.uppercase} onChange={e => setGenOptions(o => ({ ...o, uppercase: e.target.checked }))} />}
                  label="Uppercase (A-Z)"
                />
                <FormControlLabel
                  control={<Checkbox checked={genOptions.lowercase} onChange={e => setGenOptions(o => ({ ...o, lowercase: e.target.checked }))} />}
                  label="Lowercase (a-z)"
                />
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Generated Password"
                  value={generated}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Copy">
                          <IconButton onClick={handleCopy} disabled={!generated}>
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  fullWidth
                />
                {generated && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Strength: {generatedStrength.strength}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {generatedStrength.score}/{generatedStrength.maxScore}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(generatedStrength.score / generatedStrength.maxScore) * 100}
                      color={generatedStrength.color}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
                <Button variant="outlined" onClick={handleGenerate}>Generate</Button>
                <Button variant="contained" onClick={handleUseGenerated} disabled={!generated}>Use</Button>
              </Stack>
            </Stack>
            <Snackbar open={copyAlert} autoHideDuration={2000} onClose={() => setCopyAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert severity="success" sx={{ width: '100%' }}>
                {copyMessage}
              </Alert>
            </Snackbar>
          </Box>
        )}
      </Paper>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} maxWidth="sm" fullWidth>
        {console.log('Dialog render - show2FASetup:', show2FASetup)}
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {!twoFactorQRCode ? (
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
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <img src={twoFactorQRCode} alt="QR Code" style={{ maxWidth: '256px', width: '100%' }} />
                  </Box>
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
                    <Tooltip title="Copy secret">
                      <IconButton onClick={() => {
                        navigator.clipboard.writeText(twoFactorSecret);
                        setCopyMessage('Secret copied!');
                        setCopyAlert(true);
                      }}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
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
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={async () => {
                        const currentCode = await generateCurrentTOTP(twoFactorSecret);
                        if (currentCode) {
                          alert(`Current expected code: ${currentCode}\n\nThis should match the code in your Okta Verify app right now.`);
                        }
                      }}
                    >
                      Show Current Expected Code
                    </Button>
                  </Box>
                  <Button variant="contained" onClick={() => setSetupStep(2)}>
                    Next: Backup Codes
                  </Button>
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
                  <Button variant="outlined" onClick={handleCopyBackupCodes}>
                    Copy All Codes
                  </Button>
                  <Button variant="contained" onClick={handle2FAComplete}>
                    Complete Setup
                  </Button>
                </Stack>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FASetup(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FAVerification} maxWidth="sm" fullWidth>
        {console.log('2FA Verification Dialog - show2FAVerification:', show2FAVerification)}
        {console.log('2FA Verification Dialog - twoFactorSecret:', twoFactorSecret)}
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
                    The code in your Okta Verify app changes every 30 seconds. Make sure to enter the current code.
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
                />
                <Button variant="contained" onClick={handle2FAVerification}>
                  Verify
                </Button>
                <Button 
                  variant="text" 
                  onClick={() => {
                    const expectedCode = generateCurrentTOTP(twoFactorSecret);
                    console.log('Expected TOTP code:', expectedCode);
                    alert(`Expected TOTP code: ${expectedCode}\n\nThis is for debugging only. Compare with your Okta Verify app.`);
                  }}
                >
                  Debug: Show Expected Code
                </Button>
                <Button variant="text" onClick={() => setUseBackupCode(true)}>
                  Use Backup Code Instead
                </Button>
        </>
      ) : (
        <>
                <Typography>
                  Enter one of your backup codes:
                </Typography>
                <TextField
                  label="Backup Code"
                  value={backupCodeInput}
                  onChange={(e) => setBackupCodeInput(e.target.value)}
                  fullWidth
                  autoFocus
                  inputProps={{ maxLength: 6 }}
                />
                <Button variant="contained" onClick={handle2FAVerification}>
                  Verify
                </Button>
                <Button variant="text" onClick={() => setUseBackupCode(false)}>
                  Use 2FA Code Instead
                </Button>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Auto-lock Warning Dialog */}
      <Dialog open={showAutoLockWarning} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon color="warning" />
            <Typography>Auto-lock Warning</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              <Typography>
                Your vault will automatically lock in <strong>1 minute</strong> due to inactivity.
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              To prevent auto-lock, simply interact with the application (move mouse, type, etc.).
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="secondary" onClick={() => handleAutoLockTimeoutChange(0)}>
            Disable Auto-lock
          </Button>
          <Button variant="outlined" onClick={handleExtendSession}>
            Extend Session
          </Button>
          <Button variant="contained" color="primary" onClick={handleManualLock}>
            Lock Now
          </Button>
        </DialogActions>
      </Dialog>

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
                          <WarningIcon color="error" fontSize="small" />
                        ) : (
                          <CheckCircleIcon color="success" fontSize="small" />
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
                
                {entry.pass && getBreachStatus('current_entry') && (
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        New Entry
                      </Typography>
                      {getBreachStatus('current_entry').breached ? (
                        <WarningIcon color="error" fontSize="small" />
                      ) : (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {getBreachStatus('current_entry').breached 
                        ? `⚠️ This password was found in ${getBreachStatus('current_entry').count} data breaches`
                        : '✅ No breaches found for this password'
                      }
                    </Typography>
                  </Box>
                )}
                
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

      {/* Category Management Dialog */}
      <Dialog open={showCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory?.id ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={editingCategory?.name || ''}
              onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category Color:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#795548', '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setEditingCategory(prev => ({ ...prev, color }))}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: editingCategory?.color === color ? '3px solid #000' : '2px solid #ddd',
                      '&:hover': {
                        border: '3px solid #666'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCategoryDialog(false);
            setEditingCategory(null);
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveCategory}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Passwords</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Import Format</InputLabel>
              <Select
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                label="Import Format"
              >
                <MenuItem value="encrypted">Encrypted Export</MenuItem>
                <MenuItem value="csv">Generic CSV</MenuItem>
                <MenuItem value="1password">1Password CSV</MenuItem>
                <MenuItem value="lastpass">LastPass CSV</MenuItem>
                <MenuItem value="keeper">Keeper CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept=".csv,.json,.txt"
                style={{ display: 'none' }}
                id="import-file"
                type="file"
                onChange={handleFileImport}
              />
              <label htmlFor="import-file">
                <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                  Choose File
                </Button>
              </label>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Or paste your data below:
            </Typography>
            
            <TextField
              multiline
              rows={10}
              fullWidth
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={
                importFormat === 'json' 
                  ? 'Paste JSON data here...'
                  : 'Paste CSV data here...'
              }
              variant="outlined"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {importFormat === 'encrypted' && 'Encrypted exports from this app. Requires the same master password.'}
              {importFormat === 'csv' && 'Generic CSV with columns: site, user, pass, category, tags'}
              {importFormat === '1password' && '1Password CSV export with columns: title, username, password, etc.'}
              {importFormat === 'lastpass' && 'LastPass CSV export with columns: name, username, password, etc.'}
              {importFormat === 'keeper' && 'Keeper CSV export with columns: (empty), title, username, password, url, etc.'}
              {importFormat === 'json' && 'JSON array of objects with site, user, pass properties'}
            </Typography>
            
            {importFormat === 'csv' && (
              <Button 
                variant="text" 
                onClick={handleDownloadSample}
                sx={{ mt: 1 }}
              >
                Download Sample CSV
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={!importData.trim() || importing}
          >
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Passwords</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={secureExport}
                  onChange={(e) => setSecureExport(e.target.checked)}
                />
              }
              label="Secure Export (Encrypted)"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Encrypted exports can only be imported back into this app with the same master password.
            </Typography>
          </Box>
          
          {!secureExport && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Export {vault.length} password entries{secureExport ? ' securely encrypted' : ` in ${exportFormat.toUpperCase()} format`}.
          </Typography>
          
          {!secureExport && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Security Warning</AlertTitle>
              Unencrypted exports contain your passwords in plain text. Store them securely!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={vault.length === 0 || exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Biometric Setup Dialog */}
      <Dialog open={showBiometricSetup} onClose={() => setShowBiometricSetup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Biometric Authentication</DialogTitle>
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
                >
                  Setup Biometric Authentication
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    console.log('=== BIOMETRIC DEBUG INFO ===');
                    console.log('biometricSupported:', biometricSupported);
                    console.log('biometricEnabled:', biometricEnabled);
                    console.log('biometricCredentials:', biometricCredentials);
                    console.log('User Agent:', navigator.userAgent);
                    console.log('Platform:', navigator.platform);
                    console.log('Location:', window.location.href);
                    console.log('Is HTTPS:', window.location.protocol === 'https:');
                    console.log('Is localhost:', window.location.hostname === 'localhost');
                    alert('Check console for biometric debug information');
                  }}
                  fullWidth
                >
                  Debug Biometric Info
                </Button>
        </>
      )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBiometricSetup(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={copyAlert} autoHideDuration={2000} onClose={() => setCopyAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {copyMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}