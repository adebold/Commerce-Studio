#!/usr/bin/env python3
"""
Test suite for the monitoring services starter script.

Following TDD principles, this test file verifies the functionality of the
start_monitoring_services.py script which orchestrates the monitoring components.
"""

import os
import sys
import json
import time
import signal
import unittest
import threading
from unittest import mock
from datetime import datetime

# Add the parent directory to sys.path to import the script
script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parent_dir = os.path.dirname(script_dir)
sys.path.insert(0, parent_dir)

# Import the script to test
from scripts.start_monitoring_services import MonitoringServices, load_config


class MockAPIServer:
    """Mock class for API server."""
    
    def __init__(self, host=None, port=None, debug=False):
        self.host = host
        self.port = port
        self.debug = debug
        self.running = False
        self.endpoints = {}
    
    def start(self):
        self.running = True
    
    def stop(self):
        self.running = False
    
    def add_endpoint(self, path, handler):
        self.endpoints[path] = handler


class MockDatabaseChecker:
    """Mock class for database checker."""
    
    def __init__(self, db_type=None, connection_params=None):
        self.db_type = db_type
        self.connection_params = connection_params
        self.check_count = 0
    
    def check_all(self):
        self.check_count += 1
        if self.check_count % 3 == 0:
            # Simulate occasional database issues
            return {
                "status": "WARN",
                "issues": ["Slow query detected"],
                "recommendations": ["Optimize database indexes"]
            }
        return {
            "status": "OK",
            "issues": [],
            "recommendations": []
        }


