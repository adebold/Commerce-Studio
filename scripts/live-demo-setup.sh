#!/bin/bash

# Live Demo Setup Script for AI Avatar Chat System
# Sets up the live demo environment with real NVIDIA API services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEMO_DIR="demo/live-demo"
CONFIG_DIR="config/nvidia"
SCRIPTS_DIR="scripts"
LOG_FILE="live-demo-setup.log"

# Function to print colored output
print_status() {
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    print_status "Checking required environment variables..."
    
    local missing_vars=()
    
    # Required NVIDIA API variables
    if [[ -z "${NVIDIA_OMNIVERSE_API_KEY:-}" ]]; then
        missing_vars+=("NVIDIA_OMNIVERSE_API_KEY")
    fi
    
    if [[ -z "${NVIDIA_RIVA_API_KEY:-}" ]]; then
        missing_vars+=("NVIDIA_RIVA_API_KEY")
    fi
    
    if [[ -z "${NVIDIA_MERLIN_API_KEY:-}" ]]; then
        missing_vars+=("NVIDIA_MERLIN_API_KEY")
    fi
    
    # Required endpoint variables
    if [[ -z "${NVIDIA_OMNIVERSE_ENDPOINT:-}" ]]; then
        missing_vars+=("NVIDIA_OMNIVERSE_ENDPOINT")
    fi
    
    if [[ -z "${NVIDIA_RIVA_ENDPOINT:-}" ]]; then
        missing_vars+=("NVIDIA_RIVA_ENDPOINT")
    fi
    
    if [[ -z "${NVIDIA_MERLIN_ENDPOINT:-}" ]]; then
        missing_vars+=("NVIDIA_MERLIN_ENDPOINT")
    fi
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables in your .env.demo.template file or environment"
        print_warning "You can still run the demo in fallback mode without these variables"
        return 1
    fi
    
    print_success "All required environment variables are set"
    return 0
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 16 ]]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
    
    # Check Python (for MediaPipe)
    if ! command_exists python3; then
        print_warning "Python 3 is not installed. Some face analysis features may not work."
    else
        print_success "Python 3 is installed"
    fi
    
    # Check ffmpeg (for audio processing)
    if ! command_exists ffmpeg; then
        print_warning "ffmpeg is not installed. Audio processing may be limited."
    else
        print_success "ffmpeg is installed"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    # Create package.json for demo if it doesn't exist
    if [[ ! -f "$DEMO_DIR/package.json" ]]; then
        print_status "Creating package.json for live demo..."
        cat > "$DEMO_DIR/package.json" << EOF
{
  "name": "ai-avatar-chat-live-demo",
  "version": "1.0.0",
  "description": "Live demo for AI Avatar Chat System with real NVIDIA APIs",
  "main": "live-demo-server.js",
  "scripts": {
    "start": "node live-demo-server.js",
    "dev": "nodemon live-demo-server.js",
    "test": "echo \\"No tests specified\\" && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "multer": "^1.4.5-lts.1",
    "js-yaml": "^4.1.0",
    "dotenv": "^16.3.1",
    "axios": "^1.4.0",
    "ws": "^8.13.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF
    fi
    
    # Install dependencies
    cd "$DEMO_DIR"
    npm install
    cd - > /dev/null
    
    print_success "Dependencies installed successfully"
}

# Function to setup configuration files
setup_configuration() {
    print_status "Setting up configuration files..."
    
    # Ensure directories exist
    mkdir -p "$DEMO_DIR"
    mkdir -p "$CONFIG_DIR"
    mkdir -p "temp"
    mkdir -p "logs"
    
    # Copy environment template if .env doesn't exist
    if [[ ! -f ".env" ]] && [[ -f ".env.demo.template" ]]; then
        print_status "Creating .env file from template..."
        cp ".env.demo.template" ".env"
        print_warning "Please edit .env file with your actual API keys and endpoints"
    fi
    
    # Set default values for demo server if not set
    if [[ -z "${DEMO_SERVER_HOST:-}" ]]; then
        export DEMO_SERVER_HOST="localhost"
    fi
    
    if [[ -z "${DEMO_SERVER_PORT:-}" ]]; then
        export DEMO_SERVER_PORT="3000"
    fi
    
    print_success "Configuration files setup complete"
}

# Function to test NVIDIA API connectivity
test_nvidia_apis() {
    print_status "Testing NVIDIA API connectivity..."
    
    local api_test_script="$SCRIPTS_DIR/nvidia-api-test.sh"
    
    if [[ -f "$api_test_script" ]]; then
        if bash "$api_test_script"; then
            print_success "NVIDIA API connectivity test passed"
            return 0
        else
            print_warning "NVIDIA API connectivity test failed"
            print_warning "Demo will run in fallback mode"
            return 1
        fi
    else
        print_warning "API test script not found, skipping connectivity test"
        return 1
    fi
}

# Function to setup SSL certificates (optional)
setup_ssl() {
    if [[ "${DEMO_SSL_ENABLED:-false}" == "true" ]]; then
        print_status "Setting up SSL certificates..."
        
        local cert_dir="certs"
        mkdir -p "$cert_dir"
        
        if [[ ! -f "$cert_dir/server.key" ]] || [[ ! -f "$cert_dir/server.crt" ]]; then
            print_status "Generating self-signed SSL certificate..."
            openssl req -x509 -newkey rsa:4096 -keyout "$cert_dir/server.key" -out "$cert_dir/server.crt" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            print_success "SSL certificate generated"
        else
            print_success "SSL certificates already exist"
        fi
    fi
}

# Function to create systemd service (Linux only)
create_systemd_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]] && command_exists systemctl; then
        print_status "Creating systemd service..."
        
        local service_file="/etc/systemd/system/ai-avatar-demo.service"
        local current_dir=$(pwd)
        local user=$(whoami)
        
        sudo tee "$service_file" > /dev/null << EOF
