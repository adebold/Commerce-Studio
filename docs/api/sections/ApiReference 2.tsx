import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { ApiEndpoint } from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SubSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

/**
 * ApiReference Component
 * 
 * Documentation for the VARAi API endpoints.
 */
const ApiReference: React.FC = () => {
  return (
    <SectionContainer id="api-reference">
      <Typography variant="h2" gutterBottom>
        API Reference
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        This section provides detailed information about all available VARAi API endpoints.
        Each endpoint includes information about the request parameters, response format, and examples.
      </Typography>
      
      <SubSection id="frames-api">
        <Typography variant="h3" gutterBottom>
          Frames API
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The Frames API allows you to manage and query the eyewear frames catalog.
        </Typography>
        
        <ApiEndpoint
          method="GET"
          path="/v1/frames"
          description="Retrieve a list of frames with optional filtering."
          requestParams={[
            { name: "brand", type: "string", required: false, description: "Filter frames by brand name" },
            { name: "style", type: "string", required: false, description: "Filter frames by style (e.g., 'round', 'rectangle')" },
            { name: "material", type: "string", required: false, description: "Filter frames by material (e.g., 'acetate', 'metal')" },
            { name: "color", type: "string", required: false, description: "Filter frames by color" },
            { name: "page", type: "integer", required: false, description: "Page number for pagination (default: 1)" },
            { name: "limit", type: "integer", required: false, description: "Number of results per page (default: 20, max: 100)" }
          ]}
          responseExample={`{
  "success": true,
  "data": {
    "frames": [
      {
        "id": "f12345",
        "name": "Classic Wayframe",
        "brand": "RayBender",
        "style": "rectangle",
        "material": "acetate",
        "color": "tortoise",
        "price": 129.99,
        "dimensions": {
          "bridge": 20,
          "temple": 145,
          "lens_width": 52,
          "lens_height": 35
        },
        "images": [
          {
            "url": "https://assets.varai.ai/frames/f12345/front.jpg",
            "type": "front"
          },
          {
            "url": "https://assets.varai.ai/frames/f12345/side.jpg",
            "type": "side"
          }
        ],
        "created_at": "2025-01-15T12:00:00Z",
        "updated_at": "2025-03-20T09:30:00Z"
      },
      // More frames...
    ],
    "pagination": {
      "total": 256,
      "page": 1,
      "limit": 20,
      "pages": 13
    }
  }
}`}
        />
        
        <ApiEndpoint
          method="GET"
          path="/v1/frames/{frame_id}"
          description="Retrieve detailed information about a specific frame."
          requestParams={[
            { name: "frame_id", type: "string", required: true, description: "The unique identifier of the frame" }
          ]}
          responseExample={`{
  "success": true,
  "data": {
    "id": "f12345",
    "name": "Classic Wayframe",
    "brand": "RayBender",
    "style": "rectangle",
    "material": "acetate",
    "color": "tortoise",
    "price": 129.99,
    "description": "A timeless design that never goes out of style. These classic rectangular frames offer a sophisticated look for any occasion.",
    "dimensions": {
      "bridge": 20,
      "temple": 145,
      "lens_width": 52,
      "lens_height": 35,
      "total_width": 140
    },
    "weight": 28,
    "images": [
      {
        "url": "https://assets.varai.ai/frames/f12345/front.jpg",
        "type": "front"
      },
      {
        "url": "https://assets.varai.ai/frames/f12345/side.jpg",
        "type": "side"
      },
      {
        "url": "https://assets.varai.ai/frames/f12345/angle.jpg",
        "type": "angle"
      },
      {
        "url": "https://assets.varai.ai/frames/f12345/detail.jpg",
        "type": "detail"
      }
    ],
    "colors": [
      {
        "id": "tortoise",
        "name": "Tortoise",
        "hex": "#8B4513",
        "image_url": "https://assets.varai.ai/frames/f12345/colors/tortoise.jpg"
      },
      {
        "id": "black",
        "name": "Matte Black",
        "hex": "#000000",
        "image_url": "https://assets.varai.ai/frames/f12345/colors/black.jpg"
      },
      {
        "id": "crystal",
        "name": "Crystal Clear",
        "hex": "#F5F5F5",
        "image_url": "https://assets.varai.ai/frames/f12345/colors/crystal.jpg"
      }
    ],
    "features": [
      "Spring hinges",
      "Adjustable nose pads",
      "Anti-reflective coating option",
      "UV protection"
    ],
    "fit": "medium",
    "face_shapes": ["oval", "square", "heart"],
    "created_at": "2025-01-15T12:00:00Z",
    "updated_at": "2025-03-20T09:30:00Z"
  }
}`}
        />
      </SubSection>
      
      <SubSection id="recommendations-api">
        <Typography variant="h3" gutterBottom>
          Recommendations API
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The Recommendations API provides personalized eyewear recommendations based on user preferences,
          face shape, and other factors.
        </Typography>
        
        <ApiEndpoint
          method="POST"
          path="/v1/recommendations"
          description="Generate personalized frame recommendations based on user data and preferences."
          requestParams={[
            { name: "user_id", type: "string", required: false, description: "User identifier for personalized recommendations" },
            { name: "face_image", type: "string", required: false, description: "Base64-encoded image of the user's face" },
            { name: "face_shape", type: "string", required: false, description: "User's face shape (if known)" },
            { name: "preferences", type: "object", required: false, description: "User preferences for recommendations" }
          ]}
          requestExample={`{
  "user_id": "u78901",
  "face_shape": "oval",
  "preferences": {
    "styles": ["round", "cat-eye"],
    "materials": ["acetate"],
    "colors": ["black", "tortoise"],
    "price_range": {
      "min": 80,
      "max": 200
    }
  }
}`}
          responseExample={`{
  "success": true,
  "data": {
    "recommendations": [
      {
        "frame_id": "f45678",
        "name": "Roundview Classic",
        "brand": "OpticalVision",
        "style": "round",
        "material": "acetate",
        "color": "tortoise",
        "price": 149.99,
        "match_score": 0.92,
        "match_reasons": [
          "Matches preferred style: round",
          "Matches preferred material: acetate",
          "Matches preferred color: tortoise",
          "Complements oval face shape"
        ],
        "image_url": "https://assets.varai.ai/frames/f45678/front.jpg"
      },
      {
        "frame_id": "f23456",
        "name": "Feline Flair",
        "brand": "ChicEyewear",
        "style": "cat-eye",
        "material": "acetate",
        "color": "black",
        "price": 129.99,
        "match_score": 0.89,
        "match_reasons": [
          "Matches preferred style: cat-eye",
          "Matches preferred material: acetate",
          "Matches preferred color: black",
          "Complements oval face shape"
        ],
        "image_url": "https://assets.varai.ai/frames/f23456/front.jpg"
      },
      // More recommendations...
    ],
    "recommendation_id": "rec_789012",
    "created_at": "2025-04-29T12:34:56Z"
  }
}`}
        />
      </SubSection>
      
      <SubSection id="users-api">
        <Typography variant="h3" gutterBottom>
          Users API
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The Users API allows you to manage user profiles and preferences.
        </Typography>
        
        <ApiEndpoint
          method="GET"
          path="/v1/users/{user_id}"
          description="Retrieve a user's profile information."
          requestParams={[
            { name: "user_id", type: "string", required: true, description: "The unique identifier of the user" }
          ]}
          responseExample={`{
  "success": true,
  "data": {
    "id": "u78901",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "face_shape": "oval",
    "preferences": {
      "styles": ["round", "cat-eye"],
      "materials": ["acetate"],
      "colors": ["black", "tortoise"],
      "price_range": {
        "min": 80,
        "max": 200
      }
    },
    "measurements": {
      "pupillary_distance": 62,
      "face_width": 135
    },
    "created_at": "2024-11-15T08:30:00Z",
    "updated_at": "2025-03-10T14:45:00Z"
  }
}`}
        />
        
        <ApiEndpoint
          method="POST"
          path="/v1/users/{user_id}/preferences"
          description="Update a user's preferences."
          requestParams={[
            { name: "user_id", type: "string", required: true, description: "The unique identifier of the user" },
            { name: "preferences", type: "object", required: true, description: "User preferences to update" }
          ]}
          requestExample={`{
  "preferences": {
    "styles": ["round", "cat-eye", "rectangle"],
    "materials": ["acetate", "metal"],
    "colors": ["black", "tortoise", "gold"],
    "price_range": {
      "min": 100,
      "max": 300
    }
  }
}`}
          responseExample={`{
  "success": true,
  "data": {
    "id": "u78901",
    "preferences": {
      "styles": ["round", "cat-eye", "rectangle"],
      "materials": ["acetate", "metal"],
      "colors": ["black", "tortoise", "gold"],
      "price_range": {
        "min": 100,
        "max": 300
      }
    },
    "updated_at": "2025-04-29T12:34:56Z"
  }
}`}
        />
      </SubSection>
    </SectionContainer>
  );
};

export default ApiReference;