class TestMonitoringServices(unittest.TestCase):
    """Test cases for MonitoringServices class."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create a test configuration
        self.test_config = {
            "api_server": {
                "host": "127.0.0.1",
                "port": 9000,
                "debug": True
            },
            "database": {
                "type": "postgresql",
                "host": "test-db.example.com",
                "port": 5432,
                "user": "test_user",
                "password": "test_password",
                "database": "test_db"
            },
            "check_interval": 5
        }
        
        # Set up mocks
        self.mock_api_server_patcher = mock.patch(
            'scripts.start_monitoring_services.start_api.APIServer',
            MockAPIServer
        )
        self.mock_api_server = self.mock_api_server_patcher.start()
        
        self.mock_db_checker_patcher = mock.patch(
            'scripts.start_monitoring_services.database_check.DatabaseChecker',
            MockDatabaseChecker
        )
        self.mock_db_checker = self.mock_db_checker_patcher.start()
        
        self.mock_subprocess_run_patcher = mock.patch(
            'scripts.start_monitoring_services.subprocess.run'
        )
        self.mock_subprocess_run = self.mock_subprocess_run_patcher.start()
        
        # Configure mock subprocess response
        mock_process = mock.MagicMock()
        mock_process.stdout = """
        📈 Status Update (14:35:04):
          - Active alerts: 0
          - Total alerts: 12
          - Uptime: 3300s
        ⚠️  Active alerts by level:
            - INFO: 0
            - CRITICAL: 0
        """
        self.mock_subprocess_run.return_value = mock_process
    
    def tearDown(self):
        """Tear down test fixtures."""
        self.mock_api_server_patcher.stop()
        self.mock_db_checker_patcher.stop()
        self.mock_subprocess_run_patcher.stop()
    
    def test_init_with_config(self):
        """Test initialization with provided configuration."""
        services = MonitoringServices(self.test_config)
        
        # Verify that the configuration was stored correctly
        self.assertEqual(services.config, self.test_config)
        self.assertEqual(services.config["api_server"]["port"], 9000)
        self.assertEqual(services.config["database"]["type"], "postgresql")
        self.assertEqual(services.config["check_interval"], 5)
        
        # Verify that the services dictionary is empty
        self.assertEqual(len(services.services), 0)
        
        # Verify that the running flag is False
        self.assertFalse(services.running)
    
    def test_init_with_default_config(self):
        """Test initialization with default configuration."""
        services = MonitoringServices()
        
        # Verify that a default configuration was created
        self.assertIsNotNone(services.config)
        self.assertIn("api_server", services.config)
        self.assertIn("database", services.config)
        self.assertIn("check_interval", services.config)
        
        # Verify default values
        self.assertEqual(services.config["api_server"]["port"], 8000)
        self.assertEqual(services.config["database"]["type"], "mysql")
    
    def test_start_and_stop(self):
        """Test starting and stopping all services."""
        services = MonitoringServices(self.test_config)
        
        # Start services
        services.start()
        
        # Verify that services are running
        self.assertTrue(services.running)
        self.assertIn("api_server", services.services)
        self.assertIn("db_checker", services.services)
        self.assertIn("api_server", services.threads)
        self.assertIn("db_checker", services.threads)
        self.assertIn("status_updater", services.threads)
        
        # Stop services
        services.stop()
        
        # Verify that services are stopped
        self.assertFalse(services.running)
        self.assertTrue(services.shutdown_event.is_set())
    
    def test_signal_handler(self):
        """Test signal handler for graceful shutdown."""
        services = MonitoringServices(self.test_config)
        services.start()
        
        # Call signal handler
        services._signal_handler(signal.SIGTERM, None)
        
        # Verify that services are stopped
        self.assertFalse(services.running)
        self.assertTrue(services.shutdown_event.is_set())
    
    def test_api_server_initialization(self):
        """Test API server initialization."""
        services = MonitoringServices(self.test_config)
        services.start()
        
        # Verify API server configuration
        api_server = services.services["api_server"]
        self.assertEqual(api_server.host, "127.0.0.1")
        self.assertEqual(api_server.port, 9000)
        self.assertTrue(api_server.debug)
        
        # Verify that the database status endpoint was added
        self.assertIn("/database/status", api_server.endpoints)
        
        # Clean up
        services.stop()
    
    def test_database_check_service_initialization(self):
        """Test database check service initialization."""
        services = MonitoringServices(self.test_config)
        services.start()
        
        # Verify database checker configuration
        db_checker = services.services["db_checker"]
        self.assertEqual(db_checker.db_type, "postgresql")
        self.assertEqual(db_checker.connection_params["host"], "test-db.example.com")
        self.assertEqual(db_checker.connection_params["port"], 5432)
        
        # Clean up
        services.stop()
    
    def test_handle_db_status(self):
        """Test database status handler."""
        services = MonitoringServices(self.test_config)
        
        # Create a mock handler
        mock_handler = mock.MagicMock()
        mock_handler.wfile = mock.MagicMock()
        
        # Call the handler with OK status
        with mock.patch.object(MockDatabaseChecker, 'check_all', 
                              return_value={"status": "OK", "issues": [], "recommendations": []}):
            services._handle_db_status(mock_handler, self.test_config["database"])
            
            # Verify that a 200 response was sent
            mock_handler.send_response.assert_called_with(200)
            mock_handler.send_header.assert_called_with('Content-type', 'application/json')
            mock_handler.end_headers.assert_called_once()
            mock_handler.wfile.write.assert_called_once()
        
        # Call the handler with FAIL status
        mock_handler.reset_mock()
        with mock.patch.object(MockDatabaseChecker, 'check_all', 
                              return_value={"status": "FAIL", "issues": ["Connection error"], 
                                           "recommendations": ["Check credentials"]}):
            services._handle_db_status(mock_handler, self.test_config["database"])
            
            # Verify that a 500 response was sent
            mock_handler.send_response.assert_called_with(500)
    
    def test_check_monitoring_status(self):
        """Test checking monitoring status."""
        services = MonitoringServices(self.test_config)
        
        # Configure mock to indicate zero critical alerts
        self.mock_subprocess_run.return_value.stdout = """
        📈 Status Update (14:35:04):
          - Active alerts: 1
          - Total alerts: 12
          - Uptime: 3300s
        ⚠️  Active alerts by level:
            - INFO: 1
            - CRITICAL: 0
        """
        
        # Call the method
        critical_count = services.check_monitoring_status()
        
        # Verify that the subprocess was called with the right arguments
        self.mock_subprocess_run.assert_called_once()
        args, kwargs = self.mock_subprocess_run.call_args
        self.assertIn("monitoring-setup.py", args[0][1])
        self.assertIn("--check", args[0][2])
        
        # Verify the result
        self.assertEqual(critical_count, 0)
        
        # Test with critical alerts
        self.mock_subprocess_run.reset_mock()
        self.mock_subprocess_run.return_value.stdout = """
        📈 Status Update (14:35:04):
          - Active alerts: 3
          - Total alerts: 12
          - Uptime: 3300s
        ⚠️  Active alerts by level:
            - INFO: 1
            - CRITICAL: 2
        """
        
        critical_count = services.check_monitoring_status()
        self.assertEqual(critical_count, 1)  # One line with "CRITICAL:" in it
    
    def test_load_config(self):
        """Test loading configuration from a file."""
        # Create a temporary config file
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp:
            json.dump(self.test_config, temp)
            temp_name = temp.name
        
        try:
            # Load the config
            config = load_config(temp_name)
            
            # Verify that the config was loaded correctly
            self.assertEqual(config, self.test_config)
            
            # Test with invalid file
            config = load_config("nonexistent_file.json")
            self.assertIsNone(config)
        finally:
            # Clean up
            os.unlink(temp_name)


class TestMonitoringServicesIntegration(unittest.TestCase):
    """Integration tests for MonitoringServices."""
    
    @mock.patch('scripts.start_monitoring_services.start_api.APIServer', MockAPIServer)
    @mock.patch('scripts.start_monitoring_services.database_check.DatabaseChecker', MockDatabaseChecker)
    @mock.patch('scripts.start_monitoring_services.subprocess.run')
    def test_full_service_lifecycle(self, mock_subprocess_run):
        """Test the full lifecycle of the monitoring services."""
        # Configure mock
        mock_process = mock.MagicMock()
        mock_process.stdout = """
        📈 Status Update (14:35:04):
          - Active alerts: 0
          - Total alerts: 12
          - Uptime: 3300s
        ⚠️  Active alerts by level:
            - INFO: 0
            - CRITICAL: 0
        """
        mock_subprocess_run.return_value = mock_process
        
        # Create a configuration
        config = {
            "api_server": {
                "host": "localhost",
                "port": 8000,
                "debug": False
            },
            "database": {
                "type": "mysql",
                "host": "localhost",
                "port": 3306,
                "user": "root",
                "password": "password",
                "database": "test"
            },
            "check_interval": 1
        }
        
        # Create and start services
        services = MonitoringServices(config)
        services.start()
        
        # Allow services to run for a short time
        time.sleep(0.1)
        
        # Verify that services are running
        self.assertTrue(services.running)
        self.assertIn("api_server", services.services)
        self.assertIn("db_checker", services.services)
        
        # Check monitoring status
        critical_count = services.check_monitoring_status()
        self.assertEqual(critical_count, 0)
        
        # Stop services
        services.stop()
        
        # Verify that services are stopped
        self.assertFalse(services.running)
        self.assertTrue(services.shutdown_event.is_set())


if __name__ == '__main__':
    unittest.main()