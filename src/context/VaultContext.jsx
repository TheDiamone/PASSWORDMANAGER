import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { deriveKey, encryptVault, decryptVault } from '../services/crypto';

const VaultContext = createContext();

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export const VaultProvider = ({ children }) => {
  const { masterPassword, unlocked } = useAuth();
  const [vault, setVault] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([
    { id: 'social', name: 'Social Media', color: '#2196F3' },
    { id: 'banking', name: 'Banking', color: '#4CAF50' },
    { id: 'work', name: 'Work', color: '#FF9800' },
    { id: 'shopping', name: 'Shopping', color: '#9C27B0' },
    { id: 'email', name: 'Email', color: '#F44336' },
    { id: 'gaming', name: 'Gaming', color: '#795548' },
    { id: 'other', name: 'Other', color: '#607D8B' }
  ]);

  // Password visibility state
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // View preferences
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('vaultViewMode') || 'card';
  });

  // Breach checking state
  const [breachResults, setBreachResults] = useState({});
  const [checkingBreaches, setCheckingBreaches] = useState(false);

  // Load vault data when unlocked
  useEffect(() => {
    if (unlocked && masterPassword) {
      loadVault();
    } else {
      setVault([]);
      setBreachResults({});
    }
  }, [unlocked, masterPassword]);

  const loadVault = async () => {
    const vaultData = localStorage.getItem('vault');
    if (vaultData && masterPassword) {
      try {
        const key = await deriveKey(masterPassword);
        const data = await decryptVault(JSON.parse(vaultData), key);
        // Ensure all entries have IDs and new fields for backward compatibility
        const dataWithIds = data.map(entry => ({
          ...entry,
          id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          history: entry.history || [], // Initialize password history for existing entries
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: entry.updatedAt || new Date().toISOString()
        }));
        setVault(dataWithIds);
      } catch (error) {
        console.error('Error loading vault:', error);
        setVault([]);
      }
    }
  };

  const saveVault = async (newVault) => {
    if (!masterPassword) return;
    
    try {
      const key = await deriveKey(masterPassword);
      const encrypted = await encryptVault(newVault, key);
      localStorage.setItem('vault', JSON.stringify(encrypted));
      setVault(newVault);
      return true;
    } catch (error) {
      console.error('Error saving vault:', error);
      return false;
    }
  };

  const addEntry = async (entry) => {
    const safeEntry = { 
      ...entry, 
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      history: entry.history || [], // Initialize password history
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const newVault = [...vault, safeEntry];
    return await saveVault(newVault);
  };

  const updateEntry = async (index, updatedEntry) => {
    const newVault = [...vault];
    const currentEntry = newVault[index];
    
    // If password is changing, save the old password to history
    if (currentEntry.pass && updatedEntry.pass && currentEntry.pass !== updatedEntry.pass) {
      const historyEntry = {
        password: currentEntry.pass,
        timestamp: currentEntry.updatedAt || new Date().toISOString(),
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Ensure history array exists and add the old password
      const currentHistory = currentEntry.history || [];
      updatedEntry.history = [...currentHistory, historyEntry];
    } else {
      // Keep existing history if password isn't changing
      updatedEntry.history = currentEntry.history || [];
    }
    
    // Preserve essential properties and update with new values
    newVault[index] = {
      ...currentEntry, // Keep all existing properties
      ...updatedEntry, // Overwrite with updated values
      id: currentEntry.id, // Ensure ID is always preserved
      createdAt: currentEntry.createdAt, // Preserve creation timestamp
      updatedAt: new Date().toISOString() // Update modification timestamp
    };
    
    return await saveVault(newVault);
  };

  const deleteEntry = async (index) => {
    const newVault = vault.filter((_, i) => i !== index);
    return await saveVault(newVault);
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: category.id || category.name.toLowerCase().replace(/\s+/g, '_')
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (categoryId, updatedCategory) => {
    setCategories(prev => prev.map(c => 
      c.id === categoryId ? updatedCategory : c
    ));
  };

  const deleteCategory = async (categoryId) => {
    // Move entries to "other" category
    const updatedVault = vault.map(item => 
      item.category === categoryId ? { ...item, category: 'other' } : item
    );
    
    await saveVault(updatedVault);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories.find(c => c.id === 'other');
  };

  const handleToggleAllPasswords = () => {
    setShowAllPasswords(!showAllPasswords);
    if (!showAllPasswords) {
      const allIndices = new Set(vault.map((_, index) => index));
      setVisiblePasswords(allIndices);
    } else {
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

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('vaultViewMode', newViewMode);
  };

  const isPasswordVisible = (index) => {
    return showAllPasswords || visiblePasswords.has(index);
  };

  const setBreachStatus = (id, status) => {
    setBreachResults(prev => ({ ...prev, [id]: status }));
  };

  const getBreachStatus = (id) => {
    return breachResults[id] || null;
  };

  const filteredVault = vault.filter(
    item =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.site.toLowerCase().includes(search.toLowerCase()) ||
       item.user.toLowerCase().includes(search.toLowerCase()) ||
       (item.tags && item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))))
  );

  // Compute breached passwords from breach results
  const breachedPasswords = vault.filter(item => {
    const breach = breachResults[item.id];
    return breach && breach.found;
  });

  const restorePasswordFromHistory = async (entryIndex, historyId) => {
    const newVault = [...vault];
    const currentEntry = newVault[entryIndex];
    
    if (!currentEntry.history) return false;
    
    // Find the history entry to restore
    const historyEntry = currentEntry.history.find(h => h.id === historyId);
    if (!historyEntry) return false;
    
    // Save current password to history before restoring
    const currentPasswordHistory = {
      password: currentEntry.pass,
      timestamp: currentEntry.updatedAt || new Date().toISOString(),
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Remove the restored password from history and add current password
    const updatedHistory = [
      ...currentEntry.history.filter(h => h.id !== historyId),
      currentPasswordHistory
    ];
    
    // Update the entry with restored password
    newVault[entryIndex] = {
      ...currentEntry,
      pass: historyEntry.password,
      history: updatedHistory,
      updatedAt: new Date().toISOString()
    };
    
    return await saveVault(newVault);
  };

  const getPasswordHistory = (entryIndex) => {
    if (entryIndex >= 0 && entryIndex < vault.length) {
      const entry = vault[entryIndex];
      return entry.history || [];
    }
    return [];
  };

  const deletePasswordFromHistory = async (entryIndex, historyId) => {
    const newVault = [...vault];
    const currentEntry = newVault[entryIndex];
    
    if (!currentEntry.history) return false;
    
    // Remove the specified history entry
    const updatedHistory = currentEntry.history.filter(h => h.id !== historyId);
    
    newVault[entryIndex] = {
      ...currentEntry,
      history: updatedHistory,
      updatedAt: new Date().toISOString()
    };
    
    return await saveVault(newVault);
  };

  const value = {
    // Vault data
    vault,
    setVault,
    filteredVault,
    breachedPasswords,
    
    // Search and filtering
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    
    // Categories
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    
    // Password visibility
    showAllPasswords,
    setShowAllPasswords,
    visiblePasswords,
    setVisiblePasswords,
    handleToggleAllPasswords,
    handleTogglePassword,
    isPasswordVisible,

    // View preferences
    viewMode,
    handleViewModeChange,
    
    // Breach checking
    breachResults,
    setBreachResults,
    checkingBreaches,
    setCheckingBreaches,
    setBreachStatus,
    getBreachStatus,
    
    // Vault operations
    loadVault,
    saveVault,
    addEntry,
    updateEntry,
    deleteEntry,

    // Password history
    restorePasswordFromHistory,
    getPasswordHistory,
    deletePasswordFromHistory,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}; 