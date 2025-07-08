# EyewearML Production Deployment Plan

This document outlines the detailed plan for deploying the EyewearML platform to production.

## Pre-Deployment Preparation

### 1. Environment Configuration
- [x] Create `.env.production` file with production environment variables
- [x] Validate all required environment variables are present
- [x] Ensure sensitive values are properly secured

### 2. Infrastructure Setup
- [x] Create production namespace in Kubernetes
- [x] Configure resource quotas for the namespace
- [x] Set up network policies
- [ ] Configure persistent volumes for data storage
- [ ] Set up external DNS configuration

### 3. Container Registry Setup
- [ ] Create container registry for production images
- [ ] Configure access controls for the registry
- [ ] Set up CI/CD pipeline for automated image builds

### 4. Secret Management
- [x] Set up Google Cloud Secret Manager
- [x] Create script for essential secrets setup
- [x] Configure Kubernetes to use secrets from Secret Manager
- [ ] Set up rotation policy for sensitive secrets

## Deployment Process

### 1. Database Deployment
```bash
# Deploy MongoDB StatefulSet
kubectl apply -k kubernetes/overlays/prod/mongodb
```

- Verify MongoDB is running and accessible
- Initialize database with required collections
- Set up database users and permissions
- Configure database backups

### 2. Backend Services Deployment
```bash
# Deploy backend services
python scripts/deploy_with_secrets.py --project-id ml-datadriven-recos --deployment-type kubernetes --environment prod
```

- Deploy API service
- Deploy Auth service
- Deploy Recommendation service
- Deploy Virtual Try-On service
- Deploy Analytics service
- Verify all services are running correctly
- Configure service dependencies

### 3. Frontend Deployment
```bash
# Deploy frontend
kubectl apply -k kubernetes/overlays/prod/frontend
```

- Verify frontend is running correctly
- Configure CDN for static assets
- Set up caching strategies

### 4. Ingress and TLS Setup
```bash
# Deploy ingress with TLS
kubectl apply -f kubernetes/overlays/prod/ingress-tls.yaml
```

- Configure TLS certificates
- Set up automatic certificate renewal
- Configure DNS for production domain
- Verify external access is working correctly

## Post-Deployment Tasks

### 1. Monitoring and Logging Setup
```bash
# Deploy monitoring stack
kubectl apply -k kubernetes/monitoring
```

- Set up Prometheus for metrics collection
- Configure Grafana dashboards
- Set up centralized logging
- Configure alerts for critical services

### 2. Performance Testing
```bash
# Run performance tests
python scripts/performance_test.py --environment prod
```

- Conduct load testing
- Optimize resource allocation
- Verify scalability under load
- Adjust HPA settings based on performance metrics

### 3. Security Verification
```bash
# Run security scan
python scripts/security_scan.py --environment prod
```

- Perform security audit
- Verify all endpoints require authentication
- Check for exposed sensitive information
- Validate RBAC configuration

### 4. Backup and Disaster Recovery
```bash
# Set up backup jobs
kubectl apply -f kubernetes/backup/cronjobs.yaml
```

- Create backup and restore procedures
- Document recovery steps
- Test recovery process
- Set up automated backups

## Rollback Plan

In case of deployment issues, follow these steps to rollback:

### 1. Rollback Services
```bash
# Rollback specific deployment
kubectl rollout undo deployment/<deployment-name> -n varai-prod

# Rollback all deployments
for deployment in $(kubectl get deployments -n varai-prod -o jsonpath='{.items[*].metadata.name}'); do
  kubectl rollout undo deployment/$deployment -n varai-prod
done
```

### 2. Restore Database (if needed)
```bash
# Restore database from backup
kubectl exec -it mongodb-0 -n varai-prod -- mongorestore --uri="mongodb://username:password@localhost:27017" --archive=/backup/mongodb-backup.gz --gzip
```

### 3. Verify System Functionality
- Check all services are running correctly
- Verify data integrity
- Test critical user flows

## Deployment Verification Checklist

- [ ] All pods are running and ready
- [ ] Services are accessible within the cluster
- [ ] External endpoints are accessible
- [ ] Authentication is working correctly
- [ ] Database operations are functioning
- [ ] Monitoring and alerts are configured
- [ ] Backups are running successfully
- [ ] Performance meets requirements
- [ ] Security controls are in place

## Contacts and Escalation Path

### Primary Contacts
- **Deployment Lead**: [Name], [Email], [Phone]
- **DevOps Engineer**: [Name], [Email], [Phone]
- **Database Administrator**: [Name], [Email], [Phone]

### Escalation Path
1. **Level 1**: DevOps Engineer on duty
2. **Level 2**: Deployment Lead
3. **Level 3**: CTO

## Appendix

### A. Required Permissions
- Google Cloud Project Owner/Editor
- Kubernetes Cluster Admin
- Container Registry Write Access
- Secret Manager Admin

### B. Environment Variables
See `.env.production.example` for the list of required environment variables.

### C. Deployment Scripts
- `scripts/deploy_with_secrets.py`: Main deployment script
- `scripts/setup_essential_secrets.py`: Script to set up essential secrets
- `scripts/performance_test.py`: Script for performance testing
- `scripts/security_scan.py`: Script for security scanning