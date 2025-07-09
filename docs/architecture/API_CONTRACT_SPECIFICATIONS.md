# API Contract Specifications

## 🚀 Production API

- **Base URL**: [`https://commerce-studio-api-ddtojwjn7a-uc.a.run.app/api/v1`](https://commerce-studio-api-ddtojwjn7a-uc.a.run.app/api/v1)

## authentication

Authentication is handled via JWT (JSON Web Tokens). All requests to protected endpoints must include an `Authorization` header with a valid Bearer token.

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

## Endpoints

### Recommendations

#### `POST /recommendations/enhanced`

Generates advanced, personalized recommendations based on user context and face analysis.

**Request Body**:

```json
{
  "consultationData": {
    "sessionId": "uuid",
    "userId": "string",
    "preferences": {
      "style": "modern|classic|bold|vintage|sporty",
      "lifestyle": "professional|student|active|social|outdoor",
      "budget": "under-100|100-200|200-400|400+",
      "prescription": "boolean",
      "occasion": "work|leisure|sport|special"
    }
  },
  "faceAnalysis": {
    "faceShape": "oval|round|square|heart|diamond|oblong",
    "measurements": {
      "faceWidth": "number",
      "faceHeight": "number",
      "eyeDistance": "number",
      "foreheadWidth": "number",
      "jawWidth": "number"
    },
    "confidence": "number"
  },
  "context": {
    "platform": "web|shopify|magento|woocommerce|bigcommerce",
    "deviceType": "desktop|mobile|tablet",
    "conversationHistory": "array",
    "previousRecommendations": "array"
  }
}
```

**Response (200 OK)**:

```json
{
  "recommendations": [
    {
      "product": {
        "id": "string",
        "name": "string",
        "brand": "string",
        "style": "string",
        "price": "number",
        "measurements": "object",
        "features": "array",
        "images": "array"
      },
      "scores": {
        "faceShapeMatch": "number",
        "stylePreference": "number",
        "lifestyle": "number",
        "budget": "number",
        "measurements": "number",
        "totalScore": "number"
      },
      "explanation": {
        "primary": "string",
        "detailed": "string",
        "pros": "array",
        "considerations": "array",
        "tags": "array"
      },
      "confidence": "number",
      "rank": "number"
    }
  ],
  "metadata": {
    "totalProducts": "number",
    "filteredProducts": "number",
    "processingTime": "number",
    "recommendationId": "string",
    "generatedAt": "timestamp"
  }
}
```

#### `POST /recommendations/feedback`

Submits user feedback on recommendations to improve future results.

**Request Body**:

```json
{
  "recommendationId": "string",
  "sessionId": "string",
  "feedback": {
    "type": "like|dislike|try_on|purchase|bookmark",
    "productId": "string",
    "rating": "number",
    "comment": "string",
    "timestamp": "timestamp"
  }
}
```

**Response (204 No Content)**

### User Management

#### `POST /auth/register`

Registers a new user.

**Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201 Created)**:

```json
{
  "token": "string"
}
```

#### `POST /auth/login`

Authenticates a user and returns a JWT.

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK)**:

```json
{
  "token": "string"
}
```

#### `GET /customers/me`

Retrieves the profile of the currently authenticated user.

**Response (200 OK)**:

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "createdAt": "timestamp"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.

- **400 Bad Request**: The request was malformed or invalid.
- **401 Unauthorized**: The request requires authentication, but no valid token was provided.
- **403 Forbidden**: The authenticated user does not have permission to access the requested resource.
- **404 Not Found**: The requested resource does not exist.
- **500 Internal Server Error**: An unexpected error occurred on the server.