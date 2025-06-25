#!/bin/bash

# Bash script to run the HTML store demo in Docker

# Build and run the Docker container
echo "Building and running the HTML store demo..."
docker-compose up --build -d

# Wait for the container to start
sleep 2

# Open the browser to the demo (works on macOS and many Linux distros)
echo "Opening the HTML store demo in your browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:8080"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8080"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:8080"
    else
        echo "Could not automatically open browser. Please visit http://localhost:8080"
    fi
else
    echo "Could not automatically open browser. Please visit http://localhost:8080"
fi

echo "HTML store demo is running at http://localhost:8080"
echo "Press Ctrl+C to stop the demo"

# Keep the script running until user presses Ctrl+C
trap 'echo -e "\nStopping the HTML store demo..."; docker-compose down; echo "Demo stopped"; exit 0' INT
while true; do
    sleep 1
done