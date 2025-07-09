import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import TenantForm from './TenantForm';

function CreateTenantDialog({ open, onClose, onSubmit }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Tenant</DialogTitle>
      <DialogContent>
        <TenantForm onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}

export default CreateTenantDialog;