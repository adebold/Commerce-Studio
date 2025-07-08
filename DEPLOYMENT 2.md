# Commerce Studio Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Commerce Studio on Google Cloud Platform with enterprise-grade security, monitoring, and compliance features.

## Architecture

Commerce Studio is deployed as a microservices architecture on GCP:

- **API Service**: FastAPI backend (Python 3.11)
- **Auth Service**: Authentication service (Node.js 18)
- **Frontend Service**: React application (Nginx)
- **Infrastructure**: Cloud Run, Secret Manager, Cloud Build, Cloud Monitoring

## Prerequisites

### Required Tools
- Google Cloud SDK (`gcloud`)
- Docker (for local development)
- Git
- curl (for testing)

### GCP Setup
1. GCP Project with billing enabled
2. Required APIs enabled (handled automatically by scripts)
3. Appropriate IAM permissions
4. gcloud CLI authenticated

### Authentication
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

## Quick Start

### One-Command Deployment
```bash
# Deploy with defaults
./scripts/deploy-commerce-studio.sh

# Deploy to specific project/region
./scripts/deploy-commerce-studio.sh -p my-project -r us-west1

# Deploy to production
./scripts/deploy-commerce-studio.sh -e production -n ops@company.com
```

### Manual Phase-by-Phase Deployment

#### Phase 6: Application Build & Deployment
```bash
# Deploy all services with secure configuration
./scripts/deploy-to-staging.sh
```

#### Phase 7: Service Integration & Testing
```bash
# Run comprehensive end-to-end tests
./scripts/test-end-to-end.sh
```

#### Phase 8: Monitoring & Observability Setup
```bash
# Setup monitoring, alerting, and dashboards
NOTIFICATION_EMAIL="alerts@yourcompany.com" ./scripts/setup-monitoring.sh
```

#### Phase 9: Final Validation & Documentation
```bash
# Generate documentation and validate deployment
./scripts/final-validation.sh
```

#### Phase 10: Production Readiness Assessment
```bash
# Comprehensive production readiness check
./scripts/production-readiness-assessment.sh
```

## Deployment Phases

### Phase 1-5: Infrastructure (Prerequisites)
These phases should be completed before running the deployment scripts:
1. **GCP Project Setup**: Project creation, billing, basic configuration
2. **Network & Security**: VPC, firewall rules, IAM setup
3. **Database Infrastructure**: Database setup and configuration
4. **Container Registry**: Image storage and build pipeline
5. **Secret Manager**: Secure secrets configuration

### Phase 6: Application Build & Deployment
- Builds Docker images for all services
- Deploys to Cloud Run with secure configuration
- Integrates with Secret Manager for sensitive data
- Configures auto-scaling and resource limits

### Phase 7: Service Integration & Testing
- Validates service health endpoints
- Tests authentication flows
- Verifies service integration
- Checks security headers and CORS
- Validates database connectivity

### Phase 8: Monitoring & Observability
- Creates monitoring dashboards
- Sets up alerting policies
- Configures uptime checks
- Establishes log-based metrics
- Implements notification channels

### Phase 9: Final Validation & Documentation
- Comprehensive system validation
- Architecture documentation generation
- Security controls verification
- Operations runbook creation
- Monitoring setup documentation

### Phase 10: Production Readiness Assessment
- Security review checklist
- Performance benchmarking
- Disaster recovery validation
- Compliance verification (SOC 2, GDPR, PCI DSS)
- Production readiness scoring

## Configuration

### Environment Variables
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export ENVIRONMENT="staging"
export NOTIFICATION_EMAIL="alerts@yourcompany.com"
```

### Secret Manager Secrets
The following secrets must be configured in Google Secret Manager:
- `commerce-studio-jwt-secret`: JWT signing key
- `commerce-studio-db-password`: Database password
- `commerce-studio-api-key`: API authentication key

### Service Configuration
Each service can be configured through environment variables and Secret Manager:

#### API Service
- Memory: 2Gi
- CPU: 2 vCPU
- Max instances: 10
- Timeout: 900s

#### Auth Service
- Memory: 1Gi
- CPU: 1 vCPU
- Max instances: 5
- Timeout: 300s

#### Frontend Service
- Memory: 512Mi
- CPU: 1 vCPU
- Max instances: 10
- Timeout: 300s

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Session management

### Data Protection
- Secrets stored in Google Secret Manager
- HTTPS enforcement for all communications
- Security headers implementation
- Container image security scanning

### Infrastructure Security
- IAM-based access control
- Network security with VPC
- Regular security updates
- Audit logging

## Monitoring & Alerting

### Key Metrics
- Request rate and response latency
- Error rates and service availability
- Resource utilization
- Security events

### Alerting Policies
- High error rate (>5%)
- High latency (>5 seconds)
- Service downtime
- Unusual secret access patterns

### Dashboards
- Service overview dashboard
- Performance metrics
- Security monitoring
- Resource utilization

## Testing

### Health Checks
```bash
# Test API health
curl https://your-api-url/health

