# EyewearML Deployment Guide

## Overview

This guide covers the Phase 2 deployment improvements implemented for the EyewearML platform, including containerization, deployment consolidation, blue-green deployments, and secret management.

## Architecture

### Deployment Structure

```
deploy/
├── README.md                 # Deployment overview
├── Makefile                 # Main deployment entry point
├── config/                  # Environment configurations
│   ├── dev.yaml            # Development environment
│   ├── staging.yaml        # Staging environment
│   └── prod.yaml           # Production environment
├── scripts/                 # Deployment scripts
│   ├── deploy.sh           # Main deployment script
│   └── manage-secrets.sh   # Secret management
└── blue-green/             # Blue-green deployment
    ├── deploy.sh           # Blue-green deployment
    └── rollback.sh         # Automated rollback
```

## Phase 2 Improvements

### 1. Docker Multi-Stage Builds

#### Auth Service Optimizations
- **Multi-stage build**: Separate build and production stages
- **Alpine Linux**: Reduced image size by ~60%
- **Non-root user**: Enhanced security
- **Health checks**: Built-in container health monitoring
- **Proper .dockerignore**: Excludes node_modules and development files

#### Frontend Optimizations
- **Nginx-based serving**: Production-ready static file serving
- **Build optimization**: Separate build stage for React compilation
- **Security headers**: Enhanced security configuration
- **Compression**: Gzip compression enabled

### 2. Deployment Consolidation

#### Before (Scattered)
- `deployment-scripts/` - 25+ duplicate scripts
- `scripts/` - Mixed deployment and utility scripts
- `helm/` - Kubernetes configurations
- `terraform/` - Infrastructure as code
- `kubernetes/` - Raw Kubernetes manifests

#### After (Consolidated)
- **Single entry point**: `deploy/Makefile`
- **Standardized commands**: `make deploy ENV=staging`
- **Environment-specific configs**: YAML-based configuration
- **Unified secret management**: Google Secret Manager integration

### 3. Blue-Green Deployment Pattern

#### Features
- **Zero-downtime deployments**: Traffic switching without interruption
- **Automated health checks**: Comprehensive service validation
- **Automatic rollback**: Triggered on health check failures
- **Environment isolation**: Blue and green environments completely separate
- **Monitoring integration**: Deployment tracking and notifications

#### Workflow
1. **Deploy to inactive environment** (blue or green)
2. **Run comprehensive health checks**
3. **Switch traffic** to new environment
4. **Monitor performance** and error rates
5. **Automatic rollback** if issues detected

### 4. Secret Management

#### Google Secret Manager Integration
- **Environment-specific secrets**: Separate secrets per environment
- **Automatic rotation**: Built-in secret rotation capabilities
- **Secure injection**: Secrets injected as environment variables
- **Audit logging**: All secret access logged
- **Validation**: Required secrets validation before deployment

#### Supported Secrets
- Database connection strings
- JWT signing keys
- API keys (Google Cloud, OpenAI, etc.)
- Session secrets
- Encryption keys

## Quick Start

### Prerequisites
- Google Cloud SDK installed and configured
- Docker installed
- Access to `ml-datadriven-recos` GCP project
- Required environment variables set

### Environment Setup

1. **Setup secrets for an environment**:
```bash
cd deploy
./scripts/manage-secrets.sh setup staging
```

2. **Validate configuration**:
```bash
make check-env ENV=staging
```

### Standard Deployment

1. **Deploy to staging**:
```bash
make deploy ENV=staging
```

2. **Deploy to production (blue-green)**:
```bash
make deploy-blue-green ENV=prod
```

### Blue-Green Deployment

1. **Deploy to inactive environment**:
```bash
make deploy-blue-green ENV=prod
```

2. **Monitor deployment**:
```bash
make status ENV=prod
```

3. **Rollback if needed**:
```bash
make rollback-blue-green ENV=prod
```

## Environment Configurations

### Development
- **Resources**: Minimal (512Mi memory, 0.5 CPU)
- **Scaling**: 1-3 instances
- **Security**: Relaxed (allow unauthenticated)
- **Monitoring**: Debug level logging

