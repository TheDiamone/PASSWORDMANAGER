import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useVault } from '../context/VaultContext';

const CategoryFilter = () => {
  const { 
    categories, 
    selectedCategory, 
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory
  } = useVault();
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
      updateCategory(editingCategory.id, editingCategory);
    } else {
      // Add new category
      addCategory(editingCategory);
    }
    
    setShowCategoryDialog(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Entries in this category will be moved to "Other".')) return;
    deleteCategory(categoryId);
  };

  const handleCloseDialog = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
  };

  // Sort categories alphabetically, but keep "All" first and "Other" last
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.id === 'other') return 1;
    if (b.id === 'other') return -1;
    return a.name.localeCompare(b.name);
  });

  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return 'All Categories';
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.name : 'All Categories';
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category Filter</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category Filter"
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#2196F3'
                    }}
                  />
                  All Categories
                </Box>
              </MenuItem>
              {sortedCategories.map((category) => (
                <MenuItem 
                  key={category.id} 
                  value={category.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
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
                  {category.id !== 'other' && (
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Box>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleAddCategory}
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          Showing: {getSelectedCategoryName()}
        </Typography>
      </Box>

      {/* Category Management Dialog */}
      <Dialog open={showCategoryDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveCategory}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryFilter; 