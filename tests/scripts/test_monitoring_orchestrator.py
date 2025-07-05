#!/usr/bin/env python3
"""
Unit tests for the monitoring services orchestrator.

Tests the ServiceManager class in start_monitoring_services.py, ensuring it:
- Properly loads configuration
- Starts and stops services correctly
- Manages service lifecycle
- Handles signals properly
- Reports service status accurately
"""

import os
import sys
import json
import time
import signal
import unittest
import threading
from unittest import mock
from pathlib import Path

# Adjust path to import the module under test
script_dir = Path(__file__).parent.parent.parent / "scripts"
sys.path.insert(0, str(script_dir))

# Import the module under test
import start_monitoring_services


class MockService:
    """Mock service class for testing."""
    
    def __init__(self, name, **kwargs):
        self.name = name
        self.running = False
        self.config = kwargs
        self.start_called = False
        self.stop_called = False
    
    def start(self):
        self.running = True
        self.start_called = True
    
    def stop(self):
        self.running = False
        self.stop_called = True
    
    def get_status(self):
        return {
            "running": self.running,
            "name": self.name,
            "config": self.config
        }


class TestServiceManager(unittest.TestCase):
    """Test the ServiceManager class."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create a temporary config file
        self.config_path = "test_config.json"
        self.test_config = {
            "api_server": {
                "enabled": True,
                "host": "testhost",
                "port": 9000,
                "debug": True
            },
            "db_checker": {
                "enabled": True,
                "interval": 30,
                "debug": True,
                "config_path": "test_db_config.json"
            },
            "general": {
                "status_interval": 10,
                "alert_check_interval": 30
            }
        }
        
        with open(self.config_path, 'w') as f:
            json.dump(self.test_config, f)
        
        # Mock import_module to avoid actual imports
        self.import_module_patcher = mock.patch.object(
            start_monitoring_services.ServiceManager, 
            '_import_module'
        )
        self.mock_import_module = self.import_module_patcher.start()
        
        # Mock os.path.exists to return True for our config
        self.exists_patcher = mock.patch('os.path.exists')
        self.mock_exists = self.exists_patcher.start()
        self.mock_exists.return_value = True
        
        # Mock threading.Thread to avoid actual thread creation
        self.thread_patcher = mock.patch('threading.Thread')
        self.mock_thread = self.thread_patcher.start()
        
        # Create mocks for the API server and DB checker
        self.mock_api_module = mock.Mock()
        self.mock_api_server = MockService("api_server")
        self.mock_api_module.APIServer.return_value = self.mock_api_server
        
        self.mock_db_module = mock.Mock()
        self.mock_db_checker = MockService("db_checker")
        self.mock_db_module.DatabaseChecker.return_value = self.mock_db_checker
        self.mock_db_module.load_config_from_file.return_value = {
            "databases": {
                "test-db": {
                    "type": "redis",
                    "host": "localhost",
                    "port": 6379
                }
            }
        }
        self.mock_db_module.DatabaseConfig = lambda db_type, settings: {
            "type": db_type,
            "settings": settings
        }
        
        # Set up import_module to return our mocks
        def side_effect(module_name, file_path):
            if "api_server" in module_name:
                return self.mock_api_module
            elif "db_checker" in module_name:
                return self.mock_db_module
            else:
                return mock.Mock()
        
        self.mock_import_module.side_effect = side_effect
    
    def tearDown(self):
        """Tear down test fixtures."""
        # Remove the test config file
        if os.path.exists(self.config_path):
            os.unlink(self.config_path)
        
        # Stop patchers
        self.import_module_patcher.stop()
        self.exists_patcher.stop()
        self.thread_patcher.stop()
    
    def test_init_with_config(self):
        """Test initializing with a config file."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path,
            debug=True
        )
        
        # Verify the config was loaded
        self.assertEqual(manager.config["api_server"]["host"], "testhost")
        self.assertEqual(manager.config["api_server"]["port"], 9000)
        self.assertEqual(manager.config["db_checker"]["interval"], 30)
        self.assertEqual(manager.debug, True)
    
    def test_init_without_config(self):
        """Test initializing without a config file."""
        # Make os.path.exists return False for this test
        self.mock_exists.return_value = False
        
        manager = start_monitoring_services.ServiceManager()
        
        # Verify default config was used
        self.assertEqual(manager.config["api_server"]["host"], "localhost")
        self.assertEqual(manager.config["api_server"]["port"], 8000)
        self.assertEqual(manager.config["db_checker"]["interval"], 60)
    
    def test_start_and_stop_services(self):
        """Test starting and stopping services."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Start services
        manager.start()
        
        # Verify API server was started
        self.mock_api_module.APIServer.assert_called_once_with(
            host="testhost",
            port=9000,
            debug=True
        )
        self.assertTrue(self.mock_api_server.start_called)
        
        # Verify DB checker was started
        self.mock_db_module.DatabaseChecker.assert_called_once_with(
            interval=30,
            debug=True
        )
        self.assertTrue(self.mock_db_checker.start_called)
        
        # Verify services were stored
        self.assertEqual(manager.services["api_server"], self.mock_api_server)
        self.assertEqual(manager.services["db_checker"], self.mock_db_checker)
        
        # Verify status thread was started
        self.mock_thread.assert_called_once()
        self.mock_thread.return_value.start.assert_called_once()
        
        # Verify manager is running
        self.assertTrue(manager.running)
        
        # Stop services
        manager.stop()
        
        # Verify services were stopped
        self.assertTrue(self.mock_api_server.stop_called)
        self.assertTrue(self.mock_db_checker.stop_called)
        
        # Verify manager is not running
        self.assertFalse(manager.running)
    
    def test_start_with_disabled_services(self):
        """Test starting with disabled services."""
        # Modify config to disable services
        test_config = self.test_config.copy()
        test_config["api_server"]["enabled"] = False
        test_config["db_checker"]["enabled"] = False
        
        with open(self.config_path, 'w') as f:
            json.dump(test_config, f)
        
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Start services
        manager.start()
        
        # Verify API server was not started
        self.mock_api_module.APIServer.assert_not_called()
        
        # Verify DB checker was not started
        self.mock_db_module.DatabaseChecker.assert_not_called()
        
        # Verify services were not stored
        self.assertNotIn("api_server", manager.services)
        self.assertNotIn("db_checker", manager.services)
        
        # Verify status thread was still started
        self.mock_thread.assert_called_once()
        
        # Stop services
        manager.stop()
    
    def test_get_service(self):
        """Test getting a service by name."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Start services
        manager.start()
        
        # Verify get_service returns the correct service
        self.assertEqual(manager.get_service("api_server"), self.mock_api_server)
        self.assertEqual(manager.get_service("db_checker"), self.mock_db_checker)
        
        # Verify get_service returns None for unknown service
        self.assertIsNone(manager.get_service("unknown"))
        
        # Stop services
        manager.stop()
    
    def test_get_status(self):
        """Test getting service status."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Start services
        manager.start()
        
        # Set up mock status for db_checker
        self.mock_db_checker.get_status = mock.Mock(return_value={
            "databases": ["redis", "mysql"],
            "next_check_in": 30,
            "last_check_results": {
                "redis": {
                    "status": True,
                    "timestamp": "2023-01-01 12:00:00"
                },
                "mysql": {
                    "status": False,
                    "error": "Connection failed",
                    "timestamp": "2023-01-01 12:00:00"
                }
            }
        })
        
        # Get status
        status = manager.get_status()
        
        # Verify status contains API server info
        self.assertIn("api_server", status["services"])
        self.assertTrue(status["services"]["api_server"]["running"])
        
        # Verify status contains DB checker info
        self.assertIn("db_checker", status["services"])
        self.assertTrue(status["services"]["db_checker"]["running"])
        self.assertEqual(status["services"]["db_checker"]["databases"], ["redis", "mysql"])
        
        # Verify status contains DB results
        self.assertIn("results", status["services"]["db_checker"])
        self.assertTrue(status["services"]["db_checker"]["results"]["redis"]["status"])
        self.assertFalse(status["services"]["db_checker"]["results"]["mysql"]["status"])
        self.assertEqual(
            status["services"]["db_checker"]["results"]["mysql"]["error"],
            "Connection failed"
        )
        
        # Stop services
        manager.stop()
    
    @mock.patch('signal.signal')
    def test_signal_handler(self, mock_signal):
        """Test signal handler."""
        manager = start_monitoring_services.ServiceManager()
        
        # Verify signal handlers were registered
        mock_signal.assert_any_call(signal.SIGINT, manager._signal_handler)
        mock_signal.assert_any_call(signal.SIGTERM, manager._signal_handler)
        
        # Test the signal handler directly
        with mock.patch.object(manager, 'stop') as mock_stop:
            manager._signal_handler(signal.SIGINT, None)
            mock_stop.assert_called_once()
    
    def test_status_check_loop(self):
        """Test the status check loop."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Start services
        manager.start()
        
        # Mock report_service_status and check_alerts
        with mock.patch.object(manager, '_report_service_status') as mock_report:
            with mock.patch.object(manager, '_check_alerts') as mock_check_alerts:
                with mock.patch.object(threading.Event, 'wait') as mock_wait:
                    # Set up wait to return immediately once, then True to exit loop
                    mock_wait.side_effect = [False, True]
                    
                    # Run the status check loop
                    manager._status_check_loop()
                    
                    # Verify report_service_status was called
                    mock_report.assert_called()
                    
                    # Verify check_alerts was called
                    mock_check_alerts.assert_called()
        
        # Stop services
        manager.stop()
    
    def test_check_alerts(self):
        """Test checking alerts."""
        manager = start_monitoring_services.ServiceManager()
        
        # Mock the import_module and monitor_module
        mock_monitor_module = mock.Mock()
        mock_monitor_module.check_alerts.return_value = [
            {"level": "CRITICAL", "message": "Test alert 1"},
            {"level": "INFO", "message": "Test alert 2"}
        ]
        
        with mock.patch.object(manager, '_import_module', return_value=mock_monitor_module):
            # Check alerts
            manager._check_alerts()
            
            # Verify check_alerts was called
            mock_monitor_module.check_alerts.assert_called_once()
    
    def test_report_service_status_with_no_services(self):
        """Test reporting service status with no services."""
        manager = start_monitoring_services.ServiceManager()
        
        # Get status
        status = manager._report_service_status()
        
        # Verify status contains empty services
        self.assertIn("services", status)
        self.assertIn("api_server", status["services"])
        self.assertFalse(status["services"]["api_server"]["running"])
        self.assertIn("db_checker", status["services"])
        self.assertFalse(status["services"]["db_checker"]["running"])
    
    def test_import_module_error(self):
        """Test handling import module errors."""
        # Restore the real _import_module method
        self.import_module_patcher.stop()
        
        manager = start_monitoring_services.ServiceManager()
        
        # Test with non-existent module
        with self.assertRaises(ImportError):
            manager._import_module("nonexistent_module", "/path/to/nonexistent/module.py")
        
        # Restart the patcher for other tests
        self.import_module_patcher = mock.patch.object(
            start_monitoring_services.ServiceManager,
            '_import_module'
        )
        self.mock_import_module = self.import_module_patcher.start()
    
    def test_error_starting_api_server(self):
        """Test handling errors when starting API server."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Make APIServer constructor raise an exception
        self.mock_api_module.APIServer.side_effect = Exception("Test error")
        
        # Start services - should not raise exception
        manager.start()
        
        # Verify API server was not added to services
        self.assertNotIn("api_server", manager.services)
        
        # Stop services
        manager.stop()
    
    def test_error_starting_db_checker(self):
        """Test handling errors when starting database checker."""
        manager = start_monitoring_services.ServiceManager(
            config_path=self.config_path
        )
        
        # Make DatabaseChecker constructor raise an exception
        self.mock_db_module.DatabaseChecker.side_effect = Exception("Test error")
        
        # Start services - should not raise exception
        manager.start()
        
        # Verify DB checker was not added to services
        self.assertNotIn("db_checker", manager.services)
        
        # Stop services
        manager.stop()
    
    def test_start_when_already_running(self):
        """Test starting services when already running."""
        manager = start_monitoring_services.ServiceManager()
        
        # Start services
        manager.start()
        
        # Reset mocks
        self.mock_api_module.APIServer.reset_mock()
        self.mock_db_module.DatabaseChecker.reset_mock()
        
        # Start services again
        manager.start()
        
        # Verify services were not started again
        self.mock_api_module.APIServer.assert_not_called()
        self.mock_db_module.DatabaseChecker.assert_not_called()
        
        # Stop services
        manager.stop()
    
    def test_stop_when_not_running(self):
        """Test stopping services when not running."""
        manager = start_monitoring_services.ServiceManager()
        
        # Stop services without starting
        manager.stop()
        
        # Verify no error occurs
        self.assertFalse(manager.running)


if __name__ == '__main__':
    unittest.main()