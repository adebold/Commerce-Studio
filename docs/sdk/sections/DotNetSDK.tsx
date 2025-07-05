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

interface DotNetSDKProps {
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
 * DotNetSDK Component
 * 
 * Displays documentation for the .NET SDK.
 */
const DotNetSDK: React.FC<DotNetSDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'nuget',
      name: 'NuGet',
      command: `Install-Package Varai.SDK -Version ${version}`,
      language: 'powershell'
    },
    {
      id: 'dotnet-cli',
      name: '.NET CLI',
      command: `dotnet add package Varai.SDK --version ${version}`,
      language: 'bash'
    }
  ];

  // Authentication example
  const authExample = `
// Import the SDK
using Varai;
using Varai.Exceptions;

class Program
{
    static async Task Main(string[] args)
    {
        // Initialize the client with your API key
        var client = new VaraiClient(
            apiKey: "process.env.APIKEY_2553",
            environment: "production" // or "sandbox" for testing
        );
        
        // Verify authentication
        try
        {
            var response = await client.Auth.VerifyAsync();
            Console.WriteLine($"Authentication successful: {response}");
        }
        catch (ApiException ex)
        {
            Console.WriteLine($"Authentication failed: {ex.Message}");
        }
    }
}
`;

  // First request example
  const firstRequestExample = `
// Import the SDK
using Varai;
using Varai.Exceptions;
using Varai.Models;

class Program
{
    static async Task Main(string[] args)
    {
        // Initialize the client
        var client = new VaraiClient(apiKey: "process.env.APIKEY_2553");
        
        // Get a list of available frames
        try
        {
            var frames = await client.Frames.ListAsync();
            Console.WriteLine($"Available frames: {frames}");
        }
        catch (ApiException ex)
        {
            Console.WriteLine($"Error fetching frames: {ex.Message}");
        }
    }
}
`;

  return (
    <div id="dotnet-sdk">
      {/* Installation Section */}
      <SectionContainer id="dotnet-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="dotnet"
          sdkName="VARAi .NET"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="dotnet-quickstart">
        <SectionTitle variant="h3" id="dotnet-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi .NET SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="dotnet-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="csharp"
        />
        
        <SectionTitle variant="h4" id="dotnet-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="csharp"
        />
      </SectionContainer>
      
      {/* Coming Soon Message */}
      <SectionContainer>
        <SectionTitle variant="h3">
          More Documentation Coming Soon
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          We're working on expanding our .NET SDK documentation. Check back soon for more detailed guides, API references, and examples.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          In the meantime, you can refer to the JavaScript or Python SDK documentation for a better understanding of the available features and functionality.
        </Typography>
      </SectionContainer>
    </div>
  );
};

export default DotNetSDK;