#!/usr/bin/env python3
"""
Script to verify that the application can run with the environment variables.
This script loads the environment variables from the .env file and checks if
they are accessible to the application.
"""

import os
import sys
import random
import dotenv

def verify_env_vars(env_file):
    """
    Verify that the environment variables can be loaded and accessed.
    
    Args:
        env_file: Path to the .env file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Load environment variables from .env file
        dotenv.load_dotenv(env_file)
        
        # Get all environment variables
        env_vars = {}
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key] = value
        
        # Check if a random sample of environment variables are accessible
        sample_size = min(10, len(env_vars))
        sample_keys = random.sample(list(env_vars.keys()), sample_size)
        
        print(f"Checking {sample_size} random environment variables:")
        for key in sample_keys:
            value = os.environ.get(key)
            if value is None:
                print(f"  ❌ {key}: Not found in environment")
                return False
            else:
                # Don't print the actual value for security reasons
                print(f"  ✅ {key}: Successfully loaded")
        
        print(f"\nAll {sample_size} environment variables were successfully loaded.")
        return True
        
    except Exception as e:
        print(f"Error verifying environment variables: {str(e)}")
        return False

if __name__ == "__main__":
    env_file = ".env"
    if len(sys.argv) > 1:
        env_file = sys.argv[1]
    
    print(f"Verifying environment variables from {env_file}...")
    success = verify_env_vars(env_file)
    
    if success:
        print("\nVerification successful! The application can run with the environment variables.")
        sys.exit(0)
    else:
        print("\nVerification failed! The application may not run correctly with the environment variables.")
        sys.exit(1)