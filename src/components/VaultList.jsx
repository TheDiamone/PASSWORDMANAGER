import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useVault } from '../context/VaultContext';

const VaultList = () => {
  const { filteredVault } = useVault();

  return (
    <List sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
      {filteredVault.length === 0 && (
        <ListItem>
          <ListItemText primary="No entries found." />
        </ListItem>
      )}
      {filteredVault.map((item, idx) => (
        <ListItem key={idx}>
          <ListItemText 
            primary={item.site}
            secondary={`User: ${item.user}`}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default VaultList; 