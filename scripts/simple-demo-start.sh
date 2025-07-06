#!/bin/bash

# Ultra-Simple Demo Start Script for AI Avatar Chat System
# Just launches the server - no complex checks or setup

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
DEMO_DIR="demo/live-demo"
PORTS=(4000 5000 8000 3000)
SELECTED_PORT=""

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Find available port
find_port() {
    for port in "${PORTS[@]}"; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            SELECTED_PORT=$port
            return 0
        fi
    done
    print_error "No available ports found"
    exit 1
}

# Simple header
echo -e "${BOLD}${GREEN}🚀 Simple Demo Start${NC}"
echo ""

# Basic checks
if [[ ! -f ".env.demo" ]]; then
    print_error "Run from project root directory (.env.demo not found)"
    exit 1
fi

if [[ ! -f "$DEMO_DIR/live-demo-server.js" ]]; then
    print_error "Demo server not found at $DEMO_DIR/live-demo-server.js"
    exit 1
fi

# Find port
print_info "Finding available port..."
find_port
print_success "Using port: $SELECTED_PORT"

# Create logs directory
mkdir -p logs

# Load environment
export $(grep -v '^#' .env.demo | xargs) 2>/dev/null || true
export PORT=$SELECTED_PORT
export DEMO_SERVER_PORT=$SELECTED_PORT
export NODE_ENV=demo

# Start server
print_info "Starting demo server..."
cd "$DEMO_DIR"

# Simple start with basic logging
node live-demo-server.js &
SERVER_PID=$!

cd - > /dev/null

# Wait a moment for startup
sleep 3

# Check if server started
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Demo server started successfully!"
    print_success "URL: http://localhost:$SELECTED_PORT"
    print_success "Quick Start: http://localhost:$SELECTED_PORT/quick-start.html"
    print_info "Server PID: $SERVER_PID"
    
    # Try to open browser
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:$SELECTED_PORT/quick-start.html" 2>/dev/null &
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$SELECTED_PORT/quick-start.html" 2>/dev/null &
    fi
    
    echo ""
    print_info "To stop: kill $SERVER_PID"
    print_info "Or use: pkill -f live-demo-server.js"
else
    print_error "Failed to start server"
    exit 1
fi