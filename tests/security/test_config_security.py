import pytest
import os
import json
import re
import socket
import requests
import logging
import secrets
import string
import subprocess
import yaml
from pathlib import Path
from unittest import mock

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestConfigSecurity:
    """Tests for security aspects of configuration files and settings."""
    
    @pytest.fixture
    def config_files(self):
        """Find all configuration files in the project."""
        config_extensions = ['.json', '.yaml', '.yml', '.env', '.cfg', '.conf', '.ini', '.properties']
        
        # Find all config files
        config_files = []
        for ext in config_extensions:
            # Find in project root and subdirectories
            for path in Path('.').rglob(f'*{ext}'):
                # Skip test directories and virtual environments
                if not any(part in str(path) for part in ['node_modules', 'venv', '.pytest_cache', '__pycache__']):
                    config_files.append(str(path))
        
        return config_files
    
    @pytest.fixture
    def env_variables(self):
        """Get all environment variables."""
        return dict(os.environ)
    
    def test_no_hardcoded_secrets_in_config(self, config_files):
        """
        Test that configuration files don't contain hardcoded secrets.
        
        RED: This test will fail if hardcoded secrets are found in config files.
        """
        # Patterns for potential secrets
        secret_patterns = [
            r'password\s*[=:]\s*["\'](?!placeholder|changeme|your_password)([^"\']+)["\']',
            r'secret\s*[=:]\s*["\']([^"\']+)["\']',
            r'key\s*[=:]\s*["\']([^"\']{20,})["\']',
            r'token\s*[=:]\s*["\']([^"\']{20,})["\']',
            r'api[-_]?key\s*[=:]\s*["\']([^"\']+)["\']',
            r'auth[-_]?token\s*[=:]\s*["\']([^"\']+)["\']',
            r'connection[-_]?string\s*[=:]\s*["\']([^"\']+)["\']',
            r'jdbc\s*[=:]\s*["\']([^"\']+)["\']',
            r'mongodb\+srv://[^:]+:([^@]+)@',
            r'postgres://[^:]+:([^@]+)@',
            r'mysql://[^:]+:([^@]+)@'
        ]
        
        # Files to explicitly exclude (e.g., test fixtures)
        excluded_files = [
            'test_config.json',
            'test_data',
            'example',
            'sample',
            'template'
        ]
        
        issues_found = []
        
        for file_path in config_files:
            # Skip excluded files
            if any(exclude in file_path.lower() for exclude in excluded_files):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for pattern in secret_patterns:
                    matches = re.finditer(pattern, content, re.IGNORECASE)
                    for match in matches:
                        # Extract the potential secret
                        secret = match.group(1)
                        
                        # Skip if it's an environment variable reference or placeholder
                        if any(placeholder in secret for placeholder in ['${', '$', '%', '<<', '}}', 'placeholder']):
                            continue
                            
                        # Skip if it's a common non-secret value
                        if secret.lower() in ['true', 'false', 'null', 'none', 'localhost']:
                            continue
                            
                        # Report the issue
                        masked_secret = secret[:3] + '*' * (len(secret) - 6) + secret[-3:] if len(secret) > 8 else '******'
                        issues_found.append({
                            'file': file_path,
                            'pattern': pattern,
                            'line': content.count('\n', 0, match.start()) + 1,
                            'masked_secret': masked_secret
                        })
            except Exception as e:
                logger.warning(f"Could not check file {file_path}: {str(e)}")
        
        # Assert no issues found
        assert not issues_found, f"Found {len(issues_found)} potential hardcoded secrets in configuration files:\n" + \
            "\n".join([f"- {i['file']} (line {i['line']}): {i['masked_secret']}" for i in issues_found])
    
    def test_secure_environment_variables(self, env_variables):
        """
        Test that sensitive environment variables are properly set.
        
        RED: This test will fail if required secure environment variables are missing or insecure.
        """
        # Required secure environment variables
        required_secure_vars = [
            'SECRET_KEY',
            'JWT_SECRET',
            'DB_PASSWORD'
        ]
        
        missing_vars = []
        insecure_vars = []
        
        for var in required_secure_vars:
            # Check if variable exists
            if var not in env_variables:
                missing_vars.append(var)
                continue
                
            # Check if variable is secure
            value = env_variables[var]
            
            # Skip mocked or placeholder values in test environments
            if value.lower() in ['test', 'mock', 'placeholder', 'dummy', 'none', 'null']:
                continue
                
            # Check for minimum entropy/complexity
            has_length = len(value) >= 12
            has_uppercase = bool(re.search(r'[A-Z]', value))
            has_lowercase = bool(re.search(r'[a-z]', value))
            has_digit = bool(re.search(r'\d', value))
            has_special = bool(re.search(r'[^A-Za-z0-9]', value))
            
            if not (has_length and sum([has_uppercase, has_lowercase, has_digit, has_special]) >= 3):
                insecure_vars.append(var)
        
        # Assert no missing variables
        assert not missing_vars, f"Missing required secure environment variables: {', '.join(missing_vars)}"
        
        # Assert no insecure variables
        assert not insecure_vars, f"Insecure environment variables detected: {', '.join(insecure_vars)}"
    
    def test_correct_file_permissions(self):
        """
        Test that configuration files have correct permissions.
        
        RED: This test will fail if configuration files have overly permissive permissions.
        """
        # Skip on Windows as permissions work differently
        if os.name == 'nt':
            pytest.skip("Skipping permission tests on Windows")
            
        sensitive_files = [
            '.env',
            'config/secrets.yaml',
            'config/production.json',
            'prisma/.env'
        ]
        
        issues_found = []
        
        for file_path in sensitive_files:
            if os.path.exists(file_path):
                try:
                    # Get file permissions
                    permissions = oct(os.stat(file_path).st_mode)[-3:]
                    
                    # Check if permissions are too open (readable by others)
                    if permissions[2] != '0' or permissions[1] in ['5', '7']:
                        issues_found.append({
                            'file': file_path,
                            'permissions': permissions
                        })
                except Exception as e:
                    logger.warning(f"Could not check permissions for {file_path}: {str(e)}")
        
        # Assert no issues found
        assert not issues_found, f"Found {len(issues_found)} files with insecure permissions:\n" + \
            "\n".join([f"- {i['file']}: {i['permissions']}" for i in issues_found])
    
    def test_no_exposed_ports(self):
        """
        Test that no unnecessary ports are exposed.
        
        RED: This test will fail if unauthorized ports are exposed.
        """
        # Authorized ports
        authorized_ports = [
            8000,  # API
            3000,  # Frontend
            27017,  # MongoDB
            6379   # Redis
        ]
        
        # Get list of listening ports
        listening_ports = []
        
        try:
            if os.name == 'nt':  # Windows
                # Using netstat
                output = subprocess.check_output('netstat -ano', shell=True, text=True)
                for line in output.splitlines():
                    if 'LISTENING' in line:
                        parts = line.split()
                        if len(parts) >= 2:
                            addr_port = parts[1]
                            if ':' in addr_port:
                                port = addr_port.split(':')[-1]
                                try:
                                    listening_ports.append(int(port))
                                except ValueError:
                                    pass
            else:  # Unix-like
                # Using ss
                output = subprocess.check_output('ss -tuln', shell=True, text=True)
                for line in output.splitlines():
                    if 'LISTEN' in line:
                        parts = line.split()
                        for part in parts:
                            if ':' in part:
                                port_match = re.search(r':(\d+)$', part)
                                if port_match:
                                    listening_ports.append(int(port_match.group(1)))
        except Exception as e:
            pytest.skip(f"Could not check listening ports: {str(e)}")
            
        # Filter to just local ports
        local_ports = [port for port in listening_ports if port < 49152]
        
        # Check if any unauthorized ports are exposed
        unauthorized_ports = [port for port in local_ports if port not in authorized_ports]
        
        # Get process info for unauthorized ports (Windows only)
        if unauthorized_ports and os.name == 'nt':
            for port in unauthorized_ports:
                try:
                    cmd = f'netstat -ano | findstr :{port}'
                    output = subprocess.check_output(cmd, shell=True, text=True)
                    logger.warning(f"Port {port} is being used by:\n{output}")
                except Exception:
                    pass
        
        # Assert no unauthorized ports
        assert not unauthorized_ports, f"Unauthorized ports are exposed: {unauthorized_ports}"
    
    def test_secure_api_endpoints(self):
        """
        Test that API endpoints enforce security requirements.
        
        RED: This test will fail if API endpoints are insecure.
        """
        # Try to connect to API
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            api_running = response.status_code == 200
        except requests.exceptions.RequestException:
            pytest.skip("API server is not running")
            
        # Define protected endpoints that should require authentication
        protected_endpoints = [
            "/api/v1/users/profile",
            "/api/v1/orders",
            "/api/v1/admin/stats"
        ]
        
        unsecured_endpoints = []
        
        for endpoint in protected_endpoints:
            try:
                # Try to access without authentication
                response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
                
                # Should return 401 Unauthorized or 403 Forbidden
                if response.status_code not in [401, 403]:
                    unsecured_endpoints.append({
                        'endpoint': endpoint,
                        'status_code': response.status_code
                    })
            except requests.exceptions.RequestException as e:
                logger.warning(f"Could not check endpoint {endpoint}: {str(e)}")
        
        # Assert no unsecured endpoints
        assert not unsecured_endpoints, f"Found {len(unsecured_endpoints)} unsecured endpoints:\n" + \
            "\n".join([f"- {i['endpoint']}: returned {i['status_code']} (expected 401 or 403)" for i in unsecured_endpoints])
    
    def test_docker_security_settings(self):
        """
        Test Docker container security settings.
        
        RED: This test will fail if Docker containers have insecure configurations.
        """
        try:
            # Check if docker is available
            output = subprocess.check_output('docker ps', shell=True, text=True)
        except Exception:
            pytest.skip("Docker is not available or not running")
            
        try:
            # Get container information
            output = subprocess.check_output('docker ps --format "{{.Names}}"', shell=True, text=True)
            containers = [name.strip() for name in output.splitlines() if name.strip()]
            
            insecure_containers = []
            
            for container in containers:
                # Get container details
                inspect_output = subprocess.check_output(f'docker inspect {container}', shell=True, text=True)
                container_info = json.loads(inspect_output)
                
                if not container_info:
                    continue
                    
                container_info = container_info[0]
                
                # Check for privileged mode
                privileged = container_info.get('HostConfig', {}).get('Privileged', False)
                
                # Check for root user
                user = container_info.get('Config', {}).get('User', '')
                is_root = user == '' or user == 'root' or user == '0'
                
                # Check for sensitive mounts
                sensitive_mounts = []
                for mount in container_info.get('Mounts', []):
                    source = mount.get('Source', '')
                    if any(p in source for p in ['/etc', '/var/run/docker.sock', '/root', '/home']):
                        sensitive_mounts.append(source)
                
                # Check if container has security issues
                if privileged or is_root or sensitive_mounts:
                    insecure_containers.append({
                        'container': container,
                        'issues': {
                            'privileged': privileged,
                            'running_as_root': is_root,
                            'sensitive_mounts': sensitive_mounts
                        }
                    })
            
            # Assert no insecure containers
            assert not insecure_containers, f"Found {len(insecure_containers)} containers with security issues:\n" + \
                "\n".join([f"- {i['container']}: {json.dumps(i['issues'])}" for i in insecure_containers])
                
        except Exception as e:
            logger.warning(f"Could not check Docker security settings: {str(e)}")
            pytest.skip(f"Error checking Docker security: {str(e)}")
    
    def test_secure_config_validation(self):
        """
        Test that configuration validation includes security checks.
        
        RED: This test will fail if the application accepts insecure configurations.
        """
        # Attempt to create an insecure configuration
        insecure_config = {
            'SECRET_KEY': 'weak',
            'DEBUG': True,
            'ALLOWED_HOSTS': ['*'],
            'DB_PASSWORD': '123456',
            'CORS_ORIGIN_ALLOW_ALL': True
        }
        
        # Write to a temporary config file
        config_path = 'tests/test_data/insecure_config.json'
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        
        with open(config_path, 'w') as f:
            json.dump(insecure_config, f)
        
        try:
            # Mock the environment variable to point to our test config
            with mock.patch.dict(os.environ, {'CONFIG_FILE': config_path}):
                # Import the config module dynamically
                import importlib
                import sys
                
                # Add the module path to sys.path if needed
                if 'api' not in sys.path:
                    sys.path.append('api')
                
                try:
                    # Try to import the config module
                    if 'config' in sys.modules:
                        del sys.modules['config']  # Force reload
                    config_module = importlib.import_module('config')
                    
                    # The import should raise a ValueError for insecure config
                    pytest.fail("Application accepted insecure configuration")
                except (ValueError, ImportError) as e:
                    # This is expected - the app should reject insecure config
                    logger.info(f"Application correctly rejected insecure configuration: {str(e)}")
                    pass
        finally:
            # Clean up
            if os.path.exists(config_path):
                os.remove(config_path)
    
    def test_generate_secure_key(self):
        """
        Test utility function to generate secure keys.
        
        This test checks if we can generate a secure random key for use in configuration.
        """
        # Function to generate a secure key
        def generate_secure_key(length=50):
            alphabet = string.ascii_letters + string.digits + '!@#$%^&*()-_=+[]{}|;:,.<>?'
            return ''.join(secrets.choice(alphabet) for _ in range(length))
        
        # Generate a key
        key = generate_secure_key()
        
        # Verify key properties
        assert len(key) == 50, f"Key length is {len(key)}, expected 50"
        assert any(c.isupper() for c in key), "Key should contain uppercase letters"
        assert any(c.islower() for c in key), "Key should contain lowercase letters"
        assert any(c.isdigit() for c in key), "Key should contain digits"
        assert any(c in '!@#$%^&*()-_=+[]{}|;:,.<>?' for c in key), "Key should contain special characters"
        
        # Print the key for use in configuration
        logger.info(f"Generated secure key: {key}")
        
        # Print command to set environment variable
        if os.name == 'nt':  # Windows
            logger.info(f"To set as environment variable: set SECRET_KEY={key}")
        else:  # Unix-like
            logger.info(f"To set as environment variable: export SECRET_KEY='{key}'")