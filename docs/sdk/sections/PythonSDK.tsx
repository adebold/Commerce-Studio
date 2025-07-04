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

interface PythonSDKProps {
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
 * PythonSDK Component
 * 
 * Displays documentation for the Python SDK.
 */
const PythonSDK: React.FC<PythonSDKProps> = ({ version }) => {
  // Package manager configurations for installation instructions
  const packageManagers = [
    {
      id: 'pip',
      name: 'Pip',
      command: `pip install varai-sdk==${version}`,
      language: 'bash'
    },
    {
      id: 'poetry',
      name: 'Poetry',
      command: `poetry add varai-sdk==${version}`,
      language: 'bash'
    }
  ];

  // Authentication example
  const authExample = `
# Import the SDK
from varai import VaraiClient

# Initialize the client with your API key
client = VaraiClient(
    api_key="process.env.API_KEY_256",
    environment="production"  # or "sandbox" for testing
)

# Verify authentication
try:
    response = client.auth.verify()
    print(f"Authentication successful: {response}")
except Exception as e:
    print(f"Authentication failed: {e}")
`;

  // First request example
  const firstRequestExample = `
# Import the SDK
from varai import VaraiClient

# Initialize the client
client = VaraiClient(api_key="process.env.API_KEY_256")

# Get a list of available frames
try:
    frames = client.frames.list()
    print(f"Available frames: {frames}")
except Exception as e:
    print(f"Error fetching frames: {e}")
`;

  // Recommendations example
  const recommendationsExample = `
# Get personalized frame recommendations
try:
    recommendations = client.recommendations.get_personalized(
        user_id="user-123",
        face_shape="oval",
        preferences={
            "styles": ["round", "cat-eye"],
            "colors": ["black", "tortoise"],
            "materials": ["acetate"]
        },
        limit=10
    )
    print(f"Personalized recommendations: {recommendations}")
except Exception as e:
    print(f"Error getting recommendations: {e}")
`;

  // Virtual try-on example
  const virtualTryOnExample = `
# Generate a virtual try-on image
try:
    result = client.virtual_try_on.generate(
        user_id="user-123",
        face_image_url="https://example.com/user-face.jpg",
        frame_id="frame-456"
    )
    print(f"Virtual try-on image URL: {result.image_url}")
except Exception as e:
    print(f"Error generating virtual try-on: {e}")
`;

  // Error handling example
  const errorHandlingExample = `
# Import error types
from varai import VaraiClient
from varai.exceptions import (
    ApiError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    NetworkError
)

# Initialize the client
client = VaraiClient(api_key="process.env.API_KEY_256")

# Example with proper error handling
try:
    frame = client.frames.get("non-existent-frame-id")
    print(f"Frame details: {frame}")
except AuthenticationError as e:
    print(f"Authentication failed. Check your API key: {e}")
except ValidationError as e:
    print(f"Validation error: {e.details}")
except RateLimitError as e:
    print(f"Rate limit exceeded. Retry after {e.retry_after} seconds")
except ApiError as e:
    print(f"API error: {e.message} (Status: {e.status_code})")
except NetworkError as e:
    print(f"Network error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
`;

  // Webhooks example
  const webhooksExample = `
# Register a webhook
try:
    webhook = client.webhooks.create(
        url="https://your-app.com/webhooks/varai",
        events=["recommendation.created", "virtual-try-on.completed"],
        secret="process.env.PYTHONSDK_SECRET_1"
    )
    print(f"Webhook registered: {webhook}")
except Exception as e:
    print(f"Error registering webhook: {e}")

# Verify a webhook signature (in your webhook handler)
from flask import Flask, request, jsonify
from varai import verify_webhook_signature

app = Flask(__name__)

@app.route("/webhooks/varai", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-Varai-Signature")
    webhook_secret = "process.env.PYTHONSDK_SECRET_1"
    
    try:
        # Verify the webhook signature
        is_valid = verify_webhook_signature(
            payload=request.json,
            signature=signature,
            secret=webhook_secret
        )
        
        if is_valid:
            # Process the webhook event
            event = request.json
            print(f"Received valid webhook event: {event}")
            
            # Handle different event types
            event_type = event.get("type")
            if event_type == "recommendation.created":
                # Handle recommendation event
                pass
            elif event_type == "virtual-try-on.completed":
                # Handle virtual try-on event
                pass
            else:
                print(f"Unhandled event type: {event_type}")
            
            return jsonify({"status": "success"}), 200
        else:
            print("Invalid webhook signature")
            return jsonify({"error": "Invalid signature"}), 401
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return jsonify({"error": "Error processing webhook"}), 500

if __name__ == "__main__":
    app.run(port=3000)
`;

  // Pagination example
  const paginationExample = `
# List frames with pagination
def list_all_frames():
    all_frames = []
    has_more = True
    cursor = None
    
    while has_more:
        try:
            response = client.frames.list(
                limit=100,
                cursor=cursor
            )
            
            all_frames.extend(response.data)
            
            if response.pagination.has_more:
                cursor = response.pagination.next_cursor
            else:
                has_more = False
        except Exception as e:
            print(f"Error fetching frames: {e}")
            has_more = False
    
    return all_frames

# Usage
frames = list_all_frames()
print(f"Retrieved {len(frames)} frames")
`;

  // Async/await example
  const asyncAwaitExample = `
# Using the SDK with async/await
import asyncio
from varai import AsyncVaraiClient

async def get_frame_recommendations():
    # Initialize the async client
    client = AsyncVaraiClient(api_key="process.env.API_KEY_256")
    
    try:
        # Get a frame
        frame = await client.frames.get("frame-123")
        print(f"Frame: {frame}")
        
        # Get recommendations based on the frame
        recommendations = await client.recommendations.get_similar(
            frame_id=frame.id,
            limit=5
        )
        print(f"Similar frames: {recommendations}")
        
        return recommendations
    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        # Close the client when done
        await client.close()

# Run the async function
asyncio.run(get_frame_recommendations())
`;

  return (
    <div id="python-sdk">
      {/* Installation Section */}
      <SectionContainer id="py-installation">
        <InstallationInstructions
          packageManagers={packageManagers}
          language="python"
          sdkName="VARAi Python"
          version={version}
        />
      </SectionContainer>
      
      {/* Quick Start Section */}
      <SectionContainer id="py-quickstart">
        <SectionTitle variant="h3" id="py-quickstart">
          Quick Start
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Get started quickly with the VARAi Python SDK. This guide will help you authenticate with the API and make your first request.
        </Typography>
        
        <SectionTitle variant="h4" id="py-authentication">
          Authentication
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          To use the VARAi SDK, you need an API key. You can get one by signing up for a VARAi account and generating an API key in the dashboard.
        </Typography>
        
        <CodeExample
          title="Authentication Example"
          description="Initialize the SDK with your API key and verify authentication:"
          code={authExample}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-first-request">
          Making Your First Request
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Once you've authenticated, you can start making requests to the VARAi API. Here's an example of fetching a list of available frames:
        </Typography>
        
        <CodeExample
          title="First API Request"
          description="Fetch a list of available frames:"
          code={firstRequestExample}
          language="python"
        />
      </SectionContainer>
      
      {/* Core Concepts Section */}
      <SectionContainer id="py-core-concepts">
        <SectionTitle variant="h3">
          Core Concepts
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The VARAi Python SDK is organized around a few core concepts:
        </Typography>
        
        <SectionTitle variant="h4" id="py-client">
          Client
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The <code>VaraiClient</code> is the main entry point to the SDK. It provides access to all the API resources and handles authentication, request formatting, and error handling.
        </Typography>
        
        <SectionTitle variant="h4" id="py-frames">
          Frames
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Frames API allows you to access VARAi's database of eyewear frames. You can list frames, get details about specific frames, and filter frames by various criteria.
        </Typography>
        
        <SectionTitle variant="h4" id="py-recommendations">
          Recommendations
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Recommendations API provides personalized eyewear recommendations based on user preferences, face shape, and other factors.
        </Typography>
        
        <CodeExample
          title="Getting Personalized Recommendations"
          description="Get personalized frame recommendations for a user:"
          code={recommendationsExample}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-virtual-try-on">
          Virtual Try-On
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The Virtual Try-On API allows you to generate images of users wearing specific frames, providing a virtual try-on experience.
        </Typography>
        
        <CodeExample
          title="Generating a Virtual Try-On Image"
          description="Generate a virtual try-on image for a user and frame:"
          code={virtualTryOnExample}
          language="python"
        />
      </SectionContainer>
      
      {/* API Reference Section */}
      <SectionContainer id="py-api-reference">
        <SectionTitle variant="h3">
          API Reference
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Detailed reference documentation for all classes and methods in the VARAi Python SDK.
        </Typography>
        
        <ClassReference
          name="VaraiClient"
          description="The main client class for interacting with the VARAi API."
          properties={[
            {
              name: "api_key",
              type: "str",
              description: "Your VARAi API key.",
              readonly: true
            },
            {
              name: "environment",
              type: "str",
              description: "The API environment to use ('production' or 'sandbox').",
              defaultValue: "'production'"
            },
            {
              name: "base_url",
              type: "str",
              description: "The base URL for API requests.",
              defaultValue: "'https://api.varai.com'"
            },
            {
              name: "timeout",
              type: "float",
              description: "Request timeout in seconds.",
              defaultValue: "30.0"
            }
          ]}
          methods={[
            {
              name: "__init__",
              signature: "__init__(api_key: str, environment: str = 'production', **kwargs)",
              description: "Creates a new instance of the VaraiClient.",
              parameters: [
                {
                  name: "api_key",
                  type: "str",
                  description: "Your VARAi API key.",
                  required: true
                },
                {
                  name: "environment",
                  type: "str",
                  description: "The API environment to use ('production' or 'sandbox').",
                  required: false,
                  defaultValue: "'production'"
                },
                {
                  name: "**kwargs",
                  type: "dict",
                  description: "Additional configuration options for the client.",
                  required: false
                }
              ],
              examples: [
                {
                  code: `
# Basic initialization
client = VaraiClient(api_key="process.env.API_KEY_256")

# Advanced initialization
client = VaraiClient(
    api_key="process.env.API_KEY_256",
    environment="production",
    timeout=60.0,
    retries=3
)`,
                  language: "python"
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
              signature: "list(brand: str = None, style: str = None, color: str = None, material: str = None, gender: str = None, limit: int = 20, cursor: str = None) -> FrameListResponse",
              description: "Lists available frames with optional filtering.",
              parameters: [
                {
                  name: "brand",
                  type: "str",
                  description: "Filter frames by brand.",
                  required: false
                },
                {
                  name: "style",
                  type: "str",
                  description: "Filter frames by style.",
                  required: false
                },
                {
                  name: "color",
                  type: "str",
                  description: "Filter frames by color.",
                  required: false
                },
                {
                  name: "material",
                  type: "str",
                  description: "Filter frames by material.",
                  required: false
                },
                {
                  name: "gender",
                  type: "str",
                  description: "Filter frames by gender.",
                  required: false
                },
                {
                  name: "limit",
                  type: "int",
                  description: "Maximum number of frames to return.",
                  required: false,
                  defaultValue: "20"
                },
                {
                  name: "cursor",
                  type: "str",
                  description: "Pagination cursor for fetching the next page.",
                  required: false
                }
              ],
              returnType: {
                type: "FrameListResponse",
                description: "A response object containing the list of frames and pagination information."
              },
              examples: [
                {
                  code: `
# List all frames
frames = client.frames.list()
print(f"Frames: {frames.data}")

# List frames with filtering
frames = client.frames.list(
    brand="ray-ban",
    style="round",
    limit=20
)
print(f"Filtered frames: {frames.data}")`,
                  language: "python"
                }
              ]
            },
            {
              name: "get",
              signature: "get(frame_id: str) -> Frame",
              description: "Gets details for a specific frame.",
              parameters: [
                {
                  name: "frame_id",
                  type: "str",
                  description: "The ID of the frame to retrieve.",
                  required: true
                }
              ],
              returnType: {
                type: "Frame",
                description: "A Frame object containing the frame details."
              },
              examples: [
                {
                  code: `
# Get a specific frame
frame = client.frames.get("frame-123")
print(f"Frame details: {frame}")`,
                  language: "python"
                }
              ]
            }
          ]}
        />
      </SectionContainer>
      
      {/* Code Examples Section */}
      <SectionContainer id="py-examples">
        <SectionTitle variant="h3">
          Code Examples
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Examples of common use cases with the VARAi Python SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="py-example-frames">
          Working with Frames
        </SectionTitle>
        
        <CodeExample
          title="Listing and Filtering Frames"
          description="List frames with filtering and pagination:"
          code={`
# List frames with filtering
frames = client.frames.list(
    brand="ray-ban",
    style="round",
    color="black",
    material="metal",
    gender="unisex",
    limit=20,
    cursor="next-page-cursor"
)
print(f"Frames: {frames.data}")
print(f"Pagination: {frames.pagination}")
`}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-example-recommendations">
          Getting Recommendations
        </SectionTitle>
        
        <CodeExample
          title="Similar Frame Recommendations"
          description="Get recommendations for frames similar to a specific frame:"
          code={`
# Get similar frame recommendations
try:
    recommendations = client.recommendations.get_similar(
        frame_id="frame-123",
        limit=5
    )
    print(f"Similar frames: {recommendations}")
except Exception as e:
    print(f"Error getting similar frames: {e}")
`}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-example-async">
          Async/Await Support
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The SDK also provides an async client for use with Python's async/await syntax:
        </Typography>
        
        <CodeExample
          title="Using Async/Await"
          description="Use the async client with async/await syntax:"
          code={asyncAwaitExample}
          language="python"
        />
      </SectionContainer>
      
      {/* Error Handling Section */}
      <SectionContainer id="py-error-handling">
        <SectionTitle variant="h3">
          Error Handling
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The VARAi SDK provides structured error handling to help you debug and handle errors in your application.
        </Typography>
        
        <SectionTitle variant="h4" id="py-error-types">
          Error Types
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The SDK exports several exception classes that you can use to handle different types of errors:
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
        
        <SectionTitle variant="h4" id="py-error-handling">
          Handling Errors
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          You can use these exception classes to handle different types of errors in your application:
        </Typography>
        
        <CodeExample
          title="Error Handling Example"
          description="Handle different types of errors:"
          code={errorHandlingExample}
          language="python"
        />
      </SectionContainer>
      
      {/* Advanced Usage Section */}
      <SectionContainer id="py-advanced">
        <SectionTitle variant="h3">
          Advanced Usage
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Advanced features and techniques for using the VARAi Python SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="py-advanced-config">
          Advanced Configuration
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          The SDK supports advanced configuration options for customizing its behavior:
        </Typography>
        
        <CodeExample
          title="Advanced Client Configuration"
          description="Configure the client with advanced options:"
          code={`
# Import the SDK
from varai import VaraiClient

# Initialize with advanced options
client = VaraiClient(
    api_key="process.env.API_KEY_256",
    environment="production",
    base_url="https://api.custom-domain.com",  # Custom API domain
    timeout=60.0,  # 60 second timeout
    retries=3,  # Retry failed requests up to 3 times
    headers={  # Custom headers for all requests
        "X-Custom-Header": "custom-value"
    },
    on_request=lambda request: print(f"Making request: {request}"),  # Request hook
    on_response=lambda response: print(f"Received response: {response}"),  # Response hook
    on_error=lambda error: print(f"Request error: {error}")  # Error hook
)
`}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-webhooks">
          Working with Webhooks
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Webhooks allow you to receive real-time notifications when events occur in the VARAi system:
        </Typography>
        
        <CodeExample
          title="Webhooks Example"
          description="Register and handle webhooks:"
          code={webhooksExample}
          language="python"
        />
        
        <SectionTitle variant="h4" id="py-pagination">
          Pagination
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          For endpoints that return large collections of items, the SDK provides pagination support:
        </Typography>
        
        <CodeExample
          title="Pagination Example"
          description="Handle paginated responses:"
          code={paginationExample}
          language="python"
        />
      </SectionContainer>
      
      {/* Migration Guides Section */}
      <SectionContainer id="py-migration">
        <SectionTitle variant="h3">
          Migration Guides
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Guides for migrating from previous versions of the SDK.
        </Typography>
        
        <SectionTitle variant="h4" id="py-migrate-v0-to-v1">
          Migrating from v0.x to v1.0
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          Version 1.0 of the SDK includes several breaking changes from the 0.x versions:
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Client Initialization:</strong> The client now accepts keyword arguments for configuration.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Error Handling:</strong> New exception classes have been introduced for more specific error handling.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Response Format:</strong> All responses now include metadata and pagination information.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Async Support:</strong> Added support for async/await with the AsyncVaraiClient.
            </Typography>
          </li>
        </ul>
        
        <CodeExample
          title="Migration Example"
          description="Update your code from v0.x to v1.0:"
          code={`
# v0.x
from varai import VaraiClient

client = VaraiClient("process.env.API_KEY_256", "production")

frames = client.get_frames(brand="ray-ban")
print(f"Frames: {frames}")

# v1.0
from varai import VaraiClient
from varai.exceptions import ApiError

client = VaraiClient(
    api_key="process.env.API_KEY_256",
    environment="production"
)

try:
    response = client.frames.list(brand="ray-ban")
    print(f"Frames: {response.data}")
    print(f"Pagination: {response.pagination}")
except ApiError as e:
    print(f"API error: {e.message} (Status: {e.status_code})")
except Exception as e:
    print(f"Unexpected error: {e}")
`}
          language="python"
        />
      </SectionContainer>
      
      {/* Changelog Section */}
      <SectionContainer id="py-changelog">
        <SectionTitle variant="h3">
          Changelog
        </SectionTitle>
        
        <Typography variant="body1" gutterBottom>
          History of changes in the VARAi Python SDK.
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
              Added async/await support
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              Improved error handling
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

export default PythonSDK;