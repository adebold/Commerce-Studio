# Environment Configuration Implementation Guide
## EyewearML Platform - SPARC Phase 1.2

### Quick Start Implementation

This guide provides step-by-step instructions for implementing the comprehensive environment configuration architecture designed in [`docs/environment-architecture.md`](docs/environment-architecture.md).

## Phase 1: Critical Fixes (Immediate - Day 1)

### 1.1 Fix Configuration Corruption

**Priority: CRITICAL** - The malformed DATABASE_URL in [`src/api/core/config.py:117`](src/api/core/config.py:117) must be fixed immediately.

**Current Corrupted Line:**
```python
settings.DATABASE_URL = "os.environ.get('CONFIG_SECRET')'CONFIG_SECRET')'CONFIG_SECRET')'CONFIG_SECRET')"
```

**Required Fix:**
```python
# Replace line 117 with proper environment-specific configuration
if os.getenv("ENVIRONMENT") == "test":
    settings.MONGODB_DATABASE = "eyewear_ml_test"
    settings.DATABASE_URL = f"mongodb://mongodb:27017/{settings.MONGODB_DATABASE}"
    settings.USE_REDIS_CACHE = False
    settings.RATE_LIMIT_REQUESTS_PER_MINUTE = 1000
```

### 1.2 Create Complete .env.example

**File: `.env.example`**
```bash
# =============================================================================
# EyewearML Platform - Environment Configuration Template
# =============================================================================
# Copy this file to .env and update with your specific values
# DO NOT commit .env files to version control

# =============================================================================
# ENVIRONMENT CONTROL
# =============================================================================
ENVIRONMENT=development
DEBUG=false
LOG_LEVEL=INFO

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
PROJECT_NAME="EyewearML API"
API_V1_STR="/api/v1"
VERSION=1.0.0

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# MongoDB Primary Database
MONGODB_URL=mongodb://username:password@host:port/database
MONGODB_DATABASE=eyewear_ml
MONGODB_CONNECTION_TIMEOUT=30000
MONGODB_MAX_POOL_SIZE=10

# Prisma ORM (uses MongoDB)
DATABASE_URL=mongodb://username:password@host:port/database
PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1

# Redis Cache
REDIS_URL=redis://username:password@host:port/db
REDIS_CONNECTION_TIMEOUT=5000
REDIS_MAX_RETRIES=3
USE_REDIS_CACHE=true

# PostgreSQL (if needed for specific features)
POSTGRES_URL=postgresql://username:password@host:port/database

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
# JWT Configuration (CRITICAL: Change in production)
SECRET_KEY=your-256-bit-secret-key-here-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# =============================================================================
# EXTERNAL API KEYS
# =============================================================================
# DeepSeek AI API
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1

# NVIDIA API
NVIDIA_API_KEY=your-nvidia-api-key-here
NVIDIA_API_BASE_URL=https://api.nvidia.com/v1

# Face Analysis API
FACE_ANALYSIS_API_KEY=your-face-analysis-api-key-here
FACE_ANALYSIS_API_URL=https://api.faceanalysis.com/v1

# =============================================================================
# OAUTH CONFIGURATION
# =============================================================================
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE","OPTIONS"]

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# =============================================================================
# RECOMMENDATION ENGINE
# =============================================================================
COLLABORATIVE_FILTERING_APPROACH=hybrid
RECOMMENDATION_CACHE_TTL=3600
RECOMMENDATION_DIVERSITY_FACTOR=0.3

# =============================================================================
# MONITORING AND OBSERVABILITY
# =============================================================================
SENTRY_DSN=your-sentry-dsn-here
ENABLE_METRICS=true
METRICS_PORT=9090

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# =============================================================================
# AUTO-GENERATED SECRETS (from extract_secrets.py)
# =============================================================================
# These are placeholders - replace with actual values
DB_HEALTH_CHECK_SECRET=replace-with-actual-secret
CONFIG_SECRET=replace-with-actual-secret
API_KEY_ADMIN=replace-with-actual-secret
API_KEY_USER=replace-with-actual-secret
API_KEY_ANALYTICS=replace-with-actual-secret
API_KEY_MERCHANT=replace-with-actual-secret
API_KEY_RECOMMENDATION=replace-with-actual-secret
API_KEY_FACE_ANALYSIS=replace-with-actual-secret
API_KEY_VIRTUAL_TRY_ON=replace-with-actual-secret
API_KEY_PRODUCT_CATALOG=replace-with-actual-secret
API_KEY_USER_PREFERENCES=replace-with-actual-secret
API_KEY_INVENTORY=replace-with-actual-secret
API_KEY_ORDERS=replace-with-actual-secret
API_KEY_REVIEWS=replace-with-actual-secret
API_KEY_NOTIFICATIONS=replace-with-actual-secret
API_KEY_SEARCH=replace-with-actual-secret
API_KEY_CONTENT=replace-with-actual-secret
API_KEY_INTEGRATION=replace-with-actual-secret
API_KEY_MONITORING=replace-with-actual-secret
API_KEY_BACKUP=replace-with-actual-secret
API_KEY_MIGRATION=replace-with-actual-secret
API_KEY_TESTING=replace-with-actual-secret
API_KEY_DEVELOPMENT=replace-with-actual-secret
API_KEY_STAGING=replace-with-actual-secret
API_KEY_PRODUCTION=replace-with-actual-secret
```

