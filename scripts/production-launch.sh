#!/bin/bash

# ==============================================================================
# Production Launch Automation Script for AI Avatar Chat System
#
# This script serves as the main entry point for initiating a production launch.
# It executes the deployment orchestrator and provides a centralized place
# for pre-launch checks and environment setup.
#
# Usage: ./scripts/production-launch.sh
#
# Prerequisites:
# - Node.js and npm installed.
# - Access to the production environment and necessary credentials configured.
# - All required environment variables are set (e.g., NODE_ENV).
#
# ==============================================================================

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
LOG_DIR="logs/deployment"
LOG_FILE="${LOG_DIR}/production-launch-$(date +'%Y-%m-%d_%H-%M-%S').log"
ORCHESTRATOR_SCRIPT="deploy/production/production-deployment-orchestrator.js"

# --- Functions ---

# Log a message to both stdout and the log file
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Check for prerequisites before starting the launch
pre_launch_checks() {
  log "--- Running Pre-Launch Checks ---"

  # Check if Node.js is installed
  if ! command -v node &> /dev/null; then
    log "ERROR: Node.js is not installed. Please install Node.js to continue."
    exit 1
  fi

  # Check if the orchestrator script exists
  if [ ! -f "${ORCHESTRATOR_SCRIPT}" ]; then
    log "ERROR: Deployment orchestrator script not found at ${ORCHESTRATOR_SCRIPT}."
    exit 1
  fi

  # Ensure environment is set to production
  if [ "$NODE_ENV" != "production" ]; then
      log "WARNING: NODE_ENV is not set to 'production'. Exporting it for this session."
      export NODE_ENV=production
  fi

  log "All pre-launch checks passed."
}

# --- Main Execution ---

# Create log directory if it doesn't exist
mkdir -p "${LOG_DIR}"

log "================================================="
log "AI AVATAR CHAT SYSTEM - PRODUCTION LAUNCH SCRIPT"
log "================================================="
log "Log file for this session: ${LOG_FILE}"

# 1. Run pre-launch checks
pre_launch_checks

# 2. Install dependencies for deployment scripts
log "--- Installing deployment dependencies ---"
# Assuming deployment scripts have their own package.json or share the root one
# cd deploy/production && npm install && cd ../..
# For simplicity, we assume root installation is sufficient.
npm install --quiet
log "Dependencies installed."

# 3. Execute the deployment orchestrator
log "--- Starting Production Deployment Orchestrator ---"
node "${ORCHESTRATOR_SCRIPT}" 2>&1 | tee -a "${LOG_FILE}"

# Check the exit code of the orchestrator script
if [ $? -eq 0 ]; then
  log "--- LAUNCH SUCCEEDED ---"
  log "Production deployment orchestrator finished successfully."
  log "================================================="
  exit 0
else
  log "--- LAUNCH FAILED ---"
  log "Production deployment orchestrator exited with an error."
  log "Check the logs above for details on the failure and rollback process."
  log "================================================="
  exit 1
fi