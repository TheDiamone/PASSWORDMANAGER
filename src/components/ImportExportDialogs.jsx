import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  AlertTitle,
  FormHelperText,
  LinearProgress
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Cancel as CancelIcon,
  GetApp as SampleIcon
} from '@mui/icons-material';
import ActionButton from './ActionButton';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useClipboard } from '../hooks/useClipboard';
import { deriveKey, encryptVault, decryptVault } from '../services/crypto';

const ImportExportDialogs = ({ 
  showImport, 
  showExport, 
  onCloseImport, 
  onCloseExport 
}) => {
  const { vault, saveVault } = useVault();
  const { masterPassword } = useAuth();
  const { copyToClipboard } = useClipboard();
  
  // Import state
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState('csv');
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState({});
  const [importTouched, setImportTouched] = useState({});
  
  // Export state
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [secureExport, setSecureExport] = useState(false);

  // Refs for managing focus
  const importDataRef = useRef(null);

  // Focus management for import dialog
  useEffect(() => {
    if (showImport && importDataRef.current) {
      const timer = setTimeout(() => {
        importDataRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showImport]);

  // Reset states when dialogs close
  useEffect(() => {
    if (!showImport) {
      setImportData('');
      setImportErrors({});
      setImportTouched({});
      setImporting(false);
    }
  }, [showImport]);

  useEffect(() => {
    if (!showExport) {
      setExporting(false);
    }
  }, [showExport]);

  // Validation functions
  const validateImportData = (value) => {
    if (!value || !value.trim()) {
      return 'Import data is required';
    }
    if (value.trim().length < 10) {
      return 'Import data seems too short to be valid';
    }
    return '';
  };

  const validateImportField = (name, value) => {
    switch (name) {
      case 'importData':
        return validateImportData(value);
      default:
        return '';
    }
  };

  const handleImportFieldChange = (field, value) => {
    if (field === 'importData') {
      setImportData(value);
    }
    
    // Clear error when user starts typing
    if (importErrors[field]) {
      setImportErrors({ ...importErrors, [field]: '' });
    }
  };

  const handleImportFieldBlur = (field) => {
    setImportTouched({ ...importTouched, [field]: true });
    const error = validateImportField(field, field === 'importData' ? importData : '');
    setImportErrors({ ...importErrors, [field]: error });
  };

  const validateImportForm = () => {
    const newErrors = {};
    
    newErrors.importData = validateImportData(importData);
    
    setImportErrors(newErrors);
    setImportTouched({ importData: true });
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Import parsing functions
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
    
    // Skip header row and process each line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      // Keeper format: "", "TITLE", "USERNAME", "PASSWORD", "URL", "", ""
      if (values.length >= 5) {
        const entry = {
          site: values[1] || '', // Title
          user: values[2] || '', // Username
          pass: values[3] || '', // Password
          category: 'other',
          tags: []
        };
        
        // Only add if we have at least a site and password
        if (entry.site && entry.pass) {
          entries.push(entry);
        }
      }
    }
    
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
    if (!validateImportForm()) {
      copyToClipboard('Please fix the errors below before importing');
      return;
    }
    
    if (!masterPassword) {
      copyToClipboard('You must unlock your vault before importing passwords');
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
            throw new Error('Invalid JSON format. Please check your data.');
          default: // csv
            newEntries = parseGenericCSV(importData);
        }
      }
      
      // Filter out empty entries
      newEntries = newEntries.filter(entry => entry.site && entry.pass);
      
      if (newEntries.length === 0) {
        copyToClipboard('No valid entries found in the import data. Please check your format.');
        return;
      }
      
      // Merge with existing vault
      const mergedVault = [...vault, ...newEntries];
      
      const success = await saveVault(mergedVault);
      if (success) {
        setImportData('');
        onCloseImport();
        copyToClipboard(`Successfully imported ${newEntries.length} entries${parsed && parsed.iv ? ' (from encrypted export)' : ''}`);
      } else {
        copyToClipboard('Error saving imported data. Please try again.');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      copyToClipboard(`Error importing data: ${error.message}. Please check the format and try again.`);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (vault.length === 0) {
      copyToClipboard('No passwords to export');
      return;
    }
    
    setExporting(true);
    try {
      let exportData;
      let filename;
      
      if (secureExport) {
        // Encrypted export
        const key = await deriveKey(masterPassword);
        const encrypted = await encryptVault(vault, key);
        exportData = JSON.stringify(encrypted, null, 2);
        filename = `passwords_encrypted_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // Unencrypted export
        if (exportFormat === 'json') {
          exportData = JSON.stringify(vault, null, 2);
          filename = `passwords_${new Date().toISOString().split('T')[0]}.json`;
        } else {
          // CSV format
          const headers = ['site', 'user', 'pass', 'category', 'tags'];
          const csvData = [
            headers.join(','),
            ...vault.map(entry => 
              headers.map(header => {
                const value = header === 'tags' 
                  ? (entry.tags || []).join(';') 
                  : entry[header] || '';
                return `"${value.replace(/"/g, '""')}"`;
              }).join(',')
            )
          ].join('\n');
          exportData = csvData;
          filename = `passwords_${new Date().toISOString().split('T')[0]}.csv`;
        }
      }
      
      // Create and download file
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onCloseExport();
      copyToClipboard(`Successfully exported ${vault.length} entries to ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);
      copyToClipboard('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        handleImportFieldChange('importData', content);
        setImportTouched({ ...importTouched, importData: true });
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = `site,user,pass,category,tags
"Google","user@example.com","password123","work","important"
"GitHub","developer","securepass456","work","coding;development"
"Netflix","watcher@email.com","entertainment789","personal","streaming"`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    copyToClipboard('Sample CSV file downloaded');
  };

  const handleKeyDown = (event, isImport = true) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (isImport) {
        if (!importing && validateImportForm()) {
          handleImport();
        }
      } else {
        if (!exporting) {
          handleExport();
        }
      }
    }
    if (event.key === 'Escape') {
      if (isImport) {
        onCloseImport();
      } else {
        onCloseExport();
      }
    }
  };

  const hasImportErrors = Object.values(importErrors).some(error => error !== '');

  return (
    <>
      {/* Import Dialog */}
      <Dialog 
        open={showImport} 
        onClose={onCloseImport} 
        maxWidth="md" 
        fullWidth
        onKeyDown={(e) => handleKeyDown(e, true)}
        aria-labelledby="import-dialog-title"
        aria-describedby="import-dialog-description"
      >
        <DialogTitle id="import-dialog-title">Import Passwords</DialogTitle>
        <DialogContent>
          <Typography id="import-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Import passwords from other password managers or CSV files. Choose the format that matches your data.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }} disabled={importing}>
            <InputLabel>Import Format</InputLabel>
            <Select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value)}
              label="Import Format"
            >
              <MenuItem value="csv">Generic CSV</MenuItem>
              <MenuItem value="1password">1Password CSV</MenuItem>
              <MenuItem value="lastpass">LastPass CSV</MenuItem>
              <MenuItem value="keeper">Keeper CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
            <FormHelperText>
              Select the format of your import data. Use Generic CSV for custom formats.
            </FormHelperText>
          </FormControl>
          
          <TextField
            inputRef={importDataRef}
            label="Import Data *"
            value={importData}
            onChange={(e) => handleImportFieldChange('importData', e.target.value)}
            onBlur={() => handleImportFieldBlur('importData')}
            fullWidth
            multiline
            rows={12}
            placeholder="Paste your password data here, or use the file upload button below..."
            error={importTouched.importData && !!importErrors.importData}
            helperText={
              importTouched.importData && importErrors.importData 
                ? importErrors.importData 
                : 'Paste CSV data or JSON from your password manager export'
            }
            required
            disabled={importing}
            sx={{ mb: 2 }}
          />
          
                     <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             <ActionButton
               variant="outlined"
               component="label"
               startIcon={<UploadIcon />}
               disabled={importing}
               tooltip="Upload a CSV or JSON file from your computer"
             >
               Upload File
               <input
                 type="file"
                 accept=".csv,.json,.txt"
                 hidden
                 onChange={handleFileImport}
               />
             </ActionButton>
             
             <ActionButton
               variant="outlined"
               startIcon={<SampleIcon />}
               onClick={handleDownloadSample}
               disabled={importing}
               tooltip="Download a sample CSV file to see the correct format"
             >
               Download Sample CSV
             </ActionButton>
           </Box>

          {importing && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Importing passwords...
              </Typography>
            </Box>
          )}

          {hasImportErrors && Object.values(importTouched).some(t => t) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Please fix the errors above before importing.
              </Typography>
            </Alert>
          )}
          
          <Alert severity="info">
            <AlertTitle>Supported Formats</AlertTitle>
            <Typography variant="body2">
              • <strong>Generic CSV:</strong> site,user,pass,category,tags<br/>
              • <strong>1Password:</strong> title,username,password,url<br/>
              • <strong>LastPass:</strong> name,username,password,url<br/>
              • <strong>Keeper:</strong> Title,Username,Password,URL<br/>
              • <strong>JSON:</strong> Our encrypted or plain JSON format
            </Typography>
          </Alert>
        </DialogContent>
                 <DialogActions sx={{ px: 3, pb: 2 }}>
           <ActionButton 
             variant="outlined"
             startIcon={<CancelIcon />}
             onClick={onCloseImport} 
             disabled={importing}
             tooltip="Cancel import operation"
           >
             Cancel
           </ActionButton>
           <ActionButton 
             variant="contained"
             startIcon={<ImportIcon />}
             onClick={handleImport}
             disabled={importing || hasImportErrors || !importData.trim()}
             loading={importing}
             tooltip="Import passwords from the provided data"
           >
             Import Passwords
           </ActionButton>
         </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog 
        open={showExport} 
        onClose={onCloseExport} 
        maxWidth="sm" 
        fullWidth
        onKeyDown={(e) => handleKeyDown(e, false)}
        aria-labelledby="export-dialog-title"
        aria-describedby="export-dialog-description"
      >
        <DialogTitle id="export-dialog-title">Export Passwords</DialogTitle>
        <DialogContent>
          <Typography id="export-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Export your passwords to back them up or transfer to another password manager.
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={secureExport}
                onChange={(e) => setSecureExport(e.target.checked)}
                disabled={exporting}
              />
            }
            label="Secure Export (Encrypted)"
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3, ml: 4 }}>
            Encrypted exports can only be imported back into this app with the same master password.
          </Typography>
          
          {!secureExport && (
            <FormControl fullWidth sx={{ mb: 3 }} disabled={exporting}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="csv">CSV (Comma Separated Values)</MenuItem>
                <MenuItem value="json">JSON (JavaScript Object Notation)</MenuItem>
              </Select>
              <FormHelperText>
                CSV is compatible with most password managers. JSON preserves all data including tags.
              </FormHelperText>
            </FormControl>
          )}

          {exporting && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preparing export...
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export {vault.length} password entries{secureExport ? ' securely encrypted' : ` in ${exportFormat.toUpperCase()} format`}.
          </Typography>
          
          {!secureExport && (
            <Alert severity="warning">
              <AlertTitle>Security Warning</AlertTitle>
              Unencrypted exports contain your passwords in plain text. Store them securely and delete them after use!
            </Alert>
          )}
        </DialogContent>
                 <DialogActions sx={{ px: 3, pb: 2 }}>
           <ActionButton 
             variant="outlined"
             startIcon={<CancelIcon />}
             onClick={onCloseExport} 
             disabled={exporting}
             tooltip="Cancel export operation"
           >
             Cancel
           </ActionButton>
           <ActionButton 
             variant="contained"
             startIcon={<ExportIcon />}
             onClick={handleExport} 
             disabled={vault.length === 0 || exporting}
             loading={exporting}
             tooltip="Export passwords to a file"
           >
             Export Passwords
           </ActionButton>
         </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportExportDialogs; 