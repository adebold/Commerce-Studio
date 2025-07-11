# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S internationalization -u 1001

# Change ownership of the app directory
RUN chown -R internationalization:nodejs /app

# Switch to non-root user
USER internationalization

# Expose the port the app runs on
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3008/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "src/server.js"]