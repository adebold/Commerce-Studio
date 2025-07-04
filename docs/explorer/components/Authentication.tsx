import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Input, Button } from '../../../frontend/src/design-system/components';
import { GridContainer, GridItem } from '../../../frontend/src/design-system/components/Layout/ResponsiveGrid';

// Authentication method types
export enum AuthMethod {
  NONE = 'none',
  API_KEY = 'apiKey',
  OAUTH = 'oauth',
  JWT = 'jwt'
}

// Authentication configuration interface
export interface AuthConfig {
  method: AuthMethod;
  apiKey?: string;
  token?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
}

interface AuthenticationProps {
  onChange: (config: AuthConfig) => void;
  initialConfig?: AuthConfig;
}

const AuthContainer = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const AuthForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const AuthMethodSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const MethodButton = styled(Button)<{ isActive: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
  background-color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary.main : theme.colors.neutral[100]};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.neutral.white : theme.colors.neutral[800]};
`;

/**
 * Authentication Component
 * 
 * Allows users to configure authentication for API requests.
 * Supports API Key, OAuth, and JWT authentication methods.
 */
export const Authentication: React.FC<AuthenticationProps> = ({ onChange, initialConfig }) => {
  const [authConfig, setAuthConfig] = useState<AuthConfig>(
    initialConfig || { method: AuthMethod.NONE }
  );

  const handleMethodChange = (method: AuthMethod) => {
    const newConfig = { ...authConfig, method };
    setAuthConfig(newConfig);
    onChange(newConfig);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfig = { ...authConfig, [name]: value };
    setAuthConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <AuthContainer>
      <Card.Content>
        <Typography variant="h5" gutterBottom>Authentication</Typography>
        
        <AuthForm>
          <Typography variant="body2">Select authentication method:</Typography>
          
          <AuthMethodSelector>
            <MethodButton 
              size="small" 
              isActive={authConfig.method === AuthMethod.NONE}
              onClick={() => handleMethodChange(AuthMethod.NONE)}
            >
              None
            </MethodButton>
            
            <MethodButton 
              size="small" 
              isActive={authConfig.method === AuthMethod.API_KEY}
              onClick={() => handleMethodChange(AuthMethod.API_KEY)}
            >
              API Key
            </MethodButton>
            
            <MethodButton 
              size="small" 
              isActive={authConfig.method === AuthMethod.OAUTH}
              onClick={() => handleMethodChange(AuthMethod.OAUTH)}
            >
              OAuth 2.0
            </MethodButton>
            
            <MethodButton 
              size="small" 
              isActive={authConfig.method === AuthMethod.JWT}
              onClick={() => handleMethodChange(AuthMethod.JWT)}
            >
              JWT
            </MethodButton>
          </AuthMethodSelector>
          
          {authConfig.method === AuthMethod.API_KEY && (
            <GridContainer spacing="medium">
              <GridItem xs={12}>
                <Input
                  label="API Key"
                  name="apiKey"
                  value={authConfig.apiKey || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your API key"
                  fullWidth
                />
              </GridItem>
            </GridContainer>
          )}
          
          {authConfig.method === AuthMethod.JWT && (
            <GridContainer spacing="medium">
              <GridItem xs={12}>
                <Input
                  label="JWT Token"
                  name="token"
                  value={authConfig.token || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your JWT token"
                  fullWidth
                />
              </GridItem>
            </GridContainer>
          )}
          
          {authConfig.method === AuthMethod.OAUTH && (
            <GridContainer spacing="medium">
              <GridItem xs={12} md={6}>
                <Input
                  label="Client ID"
                  name="clientId"
                  value={authConfig.clientId || ''}
                  onChange={handleInputChange}
                  placeholder="Enter client ID"
                  fullWidth
                />
              </Grid>
              <GridItem xs={12} md={6}>
                <Input
                  label="Client Secret"
                  name="clientSecret"
                  value={authConfig.clientSecret || ''}
                  onChange={handleInputChange}
                  placeholder="Enter client secret"
                  fullWidth
                  type="password"
                />
              </Grid>
              <GridItem xs={12}>
                <Button 
                  variant="secondary"
                  color="primary"
                  disabled={!authConfig.clientId || !authConfig.clientSecret}
                >
                  Authorize
                </Button>
              </GridItem>
            </GridContainer>
          )}
        </AuthForm>
      </Card.Content>
    </AuthContainer>
  );
};

export default Authentication;