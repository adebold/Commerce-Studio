#!/usr/bin/env python3
"""
API Server for Monitoring System

This script implements a simple HTTP server that provides health check
and metrics endpoints for the monitoring system. It's designed to work
with the monitoring-setup.py script to resolve CRITICAL alerts.

Usage:
    python start_api.py [--host HOST] [--port PORT] [--debug]
"""

import os
import sys
import json
import time
import signal
import socket
import logging
import argparse
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("api-server")


class APIRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP request handler for the API server.
    
    This handler processes requests for health checks, metrics,
    and other monitoring endpoints.
    """
    
    # Store start time for uptime calculation
    server_start_time = time.time()
    
    # Dictionary of registered endpoint handlers
    endpoint_handlers = {}
    
    # Configuration
    debug_mode = False
    
    def log_message(self, format, *args):
        """Override to use our logger instead of stderr."""
        if self.debug_mode:
            logger.info("%s - %s", self.address_string(), format % args)
    
    def do_GET(self):
        """Handle GET requests."""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query = parse_qs(parsed_url.query)
        
        # Check if the path matches a registered endpoint
        if path in self.endpoint_handlers:
            try:
                # Call the registered handler
                self.endpoint_handlers[path](self)
                return
            except Exception as e:
                logger.error("Error handling endpoint %s: %s", path, e)
                self.send_error(500, "Internal Server Error")
                return
        
        # Handle default endpoints
        if path == "/health":
            self.handle_health()
        elif path == "/metrics":
            self.handle_metrics()
        elif path == "/info":
            self.handle_info()
        else:
            self.send_error(404, "Not Found")
    
    def handle_health(self):
        """Handle health check endpoint."""
        health_data = {
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": int(time.time() - self.server_start_time),
            "hostname": socket.gethostname()
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(health_data).encode())
    
    def handle_metrics(self):
        """Handle metrics endpoint."""
        # Get system metrics
        metrics = {
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": self._get_cpu_usage(),
                "memory_usage": self._get_memory_usage(),
                "disk_usage": self._get_disk_usage()
            },
            "application": {
                "uptime": int(time.time() - self.server_start_time),
                "requests": {
                    "total": self.server.request_count,
                    "success": self.server.success_count,
                    "error": self.server.error_count
                }
            }
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(metrics).encode())
    
    def handle_info(self):
        """Handle info endpoint."""
        info_data = {
            "name": "Monitoring API Server",
            "version": "1.0.0",
            "api_endpoints": ["/health", "/metrics", "/info"] + list(self.endpoint_handlers.keys()),
            "system_info": {
                "python_version": sys.version,
                "platform": sys.platform,
                "hostname": socket.gethostname()
            }
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(info_data).encode())
    
    def _get_cpu_usage(self):
        """Get CPU usage metric."""
        try:
            import psutil
            return psutil.cpu_percent(interval=0.1)
        except ImportError:
            return -1
    
    def _get_memory_usage(self):
        """Get memory usage metric."""
        try:
            import psutil
            memory = psutil.virtual_memory()
            return {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent
            }
        except ImportError:
            return {"total": -1, "available": -1, "percent": -1}
    
    def _get_disk_usage(self):
        """Get disk usage metric."""
        try:
            import psutil
            disk = psutil.disk_usage('/')
            return {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            }
        except ImportError:
            return {"total": -1, "used": -1, "free": -1, "percent": -1}


class InstrumentedHTTPServer(HTTPServer):
    """HTTP server with request count metrics."""
    
    def __init__(self, server_address, RequestHandlerClass):
        """Initialize with request counters."""
        super().__init__(server_address, RequestHandlerClass)
        self.request_count = 0
        self.success_count = 0
        self.error_count = 0
    
    def process_request(self, request, client_address):
        """Override to count requests."""
        self.request_count += 1
        try:
            return super().process_request(request, client_address)
        except Exception as e:
            self.error_count += 1
            raise e
        finally:
            # If no exception, count as success
            if not hasattr(self, "_last_error"):
                self.success_count += 1


class APIServer:
    """
    API server for the monitoring system.
    
    This class manages an HTTP server that provides monitoring endpoints.
    """
    
    def __init__(self, host="localhost", port=8000, debug=False):
        """
        Initialize the API server.
        
        Args:
            host (str): The host to bind to
            port (int): The port to listen on
            debug (bool): Enable debug logging
        """
        self.host = host
        self.port = port
        self.debug = debug
        self.server = None
        self.server_thread = None
        self.running = False
        self.shutdown_event = threading.Event()
        
        # Set debug mode in the handler
        APIRequestHandler.debug_mode = debug
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        logger.info("API server initialized with host=%s, port=%d, debug=%s", 
                   host, port, debug)
    
    def _signal_handler(self, signum, frame):
        """Handle termination signals for graceful shutdown."""
        logger.info("Received signal %s, initiating shutdown...", signum)
        self.stop()
    
    def add_endpoint(self, path, handler):
        """
        Register a custom endpoint handler.
        
        Args:
            path (str): The URL path of the endpoint
            handler (callable): A function that takes a request handler and processes the request
        """
        APIRequestHandler.endpoint_handlers[path] = handler
        logger.info("Registered endpoint handler for %s", path)
    
    def start(self):
        """Start the API server in a background thread."""
        if self.running:
            logger.warning("Server already running")
            return
        
        # Create server
        try:
            self.server = InstrumentedHTTPServer((self.host, self.port), APIRequestHandler)
            logger.info("Server created on %s:%d", self.host, self.port)
        except Exception as e:
            logger.error("Failed to create server: %s", e)
            return
        
        # Start server in a thread
        self.server_thread = threading.Thread(
            target=self._run_server,
            name="api-server",
            daemon=True
        )
        
        self.running = True
        self.shutdown_event.clear()
        self.server_thread.start()
        
        logger.info("API server started on %s:%d", self.host, self.port)
    
    def _run_server(self):
        """Run the server in a thread."""
        logger.info("Server thread started")
        try:
            # Set timeout to allow checking shutdown_event periodically
            self.server.timeout = 1.0
            
            while not self.shutdown_event.is_set():
                self.server.handle_request()
        except Exception as e:
            logger.error("Error in server thread: %s", e)
        finally:
            logger.info("Server thread exiting")
    
    def stop(self):
        """Stop the API server."""
        if not self.running:
            logger.warning("Server not running")
            return
        
        logger.info("Stopping API server...")
        self.running = False
        self.shutdown_event.set()
        
        if self.server:
            try:
                self.server.server_close()
            except Exception as e:
                logger.error("Error closing server: %s", e)
        
        if self.server_thread and self.server_thread.is_alive():
            logger.info("Waiting for server thread to terminate...")
            self.server_thread.join(5)  # Join with timeout of 5 seconds
            if self.server_thread.is_alive():
                logger.warning("Server thread did not terminate gracefully")
        
        logger.info("API server stopped")


def main():
    """Main function to parse arguments and start the server."""
    parser = argparse.ArgumentParser(description='Start the API server.')
    
    parser.add_argument('--host', type=str, default='localhost',
                        help='Host to bind to (default: localhost)')
    parser.add_argument('--port', type=int, default=8000,
                        help='Port to listen on (default: 8000)')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug logging')
    
    args = parser.parse_args()
    
    # Create and start API server
    server = APIServer(host=args.host, port=args.port, debug=args.debug)
    
    try:
        logger.info("Starting API server...")
        server.start()
        
        logger.info("Server running. Press Ctrl+C to stop")
        while server.running:
            time.sleep(1)
    
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    finally:
        logger.info("Shutting down API server...")
        server.stop()
        logger.info("Shutdown complete")


if __name__ == "__main__":
    main()