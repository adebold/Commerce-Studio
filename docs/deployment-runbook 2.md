# Deployment Runbook

This runbook provides step-by-step instructions for manual intervention during deployment issues.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Common Deployment Issues](#common-deployment-issues)
   - [Pod Crash Loop](#pod-crash-loop)
   - [Deployment Stuck](#deployment-stuck)
   - [Service Unavailable](#service-unavailable)
   - [Resource Constraints](#resource-constraints)
   - [Configuration Issues](#configuration-issues)
3. [Manual Remediation Procedures](#manual-remediation-procedures)
   - [Restart Pod](#restart-pod)
   - [Restart Deployment](#restart-deployment)
   - [Scale Deployment](#scale-deployment)
   - [Rollback Deployment](#rollback-deployment)
   - [Update Configuration](#update-configuration)
4. [Verification Procedures](#verification-procedures)
5. [Escalation Procedures](#escalation-procedures)

## Prerequisites

Before performing any manual intervention, ensure you have:

1. **Access Credentials**
   - Kubernetes cluster access
   - Container registry access
   - Cloud provider console access

2. **Tools Installed**
   - kubectl
   - Cloud provider CLI
   - Monitoring tools

3. **Environment Information**
   - Cluster name and region
   - Namespace
   - Deployment names
   - Service names

## Common Deployment Issues

### Pod Crash Loop

**Symptoms:**
- Pods are continuously restarting
- Status shows `CrashLoopBackOff`
- Application logs show errors

**Possible Causes:**
- Application code errors
- Missing dependencies
- Configuration errors
- Resource constraints

**Automated Remediation:**
The system will attempt to restart the pod up to 3 times. If the issue persists, manual intervention is required.

**Manual Intervention:**
1. Check pod logs:
   ```bash
   kubectl logs <pod-name> -n <namespace>
   ```
2. Check pod events:
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   ```
3. Follow the [Restart Pod](#restart-pod) or [Rollback Deployment](#rollback-deployment) procedure as appropriate.

### Deployment Stuck

**Symptoms:**
- Deployment status shows `Progressing` for an extended period
- New pods are not being created or are stuck in `Pending` state

**Possible Causes:**
- Resource constraints
- Image pull issues
- Node issues
- PVC binding issues

**Automated Remediation:**
The system will attempt to restart the deployment. If the issue persists, manual intervention is required.

**Manual Intervention:**
1. Check deployment status:
   ```bash
   kubectl rollout status deployment/<deployment-name> -n <namespace>
   ```
2. Check deployment events:
   ```bash
   kubectl describe deployment <deployment-name> -n <namespace>
   ```
3. Follow the [Restart Deployment](#restart-deployment) or [Rollback Deployment](#rollback-deployment) procedure as appropriate.

### Service Unavailable

**Symptoms:**
- Service endpoints are not responding
- Health checks are failing
- Pods are running but not receiving traffic

**Possible Causes:**
- Service configuration issues
- Pod readiness issues
- Network issues
- Health check configuration issues

**Automated Remediation:**
The system will attempt to restart the service. If the issue persists, manual intervention is required.

**Manual Intervention:**
1. Check service status:
   ```bash
   kubectl describe service <service-name> -n <namespace>
   ```
2. Check endpoints:
   ```bash
   kubectl get endpoints <service-name> -n <namespace>
   ```
3. Check pod readiness:
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label> -o wide
   ```
4. Follow the [Update Configuration](#update-configuration) procedure as appropriate.

### Resource Constraints

**Symptoms:**
- Pods are in `Pending` state
- Events show `FailedScheduling` due to insufficient resources
- Nodes are at high CPU or memory utilization

**Possible Causes:**
- Insufficient cluster resources
- Resource requests too high
- Node issues

**Automated Remediation:**
The system will attempt to scale the deployment to adjust resource usage. If the issue persists, manual intervention is required.

**Manual Intervention:**
1. Check node resource usage:
   ```bash
   kubectl top nodes
   ```
2. Check pod resource usage:
   ```bash
   kubectl top pods -n <namespace>
   ```
3. Follow the [Scale Deployment](#scale-deployment) procedure as appropriate.

### Configuration Issues

**Symptoms:**
- Application errors related to configuration
- Missing environment variables
- Invalid configuration values

**Possible Causes:**
- ConfigMap or Secret issues
- Environment variable issues
- Configuration file issues

**Automated Remediation:**
The system cannot automatically remediate configuration issues. Manual intervention is required.

**Manual Intervention:**
1. Check ConfigMaps and Secrets:
   ```bash
   kubectl get configmap -n <namespace>
   kubectl get secret -n <namespace>
   ```
2. Check environment variables in pod spec:
   ```bash
   kubectl describe pod <pod-name> -n <namespace>
   ```
3. Follow the [Update Configuration](#update-configuration) procedure as appropriate.

## Manual Remediation Procedures

### Restart Pod

1. Identify the pod to restart:
   ```bash
   kubectl get pods -n <namespace>
   ```

2. Delete the pod (it will be automatically recreated by the deployment):
   ```bash
   kubectl delete pod <pod-name> -n <namespace>
   ```

3. Verify the pod is recreated and running:
   ```bash
   kubectl get pods -n <namespace>
   ```

4. Check the logs of the new pod:
   ```bash
   kubectl logs <new-pod-name> -n <namespace>
   ```

### Restart Deployment

1. Identify the deployment to restart:
   ```bash
   kubectl get deployments -n <namespace>
   ```

2. Restart the deployment:
   ```bash
   kubectl rollout restart deployment/<deployment-name> -n <namespace>
   ```

3. Monitor the rollout status:
   ```bash
   kubectl rollout status deployment/<deployment-name> -n <namespace>
   ```

4. Verify the pods are recreated and running:
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label>
   ```

### Scale Deployment

1. Identify the deployment to scale:
   ```bash
   kubectl get deployments -n <namespace>
   ```

2. Scale the deployment:
   ```bash
   kubectl scale deployment/<deployment-name> --replicas=<replica-count> -n <namespace>
   ```

3. Monitor the scaling status:
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label> -w
   ```

4. Verify the deployment is scaled:
   ```bash
   kubectl get deployment <deployment-name> -n <namespace>
   ```

### Rollback Deployment

1. Identify the deployment to rollback:
   ```bash
   kubectl get deployments -n <namespace>
   ```

2. Check the revision history:
   ```bash
   kubectl rollout history deployment/<deployment-name> -n <namespace>
   ```

3. Rollback to the previous revision:
   ```bash
   kubectl rollout undo deployment/<deployment-name> -n <namespace>
   ```

   Or rollback to a specific revision:
   ```bash
   kubectl rollout undo deployment/<deployment-name> --to-revision=<revision> -n <namespace>
   ```

4. Monitor the rollback status:
   ```bash
   kubectl rollout status deployment/<deployment-name> -n <namespace>
   ```

5. Verify the pods are recreated and running:
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label>
   ```

### Update Configuration

1. Identify the ConfigMap or Secret to update:
   ```bash
   kubectl get configmap -n <namespace>
   kubectl get secret -n <namespace>
   ```

2. Edit the ConfigMap or Secret:
   ```bash
   kubectl edit configmap <configmap-name> -n <namespace>
   kubectl edit secret <secret-name> -n <namespace>
   ```

3. Restart the deployment to apply the configuration changes:
   ```bash
   kubectl rollout restart deployment/<deployment-name> -n <namespace>
   ```

4. Monitor the rollout status:
   ```bash
   kubectl rollout status deployment/<deployment-name> -n <namespace>
   ```

5. Verify the pods are recreated and running:
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label>
   ```

## Verification Procedures

After performing any manual remediation, verify the deployment is working correctly:

1. **Check Pod Status**
   ```bash
   kubectl get pods -n <namespace> -l app=<app-label>
   ```
   All pods should be in `Running` state and `Ready`.

2. **Check Deployment Status**
   ```bash
   kubectl get deployment <deployment-name> -n <namespace>
   ```
   The deployment should show the correct number of replicas available.

3. **Check Service Status**
   ```bash
   kubectl get service <service-name> -n <namespace>
   ```
   The service should have endpoints.

4. **Check Application Health**
   ```bash
   kubectl exec <pod-name> -n <namespace> -- curl -s http://localhost:<port>/health
   ```
   The health check should return a successful response.

5. **Run Smoke Tests**
   ```bash
   python -m tests.e2e.smoke_tests --env <environment>
   ```
   All smoke tests should pass.

## Escalation Procedures

If manual remediation does not resolve the issue, escalate to the appropriate team:

1. **Development Team**
   - For application code issues
   - For configuration issues
   - For dependency issues

2. **Infrastructure Team**
   - For cluster issues
   - For node issues
   - For network issues

3. **Security Team**
   - For security-related issues
   - For access issues
   - For compliance issues

4. **Database Team**
   - For database issues
   - For data migration issues
   - For data integrity issues

### Escalation Contact Information

| Team | Contact | Email | Phone |
|------|---------|-------|-------|
| Development | Dev Lead | dev-lead@example.com | 555-123-4567 |
| Infrastructure | Infra Lead | infra-lead@example.com | 555-234-5678 |
| Security | Security Lead | security-lead@example.com | 555-345-6789 |
| Database | DB Lead | db-lead@example.com | 555-456-7890 |

### Escalation Process

1. **Gather Information**
   - Deployment ID
   - Error messages
   - Logs
   - Steps taken to remediate

2. **Create Incident**
   - Use the incident management system
   - Include all gathered information
   - Set appropriate severity level

3. **Notify Team**
   - Use the appropriate communication channel
   - Include incident ID
   - Provide brief description of the issue

4. **Follow Up**
   - Update the incident with new information
   - Document all actions taken
   - Close the incident when resolved