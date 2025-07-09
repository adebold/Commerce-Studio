import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function TenantTable({ tenants, onDeactivate }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company Name</TableCell>
            <TableCell>Subdomain</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>{tenant.company_name}</TableCell>
              <TableCell>{tenant.subdomain}</TableCell>
              <TableCell>{tenant.status}</TableCell>
              <TableCell>
                <Button
                  component={RouterLink}
                  to={`/tenants/${tenant.id}`}
                  variant="contained"
                  size="small"
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => onDeactivate(tenant.id)}
                  sx={{ ml: 1 }}
                >
                  Deactivate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TenantTable;