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

interface JavaSDKProps {
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
 * JavaSDK Component
 * 
 * Displays documentation for the Java SDK.
 */
const JavaSDK: React.FC<JavaSDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'maven',
      name: 'Maven',
      command: `<dependency>
  <groupId>com.varai</groupId>
  <artifactId>varai-sdk</artifactId>
  <version>${version}</version>
</dependency>`,
      language: 'xml'
    },
    {
      id: 'gradle',
      name: 'Gradle',
      command: `implementation 'com.varai:varai-sdk:${version}'`,
      language: 'groovy'
    }
  ];

  // Authentication example
  const authExample = `
// Import the SDK
import com.varai.VaraiClient;
import com.varai.exception.ApiException;

public class AuthExample {
    public static void main(String[] args) {
        // Initialize the client with your API key
        VaraiClient client = new VaraiClient.Builder()
            .apiKey("your-api-key")
            .environment("production") // or "sandbox" for testing
            .build();
        
        // Verify authentication
        try {
            Object response = client.auth().verify();
            System.out.println("Authentication successful: " + response);
        } catch (ApiException e) {
            System.out.println("Authentication failed: " + e.getMessage());
        }
    }
}
`;

  // First request example
  const firstRequestExample = `
// Import the SDK
import com.varai.VaraiClient;
import com.varai.exception.ApiException;
import com.varai.model.Frame;
import com.varai.model.FrameListResponse;

public class FirstRequestExample {
    public static void main(String[] args) {
        // Initialize the client
        VaraiClient client = new VaraiClient.Builder()
            .apiKey("your-api-key")
            .build();
        
        // Get a list of available frames
        try {
            FrameListResponse frames = client.frames().list();
            System.out.println("Available frames: " + frames);
        } catch (ApiException e) {
            System.out.println("Error fetching frames: " + e.getMessage());
        }
    }
}
`;

  return (
    <div id="java-sdk">
      {/* Installation Section */}
      <SectionContainer id="java-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="java"
          sdkName="VARAi Java"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="java-quickstart">
        <SectionTitle variant="h3" id="java-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi Java SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="java-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="java"
        />
        
        <SectionTitle variant="h4" id="java-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="java"
        />
      </SectionContainer>
      
      {/* Coming Soon Message */}
      <SectionContainer>
        <SectionTitle variant="h3">
          More Documentation Coming Soon
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          We're working on expanding our Java SDK documentation. Check back soon for more detailed guides, API references, and examples.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          In the meantime, you can refer to the JavaScript or Python SDK documentation for a better understanding of the available features and functionality.
        </Typography>
      </SectionContainer>
    </div>
  );
};

export default JavaSDK;