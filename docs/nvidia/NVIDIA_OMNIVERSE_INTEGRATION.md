# NVIDIA Omniverse Avatar Integration

## Overview

This document provides comprehensive information about the NVIDIA Omniverse Avatar Cloud integration in Commerce Studio. The integration enables photorealistic avatar rendering and real-time animation for enhanced customer experiences.

## 🚀 Quick Start

### 1. Automated Setup
```bash
# Run the automated setup script
npm run setup:omniverse

# Or manually
./scripts/setup-nvidia-omniverse.sh
```

### 2. Configure API Keys

#### For Production (Recommended)
Add your NVIDIA API key to GitHub Secrets:
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add `NVIDIA_API_KEY` with your API key value
4. See [`docs/deployment/GITHUB_SECRETS_SETUP.md`](../deployment/GITHUB_SECRETS_SETUP.md) for details

#### For Local Development
```bash
# Edit .env.local (created by setup script)
NVIDIA_API_KEY=your-nvidia-api-key-here
NVIDIA_OMNIVERSE_API_KEY=your-omniverse-specific-key-here
```

### 3. Test Integration
```bash
# Basic service test
npm run test:omniverse

# Comprehensive test with API key
npm run test:omniverse:full

# GitHub Secrets integration test
npm run test:github-secrets
```

### 4. Start Demo
```bash
# Start the demo server
npm run demo

# Open browser to http://localhost:3000
```

## 🏗️ Architecture

### Service Structure
```
services/nvidia/
├── omniverse-avatar-service.js    # Main service implementation
├── riva-speech-service.js         # DEPRECATED (no license)
└── merlin-conversation-service.js # DEPRECATED (no license)
```

### Configuration Priority
1. **Direct Configuration** (highest priority)
2. **GitHub Secrets** (`NVIDIA_API_KEY`)
3. **Environment Variables** (`NVIDIA_OMNIVERSE_API_KEY`)
4. **Google Secret Manager** (fallback)

### Core Components

#### OmniverseAvatarService
- **Location**: [`services/nvidia/omniverse-avatar-service.js`](../../services/nvidia/omniverse-avatar-service.js)
- **Purpose**: Main service for NVIDIA Omniverse Avatar Cloud integration
- **Features**:
  - Photorealistic avatar rendering
  - Real-time animation
  - WebSocket streaming support
  - Performance metrics tracking
  - Centralized logging integration

#### Centralized Logging
- **Integration**: Uses [`core/logging-service.js`](../../core/logging-service.js)
- **Features**: Structured logging with service-specific contexts
- **Usage**: `logger.nvidia('message', context)`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Priority | Required |
|----------|-------------|----------|----------|
| `NVIDIA_API_KEY` | Primary NVIDIA API key (GitHub Secrets) | 1 | Yes |
| `NVIDIA_OMNIVERSE_API_KEY` | Omniverse-specific key | 2 | Optional |
| `NVIDIA_OMNIVERSE_AVATAR_URL` | Service endpoint | 3 | No |
| `MAX_API_TIMEOUT` | Request timeout (ms) | 4 | No |

### Default Configuration
```javascript
{
  endpoint: 'https://api.nvcf.nvidia.com/v2/nvcf/services/avatar',
  timeout: 30000,
  retryAttempts: 3,
  region: 'us-east-1'
}
```

## 🧪 Testing

### Available Test Scripts

#### Basic Service Test
```bash
npm run test:omniverse
# Tests: Service instantiation, configuration loading
```

#### Comprehensive Test
```bash
npm run test:omniverse:full
# Tests: API connectivity, health checks, error handling
```

#### GitHub Secrets Integration
```bash
npm run test:github-secrets
# Tests: Configuration priority, security practices, CI/CD integration
```

### Manual Testing
```bash
# Individual test files
node demo/live-demo/test-omniverse-simple.js
node demo/live-demo/test-omniverse.js
node demo/live-demo/test-github-secrets-integration.js
```

### Test Coverage
- ✅ Service instantiation
- ✅ Configuration priority system
- ✅ GitHub Secrets integration
- ✅ Security best practices
- ✅ Error handling
- ✅ Logging integration
- ⚠️ API connectivity (requires valid key)

## 🔐 Security

### Best Practices
1. **Never commit API keys** to version control
2. **Use GitHub Secrets** for production deployments
3. **Rotate keys regularly** (quarterly recommended)
4. **Monitor access logs** for unauthorized usage
5. **Use HTTPS endpoints** only

