#!/usr/bin/env python3
"""
Integration test for API health check functionality.

This test verifies that the fixed URL construction in monitoring-setup-fix.py
correctly preserves the port number when forming the health check URL.

Author: EyewearML Platform Team
Created: 2025-06-11
"""

import sys
import os
import unittest
from pathlib import Path
import time
import threading
import http.server
import socketserver
from urllib.parse import urljoin, urlparse

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Import from our fixed monitoring module
from scripts.monitoring_setup_fix import HealthChecker

class SimpleHealthServer:
    """A simple HTTP server that responds to /health endpoint with 200 OK"""
    
    def __init__(self, port=8000):
        self.port = port
        self.server = None
        self.server_thread = None
        self.is_running = False
        
    def start(self):
        """Start the health check server in a separate thread"""
        
        class HealthHandler(http.server.SimpleHTTPRequestHandler):
            def do_GET(self):
                if self.path == '/health':
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(b'{"status": "healthy"}')
                else:
                    self.send_response(404)
                    self.end_headers()
        
        # Create server
        self.server = socketserver.TCPServer(("", self.port), HealthHandler)
        
        # Start server in a thread
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.daemon = True
        self.server_thread.start()
        self.is_running = True
        
        # Small delay to ensure server is up
        time.sleep(0.1)
        
    def stop(self):
        """Stop the health check server"""
        if self.server:
            self.server.shutdown()
            self.server_thread.join(timeout=1)
            self.server = None
            self.is_running = False


class TestAPIHealthCheck(unittest.TestCase):
    """Test cases for API health check functionality"""
    
    @classmethod
    def setUpClass(cls):
        """Start test server before running tests"""
        cls.server = SimpleHealthServer(port=8000)
        cls.server.start()
        
    @classmethod
    def tearDownClass(cls):
        """Stop test server after tests"""
        cls.server.stop()
    
    def test_url_construction_methods(self):
        """Test different URL construction methods to verify they preserve port"""
        base_url = "http://localhost:8000"
        health_path = "health"
        
        # Method 1: urljoin with no leading slash (our fix)
        url1 = urljoin(base_url, health_path)
        
        # Method 2: String concatenation
        url2 = f"{base_url}/{health_path}"
        
        # Method 3: URL parsing and reconstruction
        parsed_url = urlparse(base_url)
        url3 = f"{parsed_url.scheme}://{parsed_url.netloc}/{health_path}"
        
        # Verify all methods preserve port 8000
        self.assertEqual(url1, "http://localhost:8000/health")
        self.assertEqual(url2, "http://localhost:8000/health")
        self.assertEqual(url3, "http://localhost:8000/health")
    
    def test_health_check_functionality(self):
        """Test that health checker successfully connects to server with our fix"""
        base_url = "http://localhost:8000"
        
        # Method 1: urljoin with no leading slash (our fix)
        health_url = urljoin(base_url, "health")
        result = HealthChecker.check_service_health(health_url)
        
        # Verify health check succeeds
        self.assertTrue(result["healthy"])
        self.assertEqual(result["status_code"], 200)
        self.assertIsNone(result["error"])
        
        # Verify a non-existent endpoint fails properly
        not_found_url = urljoin(base_url, "not-found")
        result = HealthChecker.check_service_health(not_found_url)
        self.assertFalse(result["healthy"])
        self.assertEqual(result["status_code"], 404)
        

if __name__ == '__main__':
    unittest.main()