[Unit]
Description=AI Avatar Chat Live Demo
After=network.target

[Service]
Type=simple
User=$user
WorkingDirectory=$current_dir
ExecStart=/usr/bin/node $current_dir/$DEMO_DIR/live-demo-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$current_dir/.env

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        print_success "Systemd service created. Use 'sudo systemctl start ai-avatar-demo' to start"
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check if all required files exist
    local required_files=(
        "$DEMO_DIR/live-demo-server.js"
        "$DEMO_DIR/live-avatar-interface.html"
        "$CONFIG_DIR/live-api-configuration.yaml"
        "demo/live-demo-configuration.yaml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required files are present"
    
    # Test configuration loading
    print_status "Testing configuration loading..."
    if node -e "
        const yaml = require('js-yaml');
        const fs = require('fs');
        try {
            const config = yaml.load(fs.readFileSync('demo/live-demo-configuration.yaml', 'utf8'));
            const nvidiaConfig = yaml.load(fs.readFileSync('$CONFIG_DIR/live-api-configuration.yaml', 'utf8'));
            console.log('Configuration files loaded successfully');
        } catch (error) {
            console.error('Configuration loading failed:', error.message);
            process.exit(1);
        }
    "; then
        print_success "Configuration files are valid"
    else
        print_error "Configuration validation failed"
        exit 1
    fi
}

# Function to start the demo server
start_demo_server() {
    print_status "Starting live demo server..."
    
    cd "$DEMO_DIR"
    
    # Check if server is already running
    if lsof -Pi :${DEMO_SERVER_PORT:-3000} -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Server is already running on port ${DEMO_SERVER_PORT:-3000}"
        print_status "Stopping existing server..."
        pkill -f "live-demo-server.js" || true
        sleep 2
    fi
    
    # Start server in background
    if [[ "${1:-}" == "--background" ]]; then
        nohup node live-demo-server.js > "../logs/live-demo.log" 2>&1 &
        local server_pid=$!
        echo $server_pid > "../logs/live-demo.pid"
        print_success "Demo server started in background (PID: $server_pid)"
        print_status "Log file: logs/live-demo.log"
    else
        print_success "Starting demo server in foreground..."
        print_status "Demo will be available at: http://${DEMO_SERVER_HOST:-localhost}:${DEMO_SERVER_PORT:-3000}"
        print_status "Press Ctrl+C to stop the server"
        node live-demo-server.js
    fi
    
    cd - > /dev/null
}

