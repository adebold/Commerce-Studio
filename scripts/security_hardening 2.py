#!/usr/bin/env python3
"""
Security hardening script for ML monitoring system.

This script implements additional security measures for the ML monitoring system,
including secure key generation, file permissions, and configuration hardening.
"""

import os
import sys
import json
import base64
import secrets
import argparse
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List, Set, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("security_hardening")


def generate_secure_key(length: int = 32) -> str:
    """
    Generate a secure random key.
    
    Args:
        length: Key length in bytes
        
    Returns:
        Base64-encoded key
    """
    key_bytes = secrets.token_bytes(length)
    return base64.urlsafe_b64encode(key_bytes).decode("utf-8")


def secure_env_file(
    env_file: str,
    template_file: Optional[str] = None,
    force: bool = False,
) -> bool:
    """
    Create or update an environment file with secure values.
    
    Args:
        env_file: Path to environment file
        template_file: Path to template file
        force: Whether to overwrite existing values
        
    Returns:
        True if successful, False otherwise
    """
    env_path = Path(env_file)
    
    # Check if env file exists
    env_values = {}
    if env_path.exists():
        logger.info(f"Updating existing environment file: {env_file}")
        
        # Read existing values
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, value = line.split("=", 1)
                        env_values[key.strip()] = value.strip()
    else:
        logger.info(f"Creating new environment file: {env_file}")
    
    # Load template values if provided
    template_values = {}
    if template_file:
        template_path = Path(template_file)
        if template_path.exists():
            with open(template_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        if "=" in line:
                            key, value = line.split("=", 1)
                            template_values[key.strip()] = value.strip()
    
    # Security-critical environment variables
    security_vars = {
        "JWT_SECRET_KEY": generate_secure_key(64),
        "ENCRYPTION_KEY": generate_secure_key(32),
        "ENCRYPTION_SALT": generate_secure_key(16),
        "TLS_ENABLED": "true",
        "TLS_MIN_VERSION": "TLSv1.2",
        "RATE_LIMIT_ENABLED": "true",
        "RATE_LIMIT_MAX_REQUESTS": "100",
        "RATE_LIMIT_TIMEFRAME": "60",  # seconds
    }
    
    # Update env values
    for key, value in security_vars.items():
        if key not in env_values or not env_values[key] or force:
            env_values[key] = value
    
    # Add template values for keys not already in env_values
    for key, value in template_values.items():
        if key not in env_values:
            env_values[key] = value
    
    # Write updated values to file
    os.makedirs(env_path.parent, exist_ok=True)
    with open(env_path, "w") as f:
        f.write(f"# ML Monitoring System Environment Configuration\n")
        f.write(f"# Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Write security variables first
        f.write("# Security Configuration\n")
        for key in security_vars.keys():
            if key in env_values:
                f.write(f"{key}={env_values[key]}\n")
        
        f.write("\n# Application Configuration\n")
        # Write other variables
        for key, value in env_values.items():
            if key not in security_vars:
                f.write(f"{key}={value}\n")
    
    logger.info(f"Environment file updated: {env_file}")
    return True


def create_secure_certs_dir(certs_dir: str = "certs") -> bool:
    """
    Create a secure directory for TLS certificates.
    
    Args:
        certs_dir: Path to certificates directory
        
    Returns:
        True if successful, False otherwise
    """
    certs_path = Path(certs_dir)
    
    # Create directory if it doesn't exist
    os.makedirs(certs_path, exist_ok=True)
    
    # Create .gitignore to prevent committing certs
    gitignore_path = certs_path / ".gitignore"
    if not gitignore_path.exists():
        with open(gitignore_path, "w") as f:
            f.write("# Ignore all files in this directory\n")
            f.write("*\n")
            f.write("# Except this file\n")
            f.write("!.gitignore\n")
    
    logger.info(f"Secure certificates directory created: {certs_dir}")
    return True


def setup_pre_commit_hooks() -> bool:
    """
    Setup pre-commit hooks for security checks.
    
    Returns:
        True if successful, False otherwise
    """
    # Check if pre-commit is installed
    try:
        subprocess.run(
            ["pre-commit", "--version"],
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.info("pre-commit not found, installing")
        try:
            subprocess.run(
                ["pip", "install", "pre-commit"],
                check=True,
                capture_output=True,
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install pre-commit: {e.stderr.decode()}")
            return False
    
    # Create pre-commit configuration if it doesn't exist
    pre_commit_config = Path(".pre-commit-config.yaml")
    
    if pre_commit_config.exists():
        logger.info("Pre-commit configuration already exists")
    else:
        logger.info("Creating pre-commit configuration")
        with open(pre_commit_config, "w") as f:
            f.write("""# Pre-commit hooks configuration
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-json
      - id: detect-private-key
      - id: check-case-conflict
      - id: check-merge-conflict

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: ["-c", "pyproject.toml"]
        additional_dependencies: ["bandit[toml]"]

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.0.265
    hooks:
      - id: ruff
        args: ["--fix"]

  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
""")
    
    # Setup pre-commit hooks
    try:
        subprocess.run(
            ["pre-commit", "install"],
            check=True,
            capture_output=True,
        )
        logger.info("Pre-commit hooks installed")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install pre-commit hooks: {e.stderr.decode()}")
        return False
    
    return True


def configure_rate_limiting() -> bool:
    """
    Configure rate limiting for the API.
    
    Returns:
        True if successful, False otherwise
    """
    # Create rate limiting middleware file
    middleware_path = Path("src/ml/monitoring/middleware.py")
    
    if middleware_path.exists():
        logger.info("Middleware file already exists")
    else:
        logger.info("Creating rate limiting middleware")
        os.makedirs(middleware_path.parent, exist_ok=True)
        with open(middleware_path, "w") as f:
            f.write('''"""
Middleware for ML monitoring API.

This module provides middleware for the ML monitoring API,
including rate limiting and request logging.
"""

import os
import time
import logging
from typing import Dict, List, Tuple, Optional, Set, Callable
from datetime import datetime, timedelta

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

# Configure logging
logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded."""
    
    def __init__(self, limit: int, timeframe: int):
        """
        Initialize exception.
        
        Args:
            limit: Maximum number of requests
            timeframe: Timeframe in seconds
        """
        self.limit = limit
        self.timeframe = timeframe
        super().__init__(f"Rate limit exceeded: {limit} requests per {timeframe} seconds")


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting requests."""
    
    def __init__(
        self,
        app: FastAPI,
        max_requests: int = 100,
        timeframe: int = 60,
        whitelist_paths: Optional[List[str]] = None,
        backend: Optional[str] = None,
    ):
        """
        Initialize middleware.
        
        Args:
            app: FastAPI application
            max_requests: Maximum number of requests per timeframe
            timeframe: Timeframe in seconds
            whitelist_paths: List of paths to exclude from rate limiting
            backend: Backend for storing rate limit data (memory, redis)
        """
        super().__init__(app)
        self.max_requests = max_requests
        self.timeframe = timeframe
        self.whitelist_paths = whitelist_paths or ["/health", "/docs", "/openapi.json"]
        self.backend = backend or "memory"
        
        # Memory backend
        if self.backend == "memory":
            self.requests = {}
            self.request_times = {}
        elif self.backend == "redis":
            # Redis backend
            try:
                import redis
                self.redis = redis.Redis.from_url(
                    os.getenv("REDIS_URL", "redis://localhost:6379/0")
                )
            except ImportError:
                logger.warning("Redis not installed, falling back to memory backend")
                self.backend = "memory"
                self.requests = {}
                self.request_times = {}
        else:
            raise ValueError(f"Unknown backend: {self.backend}")
        
        logger.info(
            f"Rate limiting middleware initialized: "
            f"{max_requests} requests per {timeframe} seconds "
            f"(backend: {self.backend})"
        )
    
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """
        Process request with rate limiting.
        
        Args:
            request: FastAPI request
            call_next: Next middleware
            
        Returns:
            Response
        """
        # Skip rate limiting for whitelisted paths
        if any(request.url.path.startswith(path) for path in self.whitelist_paths):
            return await call_next(request)
        
        # Get client info
        client_ip = request.client.host if request.client else "unknown"
        client_id = client_ip
        
        # If authentication is available, use user ID for rate limiting
        if hasattr(request.state, "user") and hasattr(request.state.user, "id"):
            client_id = request.state.user.id
        
        try:
            if self.backend == "memory":
                self._check_rate_limit_memory(client_id)
            elif self.backend == "redis":
                self._check_rate_limit_redis(client_id)
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            response.headers["X-RateLimit-Limit"] = str(self.max_requests)
            
            if self.backend == "memory":
                remaining = self.max_requests - len(self.request_times.get(client_id, []))
                response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            elif self.backend == "redis":
                remaining = self.max_requests - int(self.redis.get(f"ratelimit:{client_id}:count") or 0)
                response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            
            response.headers["X-RateLimit-Reset"] = str(self.timeframe)
            
            return response
            
        except RateLimitExceeded as e:
            # Log rate limit exceeded
            logger.warning(
                f"Rate limit exceeded for {client_id}: "
                f"{self.max_requests} requests per {self.timeframe} seconds"
            )
            
            # Return error response
            return JSONResponse(
                status_code=429,
                content={
                    "detail": str(e),
                    "limit": self.max_requests,
                    "timeframe": self.timeframe,
                }
            )
    
    def _check_rate_limit_memory(self, client_id: str):
        """
        Check rate limit using memory backend.
        
        Args:
            client_id: Client identifier
            
        Raises:
            RateLimitExceeded: If rate limit is exceeded
        """
        # Initialize if client not seen before
        if client_id not in self.request_times:
            self.request_times[client_id] = []
        
        # Get current time
        now = time.time()
        
        # Filter request times to only include those within the timeframe
        self.request_times[client_id] = [
            t for t in self.request_times[client_id]
            if t > now - self.timeframe
        ]
        
        # Check if rate limit exceeded
        if len(self.request_times[client_id]) >= self.max_requests:
            raise RateLimitExceeded(self.max_requests, self.timeframe)
        
        # Record request time
        self.request_times[client_id].append(now)
    
    def _check_rate_limit_redis(self, client_id: str):
        """
        Check rate limit using Redis backend.
        
        Args:
            client_id: Client identifier
            
        Raises:
            RateLimitExceeded: If rate limit is exceeded
        """
        # Get Redis pipeline
        pipe = self.redis.pipeline()
        
        # Get current count
        count_key = f"ratelimit:{client_id}:count"
        pipe.get(count_key)
        
        # Execute pipeline
        results = pipe.execute()
        count = int(results[0] or 0)
        
        # Check if rate limit exceeded
        if count >= self.max_requests:
            raise RateLimitExceeded(self.max_requests, self.timeframe)
        
        # Increment count and set expiration
        pipe.incr(count_key)
        pipe.expire(count_key, self.timeframe)
        pipe.execute()


def add_rate_limiting(
    app: FastAPI,
    max_requests: Optional[int] = None,
    timeframe: Optional[int] = None,
    backend: Optional[str] = None,
):
    """
    Add rate limiting middleware to FastAPI application.
    
    Args:
        app: FastAPI application
        max_requests: Maximum number of requests per timeframe
        timeframe: Timeframe in seconds
        backend: Backend for storing rate limit data (memory, redis)
    """
    # Get configuration from environment variables
    enabled = os.getenv("RATE_LIMIT_ENABLED", "true").lower() in ("true", "1", "yes")
    if not enabled:
        logger.warning("Rate limiting is disabled")
        return
    
    max_requests = max_requests or int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
    timeframe = timeframe or int(os.getenv("RATE_LIMIT_TIMEFRAME", "60"))
    backend = backend or os.getenv("RATE_LIMIT_BACKEND", "memory")
    
    # Add middleware
    app.add_middleware(
        RateLimitingMiddleware,
        max_requests=max_requests,
        timeframe=timeframe,
        backend=backend,
    )
''')
        logger.info(f"Rate limiting middleware created: {middleware_path}")
    
    # Update server.py to use rate limiting middleware
    server_path = Path("src/ml/monitoring/server.py")
    
    if server_path.exists():
        logger.info("Updating server.py to use rate limiting middleware")
        
        with open(server_path, "r") as f:
            server_content = f.read()
        
        # Check if rate limiting import already exists
        if "from src.ml.monitoring.middleware import add_rate_limiting" not in server_content:
            # Add import
            import_line = "from src.ml.monitoring.tls import get_ssl_context, get_security_headers"
            new_import = "from src.ml.monitoring.tls import get_ssl_context, get_security_headers\nfrom src.ml.monitoring.middleware import add_rate_limiting"
            server_content = server_content.replace(import_line, new_import)
            
            # Add rate limiting middleware
            middleware_line = "app.add_middleware(SecurityHeadersMiddleware)"
            new_middleware = "app.add_middleware(SecurityHeadersMiddleware)\n    add_rate_limiting(app)"
            server_content = server_content.replace(middleware_line, new_middleware)
            
            # Write updated content
            with open(server_path, "w") as f:
                f.write(server_content)
                
            logger.info("Server.py updated to use rate limiting middleware")
    
    return True


def apply_security_hardening(args):
    """
    Apply security hardening measures.
    
    Args:
        args: Command line arguments
    """
    # Create secure environment file
    if not args.skip_env:
        secure_env_file(args.env_file, args.template, args.force)
    
    # Create secure certificates directory
    if not args.skip_certs:
        create_secure_certs_dir(args.certs_dir)
    
    # Setup pre-commit hooks
    if not args.skip_hooks:
        setup_pre_commit_hooks()
    
    # Configure rate limiting
    if not args.skip_rate_limit:
        configure_rate_limiting()
    
    logger.info("Security hardening completed")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Security hardening for ML monitoring system")
    parser.add_argument(
        "--env-file",
        help="Path to environment file",
        default=".env",
    )
    parser.add_argument(
        "--template",
        help="Path to template file",
        default=".env.example",
    )
    parser.add_argument(
        "--certs-dir",
        help="Path to certificates directory",
        default="certs",
    )
    parser.add_argument(
        "--force",
        help="Force overwrite of existing values",
        action="store_true",
    )
    parser.add_argument(
        "--skip-env",
        help="Skip environment file creation",
        action="store_true",
    )
    parser.add_argument(
        "--skip-certs",
        help="Skip certificates directory creation",
        action="store_true",
    )
    parser.add_argument(
        "--skip-hooks",
        help="Skip pre-commit hooks setup",
        action="store_true",
    )
    parser.add_argument(
        "--skip-rate-limit",
        help="Skip rate limiting configuration",
        action="store_true",
    )
    return parser.parse_args()


if __name__ == "__main__":
    from datetime import datetime
    
    args = parse_args()
    apply_security_hardening(args)
