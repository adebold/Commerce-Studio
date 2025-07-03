"""
Test to verify the fix for URL construction in health checks.

This test specifically focuses on the _check_api_health method in SystemMonitor
to ensure it properly preserves port numbers when constructing health check URLs.
"""

import unittest
from unittest.mock import patch, MagicMock
from urllib.parse import urljoin
import importlib.util
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Import the module using spec since it has a dash in the name
spec = importlib.util.spec_from_file_location(
    "monitoring_setup",
    str(Path(__file__).parent.parent.parent / "scripts" / "monitoring-setup.py")
)
monitoring_setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitoring_setup)

# Get the classes from the module
SystemMonitor = monitoring_setup.SystemMonitor
HealthChecker = monitoring_setup.HealthChecker
AlertManager = monitoring_setup.AlertManager


class TestHealthURLFix(unittest.TestCase):
    """Test the fix for health check URL construction."""

    def test_urljoin_behavior_with_various_urls(self):
        """Test urljoin behavior with different URL formats to understand edge cases."""
        from urllib.parse import urljoin
        
        # Basic case - with port
        base_url1 = "http://localhost:8000"
        self.assertEqual(urljoin(base_url1, "/health"), "http://localhost:8000/health")
        self.assertEqual(urljoin(base_url1, "health"), "http://localhost:8000/health")
        
        # With path in base URL
        base_url2 = "http://localhost:8000/api/v1"
        self.assertEqual(urljoin(base_url2, "/health"), "http://localhost:8000/health",
                         "Leading slash replaces entire path in base URL")
        self.assertEqual(urljoin(base_url2, "health"), "http://localhost:8000/api/health",
                         "No leading slash appends to parent directory, not the full path")
        
        # With trailing slash in base URL
        base_url3 = "http://localhost:8000/"
        self.assertEqual(urljoin(base_url3, "/health"), "http://localhost:8000/health")
        self.assertEqual(urljoin(base_url3, "health"), "http://localhost:8000/health")
    
    @patch.object(HealthChecker, "check_service_health")
    def test_check_api_health_preserves_port(self, mock_check_service):
        """Test that _check_api_health preserves port numbers in URLs."""
        # Setup mocks
        mock_check_service.return_value = {"healthy": True}
        
        # Create a partial mock of AlertManager to avoid actual alerts
        with patch.object(AlertManager, 'create_alert'):
            # Create a monitoring config
            mock_config = MagicMock()
            
            # Create a monitoring system with mock config
            monitor = SystemMonitor(mock_config)
            
            # Set a test environment with a port in the URL
            monitor.env_config = {"api_url": "http://localhost:8000"}
            
            # Execute the health check
            monitor._check_api_health()
            
            # Verify the correct URL was passed to the health checker
            # This will fail with the current implementation but pass after our fix
            mock_check_service.assert_called_once()
            url_used = mock_check_service.call_args[0][0]
            self.assertEqual(url_used, "http://localhost:8000/health",
                             "The health check URL should preserve the port number")


if __name__ == "__main__":
    unittest.main()