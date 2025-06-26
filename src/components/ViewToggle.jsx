import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';

const ViewToggle = ({ view, onViewChange }) => {
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        View:
      </Typography>
      
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            border: 1,
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }
          }
        }}
      >
        <Tooltip title="Card View">
          <ToggleButton value="card" aria-label="card view">
            <CardViewIcon fontSize="small" sx={{ mr: 1 }} />
            Cards
          </ToggleButton>
        </Tooltip>
        
        <Tooltip title="List View">
          <ToggleButton value="list" aria-label="list view">
            <ListViewIcon fontSize="small" sx={{ mr: 1 }} />
            List
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ViewToggle; 