### 1.3 Create Frontend Environment Utilities

**File: `frontend/src/utils/env.ts`**
```typescript
/**
 * Frontend Environment Configuration Management
 * Validates and provides type-safe access to environment variables
 */

interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  VITE_API_BASE_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_ENABLE_SENTRY: boolean;
  VITE_SENTRY_DSN?: string;
  VITE_ENABLE_DEBUG: boolean;
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(`Configuration Error: ${message}`);
    this.name = 'ConfigurationError';
  }
}

class EnvironmentValidator {
  private static validateUrl(url: string, name: string): void {
    if (!url) {
      throw new ConfigurationError(`${name} is required`);
    }
    
    try {
      new URL(url);
    } catch {
      throw new ConfigurationError(`Invalid URL format for ${name}: ${url}`);
    }
  }
  
  private static validateRequired(value: any, name: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ConfigurationError(`Required environment variable missing: ${name}`);
    }
  }
  
  private static validateEnvironment(env: string): void {
    const validEnvironments = ['development', 'staging', 'production', 'test'];
    if (!validEnvironments.includes(env)) {
      throw new ConfigurationError(
        `Invalid NODE_ENV: ${env}. Must be one of: ${validEnvironments.join(', ')}`
      );
    }
  }
  
  static validate(config: Record<string, any>): EnvironmentConfig {
    // Validate required fields
    this.validateRequired(config.VITE_API_BASE_URL, 'VITE_API_BASE_URL');
    this.validateUrl(config.VITE_API_BASE_URL, 'VITE_API_BASE_URL');
    this.validateEnvironment(config.NODE_ENV);
    
    // Validate Sentry configuration if enabled
    if (config.VITE_ENABLE_SENTRY === 'true' && !config.VITE_SENTRY_DSN) {
      throw new ConfigurationError('VITE_SENTRY_DSN is required when Sentry is enabled');
    }
    
    return {
      NODE_ENV: config.NODE_ENV,
      VITE_API_BASE_URL: config.VITE_API_BASE_URL,
      VITE_APP_NAME: config.VITE_APP_NAME || 'EyewearML',
      VITE_APP_VERSION: config.VITE_APP_VERSION || '1.0.0',
      VITE_ENABLE_ANALYTICS: config.VITE_ENABLE_ANALYTICS === 'true',
      VITE_ENABLE_SENTRY: config.VITE_ENABLE_SENTRY === 'true',
      VITE_SENTRY_DSN: config.VITE_SENTRY_DSN,
      VITE_ENABLE_DEBUG: config.VITE_ENABLE_DEBUG === 'true',
    };
  }
}

// Load raw configuration from Vite environment
const rawConfig = {
  NODE_ENV: import.meta.env.NODE_ENV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  VITE_ENABLE_SENTRY: import.meta.env.VITE_ENABLE_SENTRY,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
};

// Validate and export configuration
export const config = EnvironmentValidator.validate(rawConfig);

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isStaging = () => config.NODE_ENV === 'staging';
export const isTest = () => config.NODE_ENV === 'test';

// API URL builder
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = config.VITE_API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Debug logging (only in development)
if (isDevelopment() && config.VITE_ENABLE_DEBUG) {
  console.group('🔧 Environment Configuration');
  console.log('Environment:', config.NODE_ENV);
  console.log('API Base URL:', config.VITE_API_BASE_URL);
  console.log('App Name:', config.VITE_APP_NAME);
  console.log('Version:', config.VITE_APP_VERSION);
  console.log('Analytics Enabled:', config.VITE_ENABLE_ANALYTICS);
  console.log('Sentry Enabled:', config.VITE_ENABLE_SENTRY);
  console.groupEnd();
}

export default config;
```