### Security Features
- API keys not logged in plain text
- HTTPS-only communication
- Input validation and sanitization
- Rate limiting and timeout controls
- Audit trail through centralized logging

## 🚀 Deployment

### GitHub Actions Integration
The service automatically integrates with GitHub Actions workflows:

```yaml
env:
  NVIDIA_API_KEY: ${{ secrets.NVIDIA_API_KEY }}
  NVIDIA_OMNIVERSE_API_KEY: ${{ secrets.NVIDIA_OMNIVERSE_API_KEY }}
```

### Production Checklist
- [ ] Add `NVIDIA_API_KEY` to GitHub Secrets
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Test failover scenarios
- [ ] Verify rate limiting configuration
- [ ] Document incident response procedures

## 📊 Monitoring

### Performance Metrics
- Rendering FPS
- API response latency
- Resource usage (CPU, GPU, Memory)
- Error rates and types
- Connection stability

### Logging
```javascript
// Service-specific logging
logger.nvidia('Avatar rendering started', { sessionId, userId });
logger.nvidia('Performance metrics', { fps: 30, latency: 100 });
```

### Health Checks
```bash
# Manual health check
curl -H "Authorization: Bearer $NVIDIA_API_KEY" \
     https://api.nvcf.nvidia.com/v2/nvcf/services/avatar/health
```

## 🔄 Migration from Google Secret Manager

### Phase 1: Dual Support (Current)
- GitHub Secrets integration added
- Google Secret Manager maintained as fallback
- Both approaches work simultaneously

### Phase 2: Gradual Migration
1. Add GitHub Secrets to all environments
2. Test thoroughly in staging
3. Update production workflows
4. Monitor for issues

### Phase 3: Complete Migration
1. Remove Google Secret Manager dependencies
2. Update documentation
3. Clean up legacy configuration

## 🛠️ Troubleshooting

### Common Issues

#### API Key Not Found
```
Error: NVIDIA_API_KEY is not defined
```
**Solution**: Add API key to GitHub Secrets or `.env.local`

#### 401 Unauthorized
```
Error: 401 Unauthorized
```
**Solutions**:
- Verify API key is correct
- Check key hasn't expired
- Ensure proper formatting

#### Service Instantiation Fails
```
Error: Cannot instantiate OmniverseAvatarService
```
**Solutions**:
- Check import statements
- Verify service dependencies
- Review configuration format

### Debug Commands
```bash
# Check environment variables
npm run test:github-secrets

# Verify service configuration
node demo/live-demo/test-service-config.js

# Test basic connectivity
npm run test:omniverse
```

### Log Analysis
```bash
# Check service logs
tail -f logs/live-demo.log | grep "OmniverseAvatar"

# Monitor performance
grep "Performance metrics" logs/live-demo.log
```

## 📚 API Reference

### OmniverseAvatarService Methods

#### Constructor
```javascript
const service = new OmniverseAvatarService({
  apiKey: 'your-api-key',
  endpoint: 'https://api.nvcf.nvidia.com/v2/nvcf/services/avatar',
  timeout: 30000
});
```

#### Health Check
```javascript
const health = await service.healthCheck();
```

#### Avatar Creation
```javascript
const avatar = await service.createAvatar({
  model: 'default',
  appearance: { /* configuration */ }
});
```

#### Animation
```javascript
await service.animateAvatar(avatarId, {
  expression: 'smile',
  gesture: 'wave'
});
```

## 🔗 Related Documentation

- [GitHub Secrets Setup Guide](../deployment/GITHUB_SECRETS_SETUP.md)
- [Centralized Authentication Architecture](../architecture/centralized-google-cloud-authentication.md)
- [Security Compliance Architecture](../architecture/security-compliance-architecture.md)
- [Production Deployment Guide](../deployment/PRODUCTION_LAUNCH_GUIDE.md)

## 📞 Support

### Internal Resources
- Architecture team for integration questions
- DevOps team for deployment issues
- Security team for compliance concerns

### External Resources
- [NVIDIA Omniverse Documentation](https://docs.omniverse.nvidia.com/)
- [NVIDIA Developer Portal](https://developer.nvidia.com/)
- [NVIDIA Support](https://developer.nvidia.com/support)

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Initial NVIDIA Omniverse integration
- ✅ GitHub Secrets support
- ✅ Centralized logging integration
- ✅ Comprehensive testing suite
- ✅ Security best practices implementation
- ✅ Automated setup script
- ⚠️ Riva/Merlin services deprecated (no license)

### Planned Features
- Enhanced avatar customization
- Real-time collaboration features
- Advanced performance optimization
- Multi-region deployment support