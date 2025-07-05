import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import {
  Code as CodeIcon,
  Book as BookIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doc-tabpanel-${index}`}
      aria-labelledby={`doc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  return (
    <Box sx={{ my: 2, borderRadius: 1, overflow: 'hidden' }}>
      <SyntaxHighlighter language={language} style={materialLight}>
        {code}
      </SyntaxHighlighter>
    </Box>
  );
};

const DocumentationPanel: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Code examples
  const apiKeyAuthExample = `// JavaScript example
const apiKey = 'process.env.APIKEY_2577';

fetch('https://api.varai.ai/v1/recommendations', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

  const oauthAuthCodeExample = `// Step 1: Redirect user to authorization URL
const authUrl = 'https://auth.varai.ai/oauth/authorize?' + 
  'client_id=your_client_id' +
  '&redirect_uri=https://your-app.com/callback' +
  '&response_type=code' +
  '&scope=profile email';

// Redirect the user to authUrl

// Step 2: Exchange authorization code for tokens (server-side)
const code = 'authorization_code_from_callback';

fetch('https://auth.varai.ai/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    client_id: 'your_client_id',
    client_secret: 'process.env.DOCUMENTATIONPANEL_SECRET_7',
    code: code,
    redirect_uri: 'https://your-app.com/callback'
  })
})
.then(response => response.json())
.then(data => {
  // Store tokens
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  console.log('Access token:', accessToken);
})
.catch(error => console.error('Error:', error));`;

  const oauthClientCredentialsExample = `// Server-side OAuth client credentials flow
fetch('https://auth.varai.ai/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'your_client_id',
    client_secret: 'process.env.DOCUMENTATIONPANEL_SECRET_7',
    scope: 'products:read analytics:read'
  })
})
.then(response => response.json())
.then(data => {
  const accessToken = data.access_token;
  console.log('Access token:', accessToken);
})
.catch(error => console.error('Error:', error));`;

  const refreshTokenExample = `// Refresh token example
fetch('https://auth.varai.ai/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    client_id: 'your_client_id',
    client_secret: 'process.env.DOCUMENTATIONPANEL_SECRET_7',
    refresh_token: 'your_refresh_token'
  })
})
.then(response => response.json())
.then(data => {
  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;
  console.log('New access token:', newAccessToken);
})
.catch(error => console.error('Error:', error));`;

  const pythonExample = `# Python example using requests
import requests

api_key = 'process.env.APIKEY_2577'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.varai.ai/v1/recommendations', headers=headers)
data = response.json()
print(data)`;

  const nodeExample = `// Node.js example using axios
const axios = require('axios');

const apiKey = 'process.env.APIKEY_2577';

