#!/bin/sh

# Set default PORT if not provided
export PORT=${PORT:-8080}

echo "Starting nginx with PORT=$PORT"

# Create log files if they don't exist
touch /app/logs/access.log /app/logs/error.log

# Process the nginx configuration template with envsubst
envsubst '${PORT}' < /app/nginx/nginx.conf.template > /app/nginx/nginx.conf

# Start nginx in foreground mode
exec nginx -c /app/nginx/nginx.conf -g "daemon off;"