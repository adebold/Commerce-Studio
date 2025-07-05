import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings?: {
    ssoEnabled?: boolean;
    ssoProviders?: Array<{
      provider: string;
      enabled: boolean;
    }>;
    customBranding?: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  status: string;
}

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenantId: string | null;
  onChange: (tenantId: string | null) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
  tenants,
  selectedTenantId,
  onChange
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  if (tenants.length <= 1) {
    return null;
  }

  return (
    <FormControl variant="outlined" fullWidth margin="normal">
      <InputLabel id="tenant-selector-label">Organization</InputLabel>
      <Select
        labelId="tenant-selector-label"
        id="tenant-selector"
        value={selectedTenantId || ''}
        onChange={handleChange}
        label="Organization"
      >
        {tenants.map((tenant) => (
          <MenuItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};