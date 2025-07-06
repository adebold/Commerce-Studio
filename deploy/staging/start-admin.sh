#!/bin/bash

# Startup script for VARAi Admin Panel - Staging Environment
# This script sets up basic authentication and starts nginx

set -e

echo "Starting VARAi Admin Panel - Staging Environment"

# Default credentials if not provided via environment variables
BASIC_AUTH_USERNAME="${BASIC_AUTH_USERNAME:-varai-staging}"
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-VaraiStaging2025!}"

# Create htpasswd file for basic authentication
echo "Setting up basic authentication..."
mkdir -p /etc/nginx/auth

# Create htpasswd entry
echo "$BASIC_AUTH_PASSWORD" | htpasswd -ci /etc/nginx/auth/.htpasswd "$BASIC_AUTH_USERNAME"

# Verify htpasswd file was created
if [ ! -f /etc/nginx/auth/.htpasswd ]; then
    echo "Error: Failed to create htpasswd file"
    exit 1
fi

echo "Basic authentication configured for user: $BASIC_AUTH_USERNAME"

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "Error: Nginx configuration test failed"
    exit 1
fi

echo "Nginx configuration is valid"

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g "daemon off;"