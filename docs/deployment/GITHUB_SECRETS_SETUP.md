# GitHub Secrets Management for Commerce Studio

## Overview

This guide explains how to configure GitHub Secrets for secure API key management in the Commerce Studio project. GitHub Secrets provide a more secure and maintainable approach compared to Google Secret Manager for CI/CD workflows.

## Required GitHub Secrets

### NVIDIA API Keys
- `NVIDIA_API_KEY` - Primary NVIDIA API key for all services
- `NVIDIA_OMNIVERSE_API_KEY` - Specific key for Omniverse Avatar services (can be same as primary)

### Google Cloud API Keys
- `GOOGLE_CLOUD_API_KEY` - Google Cloud services API key
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Service account JSON (base64 encoded)

### Additional Service Keys
- `SNYK_TOKEN` - For security scanning
- `SONAR_TOKEN` - For code quality analysis

## Setting Up GitHub Secrets

### 1. Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### 2. Add Repository Secrets
Click **New repository secret** for each of the following:

#### NVIDIA_API_KEY
```
Name: NVIDIA_API_KEY
Value: [Your NVIDIA API Key]
```

#### NVIDIA_OMNIVERSE_API_KEY
```
Name: NVIDIA_OMNIVERSE_API_KEY
Value: [Your NVIDIA Omniverse API Key]
```

#### GOOGLE_CLOUD_API_KEY
```
Name: GOOGLE_CLOUD_API_KEY
Value: [Your Google Cloud API Key]
```

#### GOOGLE_APPLICATION_CREDENTIALS_JSON
```
Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
Value: [Base64 encoded service account JSON]
```

To encode your service account JSON:
```bash
base64 -i path/to/service-account.json
```

### 3. Environment-Specific Secrets

For different environments, you can use environment-specific secrets:

#### Production Environment
- `PROD_NVIDIA_API_KEY`
- `PROD_GOOGLE_CLOUD_API_KEY`

#### Staging Environment
- `STAGING_NVIDIA_API_KEY`
- `STAGING_GOOGLE_CLOUD_API_KEY`

## Environment Configuration Priority

The application will check for API keys in this order:

1. **GitHub Secrets** (in CI/CD environments)
2. **Direct Environment Variables** (local development)
3. **Google Secret Manager** (fallback for existing deployments)
4. **Mock Services** (development/testing)

## Local Development Setup

For local development, create a `.env.local` file:

```bash
# .env.local (DO NOT COMMIT)
NVIDIA_API_KEY=your-nvidia-api-key-here
NVIDIA_OMNIVERSE_API_KEY=your-omniverse-key-here
GOOGLE_CLOUD_API_KEY=your-google-cloud-key-here
```

## CI/CD Workflow Integration

The GitHub Actions workflow automatically injects secrets as environment variables:

```yaml
env:
  NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}
  NVIDIA_OMNIVERSE_API_KEY: ${{ secrets.NVIDIA_OMNIVERSE_API_KEY }}
  GOOGLE_CLOUD_API_KEY: ${{ secrets.GOOGLE_CLOUD_API_KEY }}
```

## Security Best Practices

### 1. Principle of Least Privilege
- Only grant access to secrets that are actually needed
- Use environment-specific secrets when possible

### 2. Regular Key Rotation
- Rotate API keys regularly (quarterly recommended)
- Update secrets immediately if compromised

### 3. Audit Trail
- GitHub automatically logs secret access
- Monitor secret usage in repository insights

### 4. Team Access Control
- Limit who can view/edit repository secrets
- Use organization-level secrets for shared keys

## Testing Secret Configuration

Use the provided test scripts to verify secret configuration:

```bash
# Test NVIDIA Omniverse integration
node demo/live-demo/test-omniverse-simple.js

# Test with GitHub Secrets (in CI/CD)
node demo/live-demo/test-omniverse.js
```

## Migration from Google Secret Manager

### Phase 1: Dual Support
- Keep existing Google Secret Manager integration
- Add GitHub Secrets support
- Test both approaches

### Phase 2: Gradual Migration
- Update CI/CD to use GitHub Secrets
- Keep Google Secret Manager for production deployments
- Monitor and validate

### Phase 3: Complete Migration
- Remove Google Secret Manager dependencies
- Update all environments to use GitHub Secrets
- Clean up legacy configuration

## Troubleshooting

### Common Issues

#### Secret Not Available
```
Error: NVIDIA_API_KEY is not defined
```
**Solution**: Verify secret is added to repository and workflow has access

#### Invalid API Key Format
```
Error: 401 Unauthorized
```
**Solution**: Check API key format and ensure it's not truncated

#### Environment Variable Override
```
Warning: Using fallback configuration
```
**Solution**: Ensure GitHub Secrets are properly configured in workflow

### Debug Commands

```bash
# Check environment variables (DO NOT run in production)
node -e "console.log(process.env.NVIDIA_API_KEY ? 'Key present' : 'Key missing')"

# Test service configuration
node demo/live-demo/test-service-config.js
```

## Support

For issues with GitHub Secrets configuration:
1. Check repository settings and permissions
2. Verify workflow syntax
3. Review GitHub Actions logs
4. Contact repository administrators

## Security Notice

⚠️ **Never commit API keys to version control**
⚠️ **Always use secrets for sensitive configuration**
⚠️ **Regularly audit and rotate keys**
⚠️ **Monitor for unauthorized access**