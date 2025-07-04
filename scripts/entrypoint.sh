#!/bin/bash
set -e

# Function to wait for a service
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    local timeout="${4:-30}"

    echo "Waiting for $service to be ready..."
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            echo "$service is ready!"
            return 0
        fi
        echo "Attempt $i/$timeout: $service is not ready yet..."
        sleep 1
    done
    echo "Timeout waiting for $service"
    return 1
}

# Function to check GCP credentials
check_gcp_credentials() {
    if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo "Error: GCP service account key not found at $GOOGLE_APPLICATION_CREDENTIALS"
        exit 1
    fi
    
    # Verify credentials work
    if ! gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null; then
        echo "Error: Failed to authenticate with GCP service account"
        exit 1
    fi
}

# Function to verify environment variables
verify_env_vars() {
    local required_vars=(
        "GCP_PROJECT_ID"
        "GCP_BUCKET_NAME"
        "JWT_SECRET_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "Error: Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Function to initialize ML model
initialize_ml_model() {
    echo "Initializing ML model..."
    if ! python -c "
from src.ml.model import EyewearModel
from src.config.gcp_config import VERTEX_AI_CONFIG
print('ML model initialization successful')
    "; then
        echo "Error: Failed to initialize ML model"
        exit 1
    fi
}

# Main initialization
main() {
    echo "Starting application initialization..."
    
    # Verify environment
    verify_env_vars
    check_gcp_credentials
    
    # Initialize services
    initialize_ml_model
    
    # Start Gunicorn server
    echo "Starting Gunicorn server..."
    exec gunicorn \
        --bind 0.0.0.0:${PORT:-8080} \
        --workers ${GUNICORN_WORKERS:-4} \
        --threads ${GUNICORN_THREADS:-2} \
        --timeout ${GUNICORN_TIMEOUT:-120} \
        --keep-alive ${GUNICORN_KEEPALIVE:-5} \
        --log-level ${GUNICORN_LOG_LEVEL:-info} \
        --access-logfile - \
        --error-logfile - \
        --capture-output \
        "src.app:create_app()"
}

# Trap signals
trap 'echo "Received SIGTERM, shutting down..."; kill -TERM $PID; wait $PID' TERM
trap 'echo "Received SIGINT, shutting down..."; kill -TERM $PID; wait $PID' INT

# Start the application
main "$@" &
PID=$!
wait $PID
