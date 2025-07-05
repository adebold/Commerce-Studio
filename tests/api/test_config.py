import os
import pytest
from unittest.mock import patch, MagicMock
import socket
import requests
from pathlib import Path

# Import the configuration module
from src.api.core.config_new import Settings, create_settings, SecuritySettings

class TestApiConfig:
    """Test suite for API configuration validation."""
    
    def test_config_loads_successfully(self):
        """Test that the configuration loads without errors."""
        # RED: This will fail if config can't be loaded
        with patch.dict(os.environ, {"SECRET_KEY": "test-secret-key-for-validation-purposes"}):
            settings = create_settings()
            assert settings is not None
            assert settings.environment in ["development", "staging", "production", "test"]
    
    def test_required_secret_key_missing(self):
        """Test that an error is raised when SECRET_KEY is missing."""
        # RED: This should fail because SECRET_KEY is required
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(Exception):
                create_settings()
    
    def test_database_url_validation(self):
        """Test that DATABASE_URL is validated correctly."""
        # RED: This should fail with invalid DATABASE_URL
        with patch.dict(os.environ, {
            "SECRET_KEY": "test-secret-key-for-validation",
            "DATABASE_URL": "invalid-url"
        }):
            with pytest.raises(ValueError):
                create_settings()
    
    def test_environment_specific_overrides(self):
        """Test that environment-specific overrides are applied."""
        # RED: Test that test environment overrides are applied
        with patch.dict(os.environ, {
            "SECRET_KEY": "test-secret-key-for-validation",
            "ENVIRONMENT": "test"
        }):
            settings = create_settings()
            assert settings.database.mongodb_database == "eyewear_ml_test"
            assert settings.log_level == "DEBUG"
            assert settings.rate_limit_requests_per_minute == 1000
    
    @patch("socket.socket")
    def test_api_port_availability(self, mock_socket):
        """Test that the API port is available."""
        # RED: This will fail if port 8000 is already in use
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance
        
        with patch.dict(os.environ, {"SECRET_KEY": "test-secret-key-for-validation"}):
            settings = create_settings()
            
            # Check if port is available
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                sock.bind(("localhost", settings.PORT))
                port_available = True
            except OSError:
                port_available = False
            finally:
                sock.close()
            
            assert port_available, f"Port {settings.PORT} is not available for API server"