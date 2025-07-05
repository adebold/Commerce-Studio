# Getting Started with the VARAi API

This guide will help you get started with the VARAi API, from setting up your account to making your first API request.

## Table of Contents

1. [Creating a Developer Account](#creating-a-developer-account)
2. [Generating an API Key](#generating-an-api-key)
3. [Authentication](#authentication)
4. [Making Your First API Request](#making-your-first-api-request)
5. [Understanding API Responses](#understanding-api-responses)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Next Steps](#next-steps)

## Creating a Developer Account

Before you can use the VARAi API, you need to create a developer account:

1. Visit [developer.varai.ai/signup](https://developer.varai.ai/signup)
2. Fill out the registration form with your information
3. Verify your email address
4. Log in to your developer dashboard

If you're already using VARAi's e-commerce integrations, you can use your existing account credentials to access the API.

## Generating an API Key

Once you have a developer account, you can generate an API key:

1. Log in to your [developer dashboard](https://developer.varai.ai/dashboard)
2. Navigate to the "API Keys" section
3. Click "Generate New API Key"
4. Give your key a name (e.g., "Development", "Production")
5. Select the appropriate permissions for your use case
6. Click "Create API Key"

Your API key will only be displayed once. Make sure to copy it and store it securely. If you lose your key, you'll need to generate a new one.

### API Key Security

Your API key carries many privileges, so be sure to keep it secure:

- Do not share your API key in publicly accessible areas such as GitHub, client-side code, etc.
- Use environment variables or a secure key management service to store your API key
- Create separate API keys for different environments (development, staging, production)
- Rotate your API keys periodically

## Authentication

The VARAi API uses API keys for authentication. Include your API key in the `X-API-Key` header with all API requests:

```http
X-API-Key: var_your_api_key
```

For user-specific operations, you can also use JWT authentication by including a bearer token in the `Authorization` header:

```http
Authorization: Bearer your_jwt_token
```

## Making Your First API Request

Let's make a simple request to the Frames API to retrieve a list of frames:

### cURL

```bash
curl -X GET "https://api.varai.ai/v1/frames" \
  -H "X-API-Key: var_your_api_key" \
  -H "Content-Type: application/json"
```

### JavaScript

```javascript
fetch('https://api.varai.ai/v1/frames', {
  method: 'GET',
  headers: {
    'X-API-Key': 'var_your_api_key',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Python

```python
import requests

url = "https://api.varai.ai/v1/frames"
headers = {
    "X-API-Key": "var_your_api_key",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)
```

## Understanding API Responses

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

For paginated responses, the `data` object includes a `pagination` object:

```json
{
  "success": true,
  "data": {
    "frames": [
      // Array of frames
    ],
    "pagination": {
      "total": 256,
      "page": 1,
      "limit": 20,
      "pages": 13
    }
  }
}
```

## Error Handling

When an error occurs, the API returns an error response with a non-2xx HTTP status code:

```json
{
  "success": false,
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": {
      "field": "brand",
      "reason": "invalid_value"
    },
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-04-29T12:34:56Z"
  }
}
```

Common HTTP status codes:

- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: An error occurred on the server

## Rate Limiting

The VARAi API implements rate limiting to ensure fair usage. Rate limits are based on the number of requests per minute and vary depending on your plan.

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1619712000
```

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response. Implement exponential backoff in your applications to handle rate limiting gracefully.

## Next Steps

Now that you've made your first API request, you can explore more advanced features:

- [API Reference](../swagger-ui.html): Explore all available endpoints
- [Authentication Guide](./authentication.md): Learn more about authentication options
- [Webhooks Guide](./webhooks.md): Set up webhooks for real-time notifications
- [SDKs](https://developer.varai.ai/sdks): Use our official SDKs for easier integration
- [Use Cases](./use-cases.md): Explore common use cases and examples

## Support

If you have any questions or need assistance, you can:

- Check our [FAQ section](https://developer.varai.ai/faq)
- Join our [Developer Community](https://community.varai.ai)
- Contact our [Support Team](mailto:developers@varai.ai)