## Phase 2: Enhanced Configuration Management (Week 1)

### 2.1 Implement New Backend Configuration Architecture

**File: `src/api/core/config_new.py`** (Replace existing after testing)
```python
"""
Enhanced Application Configuration with Comprehensive Validation
Replaces the existing config.py with robust configuration management
"""

import os
import logging
from typing import Optional, Dict, Any, List, Union
from pydantic import BaseSettings, Field, validator, root_validator
from dotenv import load_dotenv
import secrets
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

class ConfigurationError(Exception):
    """Raised when configuration validation fails."""
    pass

class DatabaseSettings(BaseSettings):
    """Database configuration with validation."""
    
    # MongoDB Configuration
    mongodb_url: str = Field(..., env="MONGODB_URL")
    mongodb_database: str = Field("eyewear_ml", env="MONGODB_DATABASE")
    mongodb_connection_timeout: int = Field(30000, env="MONGODB_CONNECTION_TIMEOUT")
    mongodb_max_pool_size: int = Field(10, env="MONGODB_MAX_POOL_SIZE")
    
    # Prisma Configuration
    database_url: str = Field(..., env="DATABASE_URL")
    use_prisma: bool = Field(True, env="USE_PRISMA")
    
    # Redis Configuration
    redis_url: str = Field(..., env="REDIS_URL")
    redis_connection_timeout: int = Field(5000, env="REDIS_CONNECTION_TIMEOUT")
    redis_max_retries: int = Field(3, env="REDIS_MAX_RETRIES")
    use_redis_cache: bool = Field(True, env="USE_REDIS_CACHE")
    
    # PostgreSQL (optional)
    postgres_url: Optional[str] = Field(None, env="POSTGRES_URL")
    
    @validator('mongodb_url', 'database_url')
    def validate_mongodb_url(cls, v):
        if not v.startswith(('mongodb://', 'mongodb+srv://')):
            raise ValueError('MongoDB URL must start with mongodb:// or mongodb+srv://')
        
        # Parse URL to validate structure
        try:
            parsed = urlparse(v)
            if not parsed.netloc:
                raise ValueError('Invalid MongoDB URL structure')
        except Exception as e:
            raise ValueError(f'Invalid MongoDB URL: {e}')
        
        return v
    
    @validator('redis_url')
    def validate_redis_url(cls, v):
        if not v.startswith('redis://'):
            raise ValueError('Redis URL must start with redis://')
        
        try:
            parsed = urlparse(v)
            if not parsed.netloc:
                raise ValueError('Invalid Redis URL structure')
        except Exception as e:
            raise ValueError(f'Invalid Redis URL: {e}')
        
        return v
    
    @validator('postgres_url')
    def validate_postgres_url(cls, v):
        if v and not v.startswith('postgresql://'):
            raise ValueError('PostgreSQL URL must start with postgresql://')
        return v

class SecuritySettings(BaseSettings):
    """Security configuration with validation."""
    
    # JWT Configuration
    secret_key: str = Field(..., env="SECRET_KEY", min_length=32)
    algorithm: str = Field("HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # OAuth Configuration
    oauth_google_client_id: Optional[str] = Field(None, env="OAUTH_GOOGLE_CLIENT_ID")
    oauth_google_client_secret: Optional[str] = Field(None, env="OAUTH_GOOGLE_CLIENT_SECRET")
    oauth_github_client_id: Optional[str] = Field(None, env="OAUTH_GITHUB_CLIENT_ID")
    oauth_github_client_secret: Optional[str] = Field(None, env="OAUTH_GITHUB_CLIENT_SECRET")
    
    @validator('secret_key')
    def validate_secret_key(cls, v):
        # Check for default development key in production
        if v == "default_secret_key_for_development_only":
            if os.getenv("ENVIRONMENT") == "production":
                raise ValueError('Default secret key cannot be used in production')
        
        # Ensure minimum entropy
        if len(v) < 32:
            raise ValueError('Secret key must be at least 32 characters long')
        
        return v
    
    @validator('algorithm')
    def validate_algorithm(cls, v):
        valid_algorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']
        if v not in valid_algorithms:
            raise ValueError(f'Algorithm must be one of: {valid_algorithms}')
        return v
    
    @root_validator
    def validate_oauth_pairs(cls, values):
        """Ensure OAuth client ID and secret are provided together."""
        google_id = values.get('oauth_google_client_id')
        google_secret = values.get('oauth_google_client_secret')
        
        if bool(google_id) != bool(google_secret):
            raise ValueError('OAuth Google client ID and secret must be provided together')
        
        github_id = values.get('oauth_github_client_id')
        github_secret = values.get('oauth_github_client_secret')
        
        if bool(github_id) != bool(github_secret):
            raise ValueError('OAuth GitHub client ID and secret must be provided together')
        
        return values

class ExternalAPISettings(BaseSettings):
    """External API configuration with validation."""
    
    # DeepSeek API
    deepseek_api_key: str = Field(..., env="DEEPSEEK_API_KEY")
    deepseek_api_base_url: str = Field("https://api.deepseek.com/v1", env="DEEPSEEK_API_BASE_URL")
    
    # NVIDIA API
    nvidia_api_key: str = Field(..., env="NVIDIA_API_KEY")
    nvidia_api_base_url: str = Field("https://api.nvidia.com/v1", env="NVIDIA_API_BASE_URL")
    
    # Face Analysis API
    face_analysis_api_key: str = Field(..., env="FACE_ANALYSIS_API_KEY")
    face_analysis_api_url: str = Field("https://api.faceanalysis.com/v1", env="FACE_ANALYSIS_API_URL")
    
    @validator('deepseek_api_base_url', 'nvidia_api_base_url', 'face_analysis_api_url')
    def validate_api_urls(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('API URL must start with http:// or https://')
        
        try:
            parsed = urlparse(v)
            if not parsed.netloc:
                raise ValueError('Invalid API URL structure')
        except Exception as e:
            raise ValueError(f'Invalid API URL: {e}')
        
        return v
    
    @validator('deepseek_api_key', 'nvidia_api_key', 'face_analysis_api_key')
    def validate_api_keys(cls, v):
        if not v or v.strip() == "":
            raise ValueError('API key cannot be empty')
        
        # Check for placeholder values
        placeholder_patterns = [
            'your-api-key-here',
            'replace-with-actual',
            'test_key_replace',
            'placeholder'
        ]
        
        if any(pattern in v.lower() for pattern in placeholder_patterns):
            if os.getenv("ENVIRONMENT") == "production":
                raise ValueError('Placeholder API key cannot be used in production')
        
        return v

class ApplicationSettings(BaseSettings):
    """Main application configuration."""
    
    # Environment
    environment: str = Field("development", env="ENVIRONMENT")
    debug: bool = Field(False, env="DEBUG")
    log_level: str = Field("INFO", env="LOG_LEVEL")
    
    # Application Identity
    project_name: str = Field("EyewearML API", env="PROJECT_NAME")
    api_v1_str: str = Field("/api/v1", env="API_V1_STR")
    version: str = Field("1.0.0", env="VERSION")
    
    # CORS Configuration
    cors_origins: List[str] = Field(["*"], env="CORS_ORIGINS")
    cors_allow_credentials: bool = Field(True, env="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: List[str] = Field(
        ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
        env="CORS_ALLOW_METHODS"
    )
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(60, env="RATE_LIMIT_REQUESTS_PER_MINUTE")
    rate_limit_burst_size: int = Field(10, env="RATE_LIMIT_BURST_SIZE")
    
    # Feature Flags
    enable_analytics: bool = Field(True, env="ENABLE_ANALYTICS")
    enable_a_b_testing: bool = Field(True, env="ENABLE_A_B_TESTING")
    enable_face_shape_analysis: bool = Field(True, env="ENABLE_FACE_SHAPE_ANALYSIS")
    enable_virtual_try_on: bool = Field(True, env="ENABLE_VIRTUAL_TRY_ON")
    
    # Recommendation Engine
    collaborative_filtering_approach: str = Field("hybrid", env="COLLABORATIVE_FILTERING_APPROACH")
    recommendation_cache_ttl: int = Field(3600, env="RECOMMENDATION_CACHE_TTL")
    recommendation_diversity_factor: float = Field(0.3, env="RECOMMENDATION_DIVERSITY_FACTOR")
    
    # Monitoring
    sentry_dsn: Optional[str] = Field(None, env="SENTRY_DSN")
    enable_metrics: bool = Field(True, env="ENABLE_METRICS")
    metrics_port: int = Field(9090, env="METRICS_PORT")
    
    @validator('environment')
    def validate_environment(cls, v):
        valid_environments = ['local', 'development', 'staging', 'production', 'test']
        if v not in valid_environments:
            raise ValueError(f'Environment must be one of: {valid_environments}')
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.upper()
    
    @validator('cors_origins')
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated string
            v = [origin.strip() for origin in v.split(',')]
        
        # Validate each origin
        for origin in v:
            if origin != "*" and not origin.startswith(('http://', 'https://')):
                raise ValueError(f'Invalid CORS origin: {origin}')
        
        return v

class Settings(BaseSettings):
    """Comprehensive application settings with validation."""
    
    # Component configurations
    app: ApplicationSettings = ApplicationSettings()
    database: DatabaseSettings = DatabaseSettings()
    security: SecuritySettings = SecuritySettings()
    apis: ExternalAPISettings = ExternalAPISettings()
    
    # Legacy compatibility properties
    @property
    def ENVIRONMENT(self) -> str:
        return self.app.environment
    
    @property
    def DEBUG(self) -> bool:
        return self.app.debug
    
    @property
    def PROJECT_NAME(self) -> str:
        return self.app.project_name
    
    @property
    def API_V1_STR(self) -> str:
        return self.app.api_v1_str
    
    @property
    def SECRET_KEY(self) -> str:
        return self.security.secret_key
    
    @property
    def MONGODB_URL(self) -> str:
        return self.database.mongodb_url
    
    @property
    def DATABASE_URL(self) -> str:
        return self.database.database_url
    
    @property
    def REDIS_URL(self) -> str:
        return self.database.redis_url
    
    class Config:
        case_sensitive = True
        extra = "ignore"
        validate_assignment = True

def create_settings() -> Settings:
    """Create and validate settings instance."""
    try:
        settings = Settings()
        logger.info(f"Configuration loaded successfully for environment: {settings.app.environment}")
        return settings
    except Exception as e:
        logger.error(f"Configuration validation failed: {e}")
        raise ConfigurationError(f"Failed to load configuration: {e}")

# Global settings instance
settings = create_settings()

# Environment-specific overrides
def apply_environment_overrides():
    """Apply environment-specific configuration overrides."""
    env = settings.app.environment
    
    if env == "test":
        # Test environment overrides
        settings.database.mongodb_database = "eyewear_ml_test"
        settings.database.database_url = f"mongodb://mongodb:27017/{settings.database.mongodb_database}"
        settings.database.use_redis_cache = False
        settings.app.rate_limit_requests_per_minute = 1000
        settings.app.debug = True
        logger.info("Applied test environment overrides")
    
    elif env == "local":
        # Local development overrides
        settings.app.debug = True
        settings.app.log_level = "DEBUG"
        settings.app.cors_origins = ["http://localhost:3000", "http://localhost:5173"]
        settings.app.rate_limit_requests_per_minute = 1000
        logger.info("Applied local development overrides")
    
    elif env == "production":
        # Production environment validation
        if settings.security.secret_key == "default_secret_key_for_development_only":
            raise ConfigurationError("Production environment requires a secure secret key")
        
        # Ensure secure defaults
        settings.app.debug = False
        settings.app.log_level = "WARNING"
        logger.info("Applied production environment overrides")

# Apply overrides
apply_environment_overrides()

# Export commonly used settings for backward compatibility
ENVIRONMENT = settings.app.environment
DEBUG = settings.app.debug
PROJECT_NAME = settings.app.project_name
API_V1_STR = settings.app.api_v1_str
SECRET_KEY = settings.security.secret_key
MONGODB_URL = settings.database.mongodb_url
DATABASE_URL = settings.database.database_url
REDIS_URL = settings.database.redis_url
```

