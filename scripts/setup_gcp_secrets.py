#!/usr/bin/env python3
"""
Script to upload environment variables to Google Cloud Secret Manager.
This script reads the .env file and creates secrets in Google Cloud Secret Manager.
"""

import os
import re
import argparse
import logging
import subprocess
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"gcp_secrets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("gcp_secrets")

def read_env_file(file_path):
    """
    Read the .env file and extract variable names and values.
    
    Args:
        file_path: Path to the .env file
        
    Returns:
        A dictionary of environment variables and their values
    """
    env_vars = {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                # Skip comments and empty lines
                if line.strip() and not line.strip().startswith('#'):
                    # Extract variable name and value
                    match = re.match(r'^([A-Za-z0-9_]+)=(.*)$', line.strip())
                    if match:
                        env_vars[match.group(1)] = match.group(2)
    except Exception as e:
        logger.error(f"Error reading {file_path}: {str(e)}")
        raise
    
    return env_vars

def create_gcp_secret(project_id, secret_name, secret_value, prefix=None):
    """
    Create a secret in Google Cloud Secret Manager.
    
    Args:
        project_id: Google Cloud project ID
        secret_name: Name of the secret
        secret_value: Value of the secret
        prefix: Optional prefix to add to secret names
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Format secret name
        if prefix:
            secret_name = f"{prefix}-{secret_name}"
        
        # Check if secret exists
        check_cmd = ["gcloud", "secrets", "describe", secret_name, "--project", project_id]
        check_result = subprocess.run(check_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if check_result.returncode == 0:
            # Secret exists, add new version
            cmd = ["gcloud", "secrets", "versions", "add", secret_name, "--data-file=-", "--project", project_id]
            process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate(input=secret_value.encode())
            
            if process.returncode != 0:
                logger.error(f"Error adding new version to secret {secret_name}: {stderr.decode()}")
                return False
            
            logger.info(f"Added new version to secret {secret_name}")
        else:
            # Secret doesn't exist, create it
            create_cmd = ["gcloud", "secrets", "create", secret_name, "--project", project_id]
            create_result = subprocess.run(create_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            if create_result.returncode != 0:
                logger.error(f"Error creating secret {secret_name}: {create_result.stderr.decode()}")
                return False
            
            # Add initial version
            cmd = ["gcloud", "secrets", "versions", "add", secret_name, "--data-file=-", "--project", project_id]
            process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate(input=secret_value.encode())
            
            if process.returncode != 0:
                logger.error(f"Error adding initial version to secret {secret_name}: {stderr.decode()}")
                return False
            
            logger.info(f"Created secret {secret_name}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating secret {secret_name}: {str(e)}")
        return False

def upload_secrets_to_gcp(env_file, project_id, prefix=None):
    """
    Upload secrets from .env file to Google Cloud Secret Manager.
    
    Args:
        env_file: Path to the .env file
        project_id: Google Cloud project ID
        prefix: Optional prefix to add to secret names
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Read environment variables
        env_vars = read_env_file(env_file)
        logger.info(f"Found {len(env_vars)} environment variables in {env_file}")
        
        # Create secrets in Google Cloud Secret Manager
        success_count = 0
        
        for var_name, value in env_vars.items():
            # Create secret
            if create_gcp_secret(project_id, var_name, value, prefix):
                success_count += 1
        
        logger.info(f"Successfully created/updated {success_count} of {len(env_vars)} secrets")
        return True
        
    except Exception as e:
        logger.error(f"Error uploading secrets to Google Cloud Secret Manager: {str(e)}")
        return False

def check_gcloud():
    """
    Check if gcloud CLI is installed and authenticated.
    
    Returns:
        True if gcloud CLI is installed and authenticated, False otherwise
    """
    try:
        # Check if gcloud CLI is installed
        process = subprocess.run(["gcloud", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Check if gcloud CLI is authenticated
        process = subprocess.run(["gcloud", "auth", "list"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        logger.info("gcloud CLI is installed and authenticated")
        return True
        
    except Exception as e:
        logger.error(f"gcloud CLI is not installed or not authenticated: {str(e)}")
        logger.error("Please install gcloud CLI and authenticate with 'gcloud auth login'")
        return False

def setup_service_account_permissions(project_id, service_account):
    """
    Set up permissions for the service account to access secrets.
    
    Args:
        project_id: Google Cloud project ID
        service_account: Service account email
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Grant Secret Manager Secret Accessor role to the service account
        cmd = [
            "gcloud", "projects", "add-iam-policy-binding", project_id,
            "--member", f"serviceAccount:{service_account}",
            "--role", "roles/secretmanager.secretAccessor"
        ]
        
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        logger.info(f"Granted Secret Manager Secret Accessor role to {service_account}")
        return True
        
    except Exception as e:
        logger.error(f"Error setting up service account permissions: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload secrets to Google Cloud Secret Manager')
    parser.add_argument('--env-file', default='.env', help='Path to the .env file')
    parser.add_argument('--project-id', required=True, help='Google Cloud project ID')
    parser.add_argument('--prefix', help='Prefix to add to secret names')
    parser.add_argument('--service-account', help='Service account email to grant access to secrets')
    
    args = parser.parse_args()
    
    # Check if gcloud CLI is installed and authenticated
    if not check_gcloud():
        exit(1)
    
    if upload_secrets_to_gcp(args.env_file, args.project_id, args.prefix):
        logger.info("Secret upload completed successfully")
        
        # Set up service account permissions if provided
        if args.service_account:
            if setup_service_account_permissions(args.project_id, args.service_account):
                logger.info(f"Service account {args.service_account} permissions set up successfully")
            else:
                logger.error(f"Failed to set up service account {args.service_account} permissions")
                exit(1)
    else:
        logger.error("Secret upload failed")
        exit(1)

if __name__ == "__main__":
    main()