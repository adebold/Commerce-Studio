# AI Discovery Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AI Discovery integration to production across all e-commerce platforms. The deployment follows a zero-downtime, blue-green strategy with automated rollback capabilities.

## Architecture Overview

### Services Deployed
- **AI Discovery Service**: Core conversational AI and discovery logic
- **Face Analysis Service**: Privacy-compliant face shape detection
- **Recommendation Service**: ML-powered product recommendations
- **Analytics Service**: Event tracking and business intelligence
- **API Gateway**: Unified API endpoint with rate limiting and security

### Platform Integrations
- **Shopify**: Native app integration with theme extensions
- **WooCommerce**: WordPress plugin via WordPress.org repository
- **Magento**: Extension via Magento Marketplace and Composer
- **HTML**: JavaScript widget via CDN and NPM

## Prerequisites

### Required Tools
- Docker 20.10+
- Google Cloud SDK 400.0+
- Terraform 1.5+
- Node.js 18+
- PHP 8.1+ (for WooCommerce/Magento)
- Composer 2.0+
- kubectl 1.25+

### Environment Variables
```bash
# GCP Configuration
export GCP_PROJECT_ID="ml-datadriven-recos"
export GCP_REGION="us-central1"
export VERTEX_AI_PROJECT="ml-datadriven-recos"
export VERTEX_AI_LOCATION="us-central1"

# Authentication
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Platform Credentials (Optional)
export WORDPRESS_SVN_USERNAME="your-username"
export WORDPRESS_SVN_PASSWORD="your-password"
export MAGENTO_MARKETPLACE_KEY="your-key"
export MAGENTO_MARKETPLACE_SECRET="your-secret"
export NPM_TOKEN="your-npm-token"

# Notification Settings
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
export EMAIL_NOTIFICATION_ENDPOINT="https://api.example.com/notify"
```

### GCP Permissions
The deployment service account requires:
- Cloud Run Admin
- Cloud SQL Admin
- Compute Admin
- Storage Admin
- Secret Manager Admin
- Monitoring Admin
- Cloud Build Editor

## Deployment Methods

### Method 1: Automated CI/CD (Recommended)

#### GitHub Actions Deployment
1. **Tag Release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Monitor Deployment**:
   - GitHub Actions will automatically deploy to staging
   - Manual approval required for production
   - Monitor progress in GitHub Actions tab

#### Manual Approval Process
1. Review staging deployment results
2. Approve production deployment in GitHub
3. Monitor production deployment progress
4. Verify health checks and metrics

### Method 2: Manual Deployment

#### Full Platform Deployment
```bash
# Deploy all platforms and services
./deploy/scripts/deploy-all-platforms.sh v1.0.0 true

# Deploy with parallel widget deployment
./deploy/scripts/deploy-all-platforms.sh v1.0.0 true false
```

#### Individual Platform Deployment
```bash
# Deploy specific platforms
./deploy/scripts/deploy-woocommerce.sh v1.0.0
./deploy/scripts/deploy-magento.sh v1.0.0
./deploy/scripts/deploy-html.sh v1.0.0

# Deploy backend services only
./deploy/blue-green/deploy.sh prod v1.0.0
```

#### Infrastructure Only
```bash
# Deploy Terraform infrastructure
cd terraform/environments/production
terraform init
terraform plan -var="image_tag=v1.0.0"
terraform apply
```

## Deployment Process

### Phase 1: Pre-Deployment Validation
- ✅ Prerequisites check
- ✅ Environment validation
- ✅ Credential verification
- ✅ Resource availability
- ✅ Security scanning

### Phase 2: Infrastructure Deployment
- ✅ Terraform infrastructure provisioning
- ✅ VPC and networking setup
- ✅ Database and Redis deployment
- ✅ Monitoring stack configuration
- ✅ CDN and load balancer setup

### Phase 3: Backend Services Deployment
- ✅ Blue-green service deployment
- ✅ Health check validation
- ✅ Traffic switching
- ✅ Old version cleanup
- ✅ Service mesh configuration

### Phase 4: Platform Widget Deployment
- ✅ Widget build and optimization
- ✅ CDN asset upload
- ✅ Platform-specific packaging
- ✅ Repository/marketplace deployment
- ✅ Integration testing

### Phase 5: Post-Deployment Validation
- ✅ End-to-end health checks
- ✅ Integration testing
- ✅ Performance validation
- ✅ Security verification
- ✅ Monitoring setup

## Monitoring and Observability

### Health Check Endpoints
```bash
# Service health checks
curl https://api.varai.ai/health
curl https://api.varai.ai/ai/health
curl https://api.varai.ai/face/health
curl https://api.varai.ai/recommendations/health
curl https://api.varai.ai/analytics/health

# Widget availability
curl https://cdn.varai.ai/widgets/html/latest/js/varai-widget.min.js
curl https://cdn.varai.ai/widgets/shopify/latest/widget.js
```

### Monitoring Dashboards
- **Grafana**: https://monitoring.varai.ai
- **Prometheus**: https://monitoring.varai.ai:9090
- **GCP Monitoring**: https://console.cloud.google.com/monitoring

### Key Metrics
- **Availability**: >99.9% uptime SLA
- **Response Time**: <2s p95 for API calls
- **Error Rate**: <1% for all services
- **Widget Load Time**: <3s p95
- **Face Analysis Time**: <5s average

