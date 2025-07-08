#!/bin/bash

# Demo Environment Setup Script for AI Avatar Chat System
#
# This script prepares the demo environment by creating necessary directories,
# setting up mock services, and launching a simple web server for the demo interface.
#
# Usage: ./scripts/demo-setup.sh
#

# --- Configuration ---
DEMO_DIR="demo"
MOCK_SERVICES_DIR="${DEMO_DIR}/mock-services"
SAMPLE_DATA_DIR="${DEMO_DIR}/sample-data"
FRONTEND_DIR="${DEMO_DIR}/frontend"
NODE_SERVER_FILE="${MOCK_SERVICES_DIR}/nvidia-mock-server.js"
DEMO_INTERFACE_FILE="${FRONTEND_DIR}/demo-interface.html"
LOG_FILE="${DEMO_DIR}/demo-setup.log"
SERVER_PORT=8080

# --- Functions ---

# Function to handle errors and exit
handle_error() {
  echo "❌ Error: $1" | tee -a "${LOG_FILE}"
  exit 1
}

# Function for logging progress
log_progress() {
  echo "✅ $1" | tee -a "${LOG_FILE}"
}

# --- Main Script ---

# 1. Create demo directories
log_progress "Creating demo directories..."
mkdir -p "${MOCK_SERVICES_DIR}" "${SAMPLE_DATA_DIR}" "${FRONTEND_DIR}" || handle_error "Failed to create demo directories."

# 2. Check for Node.js
if ! command -v node &> /dev/null; then
    handle_error "Node.js is not installed. Please install it to run the mock server."
fi

# 3. Start the mock NVIDIA services server
if [ -f "${NODE_SERVER_FILE}" ]; then
    log_progress "Starting mock NVIDIA services server..."
    # Check if a server is already running on the port
    if lsof -i :${SERVER_PORT} > /dev/null; then
        log_progress "Server is already running on port ${SERVER_PORT}."
    else
        node "${NODE_SERVER_FILE}" > "${DEMO_DIR}/mock-server.log" 2>&1 &
        SERVER_PID=$!
        echo ${SERVER_PID} > "${DEMO_DIR}/server.pid"
        log_progress "Mock server started with PID ${SERVER_PID} on port ${SERVER_PORT}."
    fi
else
    handle_error "Mock server file not found: ${NODE_SERVER_FILE}"
fi

# 4. Launch a simple web server for the demo interface
if [ -f "${DEMO_INTERFACE_FILE}" ]; then
    log_progress "Starting simple web server for the demo interface..."
    # Use Python's simple HTTP server. Requires Python 3.
    if ! command -v python3 &> /dev/null; then
        handle_error "Python 3 is not installed. Please install it to run the demo web server."
    fi
    (cd "${DEMO_DIR}" && python3 -m http.server ${SERVER_PORT} > /dev/null 2>&1 &)
    WEB_SERVER_PID=$!
    echo ${WEB_SERVER_PID} > "${DEMO_DIR}/web-server.pid"
    log_progress "Web server started with PID ${WEB_SERVER_PID}."
    echo "🔗 Demo interface is available at: http://localhost:${SERVER_PORT}/frontend/demo-interface.html"
else
    handle_error "Demo interface file not found: ${DEMO_INTERFACE_FILE}"
fi

log_progress "Demo environment setup complete."
exit 0