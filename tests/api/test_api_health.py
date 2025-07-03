import os
import pytest
import time
import subprocess
import requests
from unittest.mock import patch
import socket
import signal

class TestApiHealth:
    """Test suite for API server health and startup."""
    
    @pytest.fixture
    def api_server(self):
        """Fixture to start and stop the API server for testing."""
        # Start the API server as a subprocess
        server_process = None
        port = 8000
        
        # Check if the port is already in use
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(("localhost", port))
            port_available = True
        except OSError:
            port_available = False
        finally:
            sock.close()
        
        if not port_available:
            pytest.skip(f"Port {port} is already in use, skipping test")
        
        # Start API server
        with patch.dict(os.environ, {"SECRET_KEY": "test-secret-key-for-validation"}):
            server_process = subprocess.Popen(
                ["python", "-m", "src.api.main"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to start
            time.sleep(2)
            
            yield server_process
            
            # Cleanup: terminate the server process
            if server_process:
                server_process.send_signal(signal.SIGTERM)
                server_process.wait(timeout=5)
    
    def test_api_starts_successfully(self, api_server):
        """Test that the API server starts successfully."""
        # RED: This will fail if the API server fails to start
        assert api_server.poll() is None, "API server process terminated unexpectedly"
    
    def test_health_endpoint_accessible(self, api_server):
        """Test that the health endpoint is accessible."""
        # RED: This will fail if health endpoint isn't responding
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            assert response.status_code == 200, f"Health endpoint returned status code {response.status_code}"
        except requests.exceptions.ConnectionError:
            pytest.fail("Failed to connect to health endpoint - server not responding")
    
    def test_api_version_endpoint(self, api_server):
        """Test that the API version endpoint returns correct information."""
        # RED: This will fail if API version endpoint isn't working
        try:
            response = requests.get("http://localhost:8000/api/v1/version", timeout=2)
            assert response.status_code == 200, f"API version endpoint returned status code {response.status_code}"
            data = response.json()
            assert "version" in data, "API version response missing 'version' field"
        except requests.exceptions.ConnectionError:
            pytest.fail("Failed to connect to API version endpoint - server not responding")
    
    def test_api_startup_logs(self, api_server):
        """Test that the API server logs contain expected startup messages."""
        # RED: This will fail if expected startup messages are missing
        # Wait for logs to be generated
        time.sleep(1)
        
        # Get stdout from the server process
        stdout, stderr = api_server.communicate(timeout=1)
        api_server.stdout.seek(0)  # Reset stdout position
        
        # Check for expected startup messages
        logs = stdout + stderr
        assert "Application startup" in logs, "Missing startup message in logs"
        assert "Uvicorn running on http://localhost:8000" in logs, "Missing Uvicorn startup message in logs"