import React, { useState } from 'react';
import {
  Box,
  CssBaseline
} from '@mui/material';
import { useVault } from '../context/VaultContext';
import AppBar from '../components/AppBar';
import Navigation from '../components/Navigation';
import VaultTab from '../components/tabs/VaultTab';
import SecurityTab from '../components/tabs/SecurityTab';
import GeneratorTab from '../components/tabs/GeneratorTab';
import ImportExportTab from '../components/tabs/ImportExportTab';
import AddPasswordDialog from '../components/AddPasswordDialog';
import AdminSidebar from '../components/AdminSidebar';

const VaultScreen = () => {
  const { filteredVault } = useVault();
  
  const [currentTab, setCurrentTab] = useState('vault');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
  };

  const handleAddPassword = () => {
    setEditEntry(null);
    setEditIndex(null);
    setShowAddDialog(true);
  };

  const handleEditPassword = (entry, index) => {
    setEditEntry(entry);
    setEditIndex(index);
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditEntry(null);
    setEditIndex(null);
  };

  const handleOpenSettings = () => {
    setShowAdminSidebar(true);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'vault':
        return <VaultTab onAddPassword={handleAddPassword} onEditPassword={handleEditPassword} />;
      case 'security':
        return <SecurityTab />;
      case 'generator':
        return <GeneratorTab />;
      case 'import-export':
        return <ImportExportTab />;
      default:
        return <VaultTab onAddPassword={handleAddPassword} onEditPassword={handleEditPassword} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar onOpenSettings={handleOpenSettings} />
      
      {/* Navigation Tabs */}
      <Navigation currentTab={currentTab} onTabChange={handleTabChange} />
      
      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 112px)' // AppBar (64px) + Navigation (48px)
        }}
      >
        {renderTabContent()}
      </Box>

      {/* Dialogs */}
      <AddPasswordDialog
        open={showAddDialog}
        onClose={handleCloseDialog}
        editEntry={editEntry}
        editIndex={editIndex}
      />

      <AdminSidebar
        open={showAdminSidebar}
        onClose={() => setShowAdminSidebar(false)}
      />
    </Box>
  );
};

export default VaultScreen; 