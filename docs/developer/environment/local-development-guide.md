# Local Development Guide

This guide provides detailed instructions for setting up a local development environment for the VARAi platform.

## Prerequisites

Before setting up the local development environment, ensure you have the following installed:

- **Git**: For version control
- **Docker and Docker Compose**: For containerized development
- **Python 3.11+**: For backend development
- **Node.js 20+**: For frontend development
- **Visual Studio Code** (recommended): With extensions for Python, TypeScript, and Docker

## Repository Setup

### Cloning the Repository

```bash
git clone https://github.com/varai/varai-platform.git
cd varai-platform
```

### Repository Structure

The repository is organized as follows:

```
varai-platform/
├── auth/                  # Authentication services
├── docs/                  # Documentation
├── frontend/              # React frontend application
├── helm/                  # Helm charts for Kubernetes deployment
├── scripts/               # Utility scripts
├── src/                   # Backend services
│   ├── api/               # API services
│   ├── ml/                # Machine learning services
│   └── integrations/      # E-commerce integrations
├── tests/                 # Test suites
├── docker-compose.yml     # Production Docker Compose configuration
├── docker-compose.dev.yml # Development Docker Compose configuration
└── README.md              # Project overview
```

## Backend Setup

### Python Environment

We recommend using a virtual environment for Python development:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=true

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/varai
REDIS_URI=redis://localhost:6379/0

# Authentication
JWT_SECRET=your-development-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# Storage
STORAGE_PROVIDER=local
STORAGE_PATH=./storage

# ML Services
ML_MODEL_PATH=./models
```

### Running Backend Services

#### Using Docker Compose

The easiest way to run all backend services is using Docker Compose:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start all required services, including:
- MongoDB
- Redis
- RabbitMQ
- Backend API services

#### Running Individual Services

To run individual backend services for development:

```bash
# Start the API service
python -m src.api.main

# Start the ML service
python -m src.ml.main

# Start the integration service
python -m src.integrations.main
```

### API Documentation

Once the backend services are running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Setup

### Node.js Environment

```bash
cd frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```
VITE_API_URL=http://localhost:8000
VITE_AUTH_DOMAIN=localhost
VITE_AUTH_CLIENT_ID=development-client-id
VITE_ENVIRONMENT=development
```

### Running the Frontend

```bash
# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
```

The built files will be in the `frontend/dist` directory.

## Database Setup

### MongoDB

The platform uses MongoDB as its primary database. You can run it using Docker:

```bash
docker-compose -f docker-compose.dev.yml up -d mongodb
```

#### Seeding Development Data

To seed the database with development data:

```bash
python -m scripts.seed_data
```

### Redis

Redis is used for caching and session management:

```bash
docker-compose -f docker-compose.dev.yml up -d redis
```

## Running the Full Stack

To run the full stack locally:

1. Start the backend services:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Workflow

### Code Formatting and Linting

The project uses several tools for code formatting and linting:

#### Python

```bash
# Format code with Black
black src tests

# Check imports with isort
isort src tests

# Lint with flake8
flake8 src tests

# Type checking with mypy
mypy src
```

#### TypeScript/JavaScript

```bash
# Format code with Prettier
npm run format

# Lint with ESLint
npm run lint

# Type checking
npm run type-check
```

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality. Install them with:

```bash
pip install pre-commit
pre-commit install
```

### Running Tests

#### Backend Tests

```bash
# Run all tests
pytest

# Run specific tests
pytest tests/api/test_auth.py

# Run with coverage
pytest --cov=src
```

#### Frontend Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- -t "AuthService"

# Run with coverage
npm test -- --coverage
```

## Debugging

### Backend Debugging

#### Using VS Code

1. Create a `.vscode/launch.json` file:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Python: FastAPI",
         "type": "python",
         "request": "launch",
         "module": "src.api.main",
         "env": {
           "API_DEBUG": "true"
         },
         "jinja": true
       }
     ]
   }
   ```

2. Set breakpoints in your code
3. Press F5 to start debugging

#### Using PyCharm

1. Create a new Run Configuration for the `src.api.main` module
2. Set environment variables as needed
3. Set breakpoints in your code
4. Run in debug mode

### Frontend Debugging

#### Using Browser DevTools

1. Open your browser's DevTools (F12 or Ctrl+Shift+I)
2. Navigate to the Sources tab
3. Find your source files under the webpack:// source
4. Set breakpoints and debug

#### Using VS Code

1. Install the "Debugger for Chrome" extension
2. Create a `.vscode/launch.json` file:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "chrome",
         "request": "launch",
         "name": "Launch Chrome against localhost",
         "url": "http://localhost:3000",
         "webRoot": "${workspaceFolder}/frontend"
       }
     ]
   }
   ```

3. Set breakpoints in your code
4. Press F5 to start debugging

## Common Issues and Solutions

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Ensure MongoDB is running:
   ```bash
   docker ps | grep mongodb
   ```

2. Check the connection string in your `.env` file
3. Try connecting using MongoDB Compass to verify credentials

### Redis Connection Issues

If you encounter Redis connection issues:

1. Ensure Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Check the connection string in your `.env` file
3. Try connecting using redis-cli to verify connectivity

### API Connection Issues

If the frontend cannot connect to the API:

1. Ensure the API is running and accessible at http://localhost:8000
2. Check CORS settings in the API configuration
3. Verify the `VITE_API_URL` in your frontend `.env.local` file

## Next Steps

Once your development environment is set up, you can:

1. Explore the [Architecture Documentation](../architecture/index.md) to understand the system
2. Review the [Code Documentation](../code/index.md) to understand the codebase
3. Check the [Contribution Guidelines](../contribution/index.md) to learn how to contribute

For more specific environment configuration details, see the [Environment Configuration Guide](./environment-configuration.md).