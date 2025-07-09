import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';

function TenantForm({ tenant, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    customDomain: '',
    status: 'active',
    tier: 'basic',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.company_name || '',
        subdomain: tenant.subdomain || '',
        customDomain: tenant.custom_domain || '',
        status: tenant.status || 'active',
        tier: tenant.tier || 'basic',
      });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="companyName"
        label="Company Name"
        value={formData.companyName}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        name="subdomain"
        label="Subdomain"
        value={formData.subdomain}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        name="customDomain"
        label="Custom Domain"
        value={formData.customDomain}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select name="status" value={formData.status} onChange={handleChange}>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Tier</InputLabel>
        <Select name="tier" value={formData.tier} onChange={handleChange}>
          <MenuItem value="basic">Basic</MenuItem>
          <MenuItem value="premium">Premium</MenuItem>
          <MenuItem value="enterprise">Enterprise</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button type="submit" variant="contained">
          {tenant ? 'Update' : 'Create'}
        </Button>
      </Box>
    </form>
  );
}

export default TenantForm;