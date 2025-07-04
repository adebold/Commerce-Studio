#!/usr/bin/env python3
"""
Deployment script that fetches secrets from Google Cloud Secret Manager
and uses them to deploy the application.
"""

import os
import argparse
import logging
import subprocess
import tempfile
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"deployment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("deployment")

def fetch_secrets_from_env_file(env_file):
    """
    Fetch secrets from a .env file.
    
    Args:
        env_file: Path to the .env file
        
    Returns:
        A dictionary of secret names and their values
    """
    try:
        secrets = {}
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                # Skip comments and empty lines
                if line.strip() and not line.strip().startswith('#'):
                    # Extract variable name and value
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        var_name, var_value = parts
                        secrets[var_name] = var_value
        
        logger.info(f"Successfully loaded {len(secrets)} secrets from {env_file}")
        return secrets
        
    except Exception as e:
        logger.error(f"Error loading secrets from {env_file}: {str(e)}")
        raise

def fetch_secrets(project_id, prefix=None, env_file=None):
    """
    Fetch secrets from Google Cloud Secret Manager or from a .env file.
    
    Args:
        project_id: Google Cloud project ID
        prefix: Optional prefix to filter secrets
        env_file: Optional path to a .env file
        
    Returns:
        A dictionary of secret names and their values
    """
    if env_file and os.path.exists(env_file):
        return fetch_secrets_from_env_file(env_file)
    
    try:
        # List all secrets
        cmd = ["gcloud", "secrets", "list", "--format=json", "--project", project_id]
        
        if prefix:
            cmd.extend(["--filter", f"name:{prefix}*"])
        
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        secrets_list = json.loads(process.stdout.decode())
        
        if not secrets_list:
            logger.warning(f"No secrets found in Google Cloud Secret Manager with prefix {prefix}")
            if env_file:
                logger.info(f"Falling back to .env file: {env_file}")
                return fetch_secrets_from_env_file(env_file)
            else:
                raise Exception("No secrets found and no .env file provided")
        
        # Fetch the latest version of each secret
        secrets = {}
        for secret in secrets_list:
            secret_name = os.path.basename(secret['name'])
            
            # Access the latest version
            access_cmd = ["gcloud", "secrets", "versions", "access", "latest",
                         "--secret", secret_name, "--project", project_id]
            
            process = subprocess.run(access_cmd, check=True, stdout=subprocess.PIPE)
            secret_value = process.stdout.decode().strip()
            
            # Get the original environment variable name from labels
            describe_cmd = ["gcloud", "secrets", "describe", secret_name,
                           "--format=json", "--project", project_id]
            
            process = subprocess.run(describe_cmd, check=True, stdout=subprocess.PIPE)
            secret_details = json.loads(process.stdout.decode())
            
            # Extract the original environment variable name from labels if available
            if 'labels' in secret_details and 'env-var-name' in secret_details['labels']:
                env_var_name = secret_details['labels']['env-var-name'].upper()
            else:
                # Convert secret name back to environment variable format
                env_var_name = secret_name.upper().replace('-', '_')
                if prefix:
                    # Remove prefix if it exists
                    prefix_with_dash = f"{prefix}-".lower()
                    if env_var_name.lower().startswith(prefix_with_dash.replace('-', '_')):
                        env_var_name = env_var_name[len(prefix_with_dash):]
            
            secrets[env_var_name] = secret_value
        
        logger.info(f"Successfully fetched {len(secrets)} secrets from Google Cloud Secret Manager")
        return secrets
        
    except Exception as e:
        logger.error(f"Error fetching secrets from Google Cloud Secret Manager: {str(e)}")
        if env_file:
            logger.info(f"Falling back to .env file: {env_file}")
            return fetch_secrets_from_env_file(env_file)
        else:
            raise

def create_env_file(secrets, output_file):
    """
    Create a .env file from the fetched secrets.
    
    Args:
        secrets: Dictionary of secret names and values
        output_file: Path to the output .env file
        
    Returns:
        Path to the created .env file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Environment variables for the EyewearML application\n")
            f.write(f"# Generated by {os.path.basename(__file__)} on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for var_name, value in secrets.items():
                f.write(f"{var_name}={value}\n")
        
        logger.info(f"Successfully created {output_file} with {len(secrets)} environment variables")
        return output_file
        
    except Exception as e:
        logger.error(f"Error creating {output_file}: {str(e)}")
        raise

def deploy_application(env_file, deployment_type, environment):
    """
    Deploy the application using the specified environment variables.
    
    Args:
        env_file: Path to the .env file
        deployment_type: Type of deployment (cloud-run, kubernetes, etc.)
        environment: Deployment environment (dev, staging, prod)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if deployment_type == "cloud-run":
            return deploy_to_cloud_run(env_file, environment)
        elif deployment_type == "kubernetes":
            return deploy_to_kubernetes(env_file, environment)
        else:
            logger.error(f"Unsupported deployment type: {deployment_type}")
            return False
        
    except Exception as e:
        logger.error(f"Error deploying application: {str(e)}")
        return False

