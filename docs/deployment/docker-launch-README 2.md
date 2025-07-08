# EyewearML Docker Launch Scripts

This directory contains scripts to help you easily launch the EyewearML frontend and backend services using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed (included with Docker Desktop)

## Launch Scripts

Two scripts are provided to accommodate different operating systems:

### For Windows

```powershell
.\launch-eyewear-services.ps1
```

### For Linux/macOS

```bash
# First make the script executable
chmod +x launch-eyewear-services.sh

# Then run it
./launch-eyewear-services.sh
```

## What the Scripts Do

The launch scripts perform the following tasks:

1. Check if Docker is running
2. Create a basic `.env.docker` file if it doesn't exist
3. Start the frontend, API, MongoDB, and Redis services
4. Display information about running services and access URLs

## Services Launched

| Service       | Description                      | URL                   |
|---------------|----------------------------------|------------------------|
| frontend      | Main EyewearML frontend          | http://localhost:3005 |
| api           | Backend API service              | http://localhost:8001 |
| mongodb       | MongoDB database                 | localhost:27018       |
| redis         | Redis cache                      | localhost:6381        |

## Useful Commands

After launching the services, you can use the following Docker Compose commands:

### View logs for a specific service

```bash
docker-compose logs -f frontend
docker-compose logs -f api
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove all data (volumes)

```bash
docker-compose down -v
```

## Troubleshooting

### Docker isn't running

If you receive an error stating Docker isn't running:

1. Start Docker Desktop (Windows/macOS)
2. Run `systemctl start docker` (Linux)
3. Try running the launch script again

### Port conflicts

If you see errors about ports already in use, modify the port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3006:80"  # Change 3005 to another port
```

### Connection issues between services

Check the Docker network status:

```bash
docker network ls
docker network inspect eyewear_network
```
