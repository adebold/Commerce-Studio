#!/bin/bash
# Setup script for Prisma in deployment environments
# This script initializes Prisma and generates the Prisma client

# Default to production environment unless specified
ENVIRONMENT=${PRISMA_ENVIRONMENT:-production}
echo "Setting up Prisma for $ENVIRONMENT environment..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Create .env file with database connection string if it doesn't exist
ENV_FILE="$PROJECT_ROOT/prisma/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    
    # Get database URL from environment or use default
    DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/eyewear_ml}
    
    # Write to .env file
    echo "DATABASE_URL=$DATABASE_URL" > "$ENV_FILE"
    
    echo "Created .env file at $ENV_FILE"
fi

# Change to the project root directory
cd "$PROJECT_ROOT"

# Run appropriate Prisma migration command based on environment
MIGRATIONS_DIR="$PROJECT_ROOT/prisma/migrations"
if [ ! -d "$MIGRATIONS_DIR" ] || [ "$ENVIRONMENT" = "development" ]; then
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "Running Prisma migrations for development..."
        npx prisma migrate dev --name init
        if [ $? -ne 0 ]; then
            echo "Error running Prisma migrations"
            exit 1
        fi
        echo "Prisma migrations completed successfully"
    else
        echo "Running Prisma migrations for production/deployment..."
        npx prisma migrate deploy
        if [ $? -ne 0 ]; then
            echo "Error deploying Prisma migrations"
            exit 1
        fi
        echo "Prisma migrations deployed successfully"
    fi
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Error generating Prisma client"
    exit 1
fi
echo "Prisma client generated successfully"

echo "Prisma setup completed successfully"
exit 0