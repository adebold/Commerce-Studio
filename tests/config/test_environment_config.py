"""
Environment-specific configuration tests.

This module contains tests to verify that the system correctly handles
configuration for different environments (development, staging, production).
It validates that environment-specific overrides work correctly and that
appropriate defaults are applied for each environment.
"""

import os
import pytest
import json
import yaml
from unittest import mock

# Constants for test environments
ENV_DEV = "development"
ENV_STAGING = "staging"
ENV_PROD = "production"


@pytest.fixture
def sample_config_file():
    """Create a temporary sample config file with environment overrides."""
    config_content = {
        "default": {
            "api": {
                "port": 8000,
                "host": "0.0.0.0",
                "debug": False,
                "timeout": 30
            },
            "database": {
                "uri": "mongodb://localhost:27017/sparc",
                "pool_size": 10,
                "timeout_ms": 5000
            },
            "logging": {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "file": "logs/app.log"
            },
            "security": {
                "secret_key": "${SECRET_KEY}",
                "jwt_expiration": 3600,
                "rate_limit": 100
            }
        },
        "development": {
            "api": {
                "debug": True,
                "timeout": 60
            },
            "database": {
                "uri": "mongodb://localhost:27017/sparc_dev"
            },
            "logging": {
                "level": "DEBUG"
            }
        },
        "staging": {
            "api": {
                "port": 8001
            },
            "database": {
                "uri": "mongodb://localhost:27017/sparc_staging",
                "pool_size": 20
            },
            "logging": {
                "level": "INFO"
            }
        },
        "production": {
            "api": {
                "host": "0.0.0.0",
                "debug": False
            },
            "database": {
                "uri": "${DB_URI}",
                "pool_size": 50,
                "timeout_ms": 10000
            },
            "logging": {
                "level": "WARNING",
                "file": "/var/log/sparc/app.log"
            },
            "security": {
                "rate_limit": 200
            }
        }
    }
    
    # Create a temporary file
    import tempfile
    config_file = tempfile.NamedTemporaryFile(delete=False, suffix=".yml")
    with open(config_file.name, "w") as f:
        yaml.dump(config_content, f)
    
    yield config_file.name
    
    # Cleanup
    os.unlink(config_file.name)


def load_config(config_file, environment):
    """Load configuration for the specified environment."""
    # This is a placeholder for the actual config loading function
    # In a real implementation, this would be imported from the application
    with open(config_file, "r") as f:
        config = yaml.safe_load(f)
    
    # Merge default config with environment-specific config
    result = config["default"].copy()
    if environment in config:
        for section, settings in config[environment].items():
            if section in result:
                result[section].update(settings)
            else:
                result[section] = settings
    
    # Process environment variable placeholders
    import re
    pattern = r"\${([A-Za-z0-9_]+)}"
    
    def replace_env_var(match):
        var_name = match.group(1)
        return os.environ.get(var_name, f"${{{var_name}}}")
    
    # Convert to JSON and back to process nested dicts
    config_str = json.dumps(result)
    config_str = re.sub(pattern, replace_env_var, config_str)
    result = json.loads(config_str)
    
    return result


