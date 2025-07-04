#!/bin/bash

# Bash script to start the API Gateway

# Navigate to the API Gateway directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "\e[31mDocker is not running. Please start Docker and try again.\e[0m"
    exit 1
fi

# Start the API Gateway
echo -e "\e[32mStarting API Gateway...\e[0m"
docker-compose up -d

# Wait for services to start
echo -e "\e[33mWaiting for services to start...\e[0m"
sleep 10

# Check if Kong is running
if curl -s http://localhost:8001/status > /dev/null; then
    KONG_STATUS=$(curl -s http://localhost:8001/status)
    KONG_VERSION=$(echo $KONG_STATUS | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    DB_STATUS=$(echo $KONG_STATUS | grep -o '"database":{"reachable":[^}]*}' | grep -o '"reachable":[^,}]*' | cut -d':' -f2)
    
    echo -e "\e[32mKong API Gateway is running!\e[0m"
    echo -e "\e[32mKong version: $KONG_VERSION\e[0m"
    echo -e "\e[32mDatabase: $DB_STATUS\e[0m"
else
    echo -e "\e[31mKong API Gateway is not responding. Check the logs with 'docker-compose logs kong'\e[0m"
fi

# Display access information
echo -e "\n\e[36mAPI Gateway is now available at the following URLs:\e[0m"
echo -e "\e[36m- Kong Admin API: http://localhost:8001\e[0m"
echo -e "\e[36m- Kong Manager UI: http://localhost:1337\e[0m"
echo -e "\e[36m- Kong Proxy (API Gateway): http://localhost:8000\e[0m"

echo -e "\n\e[36mTest the API Gateway with the following commands:\e[0m"
echo -e "\e[36m- Get all products: curl http://localhost:8000/api/v1/products\e[0m"
echo -e "\e[36m- Get a specific product: curl http://localhost:8000/api/v1/products/product-1\e[0m"
echo -e "\e[36m- Get all users: curl http://localhost:8000/api/v1/users\e[0m"
echo -e "\e[36m- Get a specific user: curl http://localhost:8000/api/v1/users/user-1\e[0m"

echo -e "\n\e[36mTo stop the API Gateway, run './stop-gateway.sh'\e[0m"