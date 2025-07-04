import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { CodeSnippet, HttpStatusCode, CollapsibleSection } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SubSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const WarningCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.semantic.warning.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.warning.main};
`;

const TipCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.semantic.info.light};
  border-left: 4px solid ${({ theme }) => theme.colors.semantic.info.main};
`;

/**
 * Authentication Component
 * 
 * Documentation for authenticating with the VARAi API.
 */
const Authentication: React.FC = () => {
  return (
    <SectionContainer id="authentication">
      <Typography variant="h2" gutterBottom>
        Authentication
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        The VARAi API uses API keys to authenticate requests. You can view and manage your API keys
        in the VARAi Developer Dashboard. Your API keys carry many privileges, so be sure to keep them
        secure. Do not share your API keys in publicly accessible areas such as GitHub, client-side code, etc.
      </Typography>
      
      <WarningCard variant="outlined">
        <Card.Content>
          <Typography variant="body2">
            <strong>Security Warning:</strong> Your API key should be kept confidential. Never expose it in
            client-side code or public repositories. Always make API requests from your server-side code.
          </Typography>
        </Card.Content>
      </WarningCard>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          API Key Authentication
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          To authenticate your API requests, include your API key in the Authorization header using the
          Bearer authentication scheme:
        </Typography>
        
        <CodeSnippet
          language="bash"
          code={`Authorization: Bearer YOUR_API_KEY`}
        />
        
        <Typography variant="h5" gutterBottom style={{ marginTop: '24px' }}>
          Example Request
        </Typography>
        
        <CodeSnippet
          language="bash"
          code={`curl -X GET "https://api.varai.ai/v1/frames" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          Authentication Errors
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          If your API key is missing, invalid, or expired, you'll receive an authentication error:
        </Typography>
        
        <HttpStatusCode
          code={401}
          name="Unauthorized"
          description="The API key is missing, invalid, or expired."
        />
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key provided",
    "details": {
      "reason": "invalid_key"
    }
  }
}`}
        />
        
        <HttpStatusCode
          code={403}
          name="Forbidden"
          description="The API key doesn't have permission to perform the requested action."
        />
        
        <CodeSnippet
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "forbidden",
    "message": "API key doesn't have permission to access this resource",
    "details": {
      "required_permission": "frames:write"
    }
  }
}`}
        />
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          API Key Management
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          You can manage your API keys in the VARAi Developer Dashboard. Here are some best practices
          for API key management:
        </Typography>
        
        <CollapsibleSection title="API Key Best Practices">
          <ul>
            <li>
              <strong>Use different API keys for different environments</strong> - Create separate API keys
              for development, staging, and production environments.
            </li>
            <li>
              <strong>Rotate API keys regularly</strong> - Periodically generate new API keys and update
              your applications to use them.
            </li>
            <li>
              <strong>Restrict API key permissions</strong> - Only grant the permissions that are necessary
              for your use case.
            </li>
            <li>
              <strong>Monitor API key usage</strong> - Regularly review the usage logs for your API keys
              to detect any unauthorized access.
            </li>
            <li>
              <strong>Secure storage</strong> - Store API keys in secure environment variables or a secure
              key management service, not in your code.
            </li>
          </ul>
        </CollapsibleSection>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          OAuth Authentication (Coming Soon)
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          In addition to API key authentication, we're working on adding OAuth 2.0 support for more
          advanced authentication scenarios. This will allow you to:
        </Typography>
        
        <ul>
          <li>Authenticate users with their VARAi accounts</li>
          <li>Request specific permissions from users</li>
          <li>Generate access tokens with limited scopes and lifetimes</li>
        </ul>
        
        <TipCard variant="outlined">
          <Card.Content>
            <Typography variant="body2">
              <strong>Stay Updated:</strong> Sign up for our developer newsletter to be notified when
              OAuth authentication becomes available.
            </Typography>
          </Card.Content>
        </TipCard>
      </SubSection>
      
      <SubSection>
        <Typography variant="h4" gutterBottom>
          API Key Permissions
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          When creating an API key, you can specify which permissions it should have. Here are the
          available permission scopes:
        </Typography>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Permission</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>frames:read</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Read access to frame data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>frames:write</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Write access to frame data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>recommendations:read</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Read access to recommendation data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>recommendations:write</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Write access to recommendation data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>users:read</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Read access to user data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>users:write</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Write access to user data
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <code>analytics:read</code>
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Read access to analytics data
              </td>
            </tr>
          </tbody>
        </table>
      </SubSection>
    </SectionContainer>
  );
};

export default Authentication;