class TestEnvironmentConfig:
    """Test suite for environment-specific configuration handling."""

    def test_development_environment_config(self, sample_config_file):
        """
        Test that development environment correctly overrides default config.
        
        RED: This test will fail if environment-specific overrides are not applied.
        """
        # Arrange
        environment = ENV_DEV
        
        # Act
        config = load_config(sample_config_file, environment)
        
        # Assert
        assert config["api"]["debug"] is True, "Development should enable debug mode"
        assert config["api"]["timeout"] == 60, "Development should have extended timeout"
        assert config["database"]["uri"] == "mongodb://localhost:27017/sparc_dev", "Development should use development database"
        assert config["logging"]["level"] == "DEBUG", "Development should use DEBUG log level"
        assert config["api"]["port"] == 8000, "Development should inherit default port"

    def test_staging_environment_config(self, sample_config_file):
        """
        Test that staging environment correctly overrides default config.
        
        RED: This test will fail if staging environment doesn't apply its specific overrides.
        """
        # Arrange
        environment = ENV_STAGING
        
        # Act
        config = load_config(sample_config_file, environment)
        
        # Assert
        assert config["api"]["port"] == 8001, "Staging should override default port"
        assert config["database"]["uri"] == "mongodb://localhost:27017/sparc_staging", "Staging should use staging database"
        assert config["database"]["pool_size"] == 20, "Staging should have increased pool size"
        assert config["api"]["debug"] is False, "Staging should inherit debug mode from default"

    def test_production_environment_config(self, sample_config_file):
        """
        Test that production environment correctly overrides default config.
        
        RED: This test will fail if production environment doesn't apply its specific overrides.
        """
        # Arrange
        environment = ENV_PROD
        
        # Act
        config = load_config(sample_config_file, environment)
        
        # Assert
        assert config["api"]["debug"] is False, "Production should have debug mode disabled"
        assert config["database"]["pool_size"] == 50, "Production should have larger connection pool"
        assert config["logging"]["level"] == "WARNING", "Production should use WARNING log level"
        assert config["security"]["rate_limit"] == 200, "Production should have higher rate limit"

    @mock.patch.dict(os.environ, {"DB_URI": "mongodb://user:pass@production:27017/sparc_prod"})
    def test_environment_variable_substitution(self, sample_config_file):
        """
        Test that environment variables are correctly substituted in configuration.
        
        RED: This test will fail if environment variable substitution doesn't work.
        """
        # Arrange
        environment = ENV_PROD
        
        # Act
        config = load_config(sample_config_file, environment)
        
        # Assert
        assert config["database"]["uri"] == "mongodb://user:pass@production:27017/sparc_prod", \
            "Environment variables should be substituted in configuration"

    @mock.patch.dict(os.environ, {"SECRET_KEY": "test_secret_key"})
    def test_environment_variable_inheritance(self, sample_config_file):
        """
        Test that environment variables in default config are inherited by all environments.
        
        RED: This test will fail if environment variable substitution doesn't work across environments.
        """
        # Arrange & Act
        dev_config = load_config(sample_config_file, ENV_DEV)
        staging_config = load_config(sample_config_file, ENV_STAGING)
        prod_config = load_config(sample_config_file, ENV_PROD)
        
        # Assert
        assert dev_config["security"]["secret_key"] == "test_secret_key", \
            "Development should inherit and substitute SECRET_KEY"
        assert staging_config["security"]["secret_key"] == "test_secret_key", \
            "Staging should inherit and substitute SECRET_KEY"
        assert prod_config["security"]["secret_key"] == "test_secret_key", \
            "Production should inherit and substitute SECRET_KEY"

    def test_missing_environment(self, sample_config_file):
        """
        Test that using a non-existent environment falls back to default values.
        
        RED: This test will fail if missing environment doesn't fall back to defaults.
        """
        # Arrange
        environment = "nonexistent"
        
        # Act
        config = load_config(sample_config_file, environment)
        
        # Assert
        assert config["api"]["port"] == 8000, "Should use default port for missing environment"
        assert config["api"]["debug"] is False, "Should use default debug setting for missing environment"
        assert config["database"]["uri"] == "mongodb://localhost:27017/sparc", "Should use default database for missing environment"

    def test_missing_environment_variable(self, sample_config_file):
        """
        Test that missing environment variables are handled gracefully.
        
        RED: This test will fail if missing environment variables aren't handled properly.
        """
        # Arrange
        environment = ENV_PROD
        
        # Ensure SECRET_KEY is not in environment
        with mock.patch.dict(os.environ, {}, clear=True):
            # Act
            config = load_config(sample_config_file, environment)
            
            # Assert
            assert config["security"]["secret_key"] == "${SECRET_KEY}", \
                "Missing environment variables should be preserved as placeholders"

    def test_environment_specific_section(self, sample_config_file):
        """
        Test adding a completely new section in an environment that doesn't exist in default.
        
        RED: This test will fail if environment-specific sections that don't exist in default aren't added.
        """
        # Arrange - Add a new section to the staging environment
        with open(sample_config_file, "r") as f:
            config = yaml.safe_load(f)
        
        config["staging"]["cache"] = {
            "enabled": True,
            "ttl": 300,
            "max_size": 1000
        }
        
        with open(sample_config_file, "w") as f:
            yaml.dump(config, f)
            
        # Act
        staging_config = load_config(sample_config_file, ENV_STAGING)
        
        # Assert
        assert "cache" in staging_config, "Environment-specific sections should be added to config"
        assert staging_config["cache"]["enabled"] is True, "Environment-specific section values should be accessible"
        assert staging_config["cache"]["ttl"] == 300, "Environment-specific section values should be correct"


def generate_environment_config_template():
    """
    Generate a template for environment-specific configuration.
    
    This utility function provides a starting point for creating 
    environment-specific configuration files.
    
    Returns:
        dict: A template configuration with environment overrides
    """
    return {
        "default": {
            "api": {
                "port": 8000,
                "host": "0.0.0.0",
                "debug": False,
                "workers": 4,
                "timeout": 30
            },
            "database": {
                "uri": "mongodb://localhost:27017/app",
                "pool_size": 10,
                "timeout_ms": 5000
            },
            "logging": {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "file": "logs/app.log"
            },
            "security": {
                "secret_key": "${SECRET_KEY}",
                "jwt_secret": "${JWT_SECRET}",
                "jwt_expiration": 3600,
                "rate_limit": 100
            },
            "cors": {
                "allowed_origins": ["http://localhost:3000"],
                "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
                "allow_credentials": True
            }
        },
        "development": {
            "api": {
                "debug": True,
                "workers": 1,
                "timeout": 60
            },
            "database": {
                "uri": "mongodb://localhost:27017/app_dev"
            },
            "logging": {
                "level": "DEBUG"
            },
            "cors": {
                "allowed_origins": ["http://localhost:3000", "http://localhost:8080"]
            }
        },
        "staging": {
            "api": {
                "workers": 2
            },
            "database": {
                "uri": "mongodb://user:${DB_PASSWORD}@staging:27017/app_staging",
                "pool_size": 20
            },
            "logging": {
                "level": "INFO",
                "file": "/var/log/app/staging.log"
            },
            "cors": {
                "allowed_origins": ["https://staging.example.com"]
            }
        },
        "production": {
            "api": {
                "workers": 8,
                "timeout": 20
            },
            "database": {
                "uri": "mongodb://user:${DB_PASSWORD}@production:27017/app_prod",
                "pool_size": 50,
                "timeout_ms": 10000
            },
            "logging": {
                "level": "WARNING",
                "file": "/var/log/app/production.log"
            },
            "security": {
                "rate_limit": 200,
                "jwt_expiration": 1800
            },
            "cors": {
                "allowed_origins": ["https://example.com"]
            }
        }
    }


if __name__ == "__main__":
    # This can be used to generate a sample configuration file
    config = generate_environment_config_template()
    print(yaml.dump(config))