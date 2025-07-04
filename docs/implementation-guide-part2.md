# Environment Configuration Implementation Guide - Part 2
## EyewearML Platform - SPARC Phase 1.2 (Continued)

### 2.2 Create Environment Setup Automation Script (Continued)

**File: `scripts/setup-environment.sh`** (Continued from Part 1)

```bash
NVIDIA_API_KEY=\${DEV_NVIDIA_API_KEY}
FACE_ANALYSIS_API_KEY=\${DEV_FACE_ANALYSIS_API_KEY}

# CORS (development domains)
CORS_ORIGINS=["https://dev.eyewearml.com","https://dev-api.eyewearml.com"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting (moderate for development)
RATE_LIMIT_REQUESTS_PER_MINUTE=120
RATE_LIMIT_BURST_SIZE=20

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# Monitoring
ENABLE_METRICS=true
SENTRY_DSN=\${DEV_SENTRY_DSN}
EOF
            ;;
        "staging")
            cat > "$env_file" << EOF
# =============================================================================
# STAGING ENVIRONMENT
# =============================================================================
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO

# Application
PROJECT_NAME="EyewearML API (Staging)"
API_V1_STR="/api/v1"
VERSION=1.0.0-staging

# Database URLs (staging cluster - replace with actual values)
MONGODB_URL=\${STAGING_MONGODB_URL}
MONGODB_DATABASE=eyewear_ml_staging
REDIS_URL=\${STAGING_REDIS_URL}
DATABASE_URL=\${STAGING_DATABASE_URL}

# Security (replace with actual values)
SECRET_KEY=\${STAGING_SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs (staging keys)
DEEPSEEK_API_KEY=\${STAGING_DEEPSEEK_API_KEY}
NVIDIA_API_KEY=\${STAGING_NVIDIA_API_KEY}
FACE_ANALYSIS_API_KEY=\${STAGING_FACE_ANALYSIS_API_KEY}

# CORS (staging domains)
CORS_ORIGINS=["https://staging.eyewearml.com"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting (production-like)
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# Feature Flags (match production)
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# Monitoring (full monitoring)
ENABLE_METRICS=true
SENTRY_DSN=\${STAGING_SENTRY_DSN}
EOF
            ;;
        "production")
            cat > "$env_file" << EOF
# =============================================================================
# PRODUCTION ENVIRONMENT
# =============================================================================
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Application
PROJECT_NAME="EyewearML API"
API_V1_STR="/api/v1"
VERSION=1.0.0

# Database URLs (production cluster - replace with actual values)
MONGODB_URL=\${PROD_MONGODB_URL}
MONGODB_DATABASE=eyewear_ml
REDIS_URL=\${PROD_REDIS_URL}
DATABASE_URL=\${PROD_DATABASE_URL}

# Security (replace with actual values - CRITICAL)
SECRET_KEY=\${PROD_SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# External APIs (production keys)
DEEPSEEK_API_KEY=\${PROD_DEEPSEEK_API_KEY}
NVIDIA_API_KEY=\${PROD_NVIDIA_API_KEY}
FACE_ANALYSIS_API_KEY=\${PROD_FACE_ANALYSIS_API_KEY}

# CORS (production domains only)
CORS_ORIGINS=["https://eyewearml.com","https://www.eyewearml.com"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting (strict)
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# Monitoring (full monitoring)
ENABLE_METRICS=true
SENTRY_DSN=\${PROD_SENTRY_DSN}
EOF
            ;;
        "test")
            cat > "$env_file" << EOF
# =============================================================================
# TEST ENVIRONMENT
# =============================================================================
ENVIRONMENT=test
DEBUG=true
LOG_LEVEL=DEBUG

# Application
PROJECT_NAME="EyewearML API (Test)"
API_V1_STR="/api/v1"
VERSION=1.0.0-test

# Database URLs (test databases)
MONGODB_URL=mongodb://localhost:27017/eyewear_ml_test
MONGODB_DATABASE=eyewear_ml_test
REDIS_URL=redis://localhost:6379/1
DATABASE_URL=mongodb://localhost:27017/eyewear_ml_test

# Security (test keys)
SECRET_KEY=$(generate_secret_key)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# External APIs (mock/test keys)
DEEPSEEK_API_KEY=test_key_mock
NVIDIA_API_KEY=test_key_mock
FACE_ANALYSIS_API_KEY=test_key_mock

# CORS (allow all for testing)
CORS_ORIGINS=["*"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting (disabled for testing)
RATE_LIMIT_REQUESTS_PER_MINUTE=10000
RATE_LIMIT_BURST_SIZE=1000

# Feature Flags (all enabled for testing)
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# Monitoring (disabled for testing)
ENABLE_METRICS=false
SENTRY_DSN=
EOF
            ;;
    esac
    
    log_success "Created environment file: .env.${env}"
}

# Setup Docker containers for local development
setup_containers() {
    log_info "Setting up Docker containers for local development..."
    
    # Create docker-compose.local.yml
    cat > "$PROJECT_ROOT/docker-compose.local.yml" << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: eyewearml-mongodb-local
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: eyewear_ml_local
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - eyewearml-network

  redis:
    image: redis:7.2-alpine
    container_name: eyewearml-redis-local
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass password123
    volumes:
      - redis_data:/data
    networks:
      - eyewearml-network

  postgres:
    image: postgres:16-alpine
    container_name: eyewearml-postgres-local
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: eyewear_ml_local
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - eyewearml-network

volumes:
  mongodb_data:
  redis_data:
  postgres_data:

networks:
  eyewearml-network:
    driver: bridge
EOF

    # Create MongoDB initialization script
    cat > "$PROJECT_ROOT/scripts/mongo-init.js" << EOF
// MongoDB initialization script for local development
db = db.getSiblingDB('eyewear_ml_local');

// Create collections with initial indexes
db.createCollection('users');
db.createCollection('products');
db.createCollection('recommendations');
db.createCollection('analytics');

// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });
db.products.createIndex({ "sku": 1 }, { unique: true });
db.products.createIndex({ "category": 1, "brand": 1 });
db.recommendations.createIndex({ "user_id": 1, "created_at": -1 });
db.analytics.createIndex({ "event_type": 1, "timestamp": -1 });

print('MongoDB local development database initialized successfully');
EOF

    # Start containers
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.local.yml up -d
    
    log_success "Docker containers started successfully"
    log_info "MongoDB: mongodb://admin:password123@localhost:27017/eyewear_ml_local"
    log_info "Redis: redis://:password123@localhost:6379/0"
    log_info "PostgreSQL: postgresql://postgres:password123@localhost:5432/eyewear_ml_local"
}

# Validate configuration
validate_configuration() {
    local env=$1
    local env_file="$PROJECT_ROOT/.env.${env}"
    
    log_info "Validating configuration for environment: $env"
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required for configuration validation"
        exit 1
    fi
    
    # Create temporary validation script
    cat > "/tmp/validate_config.py" << EOF
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path("$PROJECT_ROOT")
sys.path.insert(0, str(project_root / "src"))

# Load environment file
from dotenv import load_dotenv
load_dotenv("$env_file")

try:
    # Import the new configuration system
    from api.core.config_new import Settings, create_settings
    
    # Validate configuration
    settings = create_settings()
    print(f"✅ Configuration validation successful for environment: {settings.app.environment}")
    print(f"   - Project: {settings.app.project_name}")
    print(f"   - Version: {settings.app.version}")
    print(f"   - Debug: {settings.app.debug}")
    print(f"   - Database: {settings.database.mongodb_database}")
    
except Exception as e:
    print(f"❌ Configuration validation failed: {e}")
    sys.exit(1)
EOF

    python3 /tmp/validate_config.py
    rm /tmp/validate_config.py
    
    log_success "Configuration validation completed"
}

# Create frontend environment file
create_frontend_env() {
    local env=$1
    local frontend_env_file="$PROJECT_ROOT/frontend/.env.${env}"
    
    log_info "Creating frontend environment file: .env.${env}"
    
    case $env in
        "local")
            cat > "$frontend_env_file" << EOF
# Frontend Environment - Local Development
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EyewearML (Local)
VITE_APP_VERSION=1.0.0-local
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=false
VITE_ENABLE_DEBUG=true
EOF
            ;;
        "development")
            cat > "$frontend_env_file" << EOF
# Frontend Environment - Development
NODE_ENV=development
VITE_API_BASE_URL=https://dev-api.eyewearml.com/api/v1
VITE_APP_NAME=EyewearML (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=\${DEV_FRONTEND_SENTRY_DSN}
VITE_ENABLE_DEBUG=false
EOF
            ;;
        "staging")
            cat > "$frontend_env_file" << EOF
# Frontend Environment - Staging
NODE_ENV=staging
VITE_API_BASE_URL=https://staging-api.eyewearml.com/api/v1
VITE_APP_NAME=EyewearML (Staging)
VITE_APP_VERSION=1.0.0-staging
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=\${STAGING_FRONTEND_SENTRY_DSN}
VITE_ENABLE_DEBUG=false
EOF
            ;;
        "production")
            cat > "$frontend_env_file" << EOF
# Frontend Environment - Production
NODE_ENV=production
VITE_API_BASE_URL=https://api.eyewearml.com/api/v1
VITE_APP_NAME=EyewearML
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=\${PROD_FRONTEND_SENTRY_DSN}
VITE_ENABLE_DEBUG=false
EOF
            ;;
        "test")
            cat > "$frontend_env_file" << EOF
# Frontend Environment - Test
NODE_ENV=test
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EyewearML (Test)
VITE_APP_VERSION=1.0.0-test
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
VITE_ENABLE_DEBUG=true
EOF
            ;;
    esac
    
    log_success "Created frontend environment file: .env.${env}"
}

# Main execution
main() {
    log_info "EyewearML Environment Setup Script"
    log_info "Environment: $ENVIRONMENT"
    
    # Validate environment
    validate_environment "$ENVIRONMENT"
    
    # Create backend environment file
    create_env_file "$ENVIRONMENT"
    
    # Create frontend environment file
    create_frontend_env "$ENVIRONMENT"
    
    # Setup containers for local development
    if [[ "$ENVIRONMENT" == "local" && "$WITH_CONTAINERS" == "--with-containers" ]]; then
        setup_containers
    fi
    
    # Validate configuration (skip for production to avoid exposing secrets)
    if [[ "$ENVIRONMENT" != "production" ]]; then
        validate_configuration "$ENVIRONMENT"
    fi
    
    log_success "Environment setup completed successfully!"
    log_info "Next steps:"
    log_info "1. Review and update the generated .env.${ENVIRONMENT} file with actual values"
    log_info "2. Copy .env.${ENVIRONMENT} to .env for active use"
    log_info "3. Update frontend/.env.${ENVIRONMENT} with actual values"
    log_info "4. Run the application with: python -m uvicorn src.api.main:app --reload"
}

# Execute main function
main "$@"
```