def deploy_to_cloud_run(env_file, environment):
    """
    Deploy the application to Google Cloud Run.
    
    Args:
        env_file: Path to the .env file
        environment: Deployment environment (dev, staging, prod)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Load environment variables from .env file
        env_vars = []
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip() and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars.append(f"{key}={value}")
        
        # Build the container image
        image_name = f"gcr.io/eyewear-ml/eyewear-ml-{environment}:{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        build_cmd = ["gcloud", "builds", "submit", "--tag", image_name]
        logger.info(f"Building container image: {image_name}")
        subprocess.run(build_cmd, check=True)
        
        # Deploy to Cloud Run
        deploy_cmd = [
            "gcloud", "run", "deploy", f"eyewear-ml-{environment}",
            "--image", image_name,
            "--platform", "managed",
            "--region", "us-central1",
            "--allow-unauthenticated"
        ]
        
        # Add environment variables
        for env_var in env_vars:
            deploy_cmd.extend(["--set-env-vars", env_var])
        
        logger.info(f"Deploying to Cloud Run: eyewear-ml-{environment}")
        subprocess.run(deploy_cmd, check=True)
        
        logger.info(f"Successfully deployed to Cloud Run: eyewear-ml-{environment}")
        return True
        
    except Exception as e:
        logger.error(f"Error deploying to Cloud Run: {str(e)}")
        return False

def deploy_to_kubernetes(env_file, environment):
    """
    Deploy the application to Kubernetes.
    
    Args:
        env_file: Path to the .env file
        environment: Deployment environment (dev, staging, prod)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create a Kubernetes secret from the .env file
        secret_name = f"eyewear-ml-{environment}-secrets"
        
        # Delete existing secret if it exists
        delete_cmd = ["kubectl", "delete", "secret", secret_name, "--ignore-not-found"]
        subprocess.run(delete_cmd, check=True)
        
        # Create new secret
        create_cmd = ["kubectl", "create", "secret", "generic", secret_name, f"--from-env-file={env_file}"]
        logger.info(f"Creating Kubernetes secret: {secret_name}")
        subprocess.run(create_cmd, check=True)
        
        # Apply Kubernetes manifests using kustomize
        manifests_dir = f"kubernetes/overlays/{environment}"
        
        # Build the kustomization and apply it
        apply_cmd = ["kubectl", "apply", "-k", manifests_dir]
        logger.info(f"Applying Kubernetes manifests with kustomize from {manifests_dir}")
        subprocess.run(apply_cmd, check=True)
        
        logger.info(f"Successfully deployed to Kubernetes: eyewear-ml-{environment}")
        return True
        
    except Exception as e:
        logger.error(f"Error deploying to Kubernetes: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Deploy application with secrets from Google Cloud Secret Manager or .env file')
    parser.add_argument('--project-id', required=True, help='Google Cloud project ID')
    parser.add_argument('--prefix', help='Prefix to filter secrets')
    parser.add_argument('--deployment-type', choices=['cloud-run', 'kubernetes'], default='cloud-run', help='Type of deployment')
    parser.add_argument('--environment', choices=['dev', 'staging', 'prod'], default='dev', help='Deployment environment')
    parser.add_argument('--env-file', help='Path to .env file to use instead of fetching from Secret Manager')
    
    args = parser.parse_args()
    
    try:
        # Determine env file if not provided
        env_file_path = args.env_file
        if not env_file_path:
            # Map environment names to file names
            env_file_mapping = {
                'dev': '.env.development',
                'staging': '.env.staging',
                'prod': '.env.production'
            }
            
            env_file_path = env_file_mapping.get(args.environment)
            
            if env_file_path and os.path.exists(env_file_path):
                logger.info(f"Using environment file: {env_file_path}")
            else:
                logger.warning(f"Environment file {env_file_path} not found, falling back to Secret Manager")
        
        # Determine prefix if not provided
        prefix = args.prefix
        if not prefix:
            prefix = f"eyewear-ml-{args.environment}"
        
        # Fetch secrets from Google Cloud Secret Manager or .env file
        secrets = fetch_secrets(args.project_id, prefix, env_file_path)
        
        # Create temporary .env file for deployment
        fd, env_file = tempfile.mkstemp(prefix='eyewear-ml-', suffix='.env')
        os.close(fd)
        
        create_env_file(secrets, env_file)
        
        # Deploy the application
        if deploy_application(env_file, args.deployment_type, args.environment):
            logger.info("Deployment completed successfully")
        else:
            logger.error("Deployment failed")
            exit(1)
        
        # Clean up temporary file if created
        if not args.env_file and os.path.exists(env_file):
            os.remove(env_file)
            
    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()