### 2.2 Create Environment Setup Automation Script

**File: `scripts/setup-environment.sh`**
```bash
#!/bin/bash
# Environment Setup Automation Script
# Usage: ./scripts/setup-environment.sh [environment] [--with-containers]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-development}
WITH_CONTAINERS=${2:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment parameter
validate_environment() {
    local env=$1
    local valid_environments=("local" "development" "staging" "production" "test")
    
    if [[ ! " ${valid_environments[@]} " =~ " ${env} " ]]; then
        log_error "Invalid environment: $env"
        log_info "Valid environments: ${valid_environments[*]}"
        exit 1
    fi
}

# Generate secure random key
generate_secret_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

# Create environment-specific .env file
create_env_file() {
    local env=$1
    local env_file="$PROJECT_ROOT/.env.${env}"
    
    log_info "Creating environment file: .env.${env}"
    
    case $env in
        "local")
            cat > "$env_file" << EOF
# =============================================================================
# LOCAL DEVELOPMENT ENVIRONMENT
# =============================================================================
ENVIRONMENT=local
DEBUG=true
LOG_LEVEL=DEBUG

# Application
PROJECT_NAME="EyewearML API (Local)"
API_V1_STR="/api/v1"
VERSION=1.0.0-local

# Database URLs (local containers)
MONGODB_URL=mongodb://localhost:27017/eyewear_ml_local
MONGODB_DATABASE=eyewear_ml_local
REDIS_URL=redis://localhost:6379/0
DATABASE_URL=mongodb://localhost:27017/eyewear_ml_local

# Security (development only - auto-generated)
SECRET_KEY=$(generate_secret_key)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# External APIs (use test/development keys)
DEEPSEEK_API_KEY=test_key_replace_with_real
NVIDIA_API_KEY=test_key_replace_with_real
FACE_ANALYSIS_API_KEY=test_key_replace_with_real

# CORS (allow local development)
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://127.0.0.1:3000","http://127.0.0.1:5173"]
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting (relaxed for development)
RATE_LIMIT_REQUESTS_PER_MINUTE=1000
RATE_LIMIT_BURST_SIZE=50

# Feature Flags (all enabled for testing)
ENABLE_ANALYTICS=true
ENABLE_A_B_TESTING=true
ENABLE_FACE_SHAPE_ANALYSIS=true
ENABLE_VIRTUAL_TRY_ON=true

# Monitoring (disabled for local)
ENABLE_METRICS=false
SENTRY_DSN=
EOF
            ;;
        "development")
            cat > "$env_file" << EOF
# =============================================================================
# DEVELOPMENT ENVIRONMENT
# =============================================================================
ENVIRONMENT=development
DEBUG=false
LOG_LEVEL=INFO

# Application
PROJECT_NAME="EyewearML API (Dev)"
API_V1_STR="/api/v1"
VERSION=1.0.0-dev

# Database URLs (development cluster - replace with actual values)
MONGODB_URL=\${DEV_MONGODB_URL}
MONGODB_DATABASE=eyewear_ml_dev
REDIS_URL=\${DEV_REDIS_URL}
DATABASE_URL=\${DEV_DATABASE_URL}

# Security (replace with actual values)
SECRET_KEY=\${DEV_SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs (replace with actual keys)
DEEPSEEK_API_KEY=\${DEV_DEEPSEEK_API_KEY}