import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Storage as VaultIcon,
  Lock as LockIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  VpnKey as GenerateIcon,
  Category as CategoryIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useVault } from '../context/VaultContext';

const Navigation = ({ currentTab, onTabChange }) => {
  const { vault, breachedPasswords } = useVault();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tabs = [
    {
      label: 'Vault',
      icon: <VaultIcon />,
      value: 'vault',
      badge: vault && vault.length > 0 ? vault.length : null
    },
    {
      label: 'Security',
      icon: <SecurityIcon />,
      value: 'security',
      badge: breachedPasswords && breachedPasswords.length > 0 ? breachedPasswords.length : null,
      badgeColor: 'error'
    },
    {
      label: 'Generator',
      icon: <GenerateIcon />,
      value: 'generator'
    },
    {
      label: 'Import/Export',
      icon: <UploadIcon />,
      value: 'import-export'
    }
  ];

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 64, // AppBar height
        zIndex: 1000
      }}
    >
      <Tabs
        value={currentTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        variant={isMobile ? "fullWidth" : "standard"}
        centered={!isMobile}
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.badge ? (
                  <Badge
                    badgeContent={tab.badge}
                    color={tab.badgeColor || 'primary'}
                    max={99}
                  >
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )}
                {!isMobile && tab.label}
              </Box>
            }
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              px: isMobile ? 1 : 2
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default Navigation; 