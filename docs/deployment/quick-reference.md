# VARAi Commerce Studio - Deployment Quick Reference

This quick reference guide provides common commands and procedures for deploying and managing the VARAi Commerce Studio platform in the staging environment.

## Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set the active project
gcloud config set project commerce-studio

# Configure Docker to use gcloud credentials
gcloud auth configure-docker

# Get Kubernetes credentials
gcloud container clusters get-credentials commerce-studio-staging --region us-central1

# Set the default namespace
kubectl config set-context --current --namespace=varai-staging
```

## Building and Pushing Images

```bash
# Build and push a single service
docker build -t gcr.io/commerce-studio/service-name:staging ./services/service-name
docker push gcr.io/commerce-studio/service-name:staging

# Build and push all services (using script)
./scripts/build-and-push-images.sh staging
```

## Deploying Services

```bash
# Deploy all services
kubectl apply -k kubernetes/overlays/staging

# Deploy a single service
kubectl apply -f kubernetes/overlays/staging/service-name-deployment.yaml

# Update a deployment with a new image
kubectl set image deployment/service-name service-name=gcr.io/commerce-studio/service-name:staging-new-tag
```

## Checking Status

```bash
# Check all deployments
kubectl get deployments

# Check all pods
kubectl get pods

# Check all services
kubectl get services

# Check logs for a service
kubectl logs deployment/service-name

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

## Database Operations

```bash
# Run PostgreSQL migrations
cd database/migrations/postgres
npm run migrate:up -- --env staging

# Run MongoDB migrations
cd database/migrations/mongodb
npm run migrate:mongodb -- --env staging

# Check migration status
npm run migrate:status -- --env staging
```

## Testing

```bash
# Run integration tests
cd tests/integration
NODE_ENV=staging npm run test

# Run E2E tests
cd tests/e2e
pytest -v
```

## Scaling

```bash
# Scale a deployment
kubectl scale deployment/service-name --replicas=3

# Enable autoscaling
kubectl autoscale deployment/service-name --min=2 --max=5 --cpu-percent=80
```

## Rollback

```bash
# Rollback a deployment to the previous version
kubectl rollout undo deployment/service-name

# Rollback to a specific revision
kubectl rollout undo deployment/service-name --to-revision=2

# Check rollout history
kubectl rollout history deployment/service-name
```

## Monitoring

```bash
# Check resource usage
kubectl top nodes
kubectl top pods

# Port-forward to monitoring services
kubectl port-forward svc/grafana 3000:3000
kubectl port-forward svc/prometheus 9090:9090
kubectl port-forward svc/kibana 5601:5601
```

## Common URLs

| Service | URL |
|---------|-----|
| Main Application | https://staging.varai-commerce.com |
| API Gateway | https://api-staging.varai-commerce.com |
| Grafana | https://grafana.staging.varai-commerce.com |
| Kibana | https://kibana.staging.varai-commerce.com |
| Prometheus | https://prometheus.staging.varai-commerce.com |

## Environment Variables

```bash
# View environment variables for a pod
kubectl exec deployment/service-name -- env

# Update environment variables in a ConfigMap
kubectl edit configmap service-name-config
```

## Secrets Management

```bash
# Create a new secret
kubectl create secret generic secret-name --from-literal=key=value

# Update an existing secret
kubectl create secret generic secret-name --from-literal=key=new-value --dry-run=client -o yaml | kubectl apply -f -

# View secrets (requires decoding)
kubectl get secret secret-name -o jsonpath='{.data.key}' | base64 --decode
```

## Troubleshooting Commands

```bash
# Check pod details
kubectl describe pod <pod-name>

# Check service details
kubectl describe service <service-name>

# Check ingress details
kubectl describe ingress <ingress-name>

# Check persistent volume claims
kubectl get pvc

# Check network policies
kubectl get networkpolicy

# Test network connectivity from a pod
kubectl exec -it <pod-name> -- curl <service-name>:<port>/health

# Check DNS resolution
kubectl exec -it <pod-name> -- nslookup <service-name>
```

## Common Error Resolutions

| Issue | Resolution |
|-------|------------|
| ImagePullBackOff | Check image name and credentials with `kubectl describe pod <pod-name>` |
| CrashLoopBackOff | Check logs with `kubectl logs <pod-name>` |
| Pending status | Check events with `kubectl describe pod <pod-name>` |
| Service unreachable | Check endpoints with `kubectl get endpoints <service-name>` |
| Database connection failure | Check connection string and credentials in secrets |

## Contact Information

- **DevOps Team**: devops@varai.com
- **Slack Channel**: #varai-devops
- **On-Call Engineer**: Available via PagerDuty