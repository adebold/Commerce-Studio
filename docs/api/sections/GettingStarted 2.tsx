import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { Button } from '../../../frontend/src/design-system/components/Button/Button';
import { CodeSnippet, CollapsibleSection } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const StepContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const StepNumber = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.common.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const StepTitle = styled(Typography)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const InfoCard = styled(Card)`
  margin: ${({ theme }) => `${theme.spacing.spacing[24]} 0`};
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary[500]};
`;

/**
 * GettingStarted Component
 * 
 * The Getting Started guide for the VARAi API documentation.
 */
const GettingStarted: React.FC = () => {
  return (
    <SectionContainer id="getting-started">
      <Typography variant="h2" gutterBottom>
        Getting Started with VARAi API
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Welcome to the VARAi API documentation. This guide will help you get started with integrating
        VARAi's powerful eyewear AI capabilities into your applications. The VARAi API provides
        programmatic access to our virtual try-on, frame recommendations, style analysis, and more.
      </Typography>
      
      <StepContainer>
        <StepNumber>1</StepNumber>
        <StepTitle variant="h4">Create a VARAi Account</StepTitle>
        
        <Typography variant="body1" gutterBottom>
          Before you can use the VARAi API, you need to create a developer account. Visit the
          <a href="https://developer.varai.ai/signup" style={{ marginLeft: '4px' }}>
            VARAi Developer Portal
          </a> to sign up for an account.
        </Typography>
        
        <InfoCard variant="outlined">
          <Card.Content>
            <Typography variant="body2">
              If you're already using VARAi's e-commerce integrations, you can use your existing
              account credentials to access the API.
            </Typography>
          </Card.Content>
        </InfoCard>
      </StepContainer>
      
      <StepContainer>
        <StepNumber>2</StepNumber>
        <StepTitle variant="h4">Generate an API Key</StepTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you have an account, you can generate an API key from your developer dashboard.
          This key will be used to authenticate your API requests.
        </Typography>
        
        <CollapsibleSection title="How to generate an API key">
          <ol>
            <li>Log in to your VARAi developer account</li>
            <li>Navigate to the "API Keys" section in your dashboard</li>
            <li>Click "Generate New API Key"</li>
            <li>Give your key a name (e.g., "Production", "Testing")</li>
            <li>Select the appropriate permissions for your use case</li>
            <li>Click "Create API Key"</li>
          </ol>
          
          <Typography variant="body2" gutterBottom>
            Your API key will only be displayed once. Make sure to copy it and store it securely.
            If you lose your key, you'll need to generate a new one.
          </Typography>
        </CollapsibleSection>
      </StepContainer>
      
      <StepContainer>
        <StepNumber>3</StepNumber>
        <StepTitle variant="h4">Make Your First API Request</StepTitle>
        
        <Typography variant="body1" gutterBottom>
          Now that you have an API key, you can make your first request to the VARAi API.
          Here's a simple example using cURL:
        </Typography>
        
        <CodeSnippet
          language="bash"
          code={`curl -X GET "https://api.varai.ai/v1/frames" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
        />
        
        <Typography variant="body1" gutterBottom>
          Or using JavaScript:
        </Typography>
        
        <CodeSnippet
          language="javascript"
          code={`fetch('https://api.varai.ai/v1/frames', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
        />
      </StepContainer>
      
      <StepContainer>
        <StepNumber>4</StepNumber>
        <StepTitle variant="h4">Explore the API</StepTitle>
        
        <Typography variant="body1" gutterBottom>
          Now that you've made your first request, you can explore the rest of the API.
          Check out the following sections to learn more:
        </Typography>
        
        <ul>
          <li>
            <a href="#authentication">Authentication</a> - Learn more about authenticating your requests
          </li>
          <li>
            <a href="#rate-limiting">Rate Limiting</a> - Understand the API's rate limits
          </li>
          <li>
            <a href="#error-handling">Error Handling</a> - Learn how to handle errors
          </li>
          <li>
            <a href="#api-reference">API Reference</a> - Explore all available endpoints
          </li>
        </ul>
      </StepContainer>
      
      <Typography variant="h4" gutterBottom>
        Need Help?
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        If you have any questions or need assistance, you can:
      </Typography>
      
      <ul>
        <li>Check our <a href="#faq">FAQ section</a></li>
        <li>Join our <a href="https://community.varai.ai">Developer Community</a></li>
        <li>Contact our <a href="mailto:support@varai.ai">Support Team</a></li>
      </ul>
      
      <Button variant="primary" size="medium">
        View API Reference
      </Button>
    </SectionContainer>
  );
};

export default GettingStarted;