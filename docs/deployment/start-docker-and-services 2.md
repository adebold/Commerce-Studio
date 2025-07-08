# Starting Docker Desktop and EyewearML Services

## Step 1: Start Docker Desktop Manually

Docker Desktop appears to be installed but not running on your system. Here's how to start it:

1. Click on the Windows Start menu
2. Search for "Docker Desktop"
3. Click on the Docker Desktop application to launch it
4. Wait for Docker Desktop to initialize (you'll see the Docker whale icon in your system tray when it's ready)
5. The Docker icon in your system tray should change from red to green when it's fully running

## Step 2: Verify Docker is Running

Run these commands in PowerShell to verify Docker is running properly:

```powershell
docker info
```

You should see detailed information about your Docker installation without connection errors.

## Step 3: Run the Launch Script

Once Docker is running, you can launch the EyewearML services:

```powershell
# Navigate to your project directory if not already there
cd c:/Users/alex/Projects/eyewear-ml

# Run the PowerShell launch script
.\launch-eyewear-services.ps1
```

The script will:
- Check if Docker is running
- Create environment variables if needed
- Start all required services
- Display URLs and commands for accessing the services

## Alternative: Manual Docker Compose Commands

If you prefer to run commands directly:

```powershell
# Start the services in detached mode
docker-compose up -d frontend api mongodb redis

# Check running services
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f api
```

## Accessing the Services

Once running, you'll be able to access:
- Frontend: http://localhost:3005
- API: http://localhost:8001
- MongoDB (database): localhost:27018
- Redis (cache): localhost:6381

## Troubleshooting Docker Desktop Issues

If Docker Desktop won't start:

1. **Check for updates**: Docker Desktop might need updating
2. **Restart WSL**: In an administrator PowerShell window, run:
   ```powershell
   wsl --shutdown
   ```
3. **Check system requirements**: Ensure Hyper-V or WSL2 is properly configured
4. **Restart your computer**: Sometimes a simple restart resolves Docker issues
5. **Reinstall Docker Desktop**: As a last resort, consider reinstalling

## Docker Desktop Status

To check Docker Desktop service status:
```powershell
Get-Service -Name *docker*
```

The service status should be "Running" when Docker Desktop is working properly.
