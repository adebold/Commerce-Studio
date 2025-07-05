# Docker Optimization Guide

## Overview

This document explains the optimizations made to the Docker build process for the Eyewear ML project. These optimizations aim to:

1. Fix Python compatibility issues
2. Reduce image size
3. Speed up build time
4. Improve security
5. Enhance maintainability

## Key Optimizations

### 1. Updated Base Image

**Before:**
```dockerfile
FROM tensorflow/tensorflow:2.12.0
```

**After:**
```dockerfile
FROM tensorflow/tensorflow:2.13.0
```

**Benefits:**
- Uses Python 3.9+ which supports modern type annotations
- Fixes the `TypeError: 'type' object is not subscriptable` error
- Includes security patches and performance improvements

### 2. Layer Optimization

**Before:**
```dockerfile
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn && \
    pip install --no-cache-dir pandas==1.5.3 && \
    pip install --no-cache-dir scikit-image==0.19.3 && \
    grep -v -E "tensorflow|pandas|scikit-image" requirements.txt > filtered_requirements.txt && \
    pip install --no-cache-dir -r filtered_requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends libgl1-mesa-glx libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*
```

**After:**
```dockerfile
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn && \
    pip install --no-cache-dir pandas==1.5.3 && \
    pip install --no-cache-dir scikit-image==0.19.3 && \
    grep -v -E "tensorflow|pandas|scikit-image" requirements.txt > filtered_requirements.txt && \
    pip install --no-cache-dir -r filtered_requirements.txt && \
    rm filtered_requirements.txt

RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1-mesa-glx libsm6 libxext6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

**Benefits:**
- Removes temporary files in the same layer they're created
- Adds `apt-get clean` to further reduce image size
- Improves readability with consistent formatting

### 3. Environment Variable Consolidation

**Before:**
```dockerfile
ENV PORT=8080
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=error
ENV PYTHONUNBUFFERED=1
```

**After:**
```dockerfile
ENV PORT=8080 \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=error \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/usr/src/app
```

**Benefits:**
- Consolidates environment variables into a single layer
- Adds `PYTHONPATH` environment variable to avoid setting it in the entrypoint script
- Reduces image size and improves readability

### 4. Entrypoint Script Optimization

**Before:**
```dockerfile
RUN echo '#!/bin/bash' > /usr/src/app/entrypoint.sh && \
    echo 'echo "Starting FastAPI server..."' >> /usr/src/app/entrypoint.sh && \
    echo 'cd /usr/src/app' >> /usr/src/app/entrypoint.sh && \
    echo 'export PYTHONPATH=/usr/src/app' >> /usr/src/app/entrypoint.sh && \
    echo 'exec uvicorn src.api.main:app --host 0.0.0.0 --port 8080' >> /usr/src/app/entrypoint.sh && \
    chmod +x /usr/src/app/entrypoint.sh
```

**After:**
```dockerfile
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI server..."\n\
cd /usr/src/app\n\
exec uvicorn src.api.main:app --host 0.0.0.0 --port 8080' > /usr/src/app/entrypoint.sh && \
    chmod +x /usr/src/app/entrypoint.sh
```

**Benefits:**
- Uses a more efficient approach with a single echo command
- Removes redundant `export PYTHONPATH` since it's now set as an environment variable
- Improves readability and maintainability

### 5. Added Health Check

**New Addition:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
```

**Benefits:**
- Enables Docker to check if the container is healthy
- Helps orchestration systems like Kubernetes make better decisions
- Improves reliability and observability

## Additional Optimizations

### 1. Created .dockerignore File

Added a comprehensive `.dockerignore` file to exclude unnecessary files from the Docker build context. This significantly reduces the build context size and speeds up the build process.

### 2. Improved Documentation

Added detailed comments to the Dockerfile to explain the purpose of each section, making it easier for developers to understand and maintain.

## Implementation

To use the optimized Dockerfile:

1. Ensure you have the `.dockerignore` file in place
2. Build the image using the optimized Dockerfile:

```bash
docker build -t eyewear-ml:latest -f docker-config/Dockerfile.optimized .
```

3. Run the container:

```bash
docker run -p 8080:8080 eyewear-ml:latest
```

## Monitoring and Maintenance

- Regularly update the base image to get security patches and performance improvements
- Monitor container health using the health check endpoint
- Review and update dependencies to address security vulnerabilities
- Consider implementing multi-stage builds for further optimization in the future