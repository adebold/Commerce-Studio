import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import {
  InstallationInstructions,
  CodeExample,
  MethodReference,
  ClassReference,
  TypeDefinition
} from '../components';

interface PhpSDKProps {
  version: string;
}

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const SectionTitle = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.spacing[40]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  padding-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

/**
 * PhpSDK Component
 * 
 * Displays documentation for the PHP SDK.
 */
const PhpSDK: React.FC<PhpSDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'composer',
      name: 'Composer',
      command: `composer require varai/sdk:^${version}`,
      language: 'bash'
    }
  ];

  // Authentication example
  const authExample = `
<?php
// Import the SDK
require_once 'vendor/autoload.php';

use Varai\\Client;
use Varai\\Exception\\ApiException;

// Initialize the client with your API key
$client = new Client([
    'api_key' => 'your-api-key',
    'environment' => 'production' // or 'sandbox' for testing
]);

// Verify authentication
try {
    $response = $client->auth->verify();
    echo "Authentication successful: " . json_encode($response) . "\\n";
} catch (ApiException $e) {
    echo "Authentication failed: " . $e->getMessage() . "\\n";
}
`;

  // First request example
  const firstRequestExample = `
<?php
// Import the SDK
require_once 'vendor/autoload.php';

use Varai\\Client;
use Varai\\Exception\\ApiException;

// Initialize the client
$client = new Client([
    'api_key' => 'your-api-key'
]);

// Get a list of available frames
try {
    $frames = $client->frames->list();
    echo "Available frames: " . json_encode($frames) . "\\n";
} catch (ApiException $e) {
    echo "Error fetching frames: " . $e->getMessage() . "\\n";
}
`;

  return (
    <div id="php-sdk">
      {/* Installation Section */}
      <SectionContainer id="php-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="php"
          sdkName="VARAi PHP"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="php-quickstart">
        <SectionTitle variant="h3" id="php-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi PHP SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="php-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="php"
        />
        
        <SectionTitle variant="h4" id="php-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="php"
        />
      </SectionContainer>
      
      {/* Coming Soon Message */}
      <SectionContainer>
        <SectionTitle variant="h3">
          More Documentation Coming Soon
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          We're working on expanding our PHP SDK documentation. Check back soon for more detailed guides, API references, and examples.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          In the meantime, you can refer to the JavaScript or Python SDK documentation for a better understanding of the available features and functionality.
        </Typography>
      </SectionContainer>
    </div>
  );
};

export default PhpSDK;