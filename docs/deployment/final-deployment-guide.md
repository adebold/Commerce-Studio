# EyewearML Final Deployment Guide

This guide provides comprehensive instructions for deploying the EyewearML platform to production. It covers all necessary steps from pre-deployment preparation to post-deployment verification and maintenance.

## Prerequisites

Before beginning the deployment process, ensure the following prerequisites are met:

- Access to Google Cloud Platform with appropriate permissions
- `gcloud` CLI installed and configured
- `kubectl` installed and configured
- `helm` installed (for monitoring setup)
- GitHub CLI (`gh`) installed and authenticated (for secrets management)
- Access to the GitHub repository

## 1. Pre-Deployment Preparation

### 1.1 Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/eyewear-ml.git
   cd eyewear-ml
   ```

2. **Set up environment variables**:
   ```bash
   # Generate secure environment values
   python scripts/generate_env_values.py --output .env.production
   
   # Review and edit the generated values if necessary
   ```

3. **Upload secrets to Google Cloud Secret Manager**:
   ```bash
   # Set up GCP secrets
   python scripts/setup_gcp_secrets.py --project-id ml-datadriven-recos --env-file .env.production --prefix eyewear-ml
   ```

4. **Set up GitHub Secrets for CI/CD**:
   ```bash
   # Upload secrets to GitHub
   python scripts/setup_github_secrets.py --env-file .env.production --repo your-org/eyewear-ml
   ```

5. **Configure GitHub Actions for deployment**:
   ```bash
   # Set up GitHub Actions workflow
   python scripts/setup_github_actions.py --project-id ml-datadriven-recos --cluster-name eyewear-ml-cluster --zone us-central1-a
   ```

### 1.2 Security Hardening

1. **Implement password policies**:
   ```bash
   # Debug and fix the script first
   python scripts/enforce_password_policy.py
   ```

2. **Implement rate limiting**:
   ```bash
   # Debug and fix the script first
   python scripts/implement_rate_limiting.py
   ```

3. **Configure CORS headers**:
   ```bash
   # Debug and fix the script first
   python scripts/configure_cors.py
   ```

4. **Run security scan**:
   ```bash
   # Install security scanning tools if not already installed
   pip install safety bandit
   
   # Scan dependencies for vulnerabilities
   safety check -r requirements.txt
   
   # Scan code for security issues
   bandit -r src/
   ```

### 1.3 Monitoring Setup

1. **Set up monitoring infrastructure**:
   ```bash
   # Set up Prometheus, Grafana, and ELK stack
   python scripts/setup_monitoring.py --app-namespace varai-prod --monitoring-namespace monitoring
   ```

2. **Verify monitoring dashboards**:
   ```bash
   # Port forward to access Grafana
   kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
   
   # Access Grafana at http://localhost:3000
   # Username: admin
   # Password: (retrieved from the script output)
   ```

3. **Configure alerting**:
   - Set up alert rules in Grafana
   - Configure notification channels (email, Slack, etc.)
   - Test alerts to ensure they're working properly

## 2. Deployment Process

### 2.1 Database Migration

1. **Back up the database**:
   ```bash
   # For PostgreSQL
   pg_dump -h <host> -U <username> -d <database> -f backup.sql
   
   # For MySQL
   mysqldump -h <host> -u <username> -p <database> > backup.sql
   ```

2. **Run database migrations**:
   ```bash
   # Using Alembic
   alembic upgrade head
   
   # Or using your ORM's migration tool
   ```

3. **Verify data integrity**:
   - Check that all tables are created correctly
   - Verify that data is migrated properly
   - Run data validation queries

### 2.2 Deployment Execution

1. **Deploy to production**:
   ```bash
   # Deploy with secrets
   python scripts/deploy_with_secrets.py --project-id ml-datadriven-recos --deployment-type kubernetes --environment prod
   ```

2. **Monitor deployment progress**:
   ```bash
   # Check deployment status
   kubectl get deployments -n varai-prod
   
   # Check pod status
   kubectl get pods -n varai-prod
   
   # Check logs
   kubectl logs -f deployment/eyewear-ml-api -n varai-prod
   kubectl logs -f deployment/eyewear-ml-frontend -n varai-prod
   ```

3. **Verify all services are running**:
   ```bash
   # Check services
   kubectl get services -n varai-prod
   
   # Check ingress
   kubectl get ingress -n varai-prod
   ```

### 2.3 Smoke Testing

1. **Run smoke tests**:
   ```bash
   # Run E2E tests against production
   cd tests/e2e
   npm test -- --env=prod
   ```

2. **Verify critical functionality**:
   - Test authentication and authorization
   - Test core business functionality
   - Test integration points with external systems

3. **Check for errors in logs**:
   ```bash
   # Check for errors in logs
   kubectl logs -f deployment/eyewear-ml-api -n varai-prod | grep -i error
   ```

## 3. Post-Deployment Verification

### 3.1 Performance Verification

1. **Monitor system performance**:
   - Check CPU and memory usage
   - Monitor response times
   - Track error rates

2. **Load testing**:
   ```bash
   # Run load tests if applicable
   cd tests/load
   npm test
   ```

3. **Verify scaling capabilities**:
   - Test horizontal pod autoscaling
   - Verify that the system can handle increased load

### 3.2 Security Verification

1. **Run security scans**:
   ```bash
   # Run security scans against the deployed application
   # Use tools like OWASP ZAP, Nessus, etc.
   ```

2. **Verify access controls**:
   - Test role-based access control
   - Verify that unauthorized users cannot access protected resources
   - Test API key validation

3. **Penetration testing**:
   - Engage a security team or third-party to perform penetration testing
   - Address any vulnerabilities identified

### 3.3 Documentation

1. **Update documentation**:
   - Update API documentation
   - Update user guides
   - Update deployment documentation

2. **Create runbooks**:
   - Document common issues and their solutions
   - Create troubleshooting guides
   - Document incident response procedures

## 4. Rollback Procedures

In case of critical issues during deployment, follow these steps to rollback:

### 4.1 Kubernetes Rollback

```bash
# Rollback API deployment
kubectl rollout undo deployment/eyewear-ml-api -n varai-prod

