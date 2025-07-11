FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S consultation -u 1001

# Change ownership of the app directory
RUN chown -R consultation:nodejs /app

# Switch to non-root user
USER consultation

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (res) => { \
    if (res.statusCode === 200) { \
      console.log('Health check passed'); \
      process.exit(0); \
    } else { \
      console.log('Health check failed'); \
      process.exit(1); \
    } \
  }).on('error', (err) => { \
    console.log('Health check error:', err); \
    process.exit(1); \
  })"

# Start the service
CMD ["npm", "start"]