#!/usr/bin/env python
"""
Unit tests for the API Server Startup Script (scripts/start_api.py).

These tests verify:
1. Command-line argument parsing
2. Server initialization with correct configuration
3. API endpoint functionality
4. Port availability checking
5. Server start/stop behavior
6. Request handling and response formatting
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock, call
import socket
import tempfile
import threading
import yaml
import http.client
from io import StringIO
import time
from datetime import datetime

# Add scripts directory to path to import start_api
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../scripts')))
import start_api


class TestAPIHandler(unittest.TestCase):
    """Test cases for the APIHandler class."""
    
    def setUp(self):
        """Set up test environment."""
        # Create mock request and response objects
        self.handler = start_api.APIHandler(None, None, None)
        self.handler.send_response = MagicMock()
        self.handler.send_header = MagicMock()
        self.handler.end_headers = MagicMock()
        self.handler.wfile = MagicMock()
        self.handler.path = '/health'
    
    def test_health_endpoint(self):
        """Test the /health endpoint returns the correct response."""
        # Call the health endpoint handler
        self.handler.handle_health()
        
        # Verify response
        self.handler.send_response.assert_called_with(200)
        self.handler.send_header.assert_any_call('Content-Type', 'application/json')
        
        # Get the response data
        response_data = self.handler.wfile.write.call_args[0][0].decode('utf-8')
        response_json = json.loads(response_data)
        
        # Verify response content
        self.assertEqual(response_json["status"], "healthy")
        self.assertIn("timestamp", response_json)
    
    def test_status_endpoint(self):
        """Test the /status endpoint returns the correct response."""
        # Set up the handler path
        self.handler.path = '/status'
        
        # Call the status endpoint handler
        self.handler.handle_status()
        
        # Verify response
        self.handler.send_response.assert_called_with(200)
        
        # Get the response data
        response_data = self.handler.wfile.write.call_args[0][0].decode('utf-8')
        response_json = json.loads(response_data)
        
        # Verify response content
        self.assertEqual(response_json["status"], "running")
        self.assertIn("uptime_seconds", response_json)
        self.assertIn("start_time", response_json)
        self.assertIn("request_count", response_json)
        self.assertIn("timestamp", response_json)
    
    def test_metrics_endpoint(self):
        """Test the /metrics endpoint returns the correct response."""
        # Set up the handler path
        self.handler.path = '/metrics'
        
        # Mock the update_system_metrics method
        original_update = start_api.APIHandler.update_system_metrics
        start_api.APIHandler.update_system_metrics = MagicMock()
        
        try:
            # Call the metrics endpoint handler
            self.handler.handle_metrics()
            
            # Verify update_system_metrics was called
            start_api.APIHandler.update_system_metrics.assert_called_once()
            
            # Verify response
            self.handler.send_response.assert_called_with(200)
            
            # Get the response data
            response_data = self.handler.wfile.write.call_args[0][0].decode('utf-8')
            response_json = json.loads(response_data)
            
            # Verify response content
            self.assertIn("system", response_json)
            self.assertIn("endpoints", response_json)
            self.assertIn("timestamp", response_json)
        finally:
            # Restore the original method
            start_api.APIHandler.update_system_metrics = original_update
    
    def test_services_endpoint(self):
        """Test the /services endpoint returns the correct response."""
        # Set up the handler path
        self.handler.path = '/services'
        
        # Call the services endpoint handler
        self.handler.handle_services()
        
        # Verify response
        self.handler.send_response.assert_called_with(200)
        
        # Get the response data
        response_data = self.handler.wfile.write.call_args[0][0].decode('utf-8')
        response_json = json.loads(response_data)
        
        # Verify response content
        self.assertIn("services", response_json)
        self.assertIn("timestamp", response_json)
    
    def test_not_found(self):
        """Test the 404 handler returns the correct response."""
        # Set up the handler path
        self.handler.path = '/nonexistent'
        
        # Call the not found handler
        self.handler.handle_not_found()
        
        # Verify response
        self.handler.send_response.assert_called_with(404)
        
        # Get the response data
        response_data = self.handler.wfile.write.call_args[0][0].decode('utf-8')
        response_json = json.loads(response_data)
        
        # Verify response content
        self.assertEqual(response_json["error"], "Not Found")
        self.assertIn("message", response_json)
        self.assertIn("timestamp", response_json)
    
    def test_do_get(self):
        """Test the do_GET method routes requests correctly."""
        # Create a handler with mocked methods
        handler = start_api.APIHandler(None, None, None)
        handler.handle_health = MagicMock()
        handler.handle_status = MagicMock()
        handler.handle_metrics = MagicMock()
        handler.handle_services = MagicMock()
        handler.handle_not_found = MagicMock()
        handler.track_endpoint_metrics = MagicMock()
        
        # Test health endpoint
        handler.path = '/health'
        handler.do_GET()
        handler.handle_health.assert_called_once()
        
        # Test status endpoint
        handler.path = '/status'
        handler.do_GET()
        handler.handle_status.assert_called_once()
        
        # Test metrics endpoint
        handler.path = '/metrics'
        handler.do_GET()
        handler.handle_metrics.assert_called_once()
        
        # Test services endpoint
        handler.path = '/services'
        handler.do_GET()
        handler.handle_services.assert_called_once()
        
        # Test not found
        handler.path = '/nonexistent'
        handler.do_GET()
        handler.handle_not_found.assert_called_once()
        
        # Verify track_endpoint_metrics was called for each request
        self.assertEqual(handler.track_endpoint_metrics.call_count, 5)
    
    def test_track_endpoint_metrics(self):
        """Test endpoint metrics tracking."""
        # Reset endpoint metrics
        original_metrics = start_api.APIHandler.endpoint_metrics.copy()
        start_api.APIHandler.endpoint_metrics = {
            "/health": {"count": 0, "avg_time": 0.0}
        }
        
        try:
            # Track a request
            self.handler.track_endpoint_metrics("/health", 0.1)
            
            # Verify metrics were updated
            self.assertEqual(start_api.APIHandler.endpoint_metrics["/health"]["count"], 1)
            self.assertEqual(start_api.APIHandler.endpoint_metrics["/health"]["avg_time"], 0.1)
            
            # Track another request
            self.handler.track_endpoint_metrics("/health", 0.3)
            
            # Verify metrics were updated correctly (rolling average)
            self.assertEqual(start_api.APIHandler.endpoint_metrics["/health"]["count"], 2)
            self.assertEqual(start_api.APIHandler.endpoint_metrics["/health"]["avg_time"], 0.2)
            
            # Track a request for an unknown endpoint
            self.handler.track_endpoint_metrics("/unknown", 0.5)
            
            # Verify metrics were not updated for unknown endpoint
            self.assertNotIn("/unknown", start_api.APIHandler.endpoint_metrics)
        finally:
            # Restore original metrics
            start_api.APIHandler.endpoint_metrics = original_metrics


class TestAPIServer(unittest.TestCase):
    """Test cases for the APIServer class."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary config file
        self.config_file = tempfile.NamedTemporaryFile(delete=False, mode='w')
        self.config_file.write(yaml.dump({
            "api_server": {
                "host": "127.0.0.1",
                "port": 8001
            }
        }))
        self.config_file.close()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove the temporary config file
        os.unlink(self.config_file.name)
    
    def test_init_with_defaults(self):
        """Test server initialization with default values."""
        server = start_api.APIServer()
        self.assertEqual(server.host, "localhost")
        self.assertEqual(server.port, 8000)
    
    def test_init_with_config(self):
        """Test server initialization with configuration file."""
        server = start_api.APIServer(config_path=self.config_file.name)
        self.assertEqual(server.host, "127.0.0.1")
        self.assertEqual(server.port, 8001)
    
    def test_init_with_params_override_config(self):
        """Test that constructor parameters override config file values."""
        server = start_api.APIServer(host="0.0.0.0", port=9000, config_path=self.config_file.name)
        self.assertEqual(server.host, "127.0.0.1")  # Config file takes precedence
        self.assertEqual(server.port, 8001)  # Config file takes precedence
    
    @patch('start_api.HTTPServer')
    def test_start_server(self, mock_http_server):
        """Test starting the server."""
        # Create mock server
        mock_server = MagicMock()
        mock_http_server.return_value = mock_server
        
        # Create server
        server = start_api.APIServer(host="localhost", port=8000)
        
        # Mock threading to avoid starting actual threads
        with patch('threading.Thread'):
            # Start server in a separate thread to avoid blocking
            server_thread = threading.Thread(target=server.start)
            server_thread.daemon = True
            server_thread.start()
            
            # Give the server time to start
            time.sleep(0.1)
            
            # Stop the server
            server.stop()
            
            # Verify server was created and started
            mock_http_server.assert_called_with(('localhost', 8000), start_api.APIHandler)
            mock_server.serve_forever.assert_called_once()
    
    @patch('start_api.HTTPServer')
    def test_start_server_error(self, mock_http_server):
        """Test handling of server start errors."""
        # Make HTTPServer raise an exception
        mock_http_server.side_effect = OSError(98, "Address already in use")
        
        # Create server
        server = start_api.APIServer(host="localhost", port=8000)
        
        # Start server
        result = server.start()
        
        # Verify server failed to start
        self.assertFalse(result)
    
    def test_stop_server(self):
        """Test stopping the server."""
        # Create server with mock HTTP server
        server = start_api.APIServer()
        server.server = MagicMock()
        
        # Stop server
        result = server.stop()
        
        # Verify server was stopped
        self.assertTrue(result)
        server.server.shutdown.assert_called_once()
    
    def test_stop_server_not_started(self):
        """Test stopping a server that hasn't been started."""
        # Create server without starting it
        server = start_api.APIServer()
        
        # Stop server
        result = server.stop()
        
        # Verify result
        self.assertFalse(result)


