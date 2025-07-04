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

interface JavaScriptSDKProps {
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
 * JavaScriptSDK Component
 * 
 * Displays documentation for the JavaScript/TypeScript SDK.
 */
const JavaScriptSDK: React.FC<JavaScriptSDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'npm',
      name: 'NPM',
      command: `npm install @varai/sdk@${version}`,
      language: 'bash'
    },
    {
      id: 'yarn',
      name: 'Yarn',
      command: `yarn add @varai/sdk@${version}`,
      language: 'bash'
    },
    {
      id: 'cdn',
      name: 'CDN',
      command: `<script src="https://cdn.varai.com/sdk/js/${version}/varai-sdk.min.js"></script>`,
      language: 'html'
    }
  ];

  // Authentication example
  const authExample = `
// Import the SDK
import { VaraiClient } from '@varai/sdk';

// Initialize the client with your API key
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557',
  environment: 'production' // or 'sandbox' for testing
});

// Verify authentication
client.auth.verify()
  .then(response => {
    console.log('Authentication successful:', response);
  })
  .catch(error => {
    console.error('Authentication failed:', error);
  });
`;

  // First request example
  const firstRequestExample = `
// Import the SDK
import { VaraiClient } from '@varai/sdk';

// Initialize the client
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557'
});

// Get a list of available frames
client.frames.list()
  .then(frames => {
    console.log('Available frames:', frames);
  })
  .catch(error => {
    console.error('Error fetching frames:', error);
  });
`;

  // Recommendations example
  const recommendationsExample = `
// Get personalized frame recommendations
client.recommendations.getPersonalized({
  userId: 'user-123',
  faceShape: 'oval',
  preferences: {
    styles: ['round', 'cat-eye'],
    colors: ['black', 'tortoise'],
    materials: ['acetate']
  },
  limit: 10
})
  .then(recommendations => {
    console.log('Personalized recommendations:', recommendations);
  })
  .catch(error => {
    console.error('Error getting recommendations:', error);
  });
`;

  // Virtual try-on example
  const virtualTryOnExample = `
// Generate a virtual try-on image
client.virtualTryOn.generate({
  userId: 'user-123',
  faceImageUrl: 'https://example.com/user-face.jpg',
  frameId: 'frame-456'
})
  .then(result => {
    console.log('Virtual try-on image URL:', result.imageUrl);
  })
  .catch(error => {
    console.error('Error generating virtual try-on:', error);
  });
`;

  // Error handling example
  const errorHandlingExample = `
// Import error types
import { VaraiClient, ApiError, AuthenticationError, ValidationError } from '@varai/sdk';

// Initialize the client
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557'
});

// Example with proper error handling
client.frames.get('non-existent-frame-id')
  .then(frame => {
    console.log('Frame details:', frame);
  })
  .catch(error => {
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed. Check your API key.');
    } else if (error instanceof ValidationError) {
      console.error('Validation error:', error.details);
    } else if (error instanceof ApiError) {
      console.error(\`API error: \${error.message} (Status: \${error.statusCode})\`);
    } else {
      console.error('Unexpected error:', error);
    }
  });
`;

  // Webhooks example
  const webhooksExample = `
// Register a webhook
client.webhooks.create({
  url: 'https://your-app.com/webhooks/varai',
  events: ['recommendation.created', 'virtual-try-on.completed'],
  secret: 'process.env.JAVASCRIPTSDK_SECRET_1'
})
  .then(webhook => {
    console.log('Webhook registered:', webhook);
  })
  .catch(error => {
    console.error('Error registering webhook:', error);
  });

// Verify a webhook signature (in your webhook handler)
import express from 'express';
import { VaraiClient, verifyWebhookSignature } from '@varai/sdk';

const app = express();
app.use(express.json());

app.post('/webhooks/varai', (req, res) => {
  const signature = req.headers['x-varai-signature'];
  const webhookSecret = 'process.env.JAVASCRIPTSDK_SECRET_1';
  
  try {
    // Verify the webhook signature
    const isValid = verifyWebhookSignature({
      payload: req.body,
      signature,
      secret: webhookSecret
    });
    
    if (isValid) {
      // Process the webhook event
      const event = req.body;
      console.log('Received valid webhook event:', event);
      
      // Handle different event types
      switch (event.type) {
        case 'recommendation.created':
          // Handle recommendation event
          break;
        case 'virtual-try-on.completed':
          // Handle virtual try-on event
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      res.status(200).send('Webhook received');
    } else {
      console.error('Invalid webhook signature');
      res.status(401).send('Invalid signature');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
`;

  // Pagination example
  const paginationExample = `
// List frames with pagination
async function listAllFrames() {
  let allFrames = [];
  let hasMore = true;
  let cursor = null;
  
  while (hasMore) {
    try {
      const response = await client.frames.list({
        limit: 100,
        cursor
      });
      
      allFrames = [...allFrames, ...response.data];
      
      if (response.pagination.hasMore) {
        cursor = response.pagination.nextCursor;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error fetching frames:', error);
      hasMore = false;
    }
  }
  
  return allFrames;
}

// Usage
listAllFrames()
  .then(frames => {
    console.log(\`Retrieved \${frames.length} frames\`);
  });
`;

  return (
    <div id="javascript-sdk">
      {/* Installation Section */}
      <SectionContainer id="js-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="javascript"
          sdkName="VARAi JavaScript/TypeScript"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="js-quickstart">
        <SectionTitle variant="h3" id="js-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi JavaScript/TypeScript SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="js-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="javascript"
        />
        
        <SectionTitle variant="h4" id="js-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="javascript"
        />
      </SectionContainer>
      
      {/* Core Concepts Section */}
      <SectionContainer id="js-core-concepts">
        <SectionTitle variant="h3">
          Core Concepts
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The VARAi JavaScript SDK is organized around a few core concepts:
        </Typography>
        
        <SectionTitle variant="h4" id="js-client">
          Client
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The <code>VaraiClient</code> is the main entry point to the SDK. It provides access to all the API resources and handles authentication, request formatting, and error handling.
        </Typography>
        
        <SectionTitle variant="h4" id="js-frames">
          Frames
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Frames API allows you to access VARAi's database of eyewear frames. You can list frames, get details about specific frames, and filter frames by various criteria.
        </Typography>
        
        <SectionTitle variant="h4" id="js-recommendations">
          Recommendations
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Recommendations API provides personalized eyewear recommendations based on user preferences, face shape, and other factors.
        </Typography>
        
        <CodeExample
          title="Getting Personalized Recommendations"
          description="Get personalized frame recommendations for a user:"
          code={recommendationsExample}
          language="javascript"
        />
        
        <SectionTitle variant="h4" id="js-virtual-try-on">
          Virtual Try-On
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Virtual Try-On API allows you to generate images of users wearing specific frames, providing a virtual try-on experience.
        </Typography>
        
        <CodeExample
          title="Generating a Virtual Try-On Image"
          description="Generate a virtual try-on image for a user and frame:"
          code={virtualTryOnExample}
          language="javascript"
        />
      </SectionContainer>
      
      {/* API Reference Section */}
      <SectionContainer id="js-api-reference">
        <SectionTitle variant="h3">
          API Reference
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Detailed reference documentation for all classes and methods in the VARAi JavaScript SDK.
        </Typography>
        
        <ClassReference
          name="VaraiClient"
          description="The main client class for interacting with the VARAi API."
          properties={[
            {
              name: "apiKey",
              type: "string",
              description: "Your VARAi API key.",
              readonly: true
            },
            {
              name: "environment",
              type: "'production' | 'sandbox'",
              description: "The API environment to use.",
              defaultValue: "'production'"
            },
            {
              name: "baseUrl",
              type: "string",
              description: "The base URL for API requests.",
              defaultValue: "'https://api.varai.com'"
            },
            {
              name: "timeout",
              type: "number",
              description: "Request timeout in milliseconds.",
              defaultValue: "30000"
            }
          ]}
          methods={[
            {
              name: "constructor",
              signature: "constructor(options: VaraiClientOptions)",
              description: "Creates a new instance of the VaraiClient.",
              parameters: [
                {
                  name: "options",
                  type: "VaraiClientOptions",
                  description: "Configuration options for the client.",
                  required: true
                }
              ],
              examples: [
                {
                  code: `
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557',
  environment: 'production',
  timeout: 60000
});`,
                  language: "javascript"
                }
              ]
            }
          ]}
        />
        
        <ClassReference
          name="Frames"
          description="API client for the Frames endpoints."
          methods={[
            {
              name: "list",
              signature: "list(options?: FrameListOptions): Promise<FrameListResponse>",
              description: "Lists available frames with optional filtering.",
              parameters: [
                {
                  name: "options",
                  type: "FrameListOptions",
                  description: "Options for filtering and pagination.",
                  required: false
                }
              ],
              returnType: {
                type: "Promise<FrameListResponse>",
                description: "A promise that resolves to the list of frames."
              },
              examples: [
                {
                  code: `
// List all frames
client.frames.list()
  .then(response => {
    console.log('Frames:', response.data);
  });

// List frames with filtering
client.frames.list({
  brand: 'ray-ban',
  style: 'round',
  limit: 20
})
  .then(response => {
    console.log('Filtered frames:', response.data);
  });`,
                  language: "javascript"
                }
              ]
            },
            {
              name: "get",
              signature: "get(frameId: string): Promise<Frame>",
              description: "Gets details for a specific frame.",
              parameters: [
                {
                  name: "frameId",
                  type: "string",
                  description: "The ID of the frame to retrieve.",
                  required: true
                }
              ],
              returnType: {
                type: "Promise<Frame>",
                description: "A promise that resolves to the frame details."
              },
              examples: [
                {
                  code: `
// Get a specific frame
client.frames.get('frame-123')
  .then(frame => {
    console.log('Frame details:', frame);
  });`,
                  language: "javascript"
                }
              ]
            }
          ]}
        />
        
        <ClassReference
          name="Recommendations"
          description="API client for the Recommendations endpoints."
          methods={[
            {
              name: "getPersonalized",
              signature: "getPersonalized(options: PersonalizedRecommendationOptions): Promise<RecommendationResponse>",
              description: "Gets personalized frame recommendations for a user.",
              parameters: [
                {
                  name: "options",
                  type: "PersonalizedRecommendationOptions",
                  description: "Options for personalized recommendations.",
                  required: true
                }
              ],
              returnType: {
                type: "Promise<RecommendationResponse>",
                description: "A promise that resolves to the recommendation results."
              },
              examples: [
                {
                  code: recommendationsExample,
                  language: "javascript"
                }
              ]
            }
          ]}
        />
      </SectionContainer>
      
      {/* Code Examples Section */}
      <SectionContainer id="js-examples">
        <SectionTitle variant="h3">
          Code Examples
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Examples of common use cases with the VARAi JavaScript SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="js-example-frames">
          Working with Frames
        </SectionTitle>
        
        <CodeExample
          title="Listing and Filtering Frames"
          description="List frames with filtering and pagination:"
          code={`
// List frames with filtering
client.frames.list({
  brand: 'ray-ban',
  style: 'round',
  color: 'black',
  material: 'metal',
  gender: 'unisex',
  limit: 20,
  cursor: 'next-page-cursor'
})
  .then(response => {
    console.log('Frames:', response.data);
    console.log('Pagination:', response.pagination);
  })
  .catch(error => {
    console.error('Error listing frames:', error);
  });
`}
          language="javascript"
        />
        
        <SectionTitle variant="h4" id="js-example-recommendations">
          Getting Recommendations
        </SectionTitle>
        
        <CodeExample
          title="Similar Frame Recommendations"
          description="Get recommendations for frames similar to a specific frame:"
          code={`
// Get similar frame recommendations
client.recommendations.getSimilar({
  frameId: 'frame-123',
  limit: 5
})
  .then(recommendations => {
    console.log('Similar frames:', recommendations);
  })
  .catch(error => {
    console.error('Error getting similar frames:', error);
  });
`}
          language="javascript"
        />
      </SectionContainer>
      
      {/* Error Handling Section */}
      <SectionContainer id="js-error-handling">
        <SectionTitle variant="h3">
          Error Handling
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The VARAi SDK provides structured error handling to help you debug and handle errors in your application.
        </Typography>
        
        <SectionTitle variant="h4" id="js-error-types">
          Error Types
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The SDK exports several error classes that you can use to handle different types of errors:
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <code>ApiError</code>: Base class for all API errors
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <code>AuthenticationError</code>: Errors related to authentication (e.g., invalid API key)
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <code>ValidationError</code>: Errors related to invalid request parameters
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <code>RateLimitError</code>: Errors when you've exceeded your rate limit
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <code>NetworkError</code>: Errors related to network connectivity
            </Typography>
          </li>
        </ul>
        
        <SectionTitle variant="h4" id="js-error-handling">
          Handling Errors
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          You can use these error classes to handle different types of errors in your application:
        </Typography>
        
        <CodeExample
          title="Error Handling Example"
          description="Handle different types of errors:"
          code={errorHandlingExample}
          language="javascript"
        />
      </SectionContainer>
      
      {/* Advanced Usage Section */}
      <SectionContainer id="js-advanced">
        <SectionTitle variant="h3">
          Advanced Usage
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Advanced features and techniques for using the VARAi JavaScript SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="js-advanced-config">
          Advanced Configuration
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The SDK supports advanced configuration options for customizing its behavior:
        </Typography>
        
        <CodeExample
          title="Advanced Client Configuration"
          description="Configure the client with advanced options:"
          code={`
// Import the SDK
import { VaraiClient } from '@varai/sdk';

// Initialize with advanced options
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557',
  environment: 'production',
  baseUrl: 'https://api.custom-domain.com', // Custom API domain
  timeout: 60000, // 60 second timeout
  retries: 3, // Retry failed requests up to 3 times
  headers: { // Custom headers for all requests
    'X-Custom-Header': 'custom-value'
  },
  onRequest: (request) => {
    // Hook called before each request
    console.log('Making request:', request);
  },
  onResponse: (response) => {
    // Hook called after each response
    console.log('Received response:', response);
  },
  onError: (error) => {
    // Hook called when an error occurs
    console.error('Request error:', error);
  }
});
`}
          language="javascript"
        />
        
        <SectionTitle variant="h4" id="js-webhooks">
          Working with Webhooks
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Webhooks allow you to receive real-time notifications when events occur in the VARAi system:
        </Typography>
        
        <CodeExample
          title="Webhooks Example"
          description="Register and handle webhooks:"
          code={webhooksExample}
          language="javascript"
        />
        
        <SectionTitle variant="h4" id="js-pagination">
          Pagination
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          For endpoints that return large collections of items, the SDK provides pagination support:
        </Typography>
        
        <CodeExample
          title="Pagination Example"
          description="Handle paginated responses:"
          code={paginationExample}
          language="javascript"
        />
      </SectionContainer>
      
      {/* Migration Guides Section */}
      <SectionContainer id="js-migration">
        <SectionTitle variant="h3">
          Migration Guides
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Guides for migrating from previous versions of the SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="js-migrate-v0-to-v1">
          Migrating from v0.x to v1.0
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Version 1.0 of the SDK includes several breaking changes from the 0.x versions:
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Client Initialization:</strong> The client now accepts an options object instead of individual parameters.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Error Handling:</strong> New error classes have been introduced for more specific error handling.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Response Format:</strong> All responses now include metadata and pagination information.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>TypeScript Support:</strong> Improved TypeScript definitions with stricter types.
            </Typography>
          </li>
        </ul>
        
        <CodeExample
          title="Migration Example"
          description="Update your code from v0.x to v1.0:"
          code={`
// v0.x
const client = new VaraiClient('process.env.APIKEY_2557', 'production');

client.getFrames({ brand: 'ray-ban' })
  .then(frames => {
    console.log('Frames:', frames);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// v1.0
const client = new VaraiClient({
  apiKey: 'process.env.APIKEY_2557',
  environment: 'production'
});

client.frames.list({ brand: 'ray-ban' })
  .then(response => {
    console.log('Frames:', response.data);
    console.log('Pagination:', response.pagination);
  })
  .catch(error => {
    if (error instanceof ApiError) {
      console.error(\`API error: \${error.message} (Status: \${error.statusCode})\`);
    } else {
      console.error('Unexpected error:', error);
    }
  });
`}
          language="javascript"
        />
      </SectionContainer>
      
      {/* Changelog Section */}
      <SectionContainer id="js-changelog">
        <SectionTitle variant="h3">
          Changelog
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          History of changes in the VARAi JavaScript SDK.
        </Typography>
        
        <SectionTitle variant="h4">
          Version 1.0.0 (Current)
        </SectionTitle>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              Initial stable release
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Complete API coverage
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Improved error handling
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Full TypeScript support
            </Typography>
          </li>
        </ul>
        
        <SectionTitle variant="h4">
          Version 0.9.0
        </SectionTitle>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              Beta release with most API endpoints
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Added webhook support
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Improved documentation
            </Typography>
          </li>
        </ul>
        
        <SectionTitle variant="h4">
          Version 0.8.0
        </SectionTitle>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              Alpha release with basic functionality
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Support for frames and recommendations APIs
            </Typography>
          </li>
        </ul>
      </SectionContainer>
    </div>
  );
};

export default JavaScriptSDK;