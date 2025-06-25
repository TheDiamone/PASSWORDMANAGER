import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  AlertTitle
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
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
  
  // Export state
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [secureExport, setSecureExport] = useState(false);

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
    if (!importData.trim()) return;
    
    if (!masterPassword) {
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
      
      const success = await saveVault(mergedVault);
      if (success) {
        setImportData('');
        onCloseImport();
        copyToClipboard(`Successfully imported ${newEntries.length} entries${parsed && parsed.iv ? ' (from encrypted export)' : ''}`);
      }
      
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
      
      onCloseExport();
      copyToClipboard(`Successfully exported ${vault.length} entries${secureExport ? ' (encrypted)' : ''}`);
      
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

  return (
    <>
      {/* Import Dialog */}
      <Dialog open={showImport} onClose={onCloseImport} maxWidth="md" fullWidth>
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
          <Button onClick={onCloseImport}>Cancel</Button>
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
      <Dialog open={showExport} onClose={onCloseExport} maxWidth="sm" fullWidth>
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
          <Button onClick={onCloseExport}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={vault.length === 0 || exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportExportDialogs; 