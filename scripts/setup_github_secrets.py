#!/usr/bin/env python3
"""
Script to upload environment variables to GitHub Secrets.
This script reads the .env file and creates secrets in GitHub using the GitHub CLI.
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
        logging.FileHandler(f"github_secrets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("github_secrets")

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

def create_github_secret(repo, secret_name, secret_value):
    """
    Create a secret in GitHub using the GitHub CLI.
    
    Args:
        repo: GitHub repository in the format owner/repo
        secret_name: Name of the secret
        secret_value: Value of the secret
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create the secret using GitHub CLI
        cmd = ["gh", "secret", "set", secret_name, "--body", secret_value, "--repo", repo]
        
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        logger.info(f"Successfully created/updated secret {secret_name}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating secret {secret_name}: {str(e)}")
        return False

def upload_secrets_to_github(env_file, repo, prefix=None):
    """
    Upload secrets from .env file to GitHub Secrets.
    
    Args:
        env_file: Path to the .env file
        repo: GitHub repository in the format owner/repo
        prefix: Optional prefix to add to secret names
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Read environment variables
        env_vars = read_env_file(env_file)
        logger.info(f"Found {len(env_vars)} environment variables in {env_file}")
        
        # Create secrets in GitHub
        success_count = 0
        
        for var_name, value in env_vars.items():
            # Format secret name (GitHub secrets are uppercase by convention)
            secret_name = var_name.upper()
            if prefix:
                secret_name = f"{prefix}_{secret_name}"
            
            # Create secret
            if create_github_secret(repo, secret_name, value):
                success_count += 1
        
        logger.info(f"Successfully created/updated {success_count} of {len(env_vars)} secrets")
        return True
        
    except Exception as e:
        logger.error(f"Error uploading secrets to GitHub: {str(e)}")
        return False

def check_github_cli():
    """
    Check if GitHub CLI is installed and authenticated.
    
    Returns:
        True if GitHub CLI is installed and authenticated, False otherwise
    """
    try:
        # Check if GitHub CLI is installed
        process = subprocess.run(["gh", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Check if GitHub CLI is authenticated
        process = subprocess.run(["gh", "auth", "status"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        logger.info("GitHub CLI is installed and authenticated")
        return True
        
    except Exception as e:
        logger.error(f"GitHub CLI is not installed or not authenticated: {str(e)}")
        logger.error("Please install GitHub CLI and authenticate with 'gh auth login'")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload secrets to GitHub Secrets')
    parser.add_argument('--env-file', default='.env', help='Path to the .env file')
    parser.add_argument('--repo', required=True, help='GitHub repository in the format owner/repo')
    parser.add_argument('--prefix', help='Prefix to add to secret names')
    
    args = parser.parse_args()
    
    # Check if GitHub CLI is installed and authenticated
    if not check_github_cli():
        exit(1)
    
    if upload_secrets_to_github(args.env_file, args.repo, args.prefix):
        logger.info("Secret upload completed successfully")
    else:
        logger.error("Secret upload failed")
        exit(1)

if __name__ == "__main__":
    main()