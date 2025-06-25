import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ImportExportDialogs = ({ showImport, showExport, onCloseImport, onCloseExport }) => {
  return (
    <>
      {/* Import Dialog */}
      <Dialog open={showImport} onClose={onCloseImport} maxWidth="md" fullWidth>
        <DialogTitle>Import Passwords</DialogTitle>
        <DialogContent>
          <Typography>
            Import dialog will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseImport}>Cancel</Button>
          <Button variant="contained">Import</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onClose={onCloseExport} maxWidth="sm" fullWidth>
        <DialogTitle>Export Passwords</DialogTitle>
        <DialogContent>
          <Typography>
            Export dialog will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseExport}>Cancel</Button>
          <Button variant="contained">Export</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportExportDialogs; 