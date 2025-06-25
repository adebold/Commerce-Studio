# Deploy script for the Shopify app (PowerShell)

Write-Host "Deploying Shopify app..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Check MongoDB connection
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 27017)
    $connection.Close()
    Write-Host "MongoDB connection successful" -ForegroundColor Green
}
catch {
    Write-Host "MongoDB is not running. Please start MongoDB before deploying." -ForegroundColor Red
    exit 1
}

# Start the app
Write-Host "Starting the app..." -ForegroundColor Yellow
npm start