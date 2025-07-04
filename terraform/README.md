# VARAi Platform Infrastructure as Code

This directory contains Terraform configurations for provisioning and managing the infrastructure for the VARAi Platform.

## Directory Structure

```
terraform/
├── environments/           # Environment-specific configurations
│   ├── dev/                # Development environment
│   ├── staging/            # Staging environment
│   └── prod/               # Production environment
├── modules/                # Reusable Terraform modules
│   ├── kubernetes/         # Kubernetes resources
│   ├── networking/         # Networking resources
│   ├── database/           # Database resources
│   └── monitoring/         # Monitoring resources
└── README.md               # This file
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (version >= 1.0.0)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)
- Access to a GCP project with appropriate permissions

## Getting Started

### Authentication

1. Authenticate with Google Cloud:

```bash
gcloud auth application-default login
```

2. Set up MongoDB Atlas API keys:
   - Create API keys in the MongoDB Atlas UI
   - Add the public and private keys to your environment variables or terraform.tfvars file

### Environment Setup

Each environment (dev, staging, prod) has its own configuration. To set up an environment:

1. Navigate to the environment directory:

```bash
cd environments/dev  # or staging, prod
```

2. Create a terraform.tfvars file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

3. Edit the terraform.tfvars file to set the required variables.

### Initialization

Initialize Terraform to download providers and set up the backend:

```bash
terraform init
```

### Planning

Generate and review an execution plan:

```bash
terraform plan -out=tfplan
```

### Applying Changes

Apply the changes to create or update the infrastructure:

```bash
terraform apply tfplan
```

### Destroying Resources

To destroy all resources created by Terraform:

```bash
terraform destroy
```

## Modules

### Kubernetes Module

The Kubernetes module provisions Kubernetes resources for the VARAi Platform, including:

- Namespace
- Deployments for API, Auth, and Frontend services
- Services
- ConfigMaps and Secrets
- Ingress resources
- Horizontal Pod Autoscalers

### Networking Module

The Networking module provisions networking resources, including:

- VPC Network
- Subnets
- Cloud NAT
- Firewall rules
- Load Balancer
- Cloud DNS
- Cloud Armor security policy

### Database Module

The Database module provisions database resources, including:

- MongoDB Atlas cluster
- MongoDB Atlas database user
- MongoDB Atlas network peering
- MongoDB Atlas encryption at rest
- MongoDB Atlas backup schedule
- Redis instance (Google Cloud Memorystore)

### Monitoring Module

The Monitoring module provisions monitoring resources, including:

- Cloud Monitoring dashboards
- Uptime checks
- Alert policies
- Log sinks
- Service Level Objectives (SLOs)
- Grafana dashboards (if using Grafana)
- Prometheus rules (if using Prometheus)

## Environment-Specific Configurations

### Development Environment

The development environment is configured for local development and testing with:

- Minimal resource requirements
- Basic security settings
- No autoscaling
- Single replicas of each service

### Staging Environment

The staging environment mirrors production but with:

- Reduced resource requirements
- Simplified security settings
- Basic autoscaling
- Fewer replicas of each service

### Production Environment

The production environment is configured for high availability and security with:

- Multiple replicas of each service
- Advanced security settings
- Robust autoscaling
- High availability configurations
- Comprehensive monitoring and alerting

## Best Practices

1. **Version Control**: Always commit your Terraform configurations to version control, but never commit sensitive values like API keys or passwords.

2. **State Management**: Use remote state storage (GCS bucket) to store Terraform state securely and enable collaboration.

3. **Variable Separation**: Keep sensitive variables in a separate terraform.tfvars file that is not committed to version control.

4. **Module Versioning**: Pin module versions to ensure consistent infrastructure deployments.

5. **Terraform Workspaces**: Use Terraform workspaces to manage multiple environments if needed.

6. **CI/CD Integration**: Integrate Terraform with CI/CD pipelines for automated infrastructure deployments.

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure you have authenticated with Google Cloud and have the necessary permissions.

2. **State Lock Errors**: If Terraform state is locked, check if another Terraform operation is in progress or use `terraform force-unlock` if necessary.

3. **Resource Quota Errors**: Ensure your GCP project has sufficient quotas for the resources you are trying to provision.

4. **MongoDB Atlas Errors**: Verify your MongoDB Atlas API keys and organization ID.

### Getting Help

For additional help, contact the VARAi Platform team at devops@varai.ai.