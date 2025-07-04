# MongoDB Foundation Service - Implementation Guide

This guide provides step-by-step implementation instructions for deploying the MongoDB Foundation Service with comprehensive monitoring.

## Quick Start

### 1. Prerequisites
- Kubernetes cluster (GKE recommended)
- kubectl configured
- Helm 3.x installed
- Docker registry access

### 2. Deployment Commands

```bash
# Create namespace
kubectl create namespace mongodb-foundation

# Apply base configurations
kubectl apply -k kubernetes/overlays/staging/

# Verify deployment
kubectl get pods -n mongodb-foundation
```

### 3. Monitoring Setup

```bash
# Deploy Prometheus rules
kubectl apply -f observability/prometheus/rules/

# Import Grafana dashboard
# Use the JSON configuration from the strategy document
```

## Key Configuration Files

### Base Kustomization
```yaml
# kubernetes/base/mongodb-foundation/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - mongodb-statefulset.yaml
  - mongodb-foundation-service-deployment.yaml
  - configmap.yaml
  - network-policy.yaml
```

### Staging Environment
```yaml
# kubernetes/overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: mongodb-foundation-staging
resources:
  - ../../base/mongodb-foundation
configMapGenerator:
  - name: mongodb-foundation-config
    literals:
      - MONGODB_DATABASE=eyewear_ml_staging
      - NODE_ENV=staging
```

### MongoDB StatefulSet
```yaml
# Key configuration for MongoDB with monitoring
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb-foundation
spec:
  serviceName: mongodb-foundation-headless
  replicas: 3
  template:
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        command: [mongod, --replSet=rs0, --auth]
      - name: mongodb-exporter
        image: percona/mongodb_exporter:0.40
        ports:
        - containerPort: 9216
```

## Security Configuration

### Network Policy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mongodb-foundation-netpol
spec:
  podSelector:
    matchLabels:
      app: mongodb-foundation
  policyTypes: [Ingress, Egress]
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: mongodb-foundation-service
    ports:
    - protocol: TCP
      port: 27017
```

### Secret Management
```yaml
# External Secrets integration
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: mongodb-credentials
spec:
  secretStoreRef:
    name: gcpsm-secret-store
    kind: SecretStore
  data:
  - secretKey: uri
    remoteRef:
      key: mongodb-foundation-uri
```

## Monitoring Configuration

### Prometheus Rules
```yaml
groups:
- name: mongodb-foundation.rules
  rules:
  - alert: MongoDBFoundationServiceDown
    expr: up{job="mongodb-foundation-service"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "MongoDB Foundation Service is down"
```

### Grafana Dashboard Key Panels
- Service uptime and request rate
- Response time percentiles (95th, 50th)
- MongoDB operations by collection
- SKU Genie pipeline health
- Error rate monitoring

## Implementation Steps

### Phase 1: Infrastructure (Days 1-7)
1. **Day 1-2**: Set up Kubernetes namespace and RBAC
2. **Day 3-5**: Deploy MongoDB StatefulSet with monitoring
3. **Day 6-7**: Configure basic Prometheus/Grafana monitoring

### Phase 2: Enhanced Monitoring (Days 8-14)
1. **Day 8-10**: Implement application metrics and SKU Genie pipeline monitoring
2. **Day 11-12**: Set up distributed tracing with OpenTelemetry
3. **Day 13-14**: Configure advanced alerting and notification routing

### Phase 3: Production Readiness (Days 15-21)
1. **Day 15-17**: Security hardening and access controls
2. **Day 18-19**: Performance optimization and load testing
3. **Day 20-21**: Documentation and team training

## Verification Commands

```bash
# Check service health
kubectl get pods -n mongodb-foundation
kubectl logs -f deployment/mongodb-foundation-service -n mongodb-foundation

# Verify monitoring
curl -s http://mongodb-foundation-service:3000/metrics | grep mongodb_
kubectl port-forward svc/prometheus 9090:9090 -n observability

# Test database connectivity
kubectl exec -it mongodb-foundation-0 -- mongo --eval "db.adminCommand('ping')"
```

## Troubleshooting

### Common Issues
1. **Pod startup failures**: Check resource limits and storage class
2. **MongoDB replica set issues**: Verify network policies and DNS resolution
3. **Monitoring gaps**: Ensure Prometheus can scrape metrics endpoints
4. **High latency**: Review query performance and index usage

### Useful Commands
```bash
# Debug pod issues
kubectl describe pod <pod-name> -n mongodb-foundation
kubectl logs <pod-name> -c mongodb-exporter -n mongodb-foundation

# Check resource usage
kubectl top pods -n mongodb-foundation
kubectl get pv,pvc -n mongodb-foundation

# Verify network connectivity
kubectl exec -it <pod-name> -- nslookup mongodb-foundation-headless
```

## Success Metrics

| Metric | Target | Command to Check |
|--------|--------|------------------|
| Service Availability | 99.9% | `kubectl get pods -n mongodb-foundation` |
| Response Time (95th) | < 500ms | Check Grafana dashboard |
| MongoDB Query Performance | < 100ms average | MongoDB slow query logs |
| Error Rate | < 0.1% | Prometheus error rate metrics |

For detailed configuration files and advanced setup, refer to the main MongoDB Foundation Deployment and Monitoring Strategy document.