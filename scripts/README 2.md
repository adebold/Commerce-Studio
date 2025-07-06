# EyewearML Deployment and Security Scripts

This directory contains scripts for deploying, securing, and managing the EyewearML platform. These scripts are designed to automate common tasks and ensure consistent deployment across environments.

## Deployment Scripts

### deploy_with_secrets.py

Deploys the application using secrets from Google Cloud Secret Manager or a local .env file.

```bash
python scripts/deploy_with_secrets.py --project-id ml-datadriven-recos --deployment-type kubernetes --environment prod
```

**Parameters:**
- `--project-id`: (required) Google Cloud project ID
- `--prefix`: (optional) Prefix to filter secrets
- `--deployment-type`: (optional) Type of deployment (`cloud-run` or `kubernetes`, default: `cloud-run`)
- `--environment`: (optional) Deployment environment (`dev`, `staging`, or `prod`, default: `dev`)
- `--env-file`: (optional) Path to .env file to use instead of fetching from Secret Manager

### setup_github_actions.py

Creates or updates the GitHub Actions workflow file for deployment.

```bash
python scripts/setup_github_actions.py --project-id ml-datadriven-recos --cluster-name eyewear-ml-cluster --zone us-central1-a
```

**Parameters:**
- `--output`: (optional) Path to the output workflow file (default: `.github/workflows/deploy.yml`)
- `--project-id`: (required) Google Cloud project ID
- `--cluster-name`: (required) Google Kubernetes Engine cluster name
- `--zone`: (required) Google Cloud zone
- `--environments`: (optional) Environments to deploy to (default: `dev`, `staging`, `prod`)

## Security Scripts

### setup_gcp_secrets.py

Uploads environment variables to Google Cloud Secret Manager.

```bash
python scripts/setup_gcp_secrets.py --project-id ml-datadriven-recos --env-file .env.production --prefix eyewear-ml
```

**Parameters:**
- `--env-file`: (optional) Path to the .env file (default: `.env`)
- `--project-id`: (required) Google Cloud project ID
- `--prefix`: (optional) Prefix to add to secret names
- `--service-account`: (optional) Service account email to grant access to secrets

### setup_github_secrets.py

Uploads environment variables to GitHub Secrets.

```bash
python scripts/setup_github_secrets.py --repo your-org/eyewear-ml --env-file .env.production
```

**Parameters:**
- `--env-file`: (optional) Path to the .env file (default: `.env`)
- `--repo`: (required) GitHub repository in the format owner/repo
- `--prefix`: (optional) Prefix to add to secret names

### extract_secrets.py

Extracts hardcoded secrets from the codebase and replaces them with environment variable references.

```bash
python scripts/extract_secrets.py --replace
```

**Parameters:**
- `--directory`: (optional) Directory to scan for secrets (default: current directory)
- `--output`: (optional) Output file for extracted secrets (default: `.env.extracted`)
- `--replace`: (optional) Replace hardcoded secrets with environment variable references
- `--patterns`: (optional) File containing regex patterns to search for

### generate_env_values.py

Generates secure values for environment variables.

```bash
python scripts/generate_env_values.py --output .env.production
```

**Parameters:**
- `--template`: (optional) Template .env file (default: `.env.example`)
- `--output`: (optional) Output file (default: `.env`)
- `--overwrite`: (optional) Overwrite existing values in the output file

## Monitoring Scripts

### setup_monitoring.py

Sets up monitoring for the EyewearML platform using Prometheus, Grafana, and the ELK stack.

```bash
python scripts/setup_monitoring.py --app-namespace varai-prod --monitoring-namespace monitoring
```

**Parameters:**
- `--app-namespace`: (optional) Application namespace (default: `varai-prod`)
- `--monitoring-namespace`: (optional) Monitoring namespace (default: `monitoring`)

## Security Hardening Scripts

### enforce_password_policy.py

Updates the authentication system to enforce password complexity, expiration, and history.

```bash
python scripts/enforce_password_policy.py
```

**Parameters:**
- `--project-dir`: (optional) Project directory (default: current directory)
- `--auth-dir`: (optional) Authentication directory (if not provided, will try to find it)

### implement_rate_limiting.py

Implements rate limiting middleware for the API.

```bash
python scripts/implement_rate_limiting.py
```

**Parameters:**
- `--project-dir`: (optional) Project directory (default: current directory)
- `--api-dir`: (optional) API directory (if not provided, will try to find it)

### configure_cors.py

Configures CORS headers for the API.

```bash
python scripts/configure_cors.py
```

**Parameters:**
- `--project-dir`: (optional) Project directory (default: current directory)
- `--api-dir`: (optional) API directory (if not provided, will try to find it)

## Usage Examples

### Complete Deployment Process

```bash
# 1. Generate secure environment values
python scripts/generate_env_values.py --output .env.production

# 2. Upload secrets to Google Cloud Secret Manager
python scripts/setup_gcp_secrets.py --project-id ml-datadriven-recos --env-file .env.production --prefix eyewear-ml

# 3. Set up GitHub Secrets for CI/CD
python scripts/setup_github_secrets.py --repo your-org/eyewear-ml --env-file .env.production

# 4. Configure GitHub Actions for deployment
python scripts/setup_github_actions.py --project-id ml-datadriven-recos --cluster-name eyewear-ml-cluster --zone us-central1-a

# 5. Implement security hardening
python scripts/enforce_password_policy.py
python scripts/implement_rate_limiting.py
python scripts/configure_cors.py

# 6. Set up monitoring
python scripts/setup_monitoring.py --app-namespace varai-prod --monitoring-namespace monitoring

# 7. Deploy to production
python scripts/deploy_with_secrets.py --project-id ml-datadriven-recos --deployment-type kubernetes --environment prod
```

### Security Audit

```bash
# Extract hardcoded secrets
python scripts/extract_secrets.py --replace

# Generate new secure values
python scripts/generate_env_values.py --overwrite

# Update secrets in Google Cloud Secret Manager
python scripts/setup_gcp_secrets.py --project-id ml-datadriven-recos --prefix eyewear-ml
```

## Requirements

- Python 3.8+
- Google Cloud SDK
- kubectl
- GitHub CLI (for GitHub Secrets)
- Helm (for monitoring setup)

## Notes

- All scripts are designed to be idempotent and can be run multiple times without causing issues.
- Scripts will create backups of modified files with a `.bak` extension.
- Log files are created in the current directory with timestamps.
- Some scripts require authentication with Google Cloud and GitHub.