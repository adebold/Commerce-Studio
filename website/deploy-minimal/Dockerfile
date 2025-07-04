# Simple nginx-only deployment for static website
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website files to nginx html directory
COPY *.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY customer/ /usr/share/nginx/html/customer/
COPY api/ /usr/share/nginx/html/api/
COPY signup/ /usr/share/nginx/html/signup/
COPY dashboard/ /usr/share/nginx/html/dashboard/
COPY analytics/ /usr/share/nginx/html/analytics/

# Create a simple favicon to avoid 404 errors
RUN echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#007AFF"/></svg>' > /usr/share/nginx/html/favicon.ico

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]