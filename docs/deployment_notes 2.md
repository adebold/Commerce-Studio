# Deployment Notes

## Shell Scripts Permissions

The shell scripts in this project need to be executable when run on Unix/Linux systems:

- `scripts/setup_prisma.sh`
- `deployment-scripts/deploy-to-staging.sh`

When transferring these files to a Unix/Linux system, make sure to set the executable permission:

```bash
chmod +x scripts/setup_prisma.sh deployment-scripts/deploy-to-staging.sh
```

## Cross-Platform Deployment

This project includes deployment scripts for both Windows and Unix/Linux environments:

- Windows: `deployment-scripts/deploy-to-staging-modified.ps1` (PowerShell)
- Unix/Linux: `deployment-scripts/deploy-to-staging.sh` (Bash)

Use the appropriate script for your operating system.

## Prisma Setup

The Prisma setup scripts are also available for both platforms:

- Windows/Python: `scripts/setup_prisma.py`
- Unix/Linux: `scripts/setup_prisma.sh`

These scripts handle the Prisma migrations and client generation for deployment environments.

## Environment Variables

Make sure the following environment variables are set correctly for your deployment environment:

- `DATABASE_URL`: The connection string for your database
- `PRISMA_ENVIRONMENT`: Set to "production" for deployment environments (default in the scripts)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google Cloud service account key file (set by the deployment scripts)

## Deployment Process

The deployment process consists of the following steps:

1. Authentication with Google Cloud
2. Running Prisma migrations using `prisma migrate deploy`
3. Generating the Prisma client
4. Building the Docker image
5. Pushing the Docker image to Google Container Registry
6. Deploying the image to Cloud Run

If any step fails, the deployment scripts will provide appropriate error messages and, in some cases, continue with the deployment process.

## Troubleshooting

If you encounter issues during deployment:

1. Check the logs for error messages
2. Verify that all environment variables are set correctly
3. Ensure that the service account has the necessary permissions
4. For Prisma-related issues, refer to the [Prisma Workflow Guide](./prisma_workflow.md)