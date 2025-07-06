# EyewearML Platform Operational Runbook

## Overview

This operational runbook provides step-by-step procedures for managing, monitoring, and troubleshooting the EyewearML platform in production. It serves as the primary reference for operations teams, DevOps engineers, and on-call personnel.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Monitoring and Alerting](#monitoring-and-alerting)
3. [Incident Response Procedures](#incident-response-procedures)
4. [Routine Maintenance](#routine-maintenance)
5. [Backup and Recovery](#backup-and-recovery)
6. [Performance Optimization](#performance-optimization)
7. [Security Operations](#security-operations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Emergency Procedures](#emergency-procedures)
10. [Contact Information](#contact-information)

## System Architecture Overview

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Frontend      │    │   CDN           │
│   (nginx/ALB)   │    │   (React)       │    │   (CloudFlare)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Static Assets │    │   Media Storage │
│   (FastAPI)     │    │   (S3/MinIO)    │    │   (S3/MinIO)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Cache Layer   │    │   Message Queue │
│   Services      │    │   (Redis)       │    │   (Redis/RabbitMQ)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Search Engine │    │   ML Services   │
│   (MongoDB)     │    │   (Elasticsearch)│    │   (TensorFlow)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Dependencies

- **Frontend** → API Gateway → Application Services
- **Application Services** → Database, Cache, Message Queue
- **ML Services** → Application Services, Database
- **All Services** → Service Registry (Redis)

### Environment Configuration

- **Local**: Single-node development setup
- **Staging**: Multi-node staging environment
- **Production**: High-availability production cluster

## Monitoring and Alerting

### Key Metrics to Monitor

#### System Metrics
- **CPU Usage**: < 80% average, < 95% peak
- **Memory Usage**: < 85% average, < 95% peak
- **Disk Usage**: < 80% for data volumes, < 90% for system volumes
- **Network I/O**: Monitor for unusual spikes or drops

#### Application Metrics
- **Response Time**: < 200ms for API endpoints
- **Error Rate**: < 1% for critical endpoints
- **Throughput**: Requests per second
- **Active Users**: Concurrent user sessions

#### Database Metrics
- **Connection Pool**: < 80% utilization
- **Query Performance**: < 100ms average query time
- **Replication Lag**: < 1 second
- **Storage Growth**: Monitor disk usage trends

#### Business Metrics
- **User Registrations**: Daily/weekly trends
- **Virtual Try-On Usage**: Success rates and performance
- **Face Shape Analysis**: Accuracy and processing time
- **Revenue Metrics**: Transaction success rates

### Alert Thresholds

#### Critical Alerts (Immediate Response Required)
- API response time > 5 seconds
- Error rate > 5%
- Database connection failures
- Service unavailability
- Security incidents

#### Warning Alerts (Response Within 1 Hour)
- CPU usage > 80%
- Memory usage > 85%
- Disk usage > 80%
- Response time > 1 second
- Error rate > 2%

#### Info Alerts (Response Within 4 Hours)
- Deployment notifications
- Configuration changes
- Scheduled maintenance
- Performance degradation trends

### Monitoring Tools Setup

```bash
# Start monitoring system
python scripts/monitoring-setup.py

# Check monitoring status
curl http://localhost:8000/health/monitoring

# View active alerts
curl http://localhost:8000/alerts/active

# Get system metrics
curl http://localhost:8000/metrics
```

## Incident Response Procedures

### Incident Classification

#### Severity 1 (Critical)
- **Definition**: Complete service outage or security breach
- **Response Time**: Immediate (< 15 minutes)
- **Escalation**: Immediate to on-call engineer and management
- **Examples**: API completely down, database corruption, security breach

#### Severity 2 (High)
- **Definition**: Significant service degradation
- **Response Time**: < 1 hour
- **Escalation**: To on-call engineer
- **Examples**: High error rates, slow response times, partial outage

#### Severity 3 (Medium)
- **Definition**: Minor service issues
- **Response Time**: < 4 hours
- **Escalation**: Standard support queue
- **Examples**: Non-critical feature issues, minor performance degradation

#### Severity 4 (Low)
- **Definition**: Cosmetic or enhancement requests
- **Response Time**: Next business day
- **Escalation**: Development backlog
- **Examples**: UI improvements, feature requests

### Incident Response Workflow

#### 1. Detection and Alerting
```bash
# Check alert dashboard
curl http://localhost:8000/alerts/dashboard

# Review system status
python scripts/system-status.py

# Check service health
curl http://localhost:8000/health/dependencies
```

#### 2. Initial Assessment
```bash
# Gather system information
./scripts/incident-info-gathering.sh

# Check recent deployments
git log --oneline -10

# Review error logs
tail -f logs/application.log | grep ERROR
```

#### 3. Communication
- **Internal**: Update incident channel (#incidents)
- **External**: Status page updates if customer-facing
- **Stakeholders**: Notify management for Sev 1/2 incidents

#### 4. Investigation and Resolution
```bash
# Check application logs
docker-compose logs --tail=100 api

# Check database status
python scripts/database-health-check.py

# Check service registry
python -c "
from src.api.core.service_registry import ServiceRegistry
registry = ServiceRegistry()
print(registry.get_service_health_summary())
"

# Check resource usage
docker stats
kubectl top pods -n eyewear-ml
```

#### 5. Resolution and Recovery
```bash
# Restart services if needed
docker-compose restart api
kubectl rollout restart deployment/eyewear-api -n eyewear-ml

# Clear cache if needed
redis-cli -u $REDIS_URL flushdb

# Run health checks
python scripts/validate-config.py
curl http://localhost:8000/health
```

#### 6. Post-Incident Review
- Document root cause
- Update runbooks
- Implement preventive measures
- Schedule follow-up actions

### Common Incident Scenarios

#### API Service Down

**Symptoms:**
- Health check endpoints returning 5xx errors
- High error rates in monitoring
- User reports of service unavailability

**Investigation Steps:**
```bash
# Check service status
docker-compose ps
kubectl get pods -n eyewear-ml

# Check logs
docker-compose logs api
kubectl logs -f deployment/eyewear-api -n eyewear-ml

# Check resource usage
docker stats
kubectl top pods -n eyewear-ml

# Check configuration
python scripts/validate-config.py
```

**Resolution Steps:**
```bash
# Restart service
docker-compose restart api
kubectl rollout restart deployment/eyewear-api -n eyewear-ml

# If restart fails, check configuration
python scripts/test-environment.py

# Scale up if resource constrained
kubectl scale deployment/eyewear-api --replicas=5 -n eyewear-ml

# Check database connectivity
python scripts/database-health-check.py
```

#### Database Connection Issues

**Symptoms:**
- Database connection errors in logs
- Timeouts on database operations
- Service degradation

**Investigation Steps:**
```bash
# Check database status
docker-compose ps mongodb
kubectl get pods -l app=mongodb -n eyewear-ml

# Test connection
python -c "
import pymongo
client = pymongo.MongoClient('$DATABASE_URL')
print(client.server_info())
"

# Check connection pool
python scripts/database-connection-check.py
```

**Resolution Steps:**
```bash
# Restart database if needed
docker-compose restart mongodb
kubectl rollout restart deployment/mongodb -n eyewear-ml

# Clear connection pool
docker-compose restart api

# Check for long-running queries
python scripts/database-query-analysis.py

# Scale database if needed
kubectl scale deployment/mongodb --replicas=3 -n eyewear-ml
```

#### High Memory Usage

**Symptoms:**
- Memory usage alerts
- Application slowness
- Out of memory errors

**Investigation Steps:**
```bash
# Check memory usage
free -h
docker stats
kubectl top pods -n eyewear-ml

# Check for memory leaks
python scripts/memory-analysis.py

# Review application logs
grep -i "memory\|oom" logs/application.log
```

**Resolution Steps:**
```bash
# Restart affected services
docker-compose restart api
kubectl rollout restart deployment/eyewear-api -n eyewear-ml

# Scale horizontally
kubectl scale deployment/eyewear-api --replicas=5 -n eyewear-ml

# Clear cache
redis-cli -u $REDIS_URL flushdb

# Optimize queries if database-related
python scripts/optimize-database-queries.py
```

## Routine Maintenance

### Daily Tasks

#### Morning Health Check (9:00 AM)
```bash
#!/bin/bash
# Daily morning health check

echo "🌅 Daily Morning Health Check - $(date)"

# System health
python scripts/system-health-check.py

# Service status
curl -s http://localhost:8000/health | jq '.'

# Database health
python scripts/database-health-check.py

# Check disk space
df -h

# Check recent errors
tail -100 logs/application.log | grep ERROR | tail -10

# Check active alerts
curl -s http://localhost:8000/alerts/active | jq '.'

echo "✅ Morning health check completed"
```

#### Evening Summary (6:00 PM)
```bash
#!/bin/bash
# Daily evening summary

echo "🌆 Daily Evening Summary - $(date)"

# Generate daily report
python scripts/daily-report.py

# Check backup status
python scripts/backup-status-check.py

# Review performance metrics
python scripts/performance-summary.py

# Check security logs
python scripts/security-log-review.py

echo "✅ Evening summary completed"
```

### Weekly Tasks

#### Sunday Maintenance Window (2:00 AM)
```bash
#!/bin/bash
# Weekly maintenance tasks

echo "🔧 Weekly Maintenance - $(date)"

# Update system packages (staging first)
if [ "$ENVIRONMENT" = "staging" ]; then
    sudo apt update && sudo apt upgrade -y
fi

# Database maintenance
python scripts/database-maintenance.py

# Log rotation
logrotate /etc/logrotate.d/eyewear-ml

# Clean up old files
find logs/ -name "*.log" -mtime +7 -exec gzip {} \;
find backups/ -name "*.tar.gz" -mtime +30 -delete

# Performance optimization
python scripts/performance-optimization.py

# Security scan
python scripts/security-scan.py

# Generate weekly report
python scripts/weekly-report.py

echo "✅ Weekly maintenance completed"
```

### Monthly Tasks

#### First Sunday of Month (1:00 AM)
```bash
#!/bin/bash
# Monthly maintenance tasks

echo "📅 Monthly Maintenance - $(date)"

# Full system backup
python scripts/full-backup.py

# Security audit
python scripts/security-audit.py

# Performance analysis
python scripts/performance-analysis.py

# Dependency updates (staging first)
if [ "$ENVIRONMENT" = "staging" ]; then
    pip-review --auto
    npm audit fix
fi

# Certificate renewal check
python scripts/certificate-check.py

# Capacity planning review
python scripts/capacity-planning.py

# Generate monthly report
python scripts/monthly-report.py

echo "✅ Monthly maintenance completed"
```

## Backup and Recovery

### Backup Strategy

#### Database Backups
```bash
# Daily incremental backup
mongodump --uri="$DATABASE_URL" --out="backups/daily/$(date +%Y%m%d)"

# Weekly full backup
mongodump --uri="$DATABASE_URL" --out="backups/weekly/$(date +%Y%m%d)"

# Monthly archive backup
mongodump --uri="$DATABASE_URL" --gzip --out="backups/monthly/$(date +%Y%m%d)"
```

#### Configuration Backups
```bash
# Backup configuration files
tar -czf "backups/config/config_$(date +%Y%m%d).tar.gz" \
    src/api/core/config.py \
    .env* \
    docker-compose*.yml \
    k8s/
```

#### Application Data Backups
```bash
# Backup uploaded files
rsync -av data/uploads/ backups/uploads/$(date +%Y%m%d)/

# Backup logs
tar -czf "backups/logs/logs_$(date +%Y%m%d).tar.gz" logs/
```

### Recovery Procedures

#### Database Recovery
```bash
# Stop application
docker-compose stop api

# Restore from backup
mongorestore --uri="$DATABASE_URL" --drop backups/daily/20250111/

# Restart application
docker-compose start api

# Verify recovery
python scripts/database-integrity-check.py
```

#### Configuration Recovery
```bash
# Extract backup
tar -xzf backups/config/config_20250111.tar.gz

# Restore files
cp -r backup_extracted/* .

# Restart services
docker-compose restart

# Validate configuration
python scripts/validate-config.py
```

#### Point-in-Time Recovery
```bash
# For MongoDB with replica set and oplog
mongorestore --uri="$DATABASE_URL" \
    --oplogReplay \
    --oplogLimit="1641916800:1" \
    backups/full/20250111/
```

### Backup Verification

```bash
#!/bin/bash
# Verify backup integrity

echo "🔍 Verifying Backup Integrity"

# Test database backup
mongorestore --uri="mongodb://localhost:27017/test_restore" \
    --drop backups/daily/$(date +%Y%m%d)/

# Verify data integrity
python scripts/backup-verification.py

# Clean up test database
mongo mongodb://localhost:27017/test_restore --eval "db.dropDatabase()"

echo "✅ Backup verification completed"
```

## Performance Optimization

### Database Optimization

#### Index Management
```bash
# Check index usage
python scripts/database-index-analysis.py

# Create missing indexes
python scripts/create-database-indexes.py

# Remove unused indexes
python scripts/cleanup-unused-indexes.py
```

#### Query Optimization
```bash
# Analyze slow queries
python scripts/slow-query-analysis.py

# Optimize query patterns
python scripts/optimize-queries.py

# Update query statistics
python scripts/update-query-stats.py
```

### Application Optimization

#### Memory Optimization
```bash
# Profile memory usage
python scripts/memory-profiling.py

# Optimize cache usage
python scripts/cache-optimization.py

# Garbage collection tuning
python scripts/gc-optimization.py
```

#### CPU Optimization
```bash
# Profile CPU usage
python scripts/cpu-profiling.py

# Optimize algorithms
python scripts/algorithm-optimization.py

# Parallel processing optimization
python scripts/parallel-optimization.py
```

### Infrastructure Optimization

#### Auto-scaling Configuration
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eyewear-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eyewear-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Load Balancer Optimization
```nginx
# nginx configuration
upstream eyewear_api {
    least_conn;
    server api1:8000 max_fails=3 fail_timeout=30s;
    server api2:8000 max_fails=3 fail_timeout=30s;
    server api3:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.eyewearml.com;
    
    location / {
        proxy_pass http://eyewear_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

## Security Operations

### Security Monitoring

#### Log Analysis
```bash
# Check authentication logs
grep "authentication" logs/application.log | tail -100

# Check for suspicious activity
python scripts/security-log-analysis.py

# Check failed login attempts
grep "login.*failed" logs/application.log | tail -50
```

#### Vulnerability Scanning
```bash
# Scan dependencies
pip-audit
npm audit

# Scan Docker images
docker scan eyewear-ml:latest

# Security configuration check
python scripts/security-config-check.py
```

### Incident Response

#### Security Breach Response
1. **Immediate Actions**
   - Isolate affected systems
   - Change all credentials
   - Enable additional logging
   - Notify security team

2. **Investigation**
   - Analyze logs for breach timeline
   - Identify compromised data
   - Document attack vectors
   - Preserve evidence

3. **Recovery**
   - Patch vulnerabilities
   - Restore from clean backups
   - Update security measures
   - Monitor for reoccurrence

#### Credential Rotation
```bash
# Rotate database credentials
python scripts/rotate-database-credentials.py

# Rotate API keys
python scripts/rotate-api-keys.py

# Update application configuration
python scripts/update-security-config.py

# Restart services with new credentials
docker-compose restart
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: High CPU Usage
**Symptoms:** CPU usage consistently above 80%
**Diagnosis:**
```bash
# Check process usage
top -p $(pgrep -f "python.*api")
htop

# Profile application
python scripts/cpu-profiling.py
```
**Solutions:**
- Scale horizontally (add more instances)
- Optimize CPU-intensive operations
- Implement caching for expensive operations
- Review and optimize algorithms

#### Issue: Memory Leaks
**Symptoms:** Memory usage continuously increasing
**Diagnosis:**
```bash
# Monitor memory over time
python scripts/memory-monitoring.py

# Check for memory leaks
python scripts/memory-leak-detection.py
```
**Solutions:**
- Restart affected services
- Review code for memory leaks
- Implement proper garbage collection
- Add memory limits to containers

#### Issue: Database Performance
**Symptoms:** Slow query responses, high database CPU
**Diagnosis:**
```bash
# Check slow queries
python scripts/slow-query-analysis.py

# Check index usage
python scripts/index-usage-analysis.py
```
**Solutions:**
- Add missing indexes
- Optimize query patterns
- Implement query caching
- Consider database scaling

#### Issue: Network Connectivity
**Symptoms:** Intermittent connection failures
**Diagnosis:**
```bash
# Test network connectivity
ping database-host
telnet redis-host 6379
curl -I http://api-host:8000/health
```
**Solutions:**
- Check network configuration
- Verify firewall rules
- Test DNS resolution
- Check load balancer configuration

## Emergency Procedures

### Complete System Outage

#### Immediate Response (0-15 minutes)
1. **Assess Scope**
   ```bash
   # Check all services
   docker-compose ps
   kubectl get pods -n eyewear-ml
   
   # Check external dependencies
   curl -I https://external-api.com/health
   ```

2. **Communication**
   - Update status page
   - Notify stakeholders
   - Start incident bridge

3. **Quick Fixes**
   ```bash
   # Restart all services
   docker-compose restart
   kubectl rollout restart deployment -n eyewear-ml
   
   # Check for obvious issues
   python scripts/emergency-diagnostics.py
   ```

#### Recovery Phase (15-60 minutes)
1. **Detailed Investigation**
   ```bash
   # Gather comprehensive logs
   ./scripts/emergency-log-collection.sh
   
   # Check system resources
   ./scripts/system-resource-check.sh
   ```

2. **Systematic Recovery**
   ```bash
   # Restore from backup if needed
   ./scripts/emergency-restore.sh
   
   # Validate each component
   python scripts/component-validation.py
   ```

### Data Corruption

#### Immediate Response
1. **Stop Write Operations**
   ```bash
   # Put application in read-only mode
   kubectl patch deployment eyewear-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"READ_ONLY_MODE","value":"true"}]}]}}}}'
   ```

2. **Assess Damage**
   ```bash
   # Check data integrity
   python scripts/data-integrity-check.py
   
   # Identify corruption scope
   python scripts/corruption-analysis.py
   ```

3. **Recovery**
   ```bash
   # Restore from latest clean backup
   ./scripts/data-recovery.sh
   
   # Verify data integrity
   python scripts/post-recovery-validation.py
   ```

### Security Incident

#### Immediate Response
1. **Isolate Systems**
   ```bash
   # Block suspicious IPs
   iptables -A INPUT -s suspicious-ip -j DROP
   
   # Disable compromised accounts
   python scripts/disable-compromised-accounts.py
   ```

2. **Preserve Evidence**
   ```bash
   # Capture system state
   ./scripts/forensic-capture.sh
   
   # Backup logs
   tar -czf security-incident-logs-$(date +%Y%m%d).tar.gz logs/
   ```

3. **Secure Environment**
   ```bash
   # Rotate all credentials
   ./scripts/emergency-credential-rotation.sh
   
   # Apply security patches
   ./scripts/emergency-security-patches.sh
   ```

## Contact Information

### On-Call Rotation
- **Primary On-Call**: +1-555-0101 (ops-primary@eyewearml.com)
- **Secondary On-Call**: +1-555-0102 (ops-secondary@eyewearml.com)
- **Escalation Manager**: +1-555-0103 (ops-manager@eyewearml.com)

### Team Contacts
- **DevOps Team**: devops@eyewearml.com
- **Development Team**: dev@eyewearml.com
- **Security Team**: security@eyewearml.com
- **Management**: management@eyewearml.com

### External Vendors
- **Cloud Provider Support**: [Provider-specific contact]
- **Database Support**: [MongoDB support contact]
- **CDN Support**: [CloudFlare support contact]

### Communication Channels
- **Slack**: #incidents, #ops-alerts, #general
- **Status Page**: https://status.eyewearml.com
- **Monitoring Dashboard**: https://monitoring.eyewearml.com

## Appendix

### Useful Commands Reference

```bash
# System monitoring
htop
iotop
nethogs
df -h
free -h

# Docker operations
docker-compose ps
docker-compose logs --tail=100 service-name
docker stats
docker system prune

# Kubernetes operations
kubectl get pods -n eyewear-ml
kubectl logs -f deployment/eyewear-api -n eyewear-ml
kubectl top pods -n eyewear-ml
kubectl describe pod pod-name -n eyewear-ml

# Database operations
mongo $DATABASE_URL --eval "db.stats()"
redis-cli -u $REDIS_URL info
mongodump --uri="$DATABASE_URL" --out=backup/

# Application operations
curl http://localhost:8000/health
python scripts/validate-config.py
python scripts/test-environment.py
```

### Log Locations

- **Application Logs**: `logs/application.log`
- **Error Logs**: `logs/error.log`
- **Access Logs**: `logs/access.log`
- **Security Logs**: `logs/security.log`
- **Monitoring Logs**: `logs/monitoring.log`

### Configuration Files

- **Main Config**: `src/api/core/config.py`
- **Environment**: `.env`, `.env.production`
- **Docker**: `docker-compose.yml`
- **Kubernetes**: `k8s/`
- **Nginx**: `/etc/nginx/sites-available/eyewear-ml`

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-11  
**Next Review**: 2025-02-11  
**Owner**: DevOps Team