# Test Auth service
curl https://your-auth-url/health

# Test Frontend
curl https://your-frontend-url/
```

### End-to-End Testing
```bash
# Run comprehensive test suite
./scripts/test-end-to-end.sh
```

### Load Testing
```bash
# Basic load test (included in production readiness assessment)
./scripts/production-readiness-assessment.sh
```

## Troubleshooting

### Common Issues

#### Service Not Responding
1. Check service status: `gcloud run services list`
2. Check logs: `gcloud logging read "resource.type=cloud_run_revision"`
3. Verify resource allocation
4. Check external dependencies

#### Authentication Failures
1. Verify Secret Manager secrets
2. Check JWT token configuration
3. Review IAM permissions
4. Validate auth service logs

#### High Error Rates
1. Check error logs for specific errors
2. Review recent deployments
3. Verify database connectivity
4. Check external API dependencies

### Log Analysis
```bash
# View service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=commerce-studio-api" --limit=50

# View error logs
gcloud logging read "severity=ERROR" --limit=20

# View authentication logs
gcloud logging read "resource.labels.service_name=commerce-studio-auth" --limit=30
```

### Performance Issues
```bash
# Check service metrics
gcloud monitoring metrics list --filter="metric.type:run.googleapis.com"

# View performance dashboard
# https://console.cloud.google.com/monitoring/dashboards
```

## Disaster Recovery

### Backup Strategy
- Configuration: Version controlled in Git
- Secrets: Stored in Secret Manager with versioning
- Database: Automated backups (if applicable)

### Recovery Procedures
1. **Service Failure**: Automatic restart via Cloud Run
2. **Regional Failure**: Manual failover to backup region
3. **Data Loss**: Restore from latest backup
4. **Security Breach**: Follow incident response procedures

### Rollback
```bash
# Rollback to previous revision
gcloud run services update-traffic commerce-studio-api --to-revisions=REVISION_NAME=100

# List available revisions
gcloud run revisions list --service=commerce-studio-api
```

## Compliance

### SOC 2 Type II
- Access controls implemented
- Encryption at rest and in transit
- Monitoring and logging
- Change management procedures

### GDPR
- Data encryption
- Access logging and monitoring
- Data minimization principles
- User consent management

### PCI DSS (if applicable)
- Network security
- Encryption requirements
- Access controls
- Regular security testing

## Production Deployment

### Pre-Production Checklist
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Stakeholder approval obtained

### Production Deployment Steps
1. Run production readiness assessment
2. Obtain required approvals
3. Schedule deployment window
4. Execute deployment
5. Validate deployment
6. Monitor system performance

### Post-Deployment
- Monitor system metrics
- Validate all functionality
- Check alerting systems
- Review logs for errors
- Update documentation

## Support

### Documentation
- Architecture documentation: `./deployment-docs/architecture/`
- Security documentation: `./deployment-docs/security/`
- Operations runbook: `./deployment-docs/operations/`
- Monitoring setup: `./deployment-docs/monitoring/`

### Monitoring
- Cloud Console: https://console.cloud.google.com/monitoring
- Service URLs: Available in deployment summary
- Alerting: Configured email notifications

### Emergency Contacts
- Primary on-call: [Your contact]
- Secondary escalation: [Escalation contact]
- Vendor support: [Support contact]

## Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-commerce-studio.sh` | Master deployment script | `./scripts/deploy-commerce-studio.sh` |
| `deploy-to-staging.sh` | Deploy services | `./scripts/deploy-to-staging.sh` |
| `test-end-to-end.sh` | Integration testing | `./scripts/test-end-to-end.sh` |
| `setup-monitoring.sh` | Configure monitoring | `./scripts/setup-monitoring.sh` |
| `final-validation.sh` | System validation | `./scripts/final-validation.sh` |
| `production-readiness-assessment.sh` | Production readiness | `./scripts/production-readiness-assessment.sh` |
| `build-frontend.sh` | Build frontend | `./scripts/build-frontend.sh` |

## Configuration Files

| File | Purpose |
|------|---------|
| `cloudbuild-secure.yaml` | Secure Cloud Build configuration |
| `src/api/Dockerfile` | API service container |
| `backend/auth-api/Dockerfile` | Auth service container |
| `frontend/Dockerfile` | Frontend service container |
| `terraform/environments/staging/` | Infrastructure as code |

## Next Steps

After successful deployment:
1. Review production readiness assessment results
2. Obtain stakeholder approvals for production
3. Plan production deployment schedule
4. Set up regular monitoring and maintenance
5. Establish operational procedures
6. Plan for scaling and optimization

For questions or support, please refer to the operations runbook or contact the development team.
