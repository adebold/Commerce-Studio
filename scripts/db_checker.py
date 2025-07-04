#!/usr/bin/env python3
"""
Database Connectivity Checker

This script provides functionality to check connectivity and performance
of various database systems used by the monitoring system. It implements
periodic checks and reports issues to the monitoring system.

Usage:
    python db_checker.py [--interval SECONDS] [--debug]
"""

import os
import sys
import time
import json
import signal
import socket
import logging
import argparse
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("db-checker")


class DatabaseConfig:
    """Configuration for database connections."""
    
    def __init__(self, db_type: str, config: Dict[str, Any]):
        """
        Initialize database configuration.
        
        Args:
            db_type (str): Type of database (mysql, postgres, redis, mongodb)
            config (Dict): Configuration parameters for the database
        """
        self.db_type = db_type
        self.config = config
        self.validate()
    
    def validate(self):
        """Validate configuration has required fields."""
        required_fields = {
            "mysql": ["host", "port", "user", "password", "database"],
            "postgres": ["host", "port", "user", "password", "database"],
            "redis": ["host", "port"],
            "mongodb": ["uri"]
        }
        
        if self.db_type not in required_fields:
            raise ValueError(f"Unsupported database type: {self.db_type}")
        
        for field in required_fields[self.db_type]:
            if field not in self.config:
                raise ValueError(f"Missing required field '{field}' for {self.db_type} database")


