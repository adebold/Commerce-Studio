# PowerShell script to run the HTML store demo in Docker

# Build and run the Docker container
Write-Host "Building and running the HTML store demo..."
docker-compose up --build -d

# Wait for the container to start
Start-Sleep -Seconds 2

# Open the browser to the demo
Write-Host "Opening the HTML store demo in your browser..."
Start-Process "http://localhost:8080"

Write-Host "HTML store demo is running at http://localhost:8080"
Write-Host "Press Ctrl+C to stop the demo"

# Keep the script running until user presses Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Stop the container when the script is interrupted
    Write-Host "`nStopping the HTML store demo..."
    docker-compose down
    Write-Host "Demo stopped"
}