### 2.3 Create Configuration Validation Script

**File: `scripts/validate-config.py`**
```python
#!/usr/bin/env python3
"""
Configuration Validation Script
Validates environment configuration and reports issues
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from urllib.parse import urlparse

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

@dataclass
class ValidationResult:
    """Result of configuration validation."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    info: List[str]

class ConfigurationValidator:
    """Comprehensive configuration validator."""
    
    def __init__(self, env_file: Optional[str] = None):
        self.env_file = env_file or ".env"
        self.errors = []
        self.warnings = []
        self.info = []
        
        # Load environment variables
        if Path(self.env_file).exists():
            from dotenv import load_dotenv
            load_dotenv(self.env_file)
        else:
            self.errors.append(f"Environment file not found: {self.env_file}")
    
    def validate_required_variables(self) -> None:
        """Validate that all required environment variables are present."""
        required_vars = [
            "ENVIRONMENT",
            "SECRET_KEY",
            "MONGODB_URL",
            "DATABASE_URL",
            "REDIS_URL",
            "DEEPSEEK_API_KEY",
            "NVIDIA_API_KEY",
            "FACE_ANALYSIS_API_KEY"
        ]
        
        for var in required_vars:
            value = os.getenv(var)
            if not value:
                self.errors.append(f"Required environment variable missing: {var}")
            elif value.strip() == "":
                self.errors.append(f"Required environment variable is empty: {var}")
    
    def validate_urls(self) -> None:
        """Validate URL format for database and API endpoints."""
        url_vars = {
            "MONGODB_URL": ["mongodb://", "mongodb+srv://"],
            "DATABASE_URL": ["mongodb://", "mongodb+srv://", "postgresql://"],
            "REDIS_URL": ["redis://"],
            "DEEPSEEK_API_BASE_URL": ["http://", "https://"],
            "NVIDIA_API_BASE_URL": ["http://", "https://"],
            "FACE_ANALYSIS_API_URL": ["http://", "https://"]
        }
        
        for var, valid_schemes in url_vars.items():
            value = os.getenv(var)
            if value:
                if not any(value.startswith(scheme) for scheme in valid_schemes):
                    self.errors.append(
                        f"Invalid URL scheme for {var}: {value}. "
                        f"Must start with one of: {', '.join(valid_schemes)}"
                    )
                
                try:
                    parsed = urlparse(value)
                    if not parsed.netloc:
                        self.errors.append(f"Invalid URL structure for {var}: {value}")
                except Exception as e:
                    self.errors.append(f"Failed to parse URL for {var}: {e}")
    
    def validate_security_settings(self) -> None:
        """Validate security-related configuration."""
        environment = os.getenv("ENVIRONMENT", "development")
        secret_key = os.getenv("SECRET_KEY", "")
        
        # Check secret key strength
        if len(secret_key) < 32:
            self.errors.append("SECRET_KEY must be at least 32 characters long")
        
        # Check for default/weak keys in production
        weak_keys = [
            "default_secret_key_for_development_only",
            "your-secret-key-here",
            "change-me",
            "secret",
            "password"
        ]
        
        if any(weak_key in secret_key.lower() for weak_key in weak_keys):
            if environment == "production":
                self.errors.append("Weak or default SECRET_KEY cannot be used in production")
            else:
                self.warnings.append("Using weak or default SECRET_KEY (acceptable for development)")
        
        # Validate JWT algorithm
        algorithm = os.getenv("ALGORITHM", "HS256")
        valid_algorithms = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"]
        if algorithm not in valid_algorithms:
            self.errors.append(f"Invalid JWT algorithm: {algorithm}")
    
    def validate_api_keys(self) -> None:
        """Validate external API keys."""
        environment = os.getenv("ENVIRONMENT", "development")
        
        api_keys = {
            "DEEPSEEK_API_KEY": "DeepSeek API",
            "NVIDIA_API_KEY": "NVIDIA API",
            "FACE_ANALYSIS_API_KEY": "Face Analysis API"
        }
        
        placeholder_patterns = [
            "your-api-key-here",
            "replace-with-actual",
            "test_key_replace",
            "placeholder",
            "mock"
        ]
        
        for var, service in api_keys.items():
            value = os.getenv(var, "")
            
            if any(pattern in value.lower() for pattern in placeholder_patterns):
                if environment == "production":
                    self.errors.append(f"Placeholder API key for {service} cannot be used in production")
                elif environment in ["development", "staging"]:
                    self.warnings.append(f"Using placeholder API key for {service}")
                else:
                    self.info.append(f"Using test/mock API key for {service}")
    
    def validate_cors_settings(self) -> None:
        """Validate CORS configuration."""
        environment = os.getenv("ENVIRONMENT", "development")
        cors_origins = os.getenv("CORS_ORIGINS", "[]")
        
        try:
            # Handle both JSON array and comma-separated string formats
            if cors_origins.startswith("["):
                origins = json.loads(cors_origins)
            else:
                origins = [origin.strip() for origin in cors_origins.split(",")]
            
            # Check for wildcard in production
            if "*" in origins and environment == "production":
                self.errors.append("CORS wildcard (*) should not be used in production")
            
            # Validate origin URLs
            for origin in origins:
                if origin != "*" and not origin.startswith(("http://", "https://")):
                    self.warnings.append(f"Invalid CORS origin format: {origin}")
                    
        except json.JSONDecodeError:
            self.errors.append(f"Invalid CORS_ORIGINS format: {cors_origins}")
    
    def validate_feature_flags(self) -> None:
        """Validate feature flag configuration."""
        feature_flags = [
            "ENABLE_ANALYTICS",
            "ENABLE_A_B_TESTING",
            "ENABLE_FACE_SHAPE_ANALYSIS",
            "ENABLE_VIRTUAL_TRY_ON",
            "ENABLE_METRICS"
        ]
        
        for flag in feature_flags:
            value = os.getenv(flag, "").lower()
            if value not in ["true", "false", ""]:
                self.warnings.append(f"Feature flag {flag} should be 'true' or 'false', got: {value}")
    
    def validate_numeric_settings(self) -> None:
        """Validate numeric configuration values."""
        numeric_vars = {
            "ACCESS_TOKEN_EXPIRE_MINUTES": (1, 1440),  # 1 minute to 24 hours
            "REFRESH_TOKEN_EXPIRE_DAYS": (1, 30),      # 1 to 30 days
            "RATE_LIMIT_REQUESTS_PER_MINUTE": (1, 10000),
            "RATE_LIMIT_BURST_SIZE": (1, 1000),
            "MONGODB_CONNECTION_TIMEOUT": (1000, 60000),  # 1 to 60 seconds
            "REDIS_CONNECTION_TIMEOUT": (1000, 30000),    # 1 to 30 seconds
            "RECOMMENDATION_CACHE_TTL": (60, 86400),      # 1 minute to 24 hours
        }
        
        for var, (min_val, max_val) in numeric_vars.items():
            value = os.getenv(var)
            if value:
                try:
                    num_value = int(value)
                    if not (min_val <= num_value <= max_val):
                        self.warnings.append(
                            f"{var} value {num_value} is outside recommended range "
                            f"({min_val}-{max_val})"
                        )
                except ValueError:
                    self.errors.append(f"Invalid numeric value for {var}: {value}")
    
    def validate_environment_consistency(self) -> None:
        """Validate environment-specific consistency."""
        environment = os.getenv("ENVIRONMENT", "development")
        debug = os.getenv("DEBUG", "false").lower()
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        
        # Production environment checks
        if environment == "production":
            if debug == "true":
                self.errors.append("DEBUG should be false in production environment")
            
            if log_level in ["DEBUG"]:
                self.warnings.append("DEBUG log level not recommended for production")
        
        # Development environment recommendations
        elif environment in ["local", "development"]:
            if debug == "false":
                self.info.append("Consider enabling DEBUG for development environment")
    
    def validate_database_configuration(self) -> None:
        """Validate database configuration consistency."""
        mongodb_url = os.getenv("MONGODB_URL", "")
        database_url = os.getenv("DATABASE_URL", "")
        
        # Check if MongoDB URLs are consistent
        if mongodb_url and database_url:
            if mongodb_url != database_url and not database_url.startswith("postgresql://"):
                self.warnings.append(
                    "MONGODB_URL and DATABASE_URL should be consistent for MongoDB usage"
                )
    
    def run_validation(self) -> ValidationResult:
        """Run all validation checks."""
        self.validate_required_variables()
        self.validate_urls()
        self.validate_security_settings()
        self.validate_api_keys()
        self.validate_cors_settings()
        self.validate_feature_flags()
        self.validate_numeric_settings()
        self.validate_environment_consistency()
        self.validate_database_configuration()
        
        is_valid = len(self.errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=self.errors,
            warnings=self.warnings,
            info=self.info
        )

def main():
    """Main validation function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate EyewearML configuration")
    parser.add_argument(
        "--env-file", 
        default=".env",
        help="Path to environment file (default: .env)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as errors"
    )
    
    args = parser.parse_args()
    
    # Run validation
    validator = ConfigurationValidator(args.env_file)
    result = validator.run_validation()
    
    if args.json:
        # JSON output
        output = {
            "valid": result.is_valid,
            "errors": result.errors,
            "warnings": result.warnings,
            "info": result.info
        }
        print(json.dumps(output, indent=2))
    else:
        # Human-readable output
        print("🔍 EyewearML Configuration Validation")
        print("=" * 50)
        
        if result.errors:
            print("\n❌ ERRORS:")
            for error in result.errors:
                print(f"   • {error}")
        
        if result.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in result.warnings:
                print(f"   • {warning}")
        
        if result.info:
            print("\n💡 INFO:")
            for info in result.info:
                print(f"   • {info}")
        
        print(f"\n📊 SUMMARY:")
        print(f"   • Errors: {len(result.errors)}")
        print(f"   • Warnings: {len(result.warnings)}")
        print(f"   • Info: {len(result.info)}")
        
        if result.is_valid:
            print("\n✅ Configuration validation PASSED")
        else:
            print("\n❌ Configuration validation FAILED")
    
    # Exit with appropriate code
    if not result.is_valid or (args.strict and result.warnings):
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
```

