import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useVault } from '../context/VaultContext';

const CategoryFilter = () => {
  const { categories, selectedCategory, setSelectedCategory } = useVault();

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Categories:
      </Typography>
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
          />
        ))}
      </Box>
    </Box>
  );
};

export default CategoryFilter; 