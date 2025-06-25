import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

  return (
    <>
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