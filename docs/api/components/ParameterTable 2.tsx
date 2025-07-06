import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Parameter } from './ApiEndpoint';

interface ParameterTableProps {
  parameters: Parameter[];
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`;

const TableBody = styled.tbody`
  & tr:nth-of-type(even) {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.neutral[800]};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  vertical-align: top;
`;

const ParameterName = styled.code`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[4]}`};
  border-radius: 4px;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  color: ${({ theme }) => theme.colors.neutral[800]};
`;

const RequiredBadge = styled.span<{ required: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${({ theme, required }) => 
    required 
      ? theme.colors.semantic.info.light 
      : theme.colors.neutral[200]
  };
  color: ${({ theme, required }) => 
    required 
      ? theme.colors.semantic.info.dark 
      : theme.colors.neutral[600]
  };
`;

/**
 * ParameterTable Component
 * 
 * Displays a table of API parameters with their types, requirements, and descriptions.
 */
export const ParameterTable: React.FC<ParameterTableProps> = ({ parameters }) => {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Parameter</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Required</TableHeader>
          <TableHeader>Description</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {parameters.map((param, index) => (
          <TableRow key={index}>
            <TableCell>
              <ParameterName>{param.name}</ParameterName>
            </TableCell>
            <TableCell>
              <TypeBadge>{param.type}</TypeBadge>
            </TableCell>
            <TableCell>
              <RequiredBadge required={param.required}>
                {param.required ? 'Required' : 'Optional'}
              </RequiredBadge>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{param.description}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ParameterTable;