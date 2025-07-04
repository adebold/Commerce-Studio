#!/bin/bash

# Bash script to start the Authentication Service

# Navigate to the Authentication Service directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "\e[31mDocker is not running. Please start Docker and try again.\e[0m"
    exit 1
fi

# Check if API Gateway network exists
if ! docker network ls --filter name=api-gateway-net -q | grep -q .; then
    echo -e "\e[33mAPI Gateway network does not exist. Creating api-gateway-net...\e[0m"
    docker network create api-gateway-net
fi

# Start the Authentication Service
echo -e "\e[32mStarting Authentication Service...\e[0m"
docker-compose up -d

# Wait for services to start
echo -e "\e[33mWaiting for services to start...\e[0m"
sleep 20

# Check if Keycloak is running
if curl -s http://localhost:8080/auth/health > /dev/null; then
    echo -e "\e[32mKeycloak is running!\e[0m"
else
    echo -e "\e[31mKeycloak is not responding. Check the logs with 'docker-compose logs keycloak'\e[0m"
fi

# Display access information
echo -e "\n\e[36mAuthentication Service is now available at the following URLs:\e[0m"
echo -e "\e[36m- Keycloak Admin Console: http://localhost:8080/auth/admin/\e[0m"
echo -e "\e[36m- Integration Service: http://localhost:8081\e[0m"
echo -e "\e[36m- Admin UI: http://localhost:8082\e[0m"

echo -e "\n\e[36mDefault admin credentials:\e[0m"
echo -e "\e[36m- Username: admin\e[0m"
echo -e "\e[36m- Password: admin (you will be prompted to change this on first login)\e[0m"

echo -e "\n\e[36mTo stop the Authentication Service, run './stop-auth-service.sh'\e[0m"

# Import realm if it doesn't exist
echo -e "\n\e[33mChecking if realm exists...\e[0m"
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8080/auth/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=admin-cli&username=admin&password=admin&grant_type=password")

if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    REALMS_RESPONSE=$(curl -s -X GET "http://localhost:8080/auth/admin/realms" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$REALMS_RESPONSE" | grep -q '"realm":"varai"'; then
        echo -e "\e[32mVARAi realm already exists.\e[0m"
    else
        echo -e "\e[33mImporting VARAi realm...\e[0m"
        curl -s -X POST "http://localhost:8080/auth/admin/realms" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            --data-binary @"./keycloak/config/varai-realm.json"
        
        if [ $? -eq 0 ]; then
            echo -e "\e[32mVARAi realm imported successfully!\e[0m"
        else
            echo -e "\e[31mFailed to import VARAi realm.\e[0m"
        fi
    fi
else
    echo -e "\e[31mError obtaining access token from Keycloak.\e[0m"
    echo -e "\e[33mYou may need to manually import the realm from the Keycloak Admin Console.\e[0m"
    echo -e "\e[33m1. Log in to http://localhost:8080/auth/admin/\e[0m"
    echo -e "\e[33m2. Click on 'Add realm'\e[0m"
    echo -e "\e[33m3. Click 'Select file' and choose 'keycloak/config/varai-realm.json'\e[0m"
    echo -e "\e[33m4. Click 'Create'\e[0m"
fi