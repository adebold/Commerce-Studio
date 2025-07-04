#!/usr/bin/env python3
"""
Integration tests for the monitoring system components.
Tests the API server and database check scripts working together.
"""

import unittest
import json
import sys
import time
import threading
import requests
import importlib.util
import os
import subprocess
from unittest.mock import patch, MagicMock, call

# Import the modules directly from the scripts directory
script_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scripts")
api_script_path = os.path.join(script_dir, "start_api.py")
db_script_path = os.path.join(script_dir, "database_check.py")

spec_api = importlib.util.spec_from_file_location("start_api", api_script_path)
start_api = importlib.util.module_from_spec(spec_api)
spec_api.loader.exec_module(start_api)

spec_db = importlib.util.spec_from_file_location("database_check", db_script_path)
database_check = importlib.util.module_from_spec(spec_db)
spec_db.loader.exec_module(database_check)


class TestMonitoringIntegration(unittest.TestCase):
    """Test the monitoring system components working together."""

    @classmethod
    def setUpClass(cls):
        """Set up test environment by starting the API server."""
        # Configure a test server on a different port to avoid conflicts
        cls.test_port = 8585
        cls.test_host = "localhost"
        cls.api_url = f"http://{cls.test_host}:{cls.test_port}"
        
        # Start the API server in a separate thread
        cls.server = start_api.APIServer(host=cls.test_host, port=cls.test_port)
        cls.server_thread = threading.Thread(target=cls.server.start)
        cls.server_thread.daemon = True
        cls.server_thread.start()
        
        # Wait for server to start
        time.sleep(1)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment by stopping the API server."""
        cls.server.stop()
        cls.server_thread.join(timeout=2)
    
    def test_health_endpoint_success(self):
        """Test that the health endpoint returns OK status."""
        response = requests.get(f"{self.api_url}/health")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("uptime", data)
        self.assertIn("timestamp", data)
    
    def test_metrics_endpoint(self):
        """Test that the metrics endpoint returns system metrics."""
        response = requests.get(f"{self.api_url}/metrics")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("cpu_usage", data)
        self.assertIn("memory_usage", data)
        self.assertIn("disk_usage", data)
    
    @patch.object(database_check.DatabaseChecker, "check_all")
    def test_database_status_endpoint(self, mock_check_all):
        """Test that the database status endpoint integrates with database check."""
        # Mock the database check to return success
        mock_check_all.return_value = {
            "status": "OK",
            "issues": [],
            "recommendations": [],
            "metrics": {"connection_time": 0.01, "query_time": 0.05}
        }
        
        # Add database check handler to API server
        self.server.add_endpoint(
            "/database/status", 
            lambda handler: self._handle_db_status(handler, "mysql", {"host": "localhost"})
        )
        
        # Test the endpoint
        response = requests.get(f"{self.api_url}/database/status")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "OK")
        self.assertEqual(len(data["issues"]), 0)
        self.assertIn("metrics", data)
    
    @patch.object(database_check.DatabaseChecker, "check_all")
    def test_database_warning_propagation(self, mock_check_all):
        """Test that database warnings propagate to the API response."""
        # Mock the database check to return a warning
        mock_check_all.return_value = {
            "status": "WARNING",
            "issues": ["Slow query: 0.2s"],
            "recommendations": ["Optimize your queries"],
            "metrics": {"connection_time": 0.01, "query_time": 0.2}
        }
        
        # Test the endpoint
        response = requests.get(f"{self.api_url}/database/status")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "WARNING")
        self.assertEqual(len(data["issues"]), 1)
        self.assertEqual(len(data["recommendations"]), 1)
    
    @patch.object(database_check.DatabaseChecker, "check_all")
    def test_database_failure_propagation(self, mock_check_all):
        """Test that database failures propagate to the API response."""
        # Mock the database check to return a failure
        mock_check_all.return_value = {
            "status": "FAIL",
            "issues": ["Connection failed: Could not connect to database"],
            "recommendations": ["Check database credentials and connectivity"],
            "metrics": {}
        }
        
        # Test the endpoint
        response = requests.get(f"{self.api_url}/database/status")
        self.assertEqual(response.status_code, 500)
        
        data = response.json()
        self.assertEqual(data["status"], "FAIL")
        self.assertEqual(len(data["issues"]), 1)
        self.assertEqual(len(data["recommendations"]), 1)
    
    def test_monitoring_resolution(self):
        """
        Test that both components working together can resolve monitoring alerts.
        
        This test simulates the monitoring system by checking both the API health
        and database status, verifying that when both are working properly, the
        CRITICAL alerts would be resolved.
        """
        # First check API health
        health_response = requests.get(f"{self.api_url}/health")
        self.assertEqual(health_response.status_code, 200)
        health_data = health_response.json()
        
        # Then check database status with a mocked database
        with patch.object(database_check.DatabaseChecker, "check_all") as mock_check_all:
            mock_check_all.return_value = {
                "status": "OK",
                "issues": [],
                "recommendations": [],
                "metrics": {"connection_time": 0.01, "query_time": 0.05}
            }
            
            db_response = requests.get(f"{self.api_url}/database/status")
            self.assertEqual(db_response.status_code, 200)
            db_data = db_response.json()
        
        # Verify both components report OK status
        self.assertEqual(health_data["status"], "ok")
        self.assertEqual(db_data["status"], "OK")
        
        # This combination would resolve the CRITICAL alerts in the monitoring system
        # since both the API health check and database connectivity check pass
    
    def _handle_db_status(self, handler, db_type, connection_params):
        """Helper method to handle database status requests."""
        checker = database_check.DatabaseChecker(db_type, connection_params)
        results = checker.check_all()
        
        if results["status"] == "FAIL":
            handler.send_response(500)
        else:
            handler.send_response(200)
        
        handler.send_header('Content-type', 'application/json')
        handler.end_headers()
        handler.wfile.write(json.dumps(results).encode())


class TestMonitoringCLI(unittest.TestCase):
    """Test the command-line interfaces of the monitoring components."""
    
    def test_api_server_cli(self):
        """Test the API server CLI interface."""
        # Test with --help to verify command works without starting server
        process = subprocess.Popen(
            [sys.executable, api_script_path, "--help"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0)
        
        # Verify help text contains expected options
        output = stdout.decode()
        self.assertIn("--port", output)
        self.assertIn("--host", output)
        self.assertIn("--daemon", output)
    
    def test_database_check_cli(self):
        """Test the database check CLI interface."""
        # Test with --help to verify command works
        process = subprocess.Popen(
            [sys.executable, db_script_path, "--help"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0)
        
        # Verify help text contains expected options
        output = stdout.decode()
        self.assertIn("--type", output)
        self.assertIn("--host", output)
        self.assertIn("--json", output)


if __name__ == "__main__":
    unittest.main()