#!/usr/bin/env python
"""
Setup script for Prisma.

This script initializes Prisma and generates the Prisma client for deployment environments.
"""
import os
import subprocess
import sys
from pathlib import Path

def setup_prisma(environment="production"):
    """Initialize Prisma and generate the Prisma client.
    
    Args:
        environment: The environment to set up Prisma for. 
                    "development" uses migrate dev, 
                    "production" uses migrate deploy (default).
    """
    print(f"Setting up Prisma for {environment} environment...")
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent.absolute()
    
    # Create .env file with database connection string if it doesn't exist
    env_file = project_root / "prisma" / ".env"
    if not env_file.exists():
        print("Creating .env file...")
        
        # Get database URL from environment or use default
        database_url = os.environ.get(
            "DATABASE_URL", 
            "postgresql://postgres:postgres@localhost:5432/eyewear_ml"
        )
        
        # Write to .env file
        with open(env_file, "w") as f:
            f.write(f"DATABASE_URL={database_url}\n")
        
        print(f"Created .env file at {env_file}")
    
    # Change to the project root directory
    os.chdir(project_root)
    
    # Run appropriate Prisma migration command based on environment
    migrations_dir = project_root / "prisma" / "migrations"
    if not migrations_dir.exists() or environment == "development":
        if environment == "development":
            print("Running Prisma migrations for development...")
            try:
                subprocess.run(
                    ["npx", "prisma", "migrate", "dev", "--name", "init"],
                    check=True,
                    cwd=project_root
                )
                print("Prisma migrations completed successfully")
            except subprocess.CalledProcessError as e:
                print(f"Error running Prisma migrations: {e}")
                return False
        else:
            print("Running Prisma migrations for production/deployment...")
            try:
                subprocess.run(
                    ["npx", "prisma", "migrate", "deploy"],
                    check=True,
                    cwd=project_root
                )
                print("Prisma migrations deployed successfully")
            except subprocess.CalledProcessError as e:
                print(f"Error deploying Prisma migrations: {e}")
                return False
    
    # Generate Prisma client
    print("Generating Prisma client...")
    try:
        subprocess.run(
            ["npx", "prisma", "generate"],
            check=True,
            cwd=project_root
        )
        print("Prisma client generated successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error generating Prisma client: {e}")
        return False
    
    print("Prisma setup completed successfully")
    return True


if __name__ == "__main__":
    # Default to production for deployment scripts
    env = os.environ.get("PRISMA_ENVIRONMENT", "production")
    success = setup_prisma(env)
    sys.exit(0 if success else 1)