# Function to stop the demo server
stop_demo_server() {
    print_status "Stopping live demo server..."
    
    if [[ -f "logs/live-demo.pid" ]]; then
        local pid=$(cat logs/live-demo.pid)
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "logs/live-demo.pid"
            print_success "Demo server stopped"
        else
            print_warning "Server process not found"
            rm -f "logs/live-demo.pid"
        fi
    else
        pkill -f "live-demo-server.js" || print_warning "No running server found"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup           Setup the live demo environment"
    echo "  start           Start the demo server (foreground)"
    echo "  start-bg        Start the demo server (background)"
    echo "  stop            Stop the demo server"
    echo "  restart         Restart the demo server"
    echo "  status          Show server status"
    echo "  test            Run connectivity tests"
    echo "  logs            Show server logs"
    echo "  clean           Clean temporary files"
    echo ""
    echo "Options:"
    echo "  --force         Force setup even if files exist"
    echo "  --no-api-test   Skip API connectivity tests"
    echo "  --help          Show this help message"
}

# Function to show server status
show_status() {
    print_status "Checking server status..."
    
    local port=${DEMO_SERVER_PORT:-3000}
    local host=${DEMO_SERVER_HOST:-localhost}
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Server is running on http://$host:$port"
        
        # Try to get health status
        if command_exists curl; then
            local health_response=$(curl -s "http://$host:$port/health" 2>/dev/null || echo "")
            if [[ -n "$health_response" ]]; then
                echo "Health check response:"
                echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
            fi
        fi
    else
        print_warning "Server is not running"
    fi
    
    # Check for PID file
    if [[ -f "logs/live-demo.pid" ]]; then
        local pid=$(cat logs/live-demo.pid)
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Background process PID: $pid"
        else
            print_warning "Stale PID file found, removing..."
            rm -f "logs/live-demo.pid"
        fi
    fi
}

# Function to show logs
show_logs() {
    if [[ -f "logs/live-demo.log" ]]; then
        tail -f "logs/live-demo.log"
    else
        print_warning "No log file found"
    fi
}

# Function to clean temporary files
clean_temp_files() {
    print_status "Cleaning temporary files..."
    
    rm -rf temp/*
    rm -rf logs/*.log
    rm -f logs/*.pid
    
    print_success "Temporary files cleaned"
}

# Main execution
main() {
    # Create log file
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)
    
    print_status "AI Avatar Chat System - Live Demo Setup"
    print_status "========================================"
    
    case "${1:-setup}" in
        "setup")
            check_system_requirements
            setup_configuration
            install_dependencies
            
            if [[ "${2:-}" != "--no-api-test" ]]; then
                if check_env_vars; then
                    test_nvidia_apis
                fi
            fi
            
            setup_ssl
            run_health_checks
            create_systemd_service
            
            print_success "Live demo setup completed successfully!"
            print_status "Run '$0 start' to start the demo server"
            ;;
            
        "start")
            start_demo_server
            ;;
            
        "start-bg")
            start_demo_server --background
            ;;
            
        "stop")
            stop_demo_server
            ;;
            
        "restart")
            stop_demo_server
            sleep 2
            start_demo_server --background
            ;;
            
        "status")
            show_status
            ;;
            
        "test")
            test_nvidia_apis
            ;;
            
        "logs")
            show_logs
            ;;
            
        "clean")
            clean_temp_files
            ;;
            
        "help"|"--help")
            show_usage
            ;;
            
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"