#!/bin/bash

# Bash script to stop the Authentication Service

# Navigate to the Authentication Service directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "\e[31mDocker is not running. Please start Docker and try again.\e[0m"
    exit 1
fi

# Stop the Authentication Service
echo -e "\e[33mStopping Authentication Service...\e[0m"
docker-compose down

echo -e "\n\e[32mAuthentication Service has been stopped.\e[0m"
echo -e "\e[36mTo start the Authentication Service again, run './start-auth-service.sh'\e[0m"