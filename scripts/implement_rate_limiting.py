#!/usr/bin/env python3
"""
Script to implement rate limiting middleware for the EyewearML API.
This script creates rate limiting middleware and updates the server configuration.
"""

import os
import re
import argparse
import logging
from datetime import datetime
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"rate_limiting_implementation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("rate_limiting_implementation")

def create_rate_limiting_middleware(api_dir):
    """
    Create rate limiting middleware file.
    
    Args:
        api_dir: Directory containing the API code
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Determine middleware directory
        middleware_dir = os.path.join(api_dir, "middleware")
        if not os.path.exists(middleware_dir):
            os.makedirs(middleware_dir)
            logger.info(f"Created middleware directory: {middleware_dir}")
        
        # Create rate limiting middleware file
        rate_limit_file = os.path.join(middleware_dir, "rate_limit.py")
        
        middleware_content = '''# Rate limiting middleware for the EyewearML API
# Generated by implement_rate_limiting.py

import time
from flask import request, jsonify
from redis import Redis
import os

# Initialize Redis client
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
redis_password = os.environ.get('REDIS_PASSWORD', None)
redis_client = Redis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)

class RateLimiter:
    def __init__(self, app=None, default_limits=None, key_func=None):
        self.app = app
        self.default_limits = default_limits or ["100 per day", "10 per minute"]
        self.key_func = key_func or (lambda: request.remote_addr)
        self.redis_client = redis_client
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        app.before_request(self.limit_request)
    
    def limit_request(self):
        # Skip rate limiting for certain endpoints
        if request.path.startswith('/static') or request.path == '/health':
            return None
        
        # Get the key for the current request
        key = self.key_func()
        
        # Check rate limits
        for limit in self.default_limits:
            count, period = self._parse_limit(limit)
            window_key = f"rate_limit:{key}:{period}"
            
            # Get current count
            current = self.redis_client.get(window_key)
            current = int(current) if current else 0
            
            # Check if limit exceeded
            if current >= count:
                return jsonify({
                    "error": "Rate limit exceeded",
                    "status": 429,
                    "message": f"Too many requests. Try again in {period} seconds."
                }), 429
            
            # Increment counter
            pipe = self.redis_client.pipeline()
            pipe.incr(window_key)
            pipe.expire(window_key, period)
            pipe.execute()
        
        return None
    
    def _parse_limit(self, limit):
        # Parse rate limit string like '100 per day' into count and period
        parts = limit.split()
        count = int(parts[0])
        
        if "second" in parts[2]:
            period = 1
        elif "minute" in parts[2]:
            period = 60
        elif "hour" in parts[2]:
            period = 3600
        elif "day" in parts[2]:
            period = 86400
        else:
            period = 60  # Default to minute
        
        return count, period

# API-specific rate limiter
class ApiRateLimiter(RateLimiter):
    def __init__(self, app=None):
        super().__init__(app)
        
        # Define endpoint-specific limits
        self.endpoint_limits = {
            '/api/auth/login': ["5 per minute", "20 per hour"],
            '/api/auth/register': ["3 per minute", "10 per hour"],
            '/api/recommendations': ["30 per minute", "1000 per day"],
        }
    
    def limit_request(self):
        # Skip rate limiting for certain endpoints
        if request.path.startswith('/static') or request.path == '/health':
            return None
        
        # Get the key for the current request
        key = self.key_func()
        
        # Get limits for this endpoint
        limits = self.endpoint_limits.get(request.path, self.default_limits)
        
        # Check rate limits
        for limit in limits:
            count, period = self._parse_limit(limit)
            window_key = f"rate_limit:{key}:{request.path}:{period}"
            
            # Get current count
            current = self.redis_client.get(window_key)
            current = int(current) if current else 0
            
            # Check if limit exceeded
            if current >= count:
                return jsonify({
                    "error": "Rate limit exceeded",
                    "status": 429,
                    "message": f"Too many requests. Try again in {period} seconds."
                }), 429
            
            # Increment counter
            pipe = self.redis_client.pipeline()
            pipe.incr(window_key)
            pipe.expire(window_key, period)
            pipe.execute()
        
        return None

# Function to create rate limiter
def create_rate_limiter(app, api_specific=True):
    if api_specific:
        return ApiRateLimiter(app)
    else:
        return RateLimiter(app)
'''
        
        with open(rate_limit_file, 'w') as f:
            f.write(middleware_content)
        
        logger.info(f"Created rate limiting middleware: {rate_limit_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating rate limiting middleware: {str(e)}")
        return False

def update_server_file(api_dir):
    """
    Update server file to use rate limiting middleware.
    
    Args:
        api_dir: Directory containing the API code
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Find server file
        server_file = None
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                if file in ['server.py', 'app.py', 'main.py']:
                    server_file = os.path.join(root, file)
                    break
            if server_file:
                break
        
        if not server_file:
            logger.error("Could not find server file")
            return False
        
        # Create backup of server file
        backup_file = f"{server_file}.bak"
        shutil.copy2(server_file, backup_file)
        logger.info(f"Created backup of server file: {backup_file}")
        
        # Read server file
        with open(server_file, 'r') as f:
            content = f.read()
        
        # Check if Flask is used
        if 'from flask import' in content:
            # Add import for rate limiting middleware
            if 'from middleware.rate_limit import' not in content:
                import_pattern = r'(from flask import .*?\n)'
                import_replacement = r'\1from middleware.rate_limit import create_rate_limiter\n'
                content = re.sub(import_pattern, import_replacement, content)
            
            # Add rate limiter initialization
            if 'create_rate_limiter' not in content:
                app_pattern = r'(app = Flask\(__name__\).*?\n)'
                app_replacement = r'\1\n# Initialize rate limiter\nrate_limiter = create_rate_limiter(app)\n'
                content = re.sub(app_pattern, app_replacement, content)
        
        # Check if FastAPI is used
        elif 'from fastapi import' in content:
            # Add import for rate limiting middleware
            if 'from middleware.rate_limit import' not in content:
                import_pattern = r'(from fastapi import .*?\n)'
                import_replacement = r'\1from middleware.rate_limit import create_rate_limiter\nfrom fastapi.responses import JSONResponse\n'
                content = re.sub(import_pattern, import_replacement, content)
            
            # Add rate limiter middleware
            if 'create_rate_limiter' not in content:
                app_pattern = r'(app = FastAPI\(\).*?\n)'
                app_replacement = r'\1\n# Initialize rate limiter\nrate_limiter = create_rate_limiter(None, api_specific=True)\n\n@app.middleware("http")\nasync def rate_limit_middleware(request, call_next):\n    # Get the key for the current request\n    key = request.client.host\n    \n    # Skip rate limiting for certain endpoints\n    if str(request.url.path).startswith(\'/static\') or str(request.url.path) == \'/health\':\n        return await call_next(request)\n    \n    # Get limits for this endpoint\n    limits = rate_limiter.endpoint_limits.get(str(request.url.path), rate_limiter.default_limits)\n    \n    # Check rate limits\n    for limit in limits:\n        count, period = rate_limiter._parse_limit(limit)\n        window_key = f"rate_limit:{key}:{request.url.path}:{period}"\n        \n        # Get current count\n        current = rate_limiter.redis_client.get(window_key)\n        current = int(current) if current else 0\n        \n        # Check if limit exceeded\n        if current >= count:\n            return JSONResponse(\n                status_code=429,\n                content={\n                    "error": "Rate limit exceeded",\n                    "status": 429,\n                    "message": f"Too many requests. Try again in {period} seconds."\n                }\n            )\n        \n        # Increment counter\n        pipe = rate_limiter.redis_client.pipeline()\n        pipe.incr(window_key)\n        pipe.expire(window_key, period)\n        pipe.execute()\n    \n    response = await call_next(request)\n    return response\n'
                content = re.sub(app_pattern, app_replacement, content)
        
        else:
            logger.error("Could not determine web framework used in server file")
            return False
        
        # Write updated content back to server file
        with open(server_file, 'w') as f:
            f.write(content)
        
        logger.info(f"Updated server file to use rate limiting middleware: {server_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error updating server file: {str(e)}")
        return False

