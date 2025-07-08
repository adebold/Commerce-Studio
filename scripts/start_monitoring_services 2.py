#!/usr/bin/env python3
"""
Monitoring Services Starter

This script starts and manages all required monitoring services including:
- API server for health checks
- Database connectivity checker

It coordinates multiple services, handles configuration, and provides
graceful shutdown handling.

Usage:
    python start_monitoring_services.py [--config CONFIG] [--debug]
"""

import os
import sys
import time
import json
import signal
import logging
import argparse
import threading
import importlib.util
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("monitoring-services")

# Ensure we can import from the scripts directory
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)


class ServiceManager:
    """
    Manages and coordinates monitoring services.
    
    This class is responsible for starting, stopping, and monitoring
    all required services for the monitoring system.
    """
    
    def __init__(self, config_path: Optional[str] = None, debug: bool = False):
        """
        Initialize the service manager.
        
        Args:
            config_path (str, optional): Path to configuration file
            debug (bool): Enable debug logging
        """
        self.config_path = config_path
        self.debug = debug
        self.services = {}
        self.running = False
        self.shutdown_event = threading.Event()
        self.config = self._load_config()
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        if debug:
            logger.setLevel(logging.DEBUG)
            
        logger.info("Service manager initialized with config=%s, debug=%s", 
                   config_path, debug)
    
    def _signal_handler(self, signum, frame):
        """Handle termination signals for graceful shutdown."""
        logger.info("Received signal %s, initiating shutdown...", signum)
        self.stop()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file or use defaults.
        
        Returns:
            Dict[str, Any]: Configuration dictionary
        """
        default_config = {
            "api_server": {
                "enabled": True,
                "host": "localhost",
                "port": 8000,
                "debug": False
            },
            "db_checker": {
                "enabled": True,
                "interval": 60,
                "debug": False,
                "config_path": "db_config.json"
            },
            "general": {
                "status_interval": 30,
                "alert_check_interval": 60
            }
        }
        
        if not self.config_path:
            logger.info("No config file specified, using defaults")
            return default_config
        
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                logger.info("Loaded configuration from %s", self.config_path)
                
                # Merge with defaults for any missing settings
                merged_config = default_config.copy()
                for section, settings in config.items():
                    if section in merged_config:
                        merged_config[section].update(settings)
                    else:
                        merged_config[section] = settings
                
                return merged_config
            else:
                logger.warning("Config file %s not found, using defaults", self.config_path)
                return default_config
        except Exception as e:
            logger.error("Failed to load config from %s: %s", self.config_path, e)
            return default_config
    
    def start(self):
        """Start all configured services."""
        if self.running:
            logger.warning("Services already running")
            return
        
        logger.info("Starting all monitoring services")
        
        # Start API server if enabled
        if self.config["api_server"]["enabled"]:
            self._start_api_server()
        
        # Start database checker if enabled
        if self.config["db_checker"]["enabled"]:
            self._start_db_checker()
        
        # Start status thread
        self.status_thread = threading.Thread(
            target=self._status_check_loop,
            name="status-checker",
            daemon=True
        )
        
        self.running = True
        self.shutdown_event.clear()
        self.status_thread.start()
        
        logger.info("All monitoring services started successfully")
    
    def _import_module(self, module_name: str, file_path: str):
        """
        Dynamically import a module from file path.
        
        Args:
            module_name (str): Name to give the module
            file_path (str): Path to the module file
            
        Returns:
            module: The imported module
        """
        try:
            spec = importlib.util.spec_from_file_location(module_name, file_path)
            if spec is None:
                raise ImportError(f"Could not find module {file_path}")
                
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return module
        except FileNotFoundError as e:
            logger.error("Module file not found: %s", file_path)
            raise ImportError(f"Module file not found: {file_path}") from e
        except Exception as e:
            logger.error("Failed to import module %s from %s: %s", module_name, file_path, e)
            raise
    
    def _start_api_server(self):
        """Start the API server service."""
        logger.info("Starting API server")
        
        try:
            # Find the start_api.py script
            api_script_path = os.path.join(script_dir, "start_api.py")
            if not os.path.exists(api_script_path):
                logger.error("API server script not found at %s", api_script_path)
                return
            
            # Import the API server module
            api_module = self._import_module("api_server", api_script_path)
            
            # Get config
            config = self.config["api_server"]
            
            # Create server instance
            api_server = api_module.APIServer(
                host=config["host"],
                port=config["port"],
                debug=config["debug"] or self.debug
            )
            
            # Start the server
            api_server.start()
            
            # Store the server instance
            self.services["api_server"] = api_server
            
            logger.info("API server started on %s:%d", config["host"], config["port"])
        except Exception as e:
            logger.error("Failed to start API server: %s", e)
    
    def _start_db_checker(self):
        """Start the database checker service."""
        logger.info("Starting database checker")
        
        try:
            # Find the db_checker.py script
            db_script_path = os.path.join(script_dir, "db_checker.py")
            if not os.path.exists(db_script_path):
                logger.error("Database checker script not found at %s", db_script_path)
                return
            
            # Import the database checker module
            db_module = self._import_module("db_checker", db_script_path)
            
            # Get config
            config = self.config["db_checker"]
            
            # Create checker instance
            db_checker = db_module.DatabaseChecker(
                interval=config["interval"],
                debug=config["debug"] or self.debug
            )
            
            # Load database configurations
            if "config_path" in config and os.path.exists(config["config_path"]):
                db_config = db_module.load_config_from_file(config["config_path"])
                
                # Add configured databases
                for db_name, db_settings in db_config.get("databases", {}).items():
                    if "type" not in db_settings:
                        logger.warning("Skipping database %s: missing 'type' field", db_name)
                        continue
                    
                    try:
                        db_type = db_settings.pop("type")
                        db_checker.add_database(
                            db_name, 
                            db_module.DatabaseConfig(db_type, db_settings)
                        )
                    except Exception as e:
                        logger.error("Failed to add database %s: %s", db_name, e)
            else:
                # Add a default database for testing
                logger.info("No database config found, adding sample Redis database")
                db_checker.add_database(
                    "redis-sample", 
                    db_module.DatabaseConfig("redis", {
                        "host": "localhost",
                        "port": 6379
                    })
                )
            
            # Start the checker
            db_checker.start()
            
            # Store the checker instance
            self.services["db_checker"] = db_checker
            
            logger.info("Database checker started with interval %d seconds", config["interval"])
        except Exception as e:
            logger.error("Failed to start database checker: %s", e)
    
    def _status_check_loop(self):
        """
        Periodically check and report on service status.
        
        This also checks if the alerts are being resolved.
        """
        logger.info("Status check thread started")
        
        status_interval = self.config["general"]["status_interval"]
        alert_check_interval = self.config["general"]["alert_check_interval"]
        
        last_alert_check = 0
        
        try:
            while not self.shutdown_event.is_set():
                # Report service status
                self._report_service_status()
                
                # Check if alerts are being resolved
                current_time = time.time()
                if current_time - last_alert_check >= alert_check_interval:
                    self._check_alerts()
                    last_alert_check = current_time
                
                # Wait for next interval or shutdown
                self.shutdown_event.wait(status_interval)
        except Exception as e:
            logger.error("Error in status check thread: %s", e)
        finally:
            logger.info("Status check thread exiting")
    
    def _report_service_status(self):
        """Report on the status of all services."""
        status = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "services": {}
        }
        
        # Check API server status
        if "api_server" in self.services:
            api_server = self.services["api_server"]
            api_status = {"running": api_server.running}
            
            # Safely add host and port if they exist
            if hasattr(api_server, "host"):
                api_status["host"] = api_server.host
            if hasattr(api_server, "port"):
                api_status["port"] = api_server.port
                
            status["services"]["api_server"] = api_status
        else:
            status["services"]["api_server"] = {"running": False}
        
        # Check database checker status
        if "db_checker" in self.services:
            db_checker = self.services["db_checker"]
            db_status = db_checker.get_status()
            status["services"]["db_checker"] = {
                "running": db_checker.running,
                "databases": db_status["databases"],
                "next_check_in": db_status["next_check_in"]
            }
            
            # Include database check results if available
            if db_status["last_check_results"]:
                db_results = {}
                for db_name, result in db_status["last_check_results"].items():
                    db_results[db_name] = {
                        "status": result["status"],
                        "timestamp": result.get("timestamp")
                    }
                    if not result["status"] and "error" in result:
                        db_results[db_name]["error"] = result["error"]
                
                status["services"]["db_checker"]["results"] = db_results
        else:
            status["services"]["db_checker"] = {"running": False}
        
        # Log status summary
        service_status = []
        for service, info in status["services"].items():
            service_status.append(f"{service}: {'✓' if info['running'] else '✗'}")
        
        logger.info("Service status: %s", ", ".join(service_status))
        
        return status
    
    def _check_alerts(self):
        """
        Check if monitoring alerts are being resolved.
        
        This method tries to find the monitoring-setup.py output
        and check if CRITICAL alerts are being resolved.
        """
        try:
            # Import the script that checks for alerts if available
            monitor_script_path = os.path.join(script_dir, "monitoring-setup.py")
            if os.path.exists(monitor_script_path):
                monitor_module = self._import_module("monitoring_setup", monitor_script_path)
                
                # Check if there's an alert checker function
                if hasattr(monitor_module, "check_alerts"):
                    alerts = monitor_module.check_alerts()
                    critical_count = 0
                    
                    for alert in alerts:
                        if alert.get("level") == "CRITICAL":
                            critical_count += 1
                    
                    logger.info("Alert check: %d total, %d critical", len(alerts), critical_count)
                    
                    # Log if alerts are being resolved
                    if critical_count == 0 and len(alerts) > 0:
                        logger.info("✓ All critical alerts have been resolved!")
                    elif critical_count > 0:
                        logger.warning("⚠️ There are still %d critical alerts", critical_count)
            else:
                logger.debug("Monitoring setup script not found, skipping alert check")
        except Exception as e:
            logger.error("Error checking alerts: %s", e)
    
    def stop(self):
        """Stop all running services."""
        if not self.running:
            logger.warning("Services not running")
            return
        
        logger.info("Stopping all monitoring services")
        self.running = False
        self.shutdown_event.set()
        
        # Stop API server
        if "api_server" in self.services:
            try:
                logger.info("Stopping API server")
                self.services["api_server"].stop()
            except Exception as e:
                logger.error("Error stopping API server: %s", e)
        
        # Stop database checker
        if "db_checker" in self.services:
            try:
                logger.info("Stopping database checker")
                self.services["db_checker"].stop()
            except Exception as e:
                logger.error("Error stopping database checker: %s", e)
        
        # Wait for status thread to terminate
        if hasattr(self, "status_thread") and self.status_thread.is_alive():
            logger.info("Waiting for status thread to terminate")
            self.status_thread.join(5)  # Join with timeout of 5 seconds
        
        logger.info("All monitoring services stopped")
    
    def get_service(self, name: str) -> Any:
        """
        Get a service instance by name.
        
        Args:
            name (str): Service name
            
        Returns:
            Any: Service instance or None if not found
        """
        return self.services.get(name)
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current status of all services.
        
        Returns:
            Dict[str, Any]: Status information
        """
        return self._report_service_status()


def main():
    """Main function to parse arguments and start the services."""
    parser = argparse.ArgumentParser(description='Start monitoring services.')
    
    parser.add_argument('--config', type=str, default=None,
                        help='Path to configuration file')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug logging')
    
    args = parser.parse_args()
    
    # Create service manager
    manager = ServiceManager(config_path=args.config, debug=args.debug)
    
    try:
        logger.info("Starting monitoring services")
        manager.start()
        
        logger.info("Services running. Press Ctrl+C to stop")
        while manager.running:
            time.sleep(1)
    
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    finally:
        logger.info("Shutting down monitoring services")
        manager.stop()
        logger.info("Shutdown complete")


if __name__ == "__main__":
    main()