# EyewearML REST API Documentation

This document provides detailed specifications for the EyewearML REST API, which underlies the iOS and Android SDKs. The API allows developers to integrate EyewearML's eyewear recommendation and virtual try-on functionalities into their applications.

## Base URL

All API requests should be made to:

```
https://api.eyewear-ml.com/v1
```

## Authentication

The API uses bearer token authentication. Include your API key in the `Authorization` header of your requests:

```
Authorization: Bearer YOUR_API_KEY
```

You can obtain an API key by contacting our developer support team.

## Response Format

All responses are returned in JSON format. A typical successful response will have the following structure:

```json
{
  "data": { ... },  // Response data specific to the endpoint
  "meta": {         // Metadata about the response (optional)
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Error responses have the following structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "A human-readable error message"
  }
}
```

## Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Valid API key but insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Endpoints

### Catalog API

#### Get Products

Retrieves a paginated list of products in the catalog.

**Endpoint:** `GET /products`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `price_min` (optional): Minimum price
- `price_max` (optional): Maximum price

**Response:**

```json
{
  "data": {
    "items": [
      {
        "id": "prod_123abc",
        "name": "Classic Aviator",
        "description": "Iconic aviator style glasses with gold frame",
        "price": 129.99,
        "images": [
          "https://assets.eyewear-ml.com/products/classic-aviator-1.jpg",
          "https://assets.eyewear-ml.com/products/classic-aviator-2.jpg"
        ],
        "options": [
          {
            "name": "Color",
            "values": ["Gold", "Silver", "Black"]
          },
          {
            "name": "Size",
            "values": ["Small", "Medium", "Large"]
          }
        ],
        "created_at": "2024-06-15T10:30:00Z",
        "updated_at": "2024-08-10T14:15:00Z"
      },
      // More products...
    ],
    "total": 124,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Product by ID

Retrieves a specific product by its ID.

**Endpoint:** `GET /products/{product_id}`

**Response:**

```json
{
  "data": {
    "id": "prod_123abc",
    "name": "Classic Aviator",
    "description": "Iconic aviator style glasses with gold frame",
    "price": 129.99,
    "images": [
      "https://assets.eyewear-ml.com/products/classic-aviator-1.jpg",
      "https://assets.eyewear-ml.com/products/classic-aviator-2.jpg"
    ],
    "options": [
      {
        "name": "Color",
        "values": ["Gold", "Silver", "Black"]
      },
      {
        "name": "Size",
        "values": ["Small", "Medium", "Large"]
      }
    ],
    "created_at": "2024-06-15T10:30:00Z",
    "updated_at": "2024-08-10T14:15:00Z"
  }
}
```

### Frames API

#### Get Frame by ID

Retrieves a specific frame by its ID.

**Endpoint:** `GET /frames/{frame_id}`

**Response:**

```json
{
  "data": {
    "id": "frame_abc123",
    "name": "Urban Round",
    "description": "Modern round frames with lightweight construction",
    "images": [
      "https://assets.eyewear-ml.com/frames/urban-round-1.jpg",
      "https://assets.eyewear-ml.com/frames/urban-round-2.jpg"
    ],
    "style": "Round",
    "shape": "Round",
    "materials": ["Titanium", "Acetate"],
    "colors": ["Matte Black", "Tortoise", "Crystal"],
    "dimensions": {
      "lens_width": 47.0,
      "bridge_width": 21.0,
      "temple_length": 145.0,
      "lens_height": 44.0,
      "frame_width": 136.0
    },
    "created_at": "2024-05-20T08:45:00Z",
    "updated_at": "2024-07-15T11:30:00Z"
  }
}
```

#### Get Frame Recommendations

Generates frame recommendations based on face analysis.

**Endpoint:** `POST /frames/recommendations`

**Request:**

```json
{
  "image": "base64_encoded_image_data", // Base64-encoded image data
  "limit": 5 // Optional, number of recommendations to return (default: 5)
}
```

**Response:**

```json
{
  "data": {
    "recommendations": [
      {
        "frame": {
          "id": "frame_abc123",
          "name": "Urban Round",
          "description": "Modern round frames with lightweight construction",
          "images": [
            "https://assets.eyewear-ml.com/frames/urban-round-1.jpg",
            "https://assets.eyewear-ml.com/frames/urban-round-2.jpg"
          ],
          "style": "Round",
          "shape": "Round",
          "materials": ["Titanium", "Acetate"],
          "colors": ["Matte Black", "Tortoise", "Crystal"],
          "dimensions": {
            "lens_width": 47.0,
            "bridge_width": 21.0,
            "temple_length": 145.0,
            "lens_height": 44.0,
            "frame_width": 136.0
          },
          "created_at": "2024-05-20T08:45:00Z",
          "updated_at": "2024-07-15T11:30:00Z"
        },
        "score": 0.92,
        "fit_analysis": {
          "overall_fit": 0.95,
          "width_fit": 0.98,
          "height_fit": 0.93,
          "bridge_fit": 0.97,
          "style_compatibility": 0.90
        }
      },
      // More recommendations...
    ]
  }
}
```

### Style API

#### Get Style Recommendations

Generates style recommendations based on provided filters.

**Endpoint:** `POST /styles/recommendations`

**Request:**

```json
{
  "face_shape": "oval", // Optional, detected face shape
  "preferred_colors": ["Black", "Gold"], // Optional
  "preferred_materials": ["Metal", "Acetate"], // Optional
  "preferred_styles": ["Vintage", "Classic"], // Optional
  "excluded_styles": ["Sporty"], // Optional
  "limit": 5 // Optional, number of recommendations to return (default: 5)
}
```

**Response:**

```json
{
  "data": {
    "recommendations": [
      {
        "style": "Vintage Round",
        "description": "Classic round frames with a nostalgic feel",
        "score": 0.88,
        "example_frames": [
          {
            "id": "frame_abc123",
            "name": "Urban Round",
            "description": "Modern round frames with lightweight construction",
            "images": [
              "https://assets.eyewear-ml.com/frames/urban-round-1.jpg"
            ],
            "style": "Round",
            "shape": "Round",
            "materials": ["Titanium", "Acetate"],
            "colors": ["Matte Black", "Tortoise", "Crystal"],
            "dimensions": {
              "lens_width": 47.0,
              "bridge_width": 21.0,
              "temple_length": 145.0,
              "lens_height": 44.0,
              "frame_width": 136.0
            },
            "created_at": "2024-05-20T08:45:00Z",
            "updated_at": "2024-07-15T11:30:00Z"
          },
          // More example frames...
        ]
      },
      // More style recommendations...
    ]
  }
}
```

### Face Analysis API

#### Analyze Face

Analyzes a face image to determine face shape and measurements.

**Endpoint:** `POST /face-analysis`

**Request:**

```json
{
  "image": "base64_encoded_image_data" // Base64-encoded image data
}
```

**Response:**

```json
{
  "data": {
    "face_shape": "oval",
    "measurements": {
      "face_width": 142.5,
      "face_height": 195.3,
      "pupillary_distance": 63.0,
      "temple_width": 145.0,
      "bridge_width": 17.8
    },
    "symmetry_score": 0.92,
    "landmarks": [
      {
        "type": "left_eye_center",
        "x": 67.3,
        "y": 115.4
      },
      {
        "type": "right_eye_center",
        "x": 130.6,
        "y": 113.9
      },
      // More landmarks...
    ]
  }
}
```

### Virtual Try-On API

#### Generate Try-On Image

Generates a virtual try-on image by overlaying a frame on a face image.

**Endpoint:** `POST /virtual-try-on`

**Request:**

```json
{
  "image": "base64_encoded_image_data", // Base64-encoded image data
  "frame_id": "frame_abc123"
}
```

**Response:**

```json
{
  "data": {
    "image_url": "https://assets.eyewear-ml.com/virtual-try-on/b72f3a9c.jpg",
    "image_data": "base64_encoded_image_data" // Base64-encoded image with the frame overlay
  }
}
```

## Rate Limiting

The API is subject to rate limiting to ensure fair usage. The current limits are:

- 100 requests per minute per API key
- 5,000 requests per day per API key

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1626962035
```

If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## SDK Support

This API is intended to be used with our official SDKs:

- [EyewearML iOS SDK](../ios/)
- [EyewearML Android SDK](../android/)

The SDKs handle authentication, request formatting, and response parsing for you, making it easier to integrate EyewearML into your applications.

## API Versioning

The API version is specified in the base URL path (e.g., `/v1`). When we make backwards-incompatible changes, we will release a new API version. We will maintain backward compatibility for at least 12 months after a new version is released.

## Support

If you have any questions or need assistance, please contact our developer support team at developer-support@eyewear-ml.com.
