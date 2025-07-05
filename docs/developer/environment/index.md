# Development Environment Setup

This section provides comprehensive documentation on setting up and configuring a development environment for the VARAi platform.

## Contents

1. [Local Development Guide](./local-development-guide.md)
2. [Dependency Management Documentation](./dependency-management.md)
3. [Environment Configuration Guide](./environment-configuration.md)
4. [Debugging Guide](./debugging-guide.md)
5. [Testing Environment Setup](./testing-environment.md)
6. [CI/CD Integration Guide](./ci-cd-integration.md)

## Overview

The VARAi platform consists of multiple components that require different development environments. This documentation will guide you through setting up each component and ensuring they work together seamlessly.

## System Requirements

Before setting up the development environment, ensure your system meets the following requirements:

### Hardware Requirements

- **CPU**: 4+ cores recommended
- **RAM**: 16GB+ recommended
- **Disk Space**: 20GB+ free space

### Software Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Docker**: Docker Desktop 4.0+ or Docker Engine 20.10+
- **Kubernetes**: Minikube, Docker Desktop Kubernetes, or Kind
- **Git**: 2.30+
- **IDE**: Visual Studio Code (recommended) with extensions or JetBrains IDEs

## Quick Start

For a quick start, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/varai/varai-platform.git
   cd varai-platform
   ```

2. Install dependencies:
   ```bash
   # For backend
   pip install -r requirements-dev.txt
   
   # For frontend
   cd frontend
   npm install
   ```

3. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Run the application:
   ```bash
   # Start backend services
   python -m src.api.main
   
   # Start frontend in another terminal
   cd frontend
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

For more detailed instructions, refer to the [Local Development Guide](./local-development-guide.md).