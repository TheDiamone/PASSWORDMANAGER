import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';
import CategorySection from './CategorySection';
import ViewToggle from './ViewToggle';

const VaultList = ({ onEditPassword }) => {
  const { 
    filteredVault, 
    vault,
    categories, 
    getCategoryById, 
    viewMode, 
    handleViewModeChange,
    isPasswordVisible,
    handleTogglePassword,
    updateEntry,
    deleteEntry
  } = useVault();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Group entries by category
  const groupedEntries = categories.reduce((acc, category) => {
    const categoryEntries = filteredVault.filter(entry => entry.category === category.id);
    if (categoryEntries.length > 0) {
      acc[category.id] = {
        category,
        entries: categoryEntries
      };
    }
    return acc;
  }, {});

  // Add uncategorized entries
  const uncategorizedEntries = filteredVault.filter(entry => 
    !categories.some(cat => cat.id === entry.category)
  );
  
  if (uncategorizedEntries.length > 0) {
    groupedEntries['other'] = {
      category: { id: 'other', name: 'Other', color: theme.palette.neutral?.[500] || '#607D8B' },
      entries: uncategorizedEntries
    };
  }

  const handleEdit = (localIndex, categoryEntries) => {
    // Find the global index for this entry
    const entry = categoryEntries[localIndex];
    if (entry && entry.id) {
      const globalIndex = vault.findIndex(vaultEntry => vaultEntry.id === entry.id);
      if (globalIndex >= 0 && onEditPassword) {
        onEditPassword(entry, globalIndex);
      }
    }
  };

  const handleDelete = async (localIndex, categoryEntries) => {
    // Find the global index for this entry
    const entry = categoryEntries[localIndex];
    if (entry && entry.id) {
      const globalIndex = vault.findIndex(vaultEntry => vaultEntry.id === entry.id);
      if (globalIndex >= 0) {
        const success = await deleteEntry(globalIndex);
        if (success) {
          console.log('Entry deleted successfully');
        } else {
          console.error('Failed to delete entry');
        }
      }
    }
  };

  if (filteredVault.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          No passwords found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add your first password to get started, or adjust your search filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with View Toggle */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Password Entries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredVault.length} {filteredVault.length === 1 ? 'entry' : 'entries'} 
            {Object.keys(groupedEntries).length > 1 && 
              ` across ${Object.keys(groupedEntries).length} categories`
            }
          </Typography>
        </Box>

        <ViewToggle 
          view={viewMode} 
          onViewChange={handleViewModeChange} 
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Category Sections */}
      <Stack spacing={3}>
        {Object.entries(groupedEntries).map(([categoryId, { category, entries }]) => (
          <Fade key={categoryId} in timeout={300}>
            <div>
              <CategorySection
                category={category}
                entries={entries}
                view={viewMode}
                onEdit={(localIndex) => handleEdit(localIndex, entries)}
                onDelete={(localIndex) => handleDelete(localIndex, entries)}
                isPasswordVisible={(localIndex) => {
                  // Find the global index for visibility check
                  const entry = entries[localIndex];
                  if (entry && entry.id) {
                    const globalIndex = vault.findIndex(vaultEntry => vaultEntry.id === entry.id);
                    return globalIndex >= 0 ? isPasswordVisible(globalIndex) : false;
                  }
                  return false;
                }}
                onTogglePassword={(localIndex) => {
                  // Find the global index for password toggle
                  const entry = entries[localIndex];
                  if (entry && entry.id) {
                    const globalIndex = vault.findIndex(vaultEntry => vaultEntry.id === entry.id);
                    if (globalIndex >= 0) {
                      handleTogglePassword(globalIndex);
                    }
                  }
                }}
              />
            </div>
          </Fade>
        ))}
      </Stack>

      {/* View Mode Statistics */}
      <Box sx={{ 
        mt: 4, 
        p: 2, 
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2
      }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Viewing in {viewMode} mode • 
          {Object.keys(groupedEntries).length} {Object.keys(groupedEntries).length === 1 ? 'category' : 'categories'} • 
          {filteredVault.length} total {filteredVault.length === 1 ? 'entry' : 'entries'}
        </Typography>
      </Box>
    </Box>
  );
};

export default VaultList; 