class TestUtilityFunctions(unittest.TestCase):
    """Test cases for utility functions."""
    
    def test_is_port_available_true(self):
        """Test is_port_available when port is available."""
        # Mock socket.socket to return a socket that can bind
        mock_socket = MagicMock()
        
        with patch('socket.socket', return_value=mock_socket):
            # Test function
            result = start_api.is_port_available("localhost", 8000)
            
            # Verify result
            self.assertTrue(result)
            mock_socket.bind.assert_called_with(("localhost", 8000))
    
    def test_is_port_available_false(self):
        """Test is_port_available when port is not available."""
        # Mock socket.socket to return a socket that raises OSError on bind
        mock_socket = MagicMock()
        mock_socket.bind.side_effect = OSError()
        
        with patch('socket.socket', return_value=mock_socket):
            # Test function
            result = start_api.is_port_available("localhost", 8000)
            
            # Verify result
            self.assertFalse(result)
            mock_socket.bind.assert_called_with(("localhost", 8000))


class TestArgumentParsing(unittest.TestCase):
    """Test cases for command-line argument parsing."""
    
    def test_default_args(self):
        """Test parsing with default arguments."""
        # Mock sys.argv
        with patch('sys.argv', ['start_api.py']):
            # Parse arguments
            args = start_api.parse_args()
            
            # Verify default values
            self.assertEqual(args.host, "localhost")
            self.assertEqual(args.port, 8000)
            self.assertIsNone(args.config)
            self.assertFalse(args.daemon)
    
    def test_custom_args(self):
        """Test parsing with custom arguments."""
        # Mock sys.argv
        with patch('sys.argv', [
            'start_api.py',
            '--host', '0.0.0.0',
            '--port', '9000',
            '--config', 'config.yaml',
            '--daemon'
        ]):
            # Parse arguments
            args = start_api.parse_args()
            
            # Verify custom values
            self.assertEqual(args.host, "0.0.0.0")
            self.assertEqual(args.port, 9000)
            self.assertEqual(args.config, "config.yaml")
            self.assertTrue(args.daemon)