### Staging
- **Resources**: Moderate (1-2Gi memory, 1-2 CPU)
- **Scaling**: 2-5 instances
- **Security**: Production-like
- **Blue-green**: Enabled
- **Monitoring**: Info level logging with alerts

### Production
- **Resources**: High (2-4Gi memory, 2-4 CPU)
- **Scaling**: 3-15 instances
- **Security**: Strict (authentication required)
- **Blue-green**: Enabled with canary
- **Monitoring**: Warn level with SLA monitoring
- **Backup**: Enabled with 30-day retention

## Security Enhancements

### Container Security
- **Non-root users**: All containers run as non-root
- **Minimal base images**: Alpine Linux for reduced attack surface
- **Security scanning**: Automated vulnerability scanning
- **Read-only filesystems**: Where applicable

### Secret Management
- **Google Secret Manager**: Centralized secret storage
- **Environment isolation**: Secrets scoped to environments
- **Rotation policies**: Automatic secret rotation
- **Access logging**: All secret access audited

### Network Security
- **Private networking**: Services communicate over private networks
- **HTTPS only**: All external traffic encrypted
- **CORS policies**: Strict cross-origin policies
- **Rate limiting**: API rate limiting implemented

## Monitoring and Observability

### Health Checks
- **Liveness probes**: Container health monitoring
- **Readiness probes**: Service readiness validation
- **Custom health endpoints**: Application-specific health checks

### Logging
- **Structured logging**: JSON-formatted logs
- **Log aggregation**: Centralized log collection
- **Log retention**: Environment-specific retention policies

### Metrics
- **Performance metrics**: Response time, throughput
- **Error tracking**: Error rates and patterns
- **Resource utilization**: CPU, memory, network usage

### Alerting
- **Deployment alerts**: Success/failure notifications
- **Health check alerts**: Service health monitoring
- **Performance alerts**: SLA violation notifications

## Troubleshooting

### Common Issues

#### Deployment Failures
1. **Check secrets**: `./scripts/manage-secrets.sh validate ENV`
2. **Verify configuration**: `make check-env ENV=ENV`
3. **Check logs**: `make logs ENV=ENV`

#### Health Check Failures
1. **Manual health check**: `curl SERVICE_URL/health`
2. **Check service logs**: `gcloud run logs read SERVICE --region=REGION`
3. **Verify environment variables**: Check secret injection

#### Blue-Green Issues
1. **Check both environments**: Verify blue and green deployments
2. **Traffic routing**: Verify traffic allocation
3. **Rollback**: Use automated rollback if needed

### Support Commands

```bash
# Check deployment status
make status ENV=staging

# View service logs
make logs ENV=staging

# Run health checks
make health-check ENV=staging

# List secrets
./scripts/manage-secrets.sh list staging

# Rotate secrets
./scripts/manage-secrets.sh rotate staging jwt-secret
```

## Migration from Legacy Scripts

### Deprecated Scripts
The following scripts in `deployment-scripts/` and `scripts/` are now deprecated:
- `deploy_staging.sh` → Use `make deploy ENV=staging`
- `deploy_to_cloud_run.py` → Use `make deploy ENV=ENV`
- `deploy_with_rollback.py` → Use `make deploy-blue-green ENV=ENV`

### Migration Steps
1. **Update CI/CD pipelines** to use new Makefile commands
2. **Migrate environment variables** to Google Secret Manager
3. **Update documentation** to reference new deployment process
4. **Train team** on new deployment procedures

## Best Practices

### Development
- **Test locally** before deploying to staging
- **Use feature branches** for deployment changes
- **Validate configurations** before committing

### Staging
- **Mirror production** configuration as closely as possible
- **Run full test suites** before promoting to production
- **Validate blue-green** deployment process

### Production
- **Always use blue-green** deployments
- **Monitor deployments** closely
- **Have rollback plan** ready
- **Coordinate with team** for production deployments

## Future Enhancements

### Planned Improvements
- **Canary deployments**: Gradual traffic shifting
- **Multi-region deployments**: Global deployment support
- **Automated testing**: Integration test automation
- **Performance testing**: Load testing integration
- **Cost optimization**: Resource usage optimization

### Monitoring Enhancements
- **Custom dashboards**: Environment-specific dashboards
- **SLA monitoring**: Service level agreement tracking
- **Predictive alerting**: ML-based anomaly detection