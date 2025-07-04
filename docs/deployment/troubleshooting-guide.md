# VARAi Commerce Studio - Deployment Troubleshooting Guide

This guide provides solutions for common issues encountered during the deployment of VARAi Commerce Studio to the staging environment.

## Table of Contents

1. [Infrastructure Issues](#infrastructure-issues)
2. [Kubernetes Deployment Issues](#kubernetes-deployment-issues)
3. [Service Connectivity Issues](#service-connectivity-issues)
4. [Database Issues](#database-issues)
5. [Authentication and Authorization Issues](#authentication-and-authorization-issues)
6. [Performance Issues](#performance-issues)
7. [Monitoring and Logging Issues](#monitoring-and-logging-issues)
8. [CI/CD Pipeline Issues](#cicd-pipeline-issues)

## Infrastructure Issues

### Terraform Apply Failures

**Symptoms:**
- Terraform apply command fails with error messages
- Resources not created or updated as expected

**Troubleshooting Steps:**

1. Check Terraform state:
   ```bash
   terraform state list
   ```

2. Verify GCP permissions:
   ```bash
   gcloud projects get-iam-policy commerce-studio
   ```

3. Check for resource conflicts:
   ```bash
   terraform plan
   ```

4. Look for quota issues:
   ```bash
   gcloud compute project-info describe --project commerce-studio
   ```

**Common Solutions:**

- **Permission Issues**: Ensure your account has the necessary IAM roles (e.g., Editor, Compute Admin)
  ```bash
  gcloud projects add-iam-policy-binding commerce-studio --member=user:your-email@example.com --role=roles/editor
  ```

- **State Lock Issues**: If the state is locked, check if another operation is in progress or force unlock:
  ```bash
  terraform force-unlock <LOCK_ID>
  ```

- **Quota Exceeded**: Request quota increases through the GCP Console

- **Resource Already Exists**: Import existing resources into Terraform state:
  ```bash
  terraform import google_compute_instance.my_instance projects/commerce-studio/zones/us-central1-a/instances/instance-name
  ```

### Network Configuration Issues

**Symptoms:**
- Services cannot communicate with each other
- External access to services fails

**Troubleshooting Steps:**

1. Check firewall rules:
   ```bash
   gcloud compute firewall-rules list --project commerce-studio
   ```

2. Verify VPC configuration:
   ```bash
   gcloud compute networks describe default --project commerce-studio
   ```

3. Check subnet configuration:
   ```bash
   gcloud compute networks subnets list --project commerce-studio
   ```

**Common Solutions:**

- **Missing Firewall Rules**: Create necessary firewall rules:
  ```bash
  gcloud compute firewall-rules create allow-internal --allow tcp:0-65535,udp:0-65535,icmp --source-ranges 10.0.0.0/8
  ```

- **VPC Peering Issues**: Establish or fix VPC peering:
  ```bash
  gcloud compute networks peerings create peering-name --network=network-name --peer-project=peer-project-id --peer-network=peer-network
  ```

## Kubernetes Deployment Issues

### Pod Startup Failures

**Symptoms:**
- Pods stuck in `Pending`, `ContainerCreating`, or `CrashLoopBackOff` state
- Deployment shows 0 ready replicas

**Troubleshooting Steps:**

1. Check pod status:
   ```bash
   kubectl get pods
   ```

2. Describe the pod for detailed information:
   ```bash
   kubectl describe pod <pod-name>
   ```

3. Check pod logs:
   ```bash
   kubectl logs <pod-name>
   ```

4. Check events:
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```

**Common Solutions:**

- **ImagePullBackOff**: Verify image name and credentials:
  ```bash
  # Check image name in deployment
  kubectl get deployment <deployment-name> -o jsonpath='{.spec.template.spec.containers[0].image}'
  
  # Ensure Docker credentials are configured
  gcloud auth configure-docker
  ```

- **CrashLoopBackOff**: Check application logs and fix application errors:
  ```bash
  kubectl logs <pod-name> --previous
  ```

- **Pending Status**: Check for resource constraints or node issues:
  ```bash
  # Check node capacity
  kubectl describe nodes
  
  # Check resource requests and limits
  kubectl describe pod <pod-name> | grep -A 3 Requests
  ```

- **ConfigMap or Secret Missing**: Create missing ConfigMaps or Secrets:
  ```bash
  kubectl create configmap <config-name> --from-file=config.json
  kubectl create secret generic <secret-name> --from-literal=key=value
  ```

### Service Discovery Issues

**Symptoms:**
- Services cannot find each other
- DNS resolution fails

**Troubleshooting Steps:**

1. Check service definition:
   ```bash
   kubectl get service <service-name> -o yaml
   ```

2. Check endpoints:
   ```bash
   kubectl get endpoints <service-name>
   ```

3. Test DNS resolution from a pod:
   ```bash
   kubectl exec -it <pod-name> -- nslookup <service-name>
   ```

**Common Solutions:**

- **No Endpoints**: Ensure labels match between service and pods:
  ```bash
  # Check service selector
  kubectl get service <service-name> -o jsonpath='{.spec.selector}'
  
  # Check pod labels
  kubectl get pods --show-labels
  ```

- **DNS Issues**: Verify CoreDNS is running:
  ```bash
  kubectl get pods -n kube-system -l k8s-app=kube-dns
  ```

- **Network Policy Blocking**: Check network policies:
  ```bash
  kubectl get networkpolicy
  ```

## Service Connectivity Issues

### API Gateway Issues

**Symptoms:**
- 502 Bad Gateway errors
- Services unreachable through API Gateway

**Troubleshooting Steps:**

1. Check API Gateway pods:
   ```bash
   kubectl get pods -l app=api-gateway
   ```

2. Check API Gateway configuration:
   ```bash
   kubectl get kongplugin
   kubectl get kongconsumer
   kubectl get kongingress
   ```

3. Check API Gateway logs:
   ```bash
   kubectl logs -l app=api-gateway
   ```

**Common Solutions:**

- **Misconfigured Routes**: Update Kong configuration:
  ```bash
  kubectl apply -f kubernetes/api-gateway/staging/kong-config.yaml
  ```

- **Upstream Service Unavailable**: Ensure backend services are running:
  ```bash
  kubectl get pods -l app=<service-name>
  ```

- **Rate Limiting Issues**: Adjust rate limiting configuration:
  ```bash
  kubectl edit kongplugin rate-limiting
  ```

### Cross-Service Communication Issues

**Symptoms:**
- Services cannot communicate with each other
- Timeout errors in service logs

**Troubleshooting Steps:**

1. Check service endpoints:
   ```bash
   kubectl get endpoints
   ```

2. Test connectivity between services:
   ```bash
   kubectl exec -it <pod-name> -- curl <service-name>:<port>/health
   ```

3. Check network policies:
   ```bash
   kubectl get networkpolicy
   ```

**Common Solutions:**

- **Network Policy Blocking**: Update network policies to allow communication:
  ```bash
  kubectl apply -f kubernetes/network-policies/allow-internal-traffic.yaml
  ```

- **Service Discovery Issues**: Ensure services are using correct names and ports:
  ```bash
  # Check environment variables in pods
  kubectl exec -it <pod-name> -- env | grep SERVICE
  ```

- **Timeout Configuration**: Adjust timeout settings in service configuration:
  ```bash
  kubectl edit configmap <service-name>-config
  ```

## Database Issues

### Connection Failures

**Symptoms:**
- Services cannot connect to databases
- Database connection errors in logs

**Troubleshooting Steps:**

1. Check database service status:
   ```bash
   # For PostgreSQL
   gcloud sql instances describe postgres-staging
   
   # For MongoDB Atlas
   # Check through MongoDB Atlas UI
   ```

2. Verify connection strings:
   ```bash
   kubectl get secret database-credentials -o jsonpath='{.data.connection-string}' | base64 --decode
   ```

3. Test connection from a pod:
   ```bash
   kubectl exec -it <pod-name> -- env | grep DB_
   kubectl exec -it <pod-name> -- curl <database-service>:<port>
   ```

**Common Solutions:**

- **Incorrect Connection String**: Update database secrets:
  ```bash
  kubectl create secret generic database-credentials --from-literal=connection-string=<updated-connection-string> --dry-run=client -o yaml | kubectl apply -f -
  ```

- **Network Access Issues**: Update database firewall rules:
  ```bash
  # For Cloud SQL
  gcloud sql instances patch postgres-staging --authorized-networks=<IP_RANGE>
  
  # For MongoDB Atlas
  # Update IP whitelist through MongoDB Atlas UI
  ```

- **Authentication Issues**: Update database user credentials:
  ```bash
  # For Cloud SQL
  gcloud sql users set-password postgres --instance=postgres-staging --password=<new-password>
  
  # For MongoDB Atlas
  # Update user through MongoDB Atlas UI
  ```

### Migration Failures

**Symptoms:**
- Database migrations fail to apply
- Schema version mismatch errors

**Troubleshooting Steps:**

1. Check migration status:
   ```bash
   # For PostgreSQL
   npm run migrate:status -- --env staging
   
   # For MongoDB
   npm run migrate:mongodb:status -- --env staging
   ```

2. Check migration logs:
   ```bash
   # Look for error messages in migration output
   ```

**Common Solutions:**

- **Migration Already Applied**: Reset migration state if necessary:
  ```bash
  npm run migrate:down -- --env staging
  ```

- **Schema Conflicts**: Resolve conflicts in migration files:
  ```bash
  # Edit migration files to resolve conflicts
  ```

- **Database Permission Issues**: Ensure database user has necessary permissions:
  ```bash
  # For Cloud SQL
  gcloud sql users set-password postgres --instance=postgres-staging --password=<new-password>
  
  # For MongoDB Atlas
  # Update user permissions through MongoDB Atlas UI
  ```

## Authentication and Authorization Issues

### Authentication Service Issues

**Symptoms:**
- Users cannot log in
- Token validation failures

**Troubleshooting Steps:**

1. Check Authentication Service pods:
   ```bash
   kubectl get pods -l app=authentication-service
   ```

2. Check Authentication Service logs:
   ```bash
   kubectl logs -l app=authentication-service
   ```

3. Verify authentication configuration:
   ```bash
   kubectl get configmap authentication-service-config -o yaml
   ```

**Common Solutions:**

- **Misconfigured Auth Provider**: Update authentication configuration:
  ```bash
  kubectl edit configmap authentication-service-config
  ```

- **Invalid JWT Secret**: Update JWT secret:
  ```bash
  kubectl create secret generic jwt-secret --from-literal=JWT_SECRET=<new-secret> --dry-run=client -o yaml | kubectl apply -f -
  ```

- **User Database Issues**: Check user database connectivity:
  ```bash
  kubectl exec -it <auth-pod-name> -- curl <user-db-service>:<port>
  ```

### Authorization Issues

**Symptoms:**
- Access denied errors
- Permission-related errors in logs

**Troubleshooting Steps:**

1. Check role assignments:
   ```bash
   # This depends on your authorization implementation
   kubectl exec -it <auth-pod-name> -- curl <auth-service>:<port>/roles
   ```

2. Check authorization logs:
   ```bash
   kubectl logs -l app=authentication-service | grep "authorization"
   ```

**Common Solutions:**

- **Missing Role Assignments**: Update user roles:
  ```bash
  # This depends on your authorization implementation
  ```

- **Incorrect Permission Configuration**: Update permission settings:
  ```bash
  kubectl edit configmap authorization-config
  ```

## Performance Issues

### Resource Constraints

**Symptoms:**
- Services slow or unresponsive
- OOMKilled pod status

**Troubleshooting Steps:**

1. Check resource usage:
   ```bash
   kubectl top nodes
   kubectl top pods
   ```

2. Check resource requests and limits:
   ```bash
   kubectl describe pod <pod-name> | grep -A 3 Requests
   ```

**Common Solutions:**

- **Insufficient Resources**: Increase resource allocations:
  ```bash
  kubectl edit deployment <deployment-name>
  # Update resources.requests and resources.limits
  ```

- **Node Pressure**: Add more nodes to the cluster:
  ```bash
  gcloud container clusters resize $K8S_CLUSTER_NAME --region $GCP_REGION --num-nodes=5
  ```

- **Memory Leaks**: Identify and fix memory leaks in application code

### Scaling Issues

**Symptoms:**
- Services cannot scale up under load
- Autoscaling not working as expected

**Troubleshooting Steps:**

1. Check HorizontalPodAutoscaler status:
   ```bash
   kubectl get hpa
   ```

2. Check metrics availability:
   ```bash
   kubectl get --raw "/apis/metrics.k8s.io/v1beta1/nodes"
   ```

**Common Solutions:**

- **Metrics Server Issues**: Ensure metrics-server is running:
  ```bash
  kubectl get deployment metrics-server -n kube-system
  ```

- **Incorrect HPA Configuration**: Update HPA settings:
  ```bash
  kubectl edit hpa <hpa-name>
  ```

- **Resource Limits Preventing Scaling**: Adjust resource limits:
  ```bash
  kubectl edit deployment <deployment-name>
  # Update resources.limits
  ```

## Monitoring and Logging Issues

### Missing Metrics

**Symptoms:**
- Grafana dashboards show no data
- Prometheus targets down

**Troubleshooting Steps:**

1. Check Prometheus targets:
   ```bash
   # Access Prometheus UI and check Status > Targets
   ```

2. Check service monitors:
   ```bash
   kubectl get servicemonitor
   ```

3. Check Prometheus configuration:
   ```bash
   kubectl get configmap prometheus-config -o yaml
   ```

**Common Solutions:**

- **ServiceMonitor Issues**: Update service monitor configuration:
  ```bash
  kubectl apply -f kubernetes/monitoring/service-monitors/
  ```

- **Prometheus Configuration**: Update Prometheus configuration:
  ```bash
  kubectl edit configmap prometheus-config
  ```

- **Metrics Endpoint Issues**: Ensure services expose metrics endpoints:
  ```bash
  kubectl exec -it <pod-name> -- curl localhost:metrics
  ```

### Missing Logs

**Symptoms:**
- Logs not appearing in Kibana
- Fluentd or Filebeat errors

**Troubleshooting Steps:**

1. Check logging agents:
   ```bash
   kubectl get pods -n logging
   ```

2. Check logging agent configuration:
   ```bash
   kubectl get configmap fluentd-config -n logging -o yaml
   ```

3. Check log destinations:
   ```bash
   # Check Elasticsearch status
   kubectl get pods -n logging -l app=elasticsearch
   ```

**Common Solutions:**

- **Logging Agent Issues**: Restart logging agents:
  ```bash
  kubectl rollout restart daemonset fluentd -n logging
  ```

- **Elasticsearch Issues**: Check Elasticsearch status and storage:
  ```bash
  kubectl describe pods -n logging -l app=elasticsearch
  ```

- **Log Format Issues**: Update log parsing configuration:
  ```bash
  kubectl edit configmap fluentd-config -n logging
  ```

## CI/CD Pipeline Issues

### Build Failures

**Symptoms:**
- GitHub Actions workflow fails
- Docker build errors

**Troubleshooting Steps:**

1. Check GitHub Actions logs:
   ```
   # Access through GitHub UI
   ```

2. Try building locally:
   ```bash
   docker build -t service-name:test .
   ```

**Common Solutions:**

- **Dependency Issues**: Update dependencies:
  ```bash
  npm ci
  # or
  pip install -r requirements.txt
  ```

- **Build Configuration Issues**: Update Dockerfile or build scripts:
  ```bash
  # Edit Dockerfile
  ```

- **Resource Constraints**: Increase GitHub Actions runner resources or optimize build

### Deployment Failures

**Symptoms:**
- Automated deployment fails
- Kubernetes manifests not applied

**Troubleshooting Steps:**

1. Check deployment logs in CI/CD pipeline:
   ```
   # Access through GitHub UI
   ```

2. Verify Kubernetes credentials:
   ```bash
   # Check if kubeconfig is correctly set up in CI/CD
   ```

**Common Solutions:**

- **Authentication Issues**: Update Kubernetes credentials in CI/CD secrets:
  ```
  # Update through GitHub UI
  ```

- **Invalid Manifests**: Validate Kubernetes manifests:
  ```bash
  kubectl apply --dry-run=client -f kubernetes/manifests/
  ```

- **Permission Issues**: Ensure service account has necessary permissions:
  ```bash
  kubectl create clusterrolebinding ci-admin --clusterrole=cluster-admin --serviceaccount=default:ci-service-account
  ```

## Getting Help

If you encounter issues that you cannot resolve using this guide:

1. Check the logs in Kibana for detailed error messages
2. Review the monitoring dashboards in Grafana for anomalies
3. Consult the deployment documentation for specific procedures
4. Contact the DevOps team at devops@varai.com
5. Create an issue in the GitHub repository with detailed information about the problem
6. Join the #varai-devops Slack channel for real-time assistance