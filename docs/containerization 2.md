# VARAi Platform Containerization

This document provides an overview of the containerization strategy for the VARAi Platform.

## Table of Contents

1. [Overview](#overview)
2. [Docker Containers](#docker-containers)
3. [Docker Compose](#docker-compose)
4. [Kubernetes](#kubernetes)
5. [Helm Charts](#helm-charts)
6. [Container Security](#container-security)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

## Overview

The VARAi Platform has been containerized to ensure consistent deployment across different environments. The containerization strategy includes:

- Docker containers for all platform components
- Docker Compose configurations for different environments
- Kubernetes manifests for container orchestration
- Helm charts for simplified deployment
- Container security measures
- Monitoring and logging solutions

## Docker Containers

The following Docker containers have been created for the VARAi Platform:

| Container | Description | Base Image | Ports |
|-----------|-------------|------------|-------|
| api | Backend API service | python:3.11-slim | 3000 |
| auth | Authentication service | node:20-alpine | 3001 |
| recommendation | Recommendation engine | python:3.11-slim | 3002 |
| virtual-try-on | Virtual try-on service | python:3.11-slim | 3003 |
| analytics | Analytics service | python:3.11-slim | 3004 |
| frontend | Frontend application | node:20-alpine | 80, 443 |
| database | MongoDB database | mongo:6.0 | 27017 |

All containers are defined in the main `Dockerfile` using multi-stage builds to optimize image size and build time.

## Docker Compose

Docker Compose configurations have been created for different environments:

- `docker-compose.dev.yml`: Development environment
- `docker-compose.test.yml`: Testing environment
- `docker-compose.staging.yml`: Staging environment
- `docker-compose.prod.yml`: Production environment

### Development Environment

The development environment is configured for local development with:

- Volume mounts for code changes without rebuilding
- Debug-level logging
- Single replicas of each service
- Local MongoDB instance

To start the development environment:

```bash
docker-compose -f docker-compose.dev.yml up
```

### Testing Environment

The testing environment is configured for running tests with:

- Test-specific configurations
- Mock services for external dependencies
- Test runners for different types of tests

To start the testing environment:

```bash
docker-compose -f docker-compose.test.yml up
```

### Staging Environment

The staging environment is configured to mirror production with:

- Reduced resource requirements
- Staging-specific configurations
- Single replicas of each service

To start the staging environment:

```bash
docker-compose -f docker-compose.staging.yml up
```

### Production Environment

The production environment is configured for high availability with:

- Multiple replicas of each service
- Resource limits and requests
- Production-specific configurations
- Traefik load balancer

To start the production environment:

```bash
docker-compose -f docker-compose.prod.yml up
```

## Kubernetes

Kubernetes manifests have been created for deploying the VARAi Platform to Kubernetes clusters. The manifests are organized using Kustomize for environment-specific configurations.

### Base Configuration

The base configuration includes:

- Deployments for all services
- Services for network communication
- ConfigMaps for configuration
- Secrets for sensitive data
- Persistent Volume Claims for data storage
- Ingress for external access

### Environment Overlays

Environment-specific overlays are provided for:

- Development
- Staging
- Production

Each overlay customizes the base configuration for the specific environment.

To apply the Kubernetes manifests:

```bash
# For development
kubectl apply -k kubernetes/overlays/dev

# For staging
kubectl apply -k kubernetes/overlays/staging

# For production
kubectl apply -k kubernetes/overlays/prod
```

## Helm Charts

A Helm chart has been created for simplified deployment of the VARAi Platform to Kubernetes clusters.

### Chart Structure

The Helm chart is structured as follows:

- `Chart.yaml`: Chart metadata and dependencies
- `values.yaml`: Default configuration values
- `templates/`: Kubernetes manifest templates
- `values/`: Environment-specific values

### Deployment

To deploy the VARAi Platform using Helm:

```bash
# Add dependencies
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# For development
helm install varai-dev ./helm/varai -f ./helm/varai/values/dev.yaml

# For staging
helm install varai-staging ./helm/varai -f ./helm/varai/values/staging.yaml

# For production
helm install varai-prod ./helm/varai -f ./helm/varai/values/prod.yaml
```

## Container Security

The following security measures have been implemented:

### Image Scanning

All container images are scanned for vulnerabilities using:

- Trivy for static vulnerability scanning
- Clair for runtime vulnerability scanning

### Least Privilege

Containers are configured with least privilege:

- Non-root users for all containers
- Read-only file systems where possible
- Minimal capabilities

### Network Policies

Network policies have been defined to restrict communication between containers:

- Ingress rules to control incoming traffic
- Egress rules to control outgoing traffic
- Default deny policies with explicit allows

### Secrets Management

Sensitive data is managed securely using:

- Kubernetes Secrets for sensitive configuration
- Environment variables for runtime configuration
- Secret references instead of direct values

### Container Hardening

Containers have been hardened with:

- Minimal base images
- Regular security updates
- Removed unnecessary packages
- Disabled unnecessary services

## Monitoring and Logging

### Monitoring

The following monitoring solutions have been implemented:

- Prometheus for metrics collection
- Grafana for metrics visualization
- AlertManager for alerting

### Logging

The following logging solutions have been implemented:

- Elasticsearch for log storage
- Filebeat for log collection
- Kibana for log visualization

## Deployment Guide

### Prerequisites

- Docker and Docker Compose for local development
- Kubernetes cluster for production deployment
- Helm for simplified deployment
- kubectl for Kubernetes management

### Deployment Steps

1. Clone the repository
2. Configure environment variables
3. Build the Docker images
4. Deploy using Docker Compose or Kubernetes

### Environment Variables

The following environment variables must be configured:

- `NODE_ENV`: Environment (development, test, staging, production)
- `MONGODB_URI`: MongoDB connection URI
- `AUTH_SECRET`: Secret for JWT authentication
- `AUTH_ISSUER`: Issuer for JWT authentication
- `AUTH_AUDIENCE`: Audience for JWT authentication

## Troubleshooting

### Common Issues

- **Container fails to start**: Check logs with `docker logs <container_id>`
- **Service unavailable**: Check if the service is running with `docker ps`
- **Database connection error**: Check if MongoDB is running and accessible
- **Authentication error**: Check if AUTH_SECRET is properly configured

### Logs

Logs can be accessed using:

```bash
# Docker Compose
docker-compose -f <compose-file> logs <service>

# Kubernetes
kubectl logs -n <namespace> <pod-name>
```

### Support

For additional support, contact the VARAi Platform team at support@varai.com.