axios.get('https://api.varai.ai/v1/recommendations', {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Error:', error);
});`;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Developer Documentation
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="documentation tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<ApiIcon />} label="Authentication" />
          <Tab icon={<SecurityIcon />} label="API Keys" />
          <Tab icon={<BookIcon />} label="OAuth Guide" />
          <Tab icon={<CodeIcon />} label="Code Examples" />
          <Tab icon={<DevicesIcon />} label="SDKs & Libraries" />
        </Tabs>
      </Box>

      {/* Authentication Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Authentication Methods
        </Typography>
        <Typography paragraph>
          The VARAi Platform supports two primary authentication methods for developers:
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  API Key Authentication
                </Typography>
                <Typography variant="body2" paragraph>
                  API keys provide a simple way to authenticate with the VARAi API. Each key has specific permissions and can be revoked at any time.
                </Typography>
                <Typography variant="body2">
                  <strong>Best for:</strong> Server-to-server communication, backend services, and scripts.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  Include your API key in the Authorization header:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mt: 1 }}>
                  Authorization: Bearer process.env.APIKEY_2577
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  OAuth 2.0
                </Typography>
                <Typography variant="body2" paragraph>
                  OAuth 2.0 provides a secure way for users to grant your application access to their VARAi data without sharing their credentials.
                </Typography>
                <Typography variant="body2">
                  <strong>Best for:</strong> User-facing applications, third-party integrations, and mobile apps.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  Supported grant types:
                </Typography>
                <ul>
                  <li>Authorization Code</li>
                  <li>Client Credentials</li>
                  <li>Implicit</li>
                  <li>Refresh Token</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Choosing the Right Authentication Method
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              <strong>Use API Keys when:</strong>
            </Typography>
            <ul>
              <li>Building server-side applications or scripts</li>
              <li>You need simple authentication without user involvement</li>
              <li>You're accessing your own resources</li>
              <li>You need to make API calls from a secure backend</li>
            </ul>
            
            <Typography variant="body1" paragraph>
              <strong>Use OAuth 2.0 when:</strong>
            </Typography>
            <ul>
              <li>Building user-facing applications</li>
              <li>You need to access user-specific data</li>
              <li>You're building a third-party integration</li>
              <li>You need fine-grained access control</li>
              <li>You're developing mobile or single-page applications</li>
            </ul>
          </Paper>
        </Box>
      </TabPanel>

      {/* API Keys Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          API Key Management
        </Typography>
        
        <Typography paragraph>
          API keys provide a simple way to authenticate with the VARAi API. Each key has specific permissions (scopes) and can be revoked at any time.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Creating API Keys
                </Typography>
                <Typography variant="body2" paragraph>
                  You can create API keys from the Developer Dashboard. When creating a key, you'll need to:
                </Typography>
                <ol>
                  <li>Provide a descriptive name for the key</li>
                  <li>Select the appropriate scopes (permissions)</li>
                  <li>Set an expiration date (optional)</li>
                  <li>Configure IP restrictions (optional)</li>
                </ol>
                <Typography variant="body2" color="error">
                  Important: The full API key is only displayed once upon creation. Make sure to copy and store it securely.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  API Key Security Best Practices
                </Typography>
                <Typography variant="body2" paragraph>
                  Follow these best practices to keep your API keys secure:
                </Typography>
                <ul>
                  <li>Never expose API keys in client-side code</li>
                  <li>Don't commit API keys to version control</li>
                  <li>Use environment variables to store keys</li>
                  <li>Implement IP whitelisting when possible</li>
                  <li>Use the principle of least privilege (minimal scopes)</li>
                  <li>Rotate keys regularly</li>
                  <li>Monitor API key usage for suspicious activity</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Using API Keys
          </Typography>
          <Typography paragraph>
            To authenticate with the VARAi API using an API key, include it in the Authorization header of your HTTP requests:
          </Typography>
          
          <CodeBlock 
            language="javascript" 
            code={apiKeyAuthExample} 
          />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            API Key Scopes
          </Typography>
          <Typography paragraph>
            API key scopes determine what actions the key can perform. Available scopes include:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ul>
                <li><strong>read_only</strong> - Read-only access to resources</li>
                <li><strong>write</strong> - Read and write access to resources</li>
                <li><strong>admin</strong> - Full administrative access</li>
                <li><strong>analytics</strong> - Access to analytics data</li>
              </ul>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ul>
                <li><strong>recommendations</strong> - Access to recommendation endpoints</li>
                <li><strong>virtual_try_on</strong> - Access to virtual try-on features</li>
                <li><strong>product_catalog</strong> - Access to product catalog</li>
                <li><strong>user_data</strong> - Access to user data</li>
              </ul>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* OAuth Guide Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          OAuth 2.0 Integration Guide
        </Typography>
        
        <Typography paragraph>
          OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to a user's account on the VARAi platform.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            OAuth 2.0 Grant Types
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Authorization Code Flow
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The most common flow for web applications. It involves redirecting the user to the VARAi authorization server, where they authenticate and grant permissions.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Best for:</strong> Web applications with a server-side component.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Steps:</strong>
                  </Typography>
                  <ol>
                    <li>Redirect user to authorization endpoint</li>
                    <li>User authenticates and grants permissions</li>
                    <li>User is redirected back with an authorization code</li>
                    <li>Exchange code for access and refresh tokens</li>
                    <li>Use access token to make API requests</li>
                  </ol>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Client Credentials Flow
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Used for server-to-server authentication where no user is involved. The application authenticates with its client ID and secret.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Best for:</strong> Backend services, cron jobs, and server-side applications.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Steps:</strong>
                  </Typography>
                  <ol>
                    <li>Send client ID and secret to token endpoint</li>
                    <li>Receive access token</li>
                    <li>Use access token to make API requests</li>
                  </ol>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Implicit Flow
                  </Typography>
                  <Typography variant="body2" paragraph>
                    A simplified flow for client-side applications. The access token is returned directly in the redirect URI.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Best for:</strong> Single-page applications (SPAs) and mobile apps.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Steps:</strong>
                  </Typography>
                  <ol>
                    <li>Redirect user to authorization endpoint with response_type=token</li>
                    <li>User authenticates and grants permissions</li>
                    <li>User is redirected back with access token in the URL fragment</li>
                    <li>Use access token to make API requests</li>
                  </ol>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Refresh Token Flow
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Used to obtain a new access token when the current one expires, without requiring the user to re-authenticate.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Best for:</strong> Maintaining long-lived sessions in applications.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Steps:</strong>
                  </Typography>
                  <ol>
                    <li>Send refresh token to token endpoint</li>
                    <li>Receive new access token and refresh token</li>
                    <li>Update stored tokens</li>
                    <li>Use new access token for API requests</li>
                  </ol>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            OAuth Endpoints
          </Typography>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Authorization Endpoint
            </Typography>
            <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
              https://auth.varai.ai/oauth/authorize
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Token Endpoint
            </Typography>
            <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
              https://auth.varai.ai/oauth/token
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Token Revocation Endpoint
            </Typography>
            <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
              https://auth.varai.ai/oauth/revoke
            </Box>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            OAuth Scopes
          </Typography>
          
          <Typography paragraph>
            OAuth scopes define the specific permissions that your application is requesting. Available scopes include:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ul>
                <li><strong>profile</strong> - Access to user profile information</li>
                <li><strong>email</strong> - Access to user email address</li>
                <li><strong>products:read</strong> - Read access to product data</li>
                <li><strong>products:write</strong> - Write access to product data</li>
                <li><strong>analytics:read</strong> - Access to analytics data</li>
              </ul>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ul>
                <li><strong>recommendations:read</strong> - Access to recommendations</li>
                <li><strong>virtual-try-on:read</strong> - Access to virtual try-on</li>
                <li><strong>users:read</strong> - Read access to user data</li>
                <li><strong>users:write</strong> - Write access to user data</li>
                <li><strong>admin</strong> - Full administrative access</li>
              </ul>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* Code Examples Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Code Examples
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Authorization Code Flow Example
          </Typography>
          <CodeBlock 
            language="javascript" 
            code={oauthAuthCodeExample} 
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Client Credentials Flow Example
          </Typography>
          <CodeBlock 
            language="javascript" 
            code={oauthClientCredentialsExample} 
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Refresh Token Example
          </Typography>
          <CodeBlock 
            language="javascript" 
            code={refreshTokenExample} 
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Python Example
          </Typography>
          <CodeBlock 
            language="python" 
            code={pythonExample} 
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Node.js Example
          </Typography>
          <CodeBlock 
            language="javascript" 
            code={nodeExample} 
          />
        </Box>
      </TabPanel>

      {/* SDKs & Libraries Tab */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          SDKs & Libraries
        </Typography>
        
        <Typography paragraph>
          We provide official SDKs and libraries to help you integrate with the VARAi Platform more easily.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  JavaScript SDK
                </Typography>
                <Typography variant="body2" paragraph>
                  Our JavaScript SDK provides a convenient way to interact with the VARAi API from both browser and Node.js environments.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Installation:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                  npm install @varai/sdk
                </Box>
                <Link href="#" target="_blank" rel="noopener">
                  View on GitHub
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Python SDK
                </Typography>
                <Typography variant="body2" paragraph>
                  Our Python SDK makes it easy to integrate with the VARAi API in your Python applications.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Installation:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                  pip install varai-sdk
                </Box>
                <Link href="#" target="_blank" rel="noopener">
                  View on GitHub
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  React Components
                </Typography>
                <Typography variant="body2" paragraph>
                  Our React component library provides ready-to-use UI components for integrating VARAi features into your React applications.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Installation:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                  npm install @varai/react-components
                </Box>
                <Link href="#" target="_blank" rel="noopener">
                  View on GitHub
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Mobile SDKs
                </Typography>
                <Typography variant="body2" paragraph>
                  We provide native SDKs for iOS and Android to help you integrate VARAi features into your mobile applications.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  iOS (Swift Package Manager):
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                  https://github.com/varai/ios-sdk
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Android (Gradle):
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                  implementation 'ai.varai:android-sdk:1.0.0'
                </Box>
                <Link href="#" target="_blank" rel="noopener">
                  View Documentation
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Community Libraries
          </Typography>
          
          <Typography paragraph>
            These community-maintained libraries can help you integrate with the VARAi Platform:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    PHP Client
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By VARai Community
                  </Typography>
                  <Link href="#" target="_blank" rel="noopener" sx={{ mt: 1, display: 'block' }}>
                    View on GitHub
                  </Link>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Ruby Gem
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By VARai Community
                  </Typography>
                  <Link href="#" target="_blank" rel="noopener" sx={{ mt: 1, display: 'block' }}>
                    View on GitHub
                  </Link>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Go Client
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By VARai Community
                  </Typography>
                  <Link href="#" target="_blank" rel="noopener" sx={{ mt: 1, display: 'block' }}>
                    View on GitHub
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default DocumentationPanel;