# Multi-stage build for Cloud Run deployment with region-specific configuration
# This Dockerfile is optimized for Cloud Run and includes region-specific configuration

# Build stage
FROM node:18-slim AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config

# Copy health check script
COPY service-infrastructure/cloud-run/health-check.js ./

# Create a non-root user to run the application
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Add region-specific configuration
# This will be overridden by environment variables at runtime
ARG REGION=us
ENV REGION=${REGION}
ENV SERVICE_NAME=api-gateway

# Add region-specific health check endpoint
RUN echo "console.log('Adding region-specific health check for ${REGION}');" >> health-check.js

# Add startup script that handles region-specific configuration
COPY service-infrastructure/cloud-run/startup.sh ./
RUN chmod +x ./startup.sh

# Set the entrypoint to the startup script
ENTRYPOINT ["./startup.sh"]

# Default command to run the application
CMD ["node", "dist/index.js"]