## Phase 3: Advanced Configuration Features (Week 2)

### 3.1 Service Discovery and Health Checks

**File: `src/api/core/service_registry.py`**
```python
"""
Service Discovery and Health Check System
Implements Redis-based service registry with health monitoring
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import redis.asyncio as redis
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ServiceStatus(str, Enum):
    """Service status enumeration."""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"
    UNKNOWN = "unknown"

@dataclass
class ServiceInfo:
    """Service information structure."""
    name: str
    version: str
    host: str
    port: int
    status: ServiceStatus
    last_heartbeat: datetime
    metadata: Dict[str, Any]
    health_check_url: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Redis storage."""
        data = asdict(self)
        data['last_heartbeat'] = self.last_heartbeat.isoformat()
        data['status'] = self.status.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ServiceInfo':
        """Create from dictionary from Redis."""
        data['last_heartbeat'] = datetime.fromisoformat(data['last_heartbeat'])
        data['status'] = ServiceStatus(data['status'])
        return cls(**data)

class ServiceRegistry:
    """Redis-based service registry with health monitoring."""
    
    def __init__(self, redis_url: str, key_prefix: str = "eyewearml:services"):
        self.redis_url = redis_url
        self.key_prefix = key_prefix
        self.redis_client: Optional[redis.Redis] = None
        self.heartbeat_interval = 30  # seconds
        self.service_timeout = 90     # seconds
        
    async def connect(self) -> None:
        """Connect to Redis."""
        try:
            self.redis_client = redis.from_url(self.redis_url)
            await self.redis_client.ping()