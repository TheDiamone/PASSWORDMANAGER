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
        setVault(data);
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
    const safeEntry = { ...entry, tags: Array.isArray(entry.tags) ? entry.tags : [] };
    const newVault = [...vault, safeEntry];
    return await saveVault(newVault);
  };

  const updateEntry = async (index, updatedEntry) => {
    const newVault = [...vault];
    newVault[index] = updatedEntry;
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
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}; 