### Alerting
- **Critical**: Service down, high error rate
- **Warning**: High response time, resource usage
- **Info**: Deployment events, scaling events

## Platform-Specific Deployment

### Shopify
- **Type**: Native app integration
- **Deployment**: Automatic with backend services
- **Access**: Shopify App Store
- **Configuration**: Admin dashboard

### WooCommerce
- **Type**: WordPress plugin
- **Deployment**: WordPress.org repository
- **Installation**: WordPress admin or WP-CLI
- **Configuration**: WooCommerce settings

### Magento
- **Type**: Magento 2 extension
- **Deployment**: Magento Marketplace + Composer
- **Installation**: Composer or manual
- **Configuration**: Magento admin panel

### HTML Widget
- **Type**: JavaScript widget
- **Deployment**: CDN + NPM package
- **Installation**: Script tag or npm install
- **Configuration**: JavaScript initialization

## Rollback Procedures

### Automatic Rollback Triggers
- Health check failures (3+ consecutive)
- Error rate >5% for 5+ minutes
- Response time >5s p95 for 10+ minutes
- Manual trigger via monitoring dashboard

### Manual Rollback
```bash
# Rollback all services
./deploy/blue-green/rollback.sh prod "manual_rollback_reason"

# Rollback specific platform
git revert <commit-hash>
git push origin main
```

### Rollback Validation
- Health checks pass
- Error rates return to normal
- Performance metrics restored
- User impact minimized

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **Configuration**: Version controlled in Git
- **Secrets**: Encrypted in Secret Manager
- **Assets**: Replicated across multiple regions

### Recovery Procedures
1. **Service Failure**: Automatic failover to healthy instances
2. **Region Failure**: Manual failover to secondary region
3. **Data Loss**: Restore from latest backup
4. **Complete Outage**: Full infrastructure recreation

### Recovery Time Objectives
- **RTO**: 4 hours maximum downtime
- **RPO**: 1 hour maximum data loss
- **MTTR**: 30 minutes mean time to recovery

## Security Considerations

### Data Protection
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- No face images stored on servers
- GDPR/CCPA compliance

### Access Control
- IAM-based service authentication
- API key authentication for widgets
- Rate limiting and DDoS protection
- Regular security audits

### Compliance
- SOC 2 Type II compliance
- GDPR data processing agreements
- Regular penetration testing
- Security incident response plan

## Performance Optimization

### CDN Configuration
- Global edge locations
- Brotli compression
- Image optimization
- Cache invalidation strategies

### Database Optimization
- Connection pooling
- Query optimization
- Read replicas
- Automated scaling

### Service Optimization
- Horizontal pod autoscaling
- Resource limits and requests
- Circuit breakers
- Caching strategies

## Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check deployment logs
kubectl logs -f deployment/ai-discovery-service
docker-compose logs -f ai-discovery-service

# Verify configuration
terraform plan
kubectl get pods
```

#### Service Connectivity
```bash
# Test service endpoints
curl -v https://api.varai.ai/health
nslookup api.varai.ai

# Check network policies
kubectl get networkpolicies
```

#### Widget Loading Issues
```bash
# Test CDN availability
curl -I https://cdn.varai.ai/widgets/html/latest/js/varai-widget.min.js

# Check browser console for errors
# Verify API key configuration
```

### Support Channels
- **Documentation**: https://docs.varai.ai
- **Support Email**: support@varai.ai
- **Emergency Hotline**: +1-800-VARAI-AI
- **Status Page**: https://status.varai.ai

## Post-Deployment Checklist

### Immediate (0-1 hour)
- [ ] All health checks passing
- [ ] Monitoring dashboards operational
- [ ] Error rates within normal range
- [ ] Performance metrics acceptable
- [ ] Widget loading successfully

### Short-term (1-24 hours)
- [ ] Integration tests passing
- [ ] Customer feedback monitoring
- [ ] Performance trend analysis
- [ ] Security scan results
- [ ] Backup verification

### Long-term (1-7 days)
- [ ] Business metrics tracking
- [ ] User adoption monitoring
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Documentation updates

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly, first Sunday 2-4 AM UTC
- **Duration**: 2 hours maximum
- **Notification**: 48 hours advance notice
- **Scope**: Security updates, performance optimization

### Emergency Maintenance
- **Trigger**: Critical security vulnerabilities
- **Approval**: CTO approval required
- **Communication**: Real-time status updates
- **Rollback**: Immediate if issues detected

## Version Management

### Semantic Versioning
- **Major**: Breaking changes (v2.0.0)
- **Minor**: New features (v1.1.0)
- **Patch**: Bug fixes (v1.0.1)

### Release Branches
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **release/***: Release preparation
- **hotfix/***: Emergency fixes

### Deployment Tags
```bash
# Production releases
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Pre-release versions
git tag -a v1.0.0-rc.1 -m "Release candidate 1"
git push origin v1.0.0-rc.1
```

## Contact Information

### Deployment Team
- **Lead**: DevOps Team Lead
- **Email**: devops@varai.ai
- **Slack**: #deployment-team

### On-Call Rotation
- **Primary**: Senior DevOps Engineer
- **Secondary**: Platform Engineer
- **Escalation**: Engineering Manager

### Emergency Contacts
- **CTO**: cto@varai.ai
- **VP Engineering**: vp-eng@varai.ai
- **Security Team**: security@varai.ai

---

*This document is maintained by the DevOps team and updated with each major release. Last updated: January 2025*