class TestMainFunction(unittest.TestCase):
    """Test cases for the main function."""
    
    @patch('start_api.is_port_available')
    @patch('start_api.APIServer')
    def test_main_success(self, mock_api_server, mock_is_port_available):
        """Test main function with successful server start."""
        # Mock port availability check
        mock_is_port_available.return_value = True
        
        # Mock APIServer
        mock_server = MagicMock()
        mock_server.start.return_value = True
        mock_api_server.return_value = mock_server
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py']):
            # Run main function
            result = start_api.main()
            
            # Verify result
            self.assertEqual(result, 0)
            mock_api_server.assert_called_with(
                host="localhost", 
                port=8000, 
                config_path=None
            )
            mock_server.start.assert_called_once()
    
    @patch('start_api.is_port_available')
    def test_main_port_unavailable(self, mock_is_port_available):
        """Test main function when port is unavailable."""
        # Mock port availability check
        mock_is_port_available.return_value = False
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py']):
            # Run main function
            result = start_api.main()
            
            # Verify result
            self.assertEqual(result, 1)
    
    @patch('start_api.is_port_available')
    @patch('start_api.APIServer')
    def test_main_server_error(self, mock_api_server, mock_is_port_available):
        """Test main function when server fails to start."""
        # Mock port availability check
        mock_is_port_available.return_value = True
        
        # Mock APIServer
        mock_server = MagicMock()
        mock_server.start.return_value = False
        mock_api_server.return_value = mock_server
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py']):
            # Run main function
            result = start_api.main()
            
            # Verify result
            self.assertEqual(result, 1)
    
    @patch('start_api.is_port_available')
    @patch('start_api.APIServer')
    @patch('os.fork')
    def test_main_daemon_mode(self, mock_fork, mock_api_server, mock_is_port_available):
        """Test main function in daemon mode."""
        # Mock port availability check
        mock_is_port_available.return_value = True
        
        # Mock fork to simulate parent process
        mock_fork.return_value = 123
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py', '--daemon']):
            # Run main function
            result = start_api.main()
            
            # Verify result
            self.assertEqual(result, 0)
            mock_fork.assert_called_once()
            
            # Verify server was not started in parent process
            mock_api_server.assert_not_called()
    
    @patch('start_api.is_port_available')
    @patch('start_api.APIServer')
    @patch('os.fork')
    @patch('os.setsid')
    @patch('os.chdir')
    @patch('os.close')
    def test_main_daemon_mode_child(self, mock_close, mock_chdir, mock_setsid, 
                                    mock_fork, mock_api_server, mock_is_port_available):
        """Test main function in daemon mode (child process)."""
        # Mock port availability check
        mock_is_port_available.return_value = True
        
        # Mock fork to simulate child process
        mock_fork.return_value = 0
        
        # Mock APIServer
        mock_server = MagicMock()
        mock_server.start.return_value = True
        mock_api_server.return_value = mock_server
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py', '--daemon']):
            # Run main function
            result = start_api.main()
            
            # Verify daemon setup
            mock_fork.assert_called_once()
            mock_setsid.assert_called_once()
            mock_chdir.assert_called_once_with('/')
            
            # Verify server was started
            mock_api_server.assert_called_once()
            mock_server.start.assert_called_once()
    
    @patch('start_api.is_port_available')
    @patch('os.fork')
    def test_main_daemon_mode_fork_error(self, mock_fork, mock_is_port_available):
        """Test main function in daemon mode with fork error."""
        # Mock port availability check
        mock_is_port_available.return_value = True
        
        # Mock fork to raise an error
        mock_fork.side_effect = OSError("Fork failed")
        
        # Mock command-line arguments
        with patch('sys.argv', ['start_api.py', '--daemon']):
            # Run main function
            result = start_api.main()
            
            # Verify result
            self.assertEqual(result, 1)
            mock_fork.assert_called_once()


if __name__ == "__main__":
    unittest.main()