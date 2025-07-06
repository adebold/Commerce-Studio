#!/usr/bin/env python3
"""
Configuration Validation Script for EyewearML Platform

This script validates environment configuration files and settings
to ensure they meet security and operational requirements.

Author: EyewearML Platform Team
Created: 2025-01-11
"""

import os
import sys
import re
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from enum import Enum

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

try:
    from api.core.config_new import Settings
except ImportError as e:
    print(f"Warning: Could not import Settings: {e}")
    Settings = None


class ValidationLevel(Enum):
    """Validation severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ValidationResult:
    """Result of a validation check"""
    level: ValidationLevel
    message: str
    field: Optional[str] = None
    value: Optional[str] = None
    suggestion: Optional[str] = None


class ConfigValidationError(Exception):
    """Custom exception for configuration validation errors"""
    pass


class ConfigValidator:
    """Comprehensive configuration validator for EyewearML platform"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or ".env"
        self.results: List[ValidationResult] = []
        self.logger = logging.getLogger(__name__)
        
        # Security requirements
        self.min_secret_key_length = 32
        self.required_env_vars = [
            "DATABASE_URL",
            "SECRET_KEY",
            "REDIS_URL",
            "ENVIRONMENT",
            "DEBUG",
            "API_VERSION"
        ]
        
        # Security patterns
        self.weak_patterns = [
            r"password123",
            r"admin",
            r"secret",
            r"test",
            r"default",
            r"changeme",
            r"123456"
        ]
    
    def validate_all(self) -> Dict[str, Any]:
        """Run all validation checks"""
        self.results.clear()
        
        try:
            # Load and parse environment (handles missing .env gracefully)
            env_vars = self._load_env_file()
            
            # Core validation checks
            self._validate_required_variables(env_vars)
            self._validate_database_config(env_vars)
            self._validate_redis_config(env_vars)
            self._validate_security_settings(env_vars)
            self._validate_api_settings(env_vars)
            self._validate_logging_config(env_vars)
            
            # Advanced security checks
            self._validate_secret_strengths(env_vars)
            self._validate_production_settings(env_vars)
            
            return self._compile_results()
            
        except Exception as e:
            self.logger.error(f"Validation failed: {e}")
            return {
                "is_valid": False,
                "errors": [f"Validation failed: {str(e)}"],
                "warnings": [],
                "info": [],
                "summary": {
                    "total_checks": 0,
                    "passed": 0,
                    "warnings": 0,
                    "errors": 1,
                    "critical": 0
                }
            }
    
    def _validate_file_exists(self):
        """Check if configuration file exists"""
        if not Path(self.config_path).exists():
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message=f"Configuration file not found: {self.config_path}",
                suggestion="Create the configuration file or check the path. Using environment variables only."
            ))
            # Don't raise error, allow validation to continue with env vars only
    
    def _validate_file_readable(self):
        """Check if configuration file is readable"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                f.read(1)
        except PermissionError:
            self.results.append(ValidationResult(
                level=ValidationLevel.CRITICAL,
                message=f"Cannot read configuration file: {self.config_path}",
                suggestion="Check file permissions"
            ))
            raise ConfigValidationError(f"Cannot read configuration file: {self.config_path}")
        except UnicodeDecodeError:
            self.results.append(ValidationResult(
                level=ValidationLevel.ERROR,
                message=f"Configuration file has encoding issues: {self.config_path}",
                suggestion="Ensure file is saved with UTF-8 encoding"
            ))
    
    def _load_env_file(self) -> Dict[str, str]:
        """Load and parse environment file"""
        env_vars = {}
        
        # If file doesn't exist, use environment variables only
        if not Path(self.config_path).exists():
            env_vars.update(os.environ)
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message=f"Using {len(env_vars)} environment variables (no .env file)"
            ))
            return env_vars
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    
                    # Skip empty lines and comments
                    if not line or line.startswith('#'):
                        continue
                    
                    # Parse key=value pairs
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        env_vars[key] = value
                    else:
                        self.results.append(ValidationResult(
                            level=ValidationLevel.WARNING,
                            message=f"Invalid line format at line {line_num}: {line}",
                            suggestion="Use KEY=value format"
                        ))
            
            # Also include OS environment variables
            env_vars.update(os.environ)
            
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message=f"Successfully loaded {len(env_vars)} environment variables"
            ))
            
            return env_vars
            
        except Exception as e:
            self.results.append(ValidationResult(
                level=ValidationLevel.CRITICAL,
                message=f"Failed to load environment file: {str(e)}",
                suggestion="Check file format and encoding"
            ))
            raise ConfigValidationError(f"Failed to load environment file: {str(e)}")
    
    def _validate_required_variables(self, env_vars: Dict[str, str]):
        """Validate that all required environment variables are present"""
        missing_vars = []
        
        for var in self.required_env_vars:
            if var not in env_vars or not env_vars[var]:
                missing_vars.append(var)
                self.results.append(ValidationResult(
                    level=ValidationLevel.CRITICAL,
                    message=f"Required environment variable missing: {var}",
                    field=var,
                    suggestion=f"Add {var}=<value> to your environment file"
                ))
        
        if not missing_vars:
            self.results.append(ValidationResult(
                level=ValidationLevel.INFO,
                message="All required environment variables are present"
            ))
    
    def _validate_database_config(self, env_vars: Dict[str, str]):
        """Validate database configuration"""
        if "DATABASE_URL" in env_vars:
            db_url = env_vars["DATABASE_URL"]
            
            # Check for basic URL format
            if not db_url.startswith(("postgresql://", "postgres://", "sqlite://", "mysql://")):
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message="DATABASE_URL does not appear to be a valid database URL",
                    field="DATABASE_URL",
                    suggestion="Use format: postgresql://user:pass@host:port/dbname"
                ))
            
            # Check for localhost in production
            if env_vars.get("ENVIRONMENT") == "production" and "localhost" in db_url:
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message="Using localhost database URL in production environment",
                    field="DATABASE_URL",
                    suggestion="Use a proper production database host"
                ))
            
            # Check for embedded credentials
            if "@" in db_url and ":" in db_url.split("@")[0]:
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message="Database credentials embedded in URL",
                    field="DATABASE_URL",
                    suggestion="Consider using separate credential environment variables"
                ))
    
    def _validate_redis_config(self, env_vars: Dict[str, str]):
        """Validate Redis configuration"""
        if "REDIS_URL" in env_vars:
            redis_url = env_vars["REDIS_URL"]
            
            # Check for basic URL format
            if not redis_url.startswith(("redis://", "rediss://")):
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message="REDIS_URL does not appear to be a valid Redis URL",
                    field="REDIS_URL",
                    suggestion="Use format: redis://host:port or rediss://host:port for SSL"
                ))
            
            # Check for localhost in production
            if env_vars.get("ENVIRONMENT") == "production" and "localhost" in redis_url:
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message="Using localhost Redis URL in production environment",
                    field="REDIS_URL",
                    suggestion="Use a proper production Redis host"
                ))
    
    def _validate_security_settings(self, env_vars: Dict[str, str]):
        """Validate security-related settings"""
        # Secret key validation
        if "SECRET_KEY" in env_vars:
            self._validate_secret_key(env_vars["SECRET_KEY"], "SECRET_KEY")
        
        # JWT secret validation
        if "JWT_SECRET" in env_vars:
            self._validate_secret_key(env_vars["JWT_SECRET"], "JWT_SECRET")
        
        # Debug mode in production
        if env_vars.get("ENVIRONMENT") == "production" and env_vars.get("DEBUG", "").lower() == "true":
            self.results.append(ValidationResult(
                level=ValidationLevel.CRITICAL,
                message="DEBUG mode is enabled in production environment",
                field="DEBUG",
                suggestion="Set DEBUG=false in production"
            ))
    
    def _validate_secret_key(self, key: str, field_name: str):
        """Validate secret key strength"""
        if len(key) < self.min_secret_key_length:
            self.results.append(ValidationResult(
                level=ValidationLevel.CRITICAL,
                message=f"{field_name} is too short (minimum {self.min_secret_key_length} characters)",
                field=field_name,
                suggestion=f"Generate a secure {self.min_secret_key_length}+ character secret key"
            ))
        
        # Check for weak patterns
        key_lower = key.lower()
        for pattern in self.weak_patterns:
            if re.search(pattern, key_lower):
                self.results.append(ValidationResult(
                    level=ValidationLevel.CRITICAL,
                    message=f"{field_name} contains weak pattern: {pattern}",
                    field=field_name,
                    suggestion="Generate a cryptographically secure random key"
                ))
                break
        
        # Check for sufficient entropy (basic check)
        unique_chars = len(set(key))
        if unique_chars < 10:
            self.results.append(ValidationResult(
                level=ValidationLevel.WARNING,
                message=f"{field_name} has low character diversity",
                field=field_name,
                suggestion="Use a mix of letters, numbers, and symbols"
            ))
    
    def _validate_api_settings(self, env_vars: Dict[str, str]):
        """Validate API-related settings"""
        # API version validation
        if "API_VERSION" in env_vars:
            api_version = env_vars["API_VERSION"]
            if not re.match(r"^v\d+(\.\d+)*$", api_version):
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message="API_VERSION format should follow semantic versioning (e.g., v1, v1.0, v1.2.3)",
                    field="API_VERSION",
                    suggestion="Use format: v1, v1.0, or v1.2.3"
                ))
        
        # Port validation
        if "PORT" in env_vars:
            try:
                port = int(env_vars["PORT"])
                if port < 1024 or port > 65535:
                    self.results.append(ValidationResult(
                        level=ValidationLevel.WARNING,
                        message=f"PORT {port} is outside recommended range (1024-65535)",
                        field="PORT",
                        suggestion="Use a port between 1024 and 65535"
                    ))
            except ValueError:
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message="PORT must be a valid integer",
                    field="PORT",
                    suggestion="Set PORT to a numeric value"
                ))
    
    def _validate_logging_config(self, env_vars: Dict[str, str]):
        """Validate logging configuration"""
        if "LOG_LEVEL" in env_vars:
            log_level = env_vars["LOG_LEVEL"].upper()
            valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
            
            if log_level not in valid_levels:
                self.results.append(ValidationResult(
                    level=ValidationLevel.ERROR,
                    message=f"Invalid LOG_LEVEL: {log_level}",
                    field="LOG_LEVEL",
                    suggestion=f"Use one of: {', '.join(valid_levels)}"
                ))
    
    def _validate_secret_strengths(self, env_vars: Dict[str, str]):
        """Advanced secret strength validation"""
        secret_fields = [key for key in env_vars.keys() 
                        if any(term in key.lower() for term in ["secret", "key", "token", "password"])]
        
        for field in secret_fields:
            value = env_vars[field]
            
            # Skip if already validated
            if field in ["SECRET_KEY", "JWT_SECRET"]:
                continue
            
            # Basic strength check
            if len(value) < 16:
                self.results.append(ValidationResult(
                    level=ValidationLevel.WARNING,
                    message=f"Secret field {field} may be too short for security",
                    field=field,
                    suggestion="Consider using longer secrets for better security"
                ))
    
    def _validate_production_settings(self, env_vars: Dict[str, str]):
        """Validate production-specific settings"""
        if env_vars.get("ENVIRONMENT") != "production":
            return
        
        # Production-specific checks
        production_checks = [
            ("DEBUG", "false", "DEBUG should be disabled in production"),
            ("LOG_LEVEL", ["INFO", "WARNING", "ERROR"], "LOG_LEVEL should not be DEBUG in production"),
        ]
        
        for field, expected, message in production_checks:
            if field in env_vars:
                value = env_vars[field]
                if isinstance(expected, list):
                    if value.upper() not in expected:
                        self.results.append(ValidationResult(
                            level=ValidationLevel.WARNING,
                            message=message,
                            field=field,
                            suggestion=f"Set {field} to one of: {', '.join(expected)}"
                        ))
                else:
                    if value.lower() != expected.lower():
                        self.results.append(ValidationResult(
                            level=ValidationLevel.WARNING,
                            message=message,
                            field=field,
                            suggestion=f"Set {field}={expected}"
                        ))
    
    def _compile_results(self) -> Dict[str, Any]:
        """Compile validation results into a structured report"""
        errors = [r for r in self.results if r.level == ValidationLevel.ERROR]
        warnings = [r for r in self.results if r.level == ValidationLevel.WARNING]
        critical = [r for r in self.results if r.level == ValidationLevel.CRITICAL]
        info = [r for r in self.results if r.level == ValidationLevel.INFO]
        
        is_valid = len(errors) == 0 and len(critical) == 0
        
        return {
            "is_valid": is_valid,
            "errors": [r.message for r in errors],
            "warnings": [r.message for r in warnings],
            "critical": [r.message for r in critical],
            "info": [r.message for r in info],
            "summary": {
                "total_checks": len(self.results),
                "passed": len(info),
                "warnings": len(warnings),
                "errors": len(errors),
                "critical": len(critical)
            },
            "details": [
                {
                    "level": r.level.value,
                    "message": r.message,
                    "field": r.field,
                    "value": r.value,
                    "suggestion": r.suggestion
                }
                for r in self.results
            ]
        }
    
    def validate_environment(self) -> Dict[str, Any]:
        """Validate the current environment configuration."""
        try:
            # Load environment variables
            env_vars = {}
            
            # Try to load from .env file
            if os.path.exists('.env'):
                with open('.env', 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            env_vars[key.strip()] = value.strip().strip('"').strip("'")
            
            # Also include OS environment variables
            env_vars.update(os.environ)
            
            # Validate configuration
            validation_result = self.validate_all()
            
            return {
                "is_valid": validation_result["is_valid"],
                "errors": validation_result.get("errors", []),
                "warnings": validation_result.get("warnings", []),
                "config_count": len(env_vars)
            }
            
        except Exception as e:
            return {
                "is_valid": False,
                "errors": [f"Environment validation failed: {str(e)}"],
                "warnings": [],
                "config_count": 0
            }
    
    def _validate_secret_key_strength(self, key: str) -> bool:
        """Validate secret key strength and return boolean result."""
        try:
            # Use the existing _validate_secret_key method but return boolean
            self._validate_secret_key(key, "SECRET_KEY")
            return True
        except ConfigValidationError:
            return False


def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate EyewearML configuration")
    parser.add_argument("--config", "-c", default=".env", help="Configuration file path")
    parser.add_argument("--json", "-j", action="store_true", help="Output results as JSON")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Set up logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format="%(levelname)s: %(message)s")
    
    # Run validation
    validator = ConfigValidator(args.config)
    results = validator.validate_all()
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        # Human-readable output
        print("🔍 Configuration Validation Results")
        print("=" * 50)
        
        if results["is_valid"]:
            print("✅ Configuration is valid!")
        else:
            print("❌ Configuration has issues!")
        
        # Print summary
        summary = results["summary"]
        print(f"\n📊 Summary:")
        print(f"  Total checks: {summary['total_checks']}")
        print(f"  Passed: {summary['passed']} ✅")
        print(f"  Warnings: {summary['warnings']} ⚠️")
        print(f"  Errors: {summary['errors']} ❌")
        print(f"  Critical: {summary['critical']} 🚨")
        
        # Print details
        if results.get("critical"):
            print(f"\n🚨 Critical Issues:")
            for msg in results["critical"]:
                print(f"  - {msg}")
        
        if results.get("errors"):
            print(f"\n❌ Errors:")
            for msg in results["errors"]:
                print(f"  - {msg}")
        
        if results.get("warnings"):
            print(f"\n⚠️ Warnings:")
            for msg in results["warnings"]:
                print(f"  - {msg}")
        
        if args.verbose and results.get("info"):
            print(f"\n✅ Info:")
            for msg in results["info"]:
                print(f"  - {msg}")
    
    # Exit with appropriate code
    sys.exit(0 if results["is_valid"] else 1)


if __name__ == "__main__":
    main()