# Rollback Frontend deployment
kubectl rollout undo deployment/eyewear-ml-frontend -n varai-prod

# Verify rollback
kubectl rollout status deployment/eyewear-ml-api -n varai-prod
kubectl rollout status deployment/eyewear-ml-frontend -n varai-prod
```

### 4.2 Database Rollback

```bash
# For Alembic
alembic downgrade <previous_revision>

# Or restore from backup
# For PostgreSQL
psql -h <host> -U <username> -d <database> -f backup.sql

# For MySQL
mysql -h <host> -u <username> -p <database> < backup.sql
```

### 4.3 DNS Rollback

If DNS changes were made:

```bash
# Update DNS records to point to the previous version
# This will depend on your DNS provider
```

## 5. Maintenance and Support

### 5.1 Regular Maintenance

1. **Secret rotation**:
   ```bash
   # Generate new secrets
   python scripts/generate_env_values.py --output .env.production
   
   # Update secrets in Google Cloud Secret Manager
   python scripts/setup_gcp_secrets.py --project-id ml-datadriven-recos --env-file .env.production --prefix eyewear-ml
   
   # Update secrets in GitHub
   python scripts/setup_github_secrets.py --env-file .env.production --repo your-org/eyewear-ml
   ```

2. **Dependency updates**:
   ```bash
   # Check for outdated dependencies
   pip list --outdated
   
   # Update dependencies
   pip install -U <package>
   
   # Update requirements.txt
   pip freeze > requirements.txt
   ```

3. **Security audits**:
   - Conduct regular security audits
   - Review access logs
   - Check for unauthorized access attempts

### 5.2 Monitoring and Alerting

1. **Review monitoring dashboards**:
   - Check for performance issues
   - Look for error patterns
   - Identify potential bottlenecks

2. **Review alerts**:
   - Address any triggered alerts
   - Update alert thresholds if necessary
   - Add new alerts for emerging patterns

3. **Log analysis**:
   - Review logs for errors and warnings
   - Look for security-related events
   - Identify potential issues before they become critical

## 6. Troubleshooting Common Issues

### 6.1 Deployment Issues

1. **Pod startup failures**:
   ```bash
   # Check pod status
   kubectl get pods -n varai-prod
   
   # Check pod logs
   kubectl logs <pod-name> -n varai-prod
   
   # Describe pod for events
   kubectl describe pod <pod-name> -n varai-prod
   ```

2. **Service connectivity issues**:
   ```bash
   # Check service endpoints
   kubectl get endpoints -n varai-prod
   
   # Test connectivity from within the cluster
   kubectl run -it --rm debug --image=busybox -- wget -O- <service-name>:<port>
   ```

3. **Resource constraints**:
   ```bash
   # Check resource usage
   kubectl top pods -n varai-prod
   kubectl top nodes
   ```

### 6.2 Application Issues

1. **Authentication failures**:
   - Check JWT secret configuration
   - Verify token expiration settings
   - Check for clock skew between services

2. **Database connectivity issues**:
   - Verify database connection strings
   - Check database credentials
   - Ensure database is accessible from the cluster

3. **API errors**:
   - Check API logs for detailed error messages
   - Verify API endpoint configuration
   - Test API endpoints with Postman or curl

## Conclusion

Following this deployment guide will ensure a smooth transition to production for the EyewearML platform. The guide covers all aspects of the deployment process, from preparation to post-deployment verification and maintenance.

Remember to thoroughly test each step before proceeding to the next, and always have a rollback plan in case of issues. Regular maintenance and monitoring are essential to ensure the continued health and security of the platform.

For any questions or issues, please contact the DevOps team or refer to the project documentation.