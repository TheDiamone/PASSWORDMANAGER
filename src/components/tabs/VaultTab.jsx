import React from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Stack,
  Typography,
  Button,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useVault } from '../../context/VaultContext';
import VaultList from '../VaultList';
import CategoryFilter from '../CategoryFilter';
import ViewToggle from '../ViewToggle';

const VaultTab = ({ onAddPassword }) => {
  const { search, setSearch, filteredVault, viewMode, handleViewModeChange } = useVault();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Search and Filter Section */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <SearchIcon color="action" />
            <Typography variant="h6" component="h2" fontWeight="600">
              Search & Filter
            </Typography>
          </Box>
          
          <TextField
            label="Search passwords..."
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site, username, category, or tags..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <CategoryFilter />
            <ViewToggle view={viewMode} onViewChange={handleViewModeChange} />
          </Box>
          
          {search && (
            <Typography variant="body2" color="text.secondary">
              Found {filteredVault ? filteredVault.length : 0} matching entries
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Vault Content */}
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'neutral.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" fontWeight="600">
              Password Vault
            </Typography>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddPassword}
                sx={{ borderRadius: 2 }}
              >
                Add Password
              </Button>
            )}
          </Box>
        </Box>
        
        <VaultList />
      </Paper>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add password"
          onClick={onAddPassword}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default VaultTab; 