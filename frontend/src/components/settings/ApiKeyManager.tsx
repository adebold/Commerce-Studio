import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography, Button, Input, Card } from '../../design-system';
import { ApiKey } from '../../services/settings';

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  onGenerateKey: (name: string, permissions: string[]) => Promise<void>;
  onDeleteKey: (id: string) => Promise<void>;
  loading?: boolean;
}

const ApiKeyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ApiKeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ApiKeyItem = styled(Card)`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ApiKeyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const ApiKeyValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: monospace;
  overflow-x: auto;
`;

const ApiKeyMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const PermissionTag = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[700]};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const NewKeyForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

const PermissionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PermissionOption = styled.label<{ selected: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  background-color: ${({ theme, selected }) => 
    selected ? theme.colors.primary[100] : theme.colors.neutral[100]};
  color: ${({ theme, selected }) => 
    selected ? theme.colors.primary[700] : theme.colors.neutral[700]};
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: ${({ theme, selected }) => 
      selected ? theme.colors.primary[200] : theme.colors.neutral[200]};
  }
  
  input {
    margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  }
`;

/**
 * ApiKeyManager Component
 * 
 * A component for managing API keys with generation and deletion functionality.
 */
const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKeys,
  onGenerateKey,
  onDeleteKey,
  loading = false,
}) => {
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);
  const [generatingKey, setGeneratingKey] = useState(false);
  
  const availablePermissions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
  ];
  
  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };
  
  const handleGenerateKey = async () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return;
    
    setGeneratingKey(true);
    try {
      await onGenerateKey(newKeyName, selectedPermissions);
      setNewKeyName('');
      setSelectedPermissions(['read']);
      setShowNewKeyForm(false);
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setGeneratingKey(false);
    }
  };
  
  const handleDeleteKey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await onDeleteKey(id);
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };
  
  return (
    <ApiKeyContainer>
      <div>
        <Typography variant="h4" gutterBottom>
          API Keys
        </Typography>
        <Typography variant="body2" color="neutral.600">
          API keys allow external applications to authenticate with the VARAi API.
          Keep your API keys secure and never share them in public repositories or client-side code.
        </Typography>
      </div>
      
      <Button
        variant="secondary"
        onClick={() => setShowNewKeyForm(!showNewKeyForm)}
        disabled={loading}
      >
        {showNewKeyForm ? 'Cancel' : 'Generate New API Key'}
      </Button>
      
      {showNewKeyForm && (
        <NewKeyForm>
          <Typography variant="h5">Generate New API Key</Typography>
          
          <div>
            <Input
              label="Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API Key"
              fullWidth
              required
            />
          </div>
          
          <div>
            <Typography variant="body1" gutterBottom>
              Permissions
            </Typography>
            <PermissionOptions>
              {availablePermissions.map(permission => (
                <PermissionOption
                  key={permission.value}
                  selected={selectedPermissions.includes(permission.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionToggle(permission.value)}
                    id={`permission-${permission.value}`}
                    aria-label={`${permission.label} permission`}
                  />
                  {permission.label}
                </PermissionOption>
              ))}
            </PermissionOptions>
          </div>
          
          <FormActions>
            <Button
              variant="tertiary"
              onClick={() => setShowNewKeyForm(false)}
              disabled={generatingKey}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateKey}
              loading={generatingKey}
              disabled={!newKeyName.trim() || selectedPermissions.length === 0}
            >
              Generate Key
            </Button>
          </FormActions>
        </NewKeyForm>
      )}
      
      {apiKeys.length > 0 ? (
        <ApiKeyList>
          {apiKeys.map(apiKey => (
            <ApiKeyItem key={apiKey.id} variant="outlined">
              <ApiKeyHeader>
                <Typography variant="h5">{apiKey.name}</Typography>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => handleDeleteKey(apiKey.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </ApiKeyHeader>
              
              <ApiKeyValue>
                <code>{apiKey.key}</code>
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => navigator.clipboard.writeText(apiKey.key)}
                >
                  Copy
                </Button>
              </ApiKeyValue>
              
              <div>
                {apiKey.permissions.map(permission => (
                  <PermissionTag key={permission}>{permission}</PermissionTag>
                ))}
              </div>
              
              <ApiKeyMeta>
                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                {apiKey.lastUsed && (
                  <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                )}
              </ApiKeyMeta>
            </ApiKeyItem>
          ))}
        </ApiKeyList>
      ) : (
        <Typography variant="body1" color="neutral.600" align="center">
          No API keys found. Generate a new key to get started.
        </Typography>
      )}
    </ApiKeyContainer>
  );
};

export default ApiKeyManager;