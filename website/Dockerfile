# Multi-stage build for optimized production deployment
FROM node:18-alpine AS api-builder

# Set working directory for API
WORKDIR /app/api

# Create package.json for API dependencies
RUN echo '{ \
  "name": "varai-api-config", \
  "version": "1.0.0", \
  "description": "API configuration service for VARAi Commerce Studio", \
  "main": "server.js", \
  "dependencies": { \
    "express": "^4.18.2", \
    "@google-cloud/secret-manager": "^5.0.1", \
    "cors": "^2.8.5", \
    "helmet": "^7.1.0" \
  } \
}' > package.json

# Install API dependencies
RUN npm install

# Copy API source code
COPY api/ ./

# Create simple server.js if it doesn't exist
RUN if [ ! -f server.js ]; then \
  echo 'const express = require("express"); \
const cors = require("cors"); \
const helmet = require("helmet"); \
const configRouter = require("./config"); \
\
const app = express(); \
const PORT = process.env.API_PORT || 3001; \
\
app.use(helmet()); \
app.use(cors()); \
app.use(express.json()); \
\
app.use("/api/config", configRouter); \
\
app.get("/health", (req, res) => { \
  res.json({ status: "healthy", service: "api-config" }); \
}); \
\
app.listen(PORT, () => { \
  console.log(`API server running on port ${PORT}`); \
});' > server.js; \
fi

# Production stage
FROM nginx:alpine

# Install Node.js for API server
RUN apk add --no-cache nodejs npm

# Create app directory for API
RUN mkdir -p /app/api

# Copy API from builder stage
COPY --from=api-builder /app/api /app/api

# Copy website files to nginx html directory
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script for both nginx and API server
RUN echo '#!/bin/sh\n\n# Start API server in background\ncd /app/api && node server.js &\n\n# Start nginx in foreground\nnginx -g "daemon off;"' > /start.sh && \
    chmod +x /start.sh

# Set proper permissions for nginx user (already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start both services
CMD ["/start.sh"]