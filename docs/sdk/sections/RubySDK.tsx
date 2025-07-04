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

interface RubySDKProps {
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
 * RubySDK Component
 * 
 * Displays documentation for the Ruby SDK.
 */
const RubySDK: React.FC<RubySDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'gem',
      name: 'Gem',
      command: `gem install varai-sdk -v ${version}`,
      language: 'bash'
    },
    {
      id: 'bundler',
      name: 'Bundler',
      command: `# Add to your Gemfile
gem 'varai-sdk', '~> ${version}'

# Then run
bundle install`,
      language: 'ruby'
    }
  ];

  // Authentication example
  const authExample = `
# Import the SDK
require 'varai'

# Initialize the client with your API key
client = Varai::Client.new(
  api_key: 'process.env.API_KEY_272',
  environment: 'production' # or 'sandbox' for testing
)

# Verify authentication
begin
  response = client.auth.verify
  puts "Authentication successful: #{response}"
rescue => e
  puts "Authentication failed: #{e.message}"
end
`;

  // First request example
  const firstRequestExample = `
# Import the SDK
require 'varai'

# Initialize the client
client = Varai::Client.new(api_key: 'process.env.API_KEY_272')

# Get a list of available frames
begin
  frames = client.frames.list
  puts "Available frames: #{frames}"
rescue => e
  puts "Error fetching frames: #{e.message}"
end
`;

  return (
    <div id="ruby-sdk">
      {/* Installation Section */}
      <SectionContainer id="rb-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="ruby"
          sdkName="VARAi Ruby"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="rb-quickstart">
        <SectionTitle variant="h3" id="rb-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi Ruby SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="rb-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="ruby"
        />
        
        <SectionTitle variant="h4" id="rb-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="ruby"
        />
      </SectionContainer>
      
      {/* Coming Soon Message */}
      <SectionContainer>
        <SectionTitle variant="h3">
          More Documentation Coming Soon
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          We're working on expanding our Ruby SDK documentation. Check back soon for more detailed guides, API references, and examples.
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          In the meantime, you can refer to the JavaScript or Python SDK documentation for a better understanding of the available features and functionality.
        </Typography>
      </SectionContainer>
    </div>
  );
};

export default RubySDK;