def update_requirements_file(api_dir):
    """
    Update requirements file to include Redis.
    
    Args:
        api_dir: Directory containing the API code
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Find requirements file
        requirements_file = None
        for file in ['requirements.txt', 'requirements-dev.txt', 'requirements-prod.txt']:
            file_path = os.path.join(api_dir, file)
            if os.path.exists(file_path):
                requirements_file = file_path
                break
        
        if not requirements_file:
            # Create requirements file if it doesn't exist
            requirements_file = os.path.join(api_dir, 'requirements.txt')
        
        # Read requirements file
        requirements = []
        if os.path.exists(requirements_file):
            with open(requirements_file, 'r') as f:
                requirements = f.readlines()
        
        # Check if Redis is already in requirements
        redis_requirement = 'redis>=4.0.0\n'
        if not any(line.startswith('redis') for line in requirements):
            requirements.append(redis_requirement)
        
        # Write updated requirements file
        with open(requirements_file, 'w') as f:
            f.writelines(requirements)
        
        logger.info(f"Updated requirements file to include Redis: {requirements_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error updating requirements file: {str(e)}")
        return False

def update_docker_compose_file(project_dir):
    """
    Update docker-compose.yml to include Redis.
    
    Args:
        project_dir: Project directory
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Find docker-compose file
        docker_compose_file = os.path.join(project_dir, 'docker-compose.yml')
        
        if not os.path.exists(docker_compose_file):
            logger.warning(f"Docker Compose file not found: {docker_compose_file}")
            return True
        
        # Create backup of docker-compose file
        backup_file = f"{docker_compose_file}.bak"
        shutil.copy2(docker_compose_file, backup_file)
        logger.info(f"Created backup of Docker Compose file: {backup_file}")
        
        # Read docker-compose file
        with open(docker_compose_file, 'r') as f:
            content = f.read()
        
        # Check if Redis is already in docker-compose
        if 'redis:' not in content:
            # More robust pattern for services section
            if 'services:' in content:
                # Try to find the services section and add Redis after it
                services_pattern = r'(services\s*:.*?)(\n\s+\w+\s*:)'
                redis_service = """
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always
    networks:
      - app-network"""
                services_replacement = f"\\1{redis_service}\\2"
                modified_content = re.sub(services_pattern, services_replacement, content, flags=re.DOTALL)
                
                # If the pattern didn't match, try a different approach
                if modified_content == content:
                    # Just append the Redis service at the end of the file
                    content += f"\n  redis:\n    image: redis:alpine\n    ports:\n      - \"6379:6379\"\n    volumes:\n      - redis-data:/data\n    restart: always\n    networks:\n      - app-network\n"
                else:
                    content = modified_content
            else:
                # If no services section, create a basic structure
                content += "\nservices:\n  redis:\n    image: redis:alpine\n    ports:\n      - \"6379:6379\"\n    volumes:\n      - redis-data:/data\n    restart: always\n    networks:\n      - app-network\n"
            
            # Add Redis volume - more robust pattern
            if 'volumes:' in content:
                # Try to find the volumes section and add redis-data
                volumes_pattern = r'(volumes\s*:.*?)(\n\s+\w+\s*:|\n\w+:|\Z)'
                redis_volume = """
  redis-data:"""
                volumes_replacement = f"\\1{redis_volume}\\2"
                modified_content = re.sub(volumes_pattern, volumes_replacement, content, flags=re.DOTALL)
                
                # If the pattern didn't match, try a different approach
                if modified_content == content:
                    # Just append the redis-data volume at the end of the volumes section
                    volumes_end_pattern = r'(volumes\s*:.*?)(\n\w+:|\Z)'
                    volumes_end_replacement = f"\\1\n  redis-data:\\2"
                    content = re.sub(volumes_end_pattern, volumes_end_replacement, content, flags=re.DOTALL)
                else:
                    content = modified_content
            else:
                # If no volumes section, create it
                content += "\nvolumes:\n  redis-data:\n"
            
            # Add Redis environment variables to API service - more robust approach
            # First, try to find any service that might be the API service
            api_service_match = re.search(r'(\n\s+)(api|app|backend|server|web)(\s*:.*?environment\s*:.*?)(\n\s+\w+\s*:|\n\s*\w+:|\Z)', content, flags=re.DOTALL)
            
            if api_service_match:
                # Found a service with environment section
                indent = api_service_match.group(1)
                service_name = api_service_match.group(2)
                env_section = api_service_match.group(3)
                end_marker = api_service_match.group(4)
                
                # Add Redis env vars to this service
                redis_env_vars = f"{indent}  REDIS_HOST: redis{indent}  REDIS_PORT: 6379"
                updated_env_section = f"{env_section}{redis_env_vars}"
                
                # Replace in content
                content = content.replace(f"{indent}{service_name}{env_section}{end_marker}", 
                                         f"{indent}{service_name}{updated_env_section}{end_marker}")
            else:
                # Try to find any service that might be the API service without environment section
                api_service_match = re.search(r'(\n\s+)(api|app|backend|server|web)(\s*:.*?)(\n\s+\w+\s*:|\n\s*\w+:|\Z)', content, flags=re.DOTALL)
                
                if api_service_match:
                    # Found a service, add environment section with Redis vars
                    indent = api_service_match.group(1)
                    service_name = api_service_match.group(2)
                    service_content = api_service_match.group(3)
                    end_marker = api_service_match.group(4)
                    
                    # Add environment section with Redis vars
                    env_section = f"{indent}  environment:{indent}    REDIS_HOST: redis{indent}    REDIS_PORT: 6379"
                    updated_service_content = f"{service_content}{env_section}"
                    
                    # Replace in content
                    content = content.replace(f"{indent}{service_name}{service_content}{end_marker}", 
                                             f"{indent}{service_name}{updated_service_content}{end_marker}")
                
                # If no API service found, we'll skip adding env vars as we don't know where to add them
        
        # Write updated content back to docker-compose file
        with open(docker_compose_file, 'w') as f:
            f.write(content)
        
        logger.info(f"Updated Docker Compose file to include Redis: {docker_compose_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error updating Docker Compose file: {str(e)}")
        return False

