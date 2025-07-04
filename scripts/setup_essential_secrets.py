#!/usr/bin/env python3
"""
Script to set up essential secrets for production deployment.
This script creates the necessary secrets in Google Cloud Secret Manager
and grants access to the service account.
"""

import os
import argparse
import logging
import subprocess
import json
import tempfile
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"secrets_setup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("secrets_setup")

def create_secret(project_id, secret_name, secret_value, labels=None):
    """
    Create a secret in Google Cloud Secret Manager.
    
    Args:
        project_id: Google Cloud project ID
        secret_name: Name of the secret
        secret_value: Value of the secret
        labels: Optional labels to apply to the secret
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Check if secret already exists
        check_cmd = ["gcloud", "secrets", "describe", secret_name, 
                     "--project", project_id]
        
        try:
            subprocess.run(check_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Secret {secret_name} already exists, adding new version")
            
            # Add new version to existing secret using a temporary file
            temp_file = f"temp_secret_{secret_name}.txt"
            try:
                with open(temp_file, 'w', encoding='utf-8') as f:
                    f.write(secret_value)
                
                add_cmd = ["gcloud", "secrets", "versions", "add", secret_name,
                           f"--data-file={temp_file}", "--project", project_id]
                
                process = subprocess.run(add_cmd, check=True)
                return True
            except Exception as e:
                logger.error(f"Failed to add version to secret {secret_name}: {str(e)}")
                return False
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                
        except subprocess.CalledProcessError:
            # Secret doesn't exist, create it
            logger.info(f"Creating new secret {secret_name}")
            
            create_cmd = ["gcloud", "secrets", "create", secret_name,
                          "--project", project_id]
            
            if labels:
                label_args = [f"{k}={v}" for k, v in labels.items()]
                create_cmd.extend(["--labels", ",".join(label_args)])
            
            process = subprocess.run(create_cmd, check=True)
            
            # Add initial version using a temporary file
            temp_file = f"temp_secret_{secret_name}.txt"
            try:
                with open(temp_file, 'w', encoding='utf-8') as f:
                    f.write(secret_value)
                
                add_cmd = ["gcloud", "secrets", "versions", "add", secret_name,
                           f"--data-file={temp_file}", "--project", project_id]
                
                process = subprocess.run(add_cmd, check=True)
                return True
            except Exception as e:
                logger.error(f"Failed to add version to secret {secret_name}: {str(e)}")
                return False
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        
        logger.info(f"Successfully created/updated secret {secret_name}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating secret {secret_name}: {str(e)}")
        return False

def setup_service_account_access(project_id, service_account, secret_names):
    """
    Grant access to secrets to a service account.
    
    Args:
        project_id: Google Cloud project ID
        service_account: Service account email
        secret_names: List of secret names to grant access to
        
    Returns:
        True if successful, False otherwise
    """
    try:
        for secret_name in secret_names:
            cmd = ["gcloud", "secrets", "add-iam-policy-binding", secret_name,
                   "--member", f"serviceAccount:{service_account}",
                   "--role", "roles/secretmanager.secretAccessor",
                   "--project", project_id]
            
            process = subprocess.run(cmd, check=True)
            
        logger.info(f"Successfully granted access to {len(secret_names)} secrets for {service_account}")
        return True
        
    except Exception as e:
        logger.error(f"Error granting access to secrets: {str(e)}")
        return False

def setup_essential_secrets(project_id, env_file, service_account=None, prefix=None):
    """
    Set up essential secrets for production deployment.
    
    Args:
        project_id: Google Cloud project ID
        env_file: Path to the .env file
        service_account: Optional service account to grant access to
        prefix: Optional prefix to add to secret names
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Read environment variables from .env file
        env_vars = {}
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                # Skip comments and empty lines
                if line.strip() and not line.strip().startswith('#'):
                    # Extract variable name and value
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        var_name, var_value = parts
                        env_vars[var_name] = var_value
        
        logger.info(f"Found {len(env_vars)} environment variables in {env_file}")
        
        # Define essential secrets
        essential_secrets = [
            "SECRET_KEY",
            "MONGODB_URL",
            "MONGODB_DB_NAME",
            "REDIS_PASSWORD",
            "DEEPSEEK_API_KEY"
        ]
        
        # Create secrets in Google Cloud Secret Manager
        secret_names = []
        success_count = 0
        
        for var_name in essential_secrets:
            if var_name in env_vars:
                # Format secret name (lowercase, hyphens instead of underscores)
                secret_name = var_name.lower().replace('_', '-')
                if prefix:
                    secret_name = f"{prefix}-{secret_name}"
                
                # Add labels
                labels = {
                    "created-by": "setup-essential-secrets",
                    "env-var-name": var_name.lower(),
                    "application": "eyewear-ml"
                }
                
                # Create secret
                if create_secret(project_id, secret_name, env_vars[var_name], labels):
                    secret_names.append(secret_name)
                    success_count += 1
            else:
                logger.warning(f"Essential secret {var_name} not found in {env_file}")
        
        logger.info(f"Successfully created/updated {success_count} of {len(essential_secrets)} essential secrets")
        
        # Grant access to service account if provided
        if service_account and secret_names:
            setup_service_account_access(project_id, service_account, secret_names)
        
        return True
        
    except Exception as e:
        logger.error(f"Error setting up essential secrets: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Set up essential secrets for production deployment')
    parser.add_argument('--project-id', required=True, help='Google Cloud project ID')
    parser.add_argument('--env-file', default='.env.production', help='Path to the .env file')
    parser.add_argument('--service-account', help='Service account to grant access to')
    parser.add_argument('--prefix', default='eyewear-ml-prod', help='Prefix to add to secret names')
    
    args = parser.parse_args()
    
    if setup_essential_secrets(args.project_id, args.env_file, args.service_account, args.prefix):
        logger.info("Essential secrets setup completed successfully")
    else:
        logger.error("Essential secrets setup failed")
        exit(1)

if __name__ == "__main__":
    main()