class DatabaseChecker:
    """
    Class for checking database connectivity and performance.
    
    This class implements checks for various database types and
    reports metrics and status information.
    """
    
    def __init__(self, interval: int = 60, debug: bool = False):
        """
        Initialize the database checker.
        
        Args:
            interval (int): Check interval in seconds
            debug (bool): Enable debug logging
        """
        self.interval = interval
        self.debug = debug
        self.running = False
        self.databases = {}
        self.check_thread = None
        self.shutdown_event = threading.Event()
        self.last_check_results = {}
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        if debug:
            logger.setLevel(logging.DEBUG)
        
        logger.info("Database checker initialized with interval=%d seconds, debug=%s", 
                   interval, debug)
    
    def _signal_handler(self, signum, frame):
        """Handle termination signals for graceful shutdown."""
        logger.info("Received signal %s, initiating shutdown...", signum)
        self.stop()
    
    def add_database(self, name: str, db_config: DatabaseConfig):
        """
        Add a database to check.
        
        Args:
            name (str): Name identifier for the database
            db_config (DatabaseConfig): Database configuration
        """
        self.databases[name] = db_config
        logger.info("Added database %s of type %s for checking", name, db_config.db_type)
    
    def start(self):
        """Start the database checker in a background thread."""
        if self.running:
            logger.warning("Checker already running")
            return
        
        if not self.databases:
            logger.warning("No databases configured, nothing to check")
            return
        
        # Start checker in a thread
        self.check_thread = threading.Thread(
            target=self._run_checks,
            name="db-checker",
            daemon=True
        )
        
        self.running = True
        self.shutdown_event.clear()
        self.check_thread.start()
        
        logger.info("Database checker started with %d databases", len(self.databases))
    
    def _run_checks(self):
        """Run database checks in a loop."""
        logger.info("Check thread started")
        try:
            while not self.shutdown_event.is_set():
                self._check_all_databases()
                
                # Wait for next check interval or shutdown
                self.shutdown_event.wait(self.interval)
        except Exception as e:
            logger.error("Error in check thread: %s", e)
        finally:
            logger.info("Check thread exiting")
    
    def _check_all_databases(self):
        """Check all configured databases."""
        start_time = time.time()
        logger.debug("Starting database checks")
        
        results = {}
        for name, db_config in self.databases.items():
            try:
                logger.debug("Checking database %s", name)
                result = self._check_database(name, db_config)
                results[name] = result
                logger.debug("Database %s check completed: %s", name, "OK" if result["status"] else "FAILED")
            except Exception as e:
                logger.error("Error checking database %s: %s", name, e)
                results[name] = {
                    "status": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
        
        self.last_check_results = results
        
        elapsed = time.time() - start_time
        logger.info("Completed all database checks in %.2f seconds", elapsed)
        
        # Log summary of results
        success_count = sum(1 for r in results.values() if r["status"])
        logger.info("Database check summary: %d/%d successful", success_count, len(results))
    
    def _check_database(self, name: str, db_config: DatabaseConfig) -> Dict[str, Any]:
        """
        Check a specific database.
        
        Args:
            name (str): Name of the database
            db_config (DatabaseConfig): Database configuration
        
        Returns:
            Dict[str, Any]: Check results
        """
        checker_method = getattr(self, f"_check_{db_config.db_type}", None)
        if not checker_method:
            return {
                "status": False,
                "error": f"No checker implemented for database type {db_config.db_type}",
                "timestamp": datetime.now().isoformat()
            }
        
        return checker_method(db_config.config)
    
    def _check_mysql(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check MySQL database connectivity and performance.
        
        Args:
            config (Dict): MySQL configuration
        
        Returns:
            Dict[str, Any]: Check results
        """
        result = {
            "status": False,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        try:
            import mysql.connector
            
            start_time = time.time()
            
            # Connect to database
            conn = mysql.connector.connect(
                host=config["host"],
                port=config["port"],
                user=config["user"],
                password=config["password"],
                database=config["database"],
                connection_timeout=10
            )
        except ImportError:
            result["error"] = "MySQL connector module not installed"
            return result
        except Exception as e:
            result["error"] = str(e)
            return result
            
        try:
            
            result["metrics"]["connect_time"] = time.time() - start_time
            
            # Check if connection is working
            if conn.is_connected():
                cursor = conn.cursor()
                
                # Check simple query performance
                query_start = time.time()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                result["metrics"]["query_time"] = time.time() - query_start
                
                # Get server info
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()[0]
                result["server_info"] = {"version": version}
                
                # Get connection stats
                cursor.execute("SHOW STATUS LIKE 'Threads_connected'")
                threads = cursor.fetchone()[1]
                result["metrics"]["threads_connected"] = int(threads)
                
                cursor.close()
                conn.close()
                
                result["status"] = True
                result["metrics"]["total_time"] = time.time() - start_time
            else:
                result["error"] = "Failed to connect to MySQL database"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _check_postgres(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check PostgreSQL database connectivity and performance.
        
        Args:
            config (Dict): PostgreSQL configuration
        
        Returns:
            Dict[str, Any]: Check results
        """
        result = {
            "status": False,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        try:
            import psycopg2
            
            start_time = time.time()
            
            # Connect to database
            conn = psycopg2.connect(
                host=config["host"],
                port=config["port"],
                user=config["user"],
                password=config["password"],
                dbname=config["database"],
                connect_timeout=10
            )
            
            result["metrics"]["connect_time"] = time.time() - start_time
            
            # Check if connection is working
            cursor = conn.cursor()
            
            # Check simple query performance
            query_start = time.time()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            result["metrics"]["query_time"] = time.time() - query_start
            
            # Get server info
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            result["server_info"] = {"version": version}
            
            # Get connection stats
            cursor.execute("SELECT count(*) FROM pg_stat_activity")
            connections = cursor.fetchone()[0]
            result["metrics"]["active_connections"] = connections
            
            cursor.close()
            conn.close()
            
            result["status"] = True
            result["metrics"]["total_time"] = time.time() - start_time
        except ImportError:
            result["error"] = "psycopg2 module not installed"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _check_redis(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check Redis database connectivity and performance.
        
        Args:
            config (Dict): Redis configuration
        
        Returns:
            Dict[str, Any]: Check results
        """
        result = {
            "status": False,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        try:
            import redis
            
            start_time = time.time()
            
            # Connect to Redis
            r = redis.Redis(
                host=config["host"],
                port=config["port"],
                password=config.get("password"),
                socket_timeout=10
            )
            
            result["metrics"]["connect_time"] = time.time() - start_time
            
            # Ping to check connectivity
            ping_start = time.time()
            if r.ping():
                result["metrics"]["ping_time"] = time.time() - ping_start
                
                # Get server info
                info = r.info()
                result["server_info"] = {
                    "version": info["redis_version"],
                    "uptime_seconds": info["uptime_in_seconds"],
                    "connected_clients": info["connected_clients"]
                }
                
                # Simple performance test
                set_start = time.time()
                r.set("db_check_test_key", "test_value")
                result["metrics"]["set_time"] = time.time() - set_start
                
                get_start = time.time()
                r.get("db_check_test_key")
                result["metrics"]["get_time"] = time.time() - get_start
                
                # Clean up
                r.delete("db_check_test_key")
                
                result["status"] = True
                result["metrics"]["total_time"] = time.time() - start_time
            else:
                result["error"] = "Failed to ping Redis server"
        except ImportError:
            result["error"] = "redis module not installed"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _check_mongodb(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check MongoDB connectivity and performance.
        
        Args:
            config (Dict): MongoDB configuration
        
        Returns:
            Dict[str, Any]: Check results
        """
        result = {
            "status": False,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        try:
            from pymongo import MongoClient
            
            start_time = time.time()
            
            # Connect to MongoDB
            client = MongoClient(config["uri"], serverSelectionTimeoutMS=10000)
            
            result["metrics"]["connect_time"] = time.time() - start_time
            
            # Check if server is available
            server_info = client.server_info()
            result["server_info"] = {
                "version": server_info["version"],
                "uptime_seconds": server_info["uptime"]
            }
            
            # Simple performance test
            db = client.get_database("admin")
            ping_start = time.time()
            db.command("ping")
            result["metrics"]["ping_time"] = time.time() - ping_start
            
            client.close()
            
            result["status"] = True
            result["metrics"]["total_time"] = time.time() - start_time
        except ImportError:
            result["error"] = "pymongo module not installed"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current status of all databases.
        
        Returns:
            Dict[str, Any]: Status information
        """
        return {
            "running": self.running,
            "databases": list(self.databases.keys()),
            "last_check_results": self.last_check_results,
            "next_check_in": self._get_next_check_time() if self.running else None
        }
    
    def _get_next_check_time(self) -> int:
        """Calculate seconds until next check."""
        if not self.check_thread or not self.check_thread.is_alive():
            return 0
        
        last_check_time = max([r.get("timestamp", "2000-01-01T00:00:00") 
                              for r in self.last_check_results.values()], default="2000-01-01T00:00:00")
        
        try:
            last_time = datetime.fromisoformat(last_check_time)
            now = datetime.now()
            elapsed = (now - last_time).total_seconds()
            return max(0, self.interval - int(elapsed))
        except Exception:
            return 0
    
    def stop(self):
        """Stop the database checker."""
        if not self.running:
            logger.warning("Checker not running")
            return
        
        logger.info("Stopping database checker...")
        self.running = False
        self.shutdown_event.set()
        
        if self.check_thread and self.check_thread.is_alive():
            logger.info("Waiting for check thread to terminate...")
            self.check_thread.join(5)  # Join with timeout of 5 seconds
            if self.check_thread.is_alive():
                logger.warning("Check thread did not terminate gracefully")
        
        logger.info("Database checker stopped")


def load_config_from_file(filepath: str) -> Dict[str, Any]:
    """
    Load configuration from a JSON file.
    
    Args:
        filepath (str): Path to configuration file
    
    Returns:
        Dict[str, Any]: Configuration dictionary
    """
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error("Failed to load configuration from %s: %s", filepath, e)
        return {}


def main():
    """Main function to parse arguments and start the database checker."""
    parser = argparse.ArgumentParser(description='Start the database checker.')
    
    parser.add_argument('--config', type=str, default='db_config.json',
                        help='Path to database configuration file')
    parser.add_argument('--interval', type=int, default=60,
                        help='Check interval in seconds (default: 60)')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug logging')
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config_from_file(args.config)
    
    # Create database checker
    checker = DatabaseChecker(interval=args.interval, debug=args.debug)
    
    # Add databases from configuration
    for db_name, db_config in config.get("databases", {}).items():
        if "type" not in db_config:
            logger.warning("Skipping database %s: missing 'type' field", db_name)
            continue
        
        try:
            db_type = db_config.pop("type")
            checker.add_database(db_name, DatabaseConfig(db_type, db_config))
        except Exception as e:
            logger.error("Failed to add database %s: %s", db_name, e)
    
    # If no databases in config, add a sample Redis database for testing
    if not checker.databases and not os.path.exists(args.config):
        logger.info("No configuration file found, adding sample Redis database")
        checker.add_database("redis-sample", DatabaseConfig("redis", {
            "host": "localhost",
            "port": 6379
        }))
    
    try:
        logger.info("Starting database checker...")
        checker.start()
        
        logger.info("Checker running. Press Ctrl+C to stop")
        while checker.running:
            time.sleep(1)
    
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    finally:
        logger.info("Shutting down database checker...")
        checker.stop()
        logger.info("Shutdown complete")


if __name__ == "__main__":
    main()