def implement_rate_limiting(project_dir, api_dir=None):
    """
    Implement rate limiting middleware.
    
    Args:
        project_dir: Project directory
        api_dir: API directory (if None, will try to find it)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Determine API directory if not provided
        if api_dir is None:
            # Common API directory names
            api_dirs = ['api', 'backend', 'server', 'app', 'src']
            
            for dir_name in api_dirs:
                dir_path = os.path.join(project_dir, dir_name)
                if os.path.exists(dir_path) and os.path.isdir(dir_path):
                    api_dir = dir_path
                    break
            
            if api_dir is None:
                api_dir = project_dir
        
        logger.info(f"Using API directory: {api_dir}")
        
        # Create rate limiting middleware
        if not create_rate_limiting_middleware(api_dir):
            logger.error("Failed to create rate limiting middleware")
            return False
        
        # Update server file
        if not update_server_file(api_dir):
            logger.error("Failed to update server file")
            return False
        
        # Update requirements file
        if not update_requirements_file(api_dir):
            logger.error("Failed to update requirements file")
            return False
        
        # Update docker-compose file
        if not update_docker_compose_file(project_dir):
            logger.error("Failed to update Docker Compose file")
            return False
        
        logger.info("Successfully implemented rate limiting middleware")
        return True
        
    except Exception as e:
        logger.error(f"Error implementing rate limiting middleware: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Implement rate limiting middleware for the EyewearML API')
    parser.add_argument('--project-dir', default='.', help='Project directory')
    parser.add_argument('--api-dir', help='API directory (if not provided, will try to find it)')
    
    args = parser.parse_args()
    
    if implement_rate_limiting(args.project_dir, args.api_dir):
        logger.info("Rate limiting implementation completed successfully")
    else:
        logger.error("Rate limiting implementation failed")
        exit(1)

if __name__ == "__main__":
    main()