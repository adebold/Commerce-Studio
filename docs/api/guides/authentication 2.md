# Authentication Guide

This guide explains the authentication methods available for the VARAi API and best practices for securing your API access.

## Table of Contents

1. [Authentication Methods](#authentication-methods)
   - [API Key Authentication](#api-key-authentication)
   - [Bearer Token Authentication](#bearer-token-authentication)
   - [OAuth 2.0 Authentication](#oauth-20-authentication)
2. [API Key Management](#api-key-management)
   - [Creating API Keys](#creating-api-keys)
   - [API Key Permissions](#api-key-permissions)
   - [Rotating API Keys](#rotating-api-keys)
3. [Security Best Practices](#security-best-practices)
4. [Troubleshooting](#troubleshooting)

## Authentication Methods

The VARAi API supports three authentication methods:

### API Key Authentication

API key authentication is the simplest method and is recommended for server-to-server communication. Include your API key in the `X-API-Key` header with all API requests:

```http
X-API-Key: var_your_api_key
```

#### Example Request with API Key

```bash
curl -X GET "https://api.varai.ai/v1/frames" \
  -H "X-API-Key: var_your_api_key" \
  -H "Content-Type: application/json"
```

### Bearer Token Authentication

Bearer token authentication uses JSON Web Tokens (JWT) and is recommended for user-specific operations. Include the bearer token in the `Authorization` header:

```http
Authorization: Bearer your_jwt_token
```

Bearer tokens are typically obtained through the authentication flow and have a limited lifetime. They represent a user session and carry user-specific permissions.

#### Example Request with Bearer Token

```bash
curl -X GET "https://api.varai.ai/v1/users/me" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### OAuth 2.0 Authentication

OAuth 2.0 authentication is recommended for applications that need to access user data. It provides a secure way for users to grant limited access to their data without sharing their credentials.

VARAi supports the following OAuth 2.0 flows:

- **Authorization Code Flow**: For web applications
- **PKCE Flow**: For mobile and single-page applications
- **Client Credentials Flow**: For server-to-server communication

#### OAuth 2.0 Endpoints

- **Authorization URL**: `https://auth.varai.ai/oauth/authorize`
- **Token URL**: `https://auth.varai.ai/oauth/token`
- **Revocation URL**: `https://auth.varai.ai/oauth/revoke`

#### Available Scopes

| Scope | Description |
|-------|-------------|
| `frames:read` | Read access to frame data |
| `frames:write` | Write access to frame data |
| `recommendations:read` | Read access to recommendation data |
| `recommendations:write` | Write access to recommendation data |
| `users:read` | Read access to user data |
| `users:write` | Write access to user data |
| `analytics:read` | Read access to analytics data |

#### Example OAuth 2.0 Authorization Request

```
https://auth.varai.ai/oauth/authorize?
  response_type=code&
  client_id=your_client_id&
  redirect_uri=https://your-app.com/callback&
  scope=frames:read+recommendations:read&
  state=random_state_string
```

#### Example Token Exchange

```bash
curl -X POST "https://auth.varai.ai/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&\
      code=authorization_code&\
      client_id=your_client_id&\
      client_secret=your_client_secret&\
      redirect_uri=https://your-app.com/callback"
```

#### Example Response

```json
{
  "access_token": "access_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token",
  "scope": "frames:read recommendations:read"
}
```

## API Key Management

### Creating API Keys

To create an API key:

1. Log in to your [developer dashboard](https://developer.varai.ai/dashboard)
2. Navigate to the "API Keys" section
3. Click "Generate New API Key"
4. Give your key a name (e.g., "Development", "Production")
5. Select the appropriate permissions for your use case
6. Click "Create API Key"

Your API key will only be displayed once. Make sure to copy it and store it securely. If you lose your key, you'll need to generate a new one.

### API Key Permissions

When creating an API key, you can specify which permissions it should have. This follows the principle of least privilege, ensuring that each API key has only the permissions it needs.

Available permissions:

| Permission | Description |
|------------|-------------|
| `frames:read` | Read access to frame data |
| `frames:write` | Write access to frame data |
| `recommendations:read` | Read access to recommendation data |
| `recommendations:write` | Write access to recommendation data |
| `users:read` | Read access to user data |
| `users:write` | Write access to user data |
| `analytics:read` | Read access to analytics data |

### Rotating API Keys

It's a good practice to rotate your API keys periodically to minimize the risk of compromised keys. To rotate an API key:

1. Generate a new API key with the same permissions
2. Update your applications to use the new key
3. Verify that everything works correctly with the new key
4. Delete the old API key

## Security Best Practices

Follow these best practices to keep your API access secure:

1. **Store API keys securely**: Use environment variables or a secure key management service to store your API keys. Never hardcode API keys in your source code or include them in client-side code.

2. **Use separate API keys for different environments**: Create different API keys for development, staging, and production environments. This makes it easier to manage access and minimize the impact if a key is compromised.

3. **Limit API key permissions**: Only grant the permissions that are necessary for your use case. This follows the principle of least privilege and minimizes the potential damage if a key is compromised.

4. **Rotate API keys regularly**: Periodically generate new API keys and update your applications to use them. This minimizes the risk of compromised keys.

5. **Monitor API key usage**: Regularly review the usage logs for your API keys to detect any unauthorized access. The developer dashboard provides usage statistics for each API key.

6. **Use HTTPS**: Always use HTTPS for API requests to ensure that data is encrypted in transit.

7. **Implement proper error handling**: Handle authentication errors gracefully in your applications. This includes implementing retry logic with exponential backoff for rate limiting.

## Troubleshooting

### Common Authentication Errors

| HTTP Status | Error Code | Description | Solution |
|-------------|------------|-------------|----------|
| 401 | `missing_api_key` | API key is missing | Include the API key in the `X-API-Key` header |
| 401 | `invalid_api_key` | API key is invalid | Check that you're using a valid API key |
| 401 | `expired_api_key` | API key has expired | Generate a new API key |
| 403 | `insufficient_permissions` | API key doesn't have the required permissions | Generate a new API key with the necessary permissions |
| 401 | `invalid_token` | Bearer token is invalid | Obtain a new bearer token |
| 401 | `expired_token` | Bearer token has expired | Refresh the bearer token |

### API Key Not Working

If your API key is not working:

1. Verify that you're using the correct API key
2. Check that the API key has the necessary permissions
3. Ensure that the API key is included in the `X-API-Key` header
4. Check if the API key has been revoked or expired
5. Verify that you're making the request to the correct environment (development, staging, production)

### Bearer Token Not Working

If your bearer token is not working:

1. Check if the token has expired (tokens typically expire after 1 hour)
2. Verify that you're using the correct token
3. Ensure that the token is included in the `Authorization` header with the `Bearer` prefix
4. Check if the token has been revoked
5. Verify that the token has the necessary scopes for the requested operation

### OAuth 2.0 Issues

If you're experiencing issues with OAuth 2.0:

1. Verify that you're using the correct client ID and client secret
2. Check that the redirect URI matches the one registered in your application
3. Ensure that you're requesting the necessary scopes
4. Verify that the authorization code has not expired (codes typically expire after 10 minutes)
5. Check if the user has revoked access for your application

If you continue to experience authentication issues, please contact our [support team](mailto:developers@varai.ai) for assistance.