#!/usr/bin/env python
"""
Database Check Script

This script provides database connectivity and health checking functionality
for the monitoring system. It can diagnose common database issues and
provide suggested solutions.

Features:
- Database connection testing
- Configuration validation
- Query performance testing
- Schema validation
- Database status reporting
- Common issue diagnostics
- Automatic remediation options
"""

import os
import sys
import argparse
import logging
import json
import yaml
import time
import socket
from datetime import datetime
import subprocess
import importlib.util

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("database-check")


class DatabaseCheck:
    """Database connectivity and health check implementation."""
    
    # Common database ports
    DEFAULT_PORTS = {
        "mysql": 3306,
        "postgresql": 5432,
        "mongodb": 27017,
        "redis": 6379,
        "cassandra": 9042,
        "elasticsearch": 9200,
        "sqlserver": 1433,
        "oracle": 1521
    }
    
    # Required connection parameters by database type
    REQUIRED_PARAMS = {
        "mysql": ["host", "port", "database", "user", "password"],
        "postgresql": ["host", "port", "database", "user", "password"],
        "mongodb": ["host", "port", "database"],
        "redis": ["host", "port"],
        "cassandra": ["host", "port", "keyspace"],
        "elasticsearch": ["host", "port"],
        "sqlserver": ["host", "port", "database", "user", "password"],
        "oracle": ["host", "port", "service_name", "user", "password"]
    }
    
    def __init__(self, db_type=None, config_path=None):
        """Initialize the database check with configuration."""
        self.db_type = db_type
        self.config_path = config_path
        self.config = self._load_config()
        
        # Set database type from config if not provided
        if not self.db_type and self.config and "database" in self.config:
            self.db_type = self.config["database"].get("type")
        
        # Default to MySQL if still not set
        if not self.db_type:
            self.db_type = "mysql"
            logger.warning("Database type not specified, defaulting to MySQL")
        
        # Initialize connection parameters
        self.connection_params = self._get_connection_params()
        
        # Initialize database-specific driver
        self.db_driver = None
        self._load_driver()
    
    def _load_config(self):
        """Load configuration from file."""
        if not self.config_path:
            # Try to find monitoring config
            default_paths = [
                "config/monitoring.yaml",
                "monitoring/config.yaml",
                "config/config.yaml"
            ]
            
            for path in default_paths:
                if os.path.exists(path):
                    self.config_path = path
                    break
        
        if not self.config_path or not os.path.exists(self.config_path):
            logger.warning(f"Config file not found: {self.config_path}")
            return {}
        
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config from {self.config_path}: {e}")
            return {}
    
    def _get_connection_params(self):
        """Extract database connection parameters from config."""
        params = {}
        
        # Set default port based on database type
        if self.db_type in self.DEFAULT_PORTS:
            params["port"] = self.DEFAULT_PORTS[self.db_type]
        
        # Set localhost as default host
        params["host"] = "localhost"
        
        # Extract parameters from config
        if self.config and "database" in self.config:
            db_config = self.config["database"]
            for key, value in db_config.items():
                if key != "type":
                    params[key] = value
        
        return params
    
    def _load_driver(self):
        """Load the appropriate database driver."""
        drivers = {
            "mysql": self._load_mysql_driver,
            "postgresql": self._load_postgresql_driver,
            "mongodb": self._load_mongodb_driver,
            "redis": self._load_redis_driver,
            "cassandra": self._load_cassandra_driver,
            "elasticsearch": self._load_elasticsearch_driver,
            "sqlserver": self._load_sqlserver_driver,
            "oracle": self._load_oracle_driver
        }
        
        if self.db_type in drivers:
            drivers[self.db_type]()
        else:
            logger.error(f"Unsupported database type: {self.db_type}")
    
    def _load_mysql_driver(self):
        """Load the MySQL driver."""
        try:
            import mysql.connector
            self.db_driver = mysql.connector
            logger.debug("MySQL driver loaded successfully")
        except ImportError:
            logger.warning("MySQL driver not found. Install with: pip install mysql-connector-python")
    
    def _load_postgresql_driver(self):
        """Load the PostgreSQL driver."""
        try:
            import psycopg2
            self.db_driver = psycopg2
            logger.debug("PostgreSQL driver loaded successfully")
        except ImportError:
            logger.warning("PostgreSQL driver not found. Install with: pip install psycopg2-binary")
    
    def _load_mongodb_driver(self):
        """Load the MongoDB driver."""
        try:
            import pymongo
            self.db_driver = pymongo
            logger.debug("MongoDB driver loaded successfully")
        except ImportError:
            logger.warning("MongoDB driver not found. Install with: pip install pymongo")
    
    def _load_redis_driver(self):
        """Load the Redis driver."""
        try:
            import redis
            self.db_driver = redis
            logger.debug("Redis driver loaded successfully")
        except ImportError:
            logger.warning("Redis driver not found. Install with: pip install redis")
    
    def _load_cassandra_driver(self):
        """Load the Cassandra driver."""
        try:
            import cassandra
            self.db_driver = cassandra
            logger.debug("Cassandra driver loaded successfully")
        except ImportError:
            logger.warning("Cassandra driver not found. Install with: pip install cassandra-driver")
    
    def _load_elasticsearch_driver(self):
        """Load the Elasticsearch driver."""
        try:
            import elasticsearch
            self.db_driver = elasticsearch
            logger.debug("Elasticsearch driver loaded successfully")
        except ImportError:
            logger.warning("Elasticsearch driver not found. Install with: pip install elasticsearch")
    
    def _load_sqlserver_driver(self):
        """Load the SQL Server driver."""
        try:
            import pyodbc
            self.db_driver = pyodbc
            logger.debug("SQL Server driver loaded successfully")
        except ImportError:
            logger.warning("SQL Server driver not found. Install with: pip install pyodbc")
    
    def _load_oracle_driver(self):
        """Load the Oracle driver."""
        try:
            import cx_Oracle
            self.db_driver = cx_Oracle
            logger.debug("Oracle driver loaded successfully")
        except ImportError:
            logger.warning("Oracle driver not found. Install with: pip install cx_Oracle")
    
    def check_config(self):
        """Check the database configuration for completeness."""
        results = {
            "status": "PASS",
            "issues": [],
            "recommendations": []
        }
        
        # Check if database type is supported
        if self.db_type not in self.REQUIRED_PARAMS:
            results["status"] = "FAIL"
            results["issues"].append(f"Unsupported database type: {self.db_type}")
            results["recommendations"].append(
                f"Use one of the supported database types: {', '.join(self.REQUIRED_PARAMS.keys())}"
            )
            return results
        
        # Check for required parameters
        missing_params = []
        for param in self.REQUIRED_PARAMS[self.db_type]:
            if param not in self.connection_params:
                missing_params.append(param)
        
        if missing_params:
            results["status"] = "FAIL"
            results["issues"].append(f"Missing required parameters: {', '.join(missing_params)}")
            results["recommendations"].append(
                "Update your configuration with the missing parameters"
            )
        
        # Check if driver is available
        if not self.db_driver:
            results["status"] = "FAIL"
            results["issues"].append(f"Database driver for {self.db_type} not found")
            
            driver_packages = {
                "mysql": "mysql-connector-python",
                "postgresql": "psycopg2-binary",
                "mongodb": "pymongo",
                "redis": "redis",
                "cassandra": "cassandra-driver",
                "elasticsearch": "elasticsearch",
                "sqlserver": "pyodbc",
                "oracle": "cx_Oracle"
            }
            
            if self.db_type in driver_packages:
                results["recommendations"].append(
                    f"Install the required driver: pip install {driver_packages[self.db_type]}"
                )
        
        return results
    
    def check_connectivity(self):
        """Check basic connectivity to the database server."""
        results = {
            "status": "PASS",
            "issues": [],
            "recommendations": []
        }
        
        # Extract host and port
        host = self.connection_params.get("host", "localhost")
        
        # Get port from connection parameters or use default
        port = self.connection_params.get("port")
        if not port and self.db_type in self.DEFAULT_PORTS:
            port = self.DEFAULT_PORTS[self.db_type]
        
        if not port:
            results["status"] = "FAIL"
            results["issues"].append("Database port not specified")
            results["recommendations"].append(
                "Add port to your database configuration"
            )
            return results
        
        # Test TCP connectivity
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(3)
                result = sock.connect_ex((host, port))
                
                if result != 0:
                    results["status"] = "FAIL"
                    results["issues"].append(f"Cannot connect to {host}:{port}")
                    
                    # Add recommendations based on error
                    if result == 111:  # Connection refused
                        results["recommendations"].append(
                            f"Ensure the database server is running on {host}:{port}"
                        )
                    elif result == 110:  # Connection timed out
                        results["recommendations"].append(
                            f"Check network connectivity to {host}"
                        )
                    else:
                        results["recommendations"].append(
                            f"Check if the database server is running and accessible (error {result})"
                        )
        except socket.gaierror:
            results["status"] = "FAIL"
            results["issues"].append(f"Cannot resolve hostname: {host}")
            results["recommendations"].append(
                "Check if the hostname is correct or use an IP address"
            )
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Connectivity test failed: {e}")
            results["recommendations"].append(
                "Check network connectivity and database configuration"
            )
        
        return results
    
    def check_connection(self):
        """Test actual database connection using the driver."""
        results = {
            "status": "PASS",
            "issues": [],
            "recommendations": []
        }
        
        # Check if driver is available
        if not self.db_driver:
            results["status"] = "FAIL"
            results["issues"].append(f"Database driver for {self.db_type} not available")
            results["recommendations"].append(
                f"Install the required driver for {self.db_type}"
            )
            return results
        
        # Attempt connection based on database type
        try:
            if self.db_type == "mysql":
                self._check_mysql_connection(results)
            elif self.db_type == "postgresql":
                self._check_postgresql_connection(results)
            elif self.db_type == "mongodb":
                self._check_mongodb_connection(results)
            elif self.db_type == "redis":
                self._check_redis_connection(results)
            elif self.db_type == "cassandra":
                self._check_cassandra_connection(results)
            elif self.db_type == "elasticsearch":
                self._check_elasticsearch_connection(results)
            elif self.db_type == "sqlserver":
                self._check_sqlserver_connection(results)
            elif self.db_type == "oracle":
                self._check_oracle_connection(results)
            else:
                results["status"] = "FAIL"
                results["issues"].append(f"Unsupported database type: {self.db_type}")
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Connection test failed: {e}")
            results["recommendations"].append(
                "Check database credentials and configuration"
            )
        
        return results
    
    def _check_mysql_connection(self, results):
        """Check MySQL connection."""
        try:
            conn = self.db_driver.connect(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 3306),
                database=self.connection_params.get("database"),
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password"),
                connect_timeout=5
            )
            cursor = conn.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            results["version"] = version
            cursor.close()
            conn.close()
        except self.db_driver.Error as e:
            results["status"] = "FAIL"
            results["issues"].append(f"MySQL connection failed: {e}")
            
            # Add specific recommendations based on error
            error_code = e.errno if hasattr(e, 'errno') else None
            
            if error_code == 1045:  # Access denied
                results["recommendations"].append(
                    "Check username and password"
                )
            elif error_code == 1049:  # Unknown database
                results["recommendations"].append(
                    "Check if the database exists"
                )
            elif error_code == 2003:  # Cannot connect
                results["recommendations"].append(
                    "Check if MySQL server is running"
                )
            else:
                results["recommendations"].append(
                    "Check MySQL configuration and credentials"
                )
    
    def _check_postgresql_connection(self, results):
        """Check PostgreSQL connection."""
        try:
            conn = self.db_driver.connect(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 5432),
                database=self.connection_params.get("database"),
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password"),
                connect_timeout=5
            )
            cursor = conn.cursor()
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            results["version"] = version
            cursor.close()
            conn.close()
        except self.db_driver.Error as e:
            results["status"] = "FAIL"
            results["issues"].append(f"PostgreSQL connection failed: {e}")
            results["recommendations"].append(
                "Check PostgreSQL configuration and credentials"
            )
    
    def _check_mongodb_connection(self, results):
        """Check MongoDB connection."""
        try:
            client = self.db_driver.MongoClient(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 27017),
                serverSelectionTimeoutMS=5000
            )
            server_info = client.server_info()
            results["version"] = server_info.get("version")
            client.close()
        except self.db_driver.errors.ServerSelectionTimeoutError:
            results["status"] = "FAIL"
            results["issues"].append("MongoDB server selection timeout")
            results["recommendations"].append(
                "Check if MongoDB server is running and accessible"
            )
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"MongoDB connection failed: {e}")
            results["recommendations"].append(
                "Check MongoDB configuration and credentials"
            )
    
    def _check_redis_connection(self, results):
        """Check Redis connection."""
        try:
            client = self.db_driver.Redis(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 6379),
                socket_timeout=5
            )
            info = client.info()
            results["version"] = info.get("redis_version")
        except self.db_driver.exceptions.ConnectionError:
            results["status"] = "FAIL"
            results["issues"].append("Redis connection error")
            results["recommendations"].append(
                "Check if Redis server is running and accessible"
            )
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Redis connection failed: {e}")
            results["recommendations"].append(
                "Check Redis configuration"
            )
    
    def _check_cassandra_connection(self, results):
        """Check Cassandra connection."""
        try:
            from cassandra.cluster import Cluster
            
            cluster = Cluster(
                [self.connection_params.get("host", "localhost")],
                port=self.connection_params.get("port", 9042)
            )
            session = cluster.connect()
            row = session.execute("SELECT release_version FROM system.local").one()
            results["version"] = row.release_version
            session.shutdown()
            cluster.shutdown()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Cassandra connection failed: {e}")
            results["recommendations"].append(
                "Check Cassandra configuration and credentials"
            )
    
    def _check_elasticsearch_connection(self, results):
        """Check Elasticsearch connection."""
        try:
            es = self.db_driver.Elasticsearch(
                [f"{self.connection_params.get('host', 'localhost')}:{self.connection_params.get('port', 9200)}"],
                timeout=5
            )
            info = es.info()
            results["version"] = info.get("version", {}).get("number")
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Elasticsearch connection failed: {e}")
            results["recommendations"].append(
                "Check Elasticsearch configuration and credentials"
            )
    
    def _check_sqlserver_connection(self, results):
        """Check SQL Server connection."""
        try:
            conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={self.connection_params.get('host', 'localhost')},{self.connection_params.get('port', 1433)};DATABASE={self.connection_params.get('database')};UID={self.connection_params.get('user')};PWD={self.connection_params.get('password')}"
            conn = self.db_driver.connect(conn_str, timeout=5)
            cursor = conn.cursor()
            cursor.execute("SELECT @@VERSION")
            version = cursor.fetchone()[0]
            results["version"] = version
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"SQL Server connection failed: {e}")
            results["recommendations"].append(
                "Check SQL Server configuration and credentials"
            )
    
    def _check_oracle_connection(self, results):
        """Check Oracle connection."""
        try:
            dsn = self.db_driver.makedsn(
                self.connection_params.get("host", "localhost"),
                self.connection_params.get("port", 1521),
                service_name=self.connection_params.get("service_name")
            )
            conn = self.db_driver.connect(
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password"),
                dsn=dsn
            )
            cursor = conn.cursor()
            cursor.execute("SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1")
            version = cursor.fetchone()[0]
            results["version"] = version
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Oracle connection failed: {e}")
            results["recommendations"].append(
                "Check Oracle configuration and credentials"
            )
    
    def check_performance(self):
        """Run a simple performance test on the database."""
        results = {
            "status": "PASS",
            "issues": [],
            "recommendations": [],
            "metrics": {}
        }
        
        # Check if driver is available
        if not self.db_driver:
            results["status"] = "FAIL"
            results["issues"].append(f"Database driver for {self.db_type} not available")
            return results
        
        # Run performance test based on database type
        try:
            if self.db_type == "mysql":
                self._check_mysql_performance(results)
            elif self.db_type == "postgresql":
                self._check_postgresql_performance(results)
            elif self.db_type == "mongodb":
                self._check_mongodb_performance(results)
            elif self.db_type == "redis":
                self._check_redis_performance(results)
            elif self.db_type == "cassandra":
                self._check_cassandra_performance(results)
            elif self.db_type == "elasticsearch":
                self._check_elasticsearch_performance(results)
            elif self.db_type == "sqlserver":
                self._check_sqlserver_performance(results)
            elif self.db_type == "oracle":
                self._check_oracle_performance(results)
            else:
                results["status"] = "SKIP"
                results["issues"].append(f"Performance test not implemented for {self.db_type}")
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Performance test failed: {e}")
        
        return results
    
    def _check_mysql_performance(self, results):
        """Check MySQL performance."""
        try:
            conn = self.db_driver.connect(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 3306),
                database=self.connection_params.get("database"),
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password")
            )
            cursor = conn.cursor()
            
            # Test connection time
            start_time = time.time()
            cursor.execute("SELECT 1")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            cursor.execute("SELECT 1")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get server variables
            cursor.execute("SHOW GLOBAL VARIABLES LIKE 'max_connections'")
            max_connections = cursor.fetchone()[1]
            results["metrics"]["max_connections"] = max_connections
            
            cursor.execute("SHOW GLOBAL STATUS LIKE 'Threads_connected'")
            threads_connected = cursor.fetchone()[1]
            results["metrics"]["threads_connected"] = threads_connected
            
            # Check if connection count is close to limit
            connection_ratio = float(threads_connected) / float(max_connections)
            results["metrics"]["connection_ratio"] = connection_ratio
            
            if connection_ratio > 0.8:
                results["status"] = "WARNING"
                results["issues"].append(f"High connection usage: {connection_ratio:.0%}")
                results["recommendations"].append(
                    "Consider increasing max_connections or optimizing connection usage"
                )
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check database load and performance"
                )
            
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"MySQL performance test failed: {e}")
    
    def _check_postgresql_performance(self, results):
        """Check PostgreSQL performance."""
        try:
            conn = self.db_driver.connect(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 5432),
                database=self.connection_params.get("database"),
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password")
            )
            cursor = conn.cursor()
            
            # Test connection time
            start_time = time.time()
            cursor.execute("SELECT 1")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            cursor.execute("SELECT 1")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get connection info
            cursor.execute("SHOW max_connections")
            max_connections = cursor.fetchone()[0]
            results["metrics"]["max_connections"] = max_connections
            
            cursor.execute("SELECT count(*) FROM pg_stat_activity")
            active_connections = cursor.fetchone()[0]
            results["metrics"]["active_connections"] = active_connections
            
            # Check if connection count is close to limit
            connection_ratio = float(active_connections) / float(max_connections)
            results["metrics"]["connection_ratio"] = connection_ratio
            
            if connection_ratio > 0.8:
                results["status"] = "WARNING"
                results["issues"].append(f"High connection usage: {connection_ratio:.0%}")
                results["recommendations"].append(
                    "Consider increasing max_connections or optimizing connection usage"
                )
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check database load and performance"
                )
            
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"PostgreSQL performance test failed: {e}")
    
    def _check_mongodb_performance(self, results):
        """Check MongoDB performance."""
        try:
            client = self.db_driver.MongoClient(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 27017),
                serverSelectionTimeoutMS=5000
            )
            
            # Test connection time
            start_time = time.time()
            client.admin.command("ping")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            client.admin.command("ping")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get server status
            server_status = client.admin.command("serverStatus")
            
            # Check connections
            connections = server_status.get("connections", {})
            current = connections.get("current", 0)
            available = connections.get("available", 0)
            
            if current + available > 0:
                connection_ratio = float(current) / float(current + available)
                results["metrics"]["connection_ratio"] = connection_ratio
                
                if connection_ratio > 0.8:
                    results["status"] = "WARNING"
                    results["issues"].append(f"High connection usage: {connection_ratio:.0%}")
                    results["recommendations"].append(
                        "Consider increasing connection limit or optimizing connection usage"
                    )
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check database load and performance"
                )
            
            client.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"MongoDB performance test failed: {e}")
    
    def _check_redis_performance(self, results):
        """Check Redis performance."""
        try:
            client = self.db_driver.Redis(
                host=self.connection_params.get("host", "localhost"),
                port=self.connection_params.get("port", 6379)
            )
            
            # Test connection time
            start_time = time.time()
            client.ping()
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple operation
            start_time = time.time()
            client.ping()
            op_time = time.time() - start_time
            results["metrics"]["simple_operation_time"] = op_time
            
            # Get info
            info = client.info()
            
            # Check memory usage
            used_memory = int(info.get("used_memory", 0))
            total_system_memory = int(info.get("total_system_memory", 0))
            
            if total_system_memory > 0:
                memory_ratio = float(used_memory) / float(total_system_memory)
                results["metrics"]["memory_ratio"] = memory_ratio
                
                if memory_ratio > 0.8:
                    results["status"] = "WARNING"
                    results["issues"].append(f"High memory usage: {memory_ratio:.0%}")
                    results["recommendations"].append(
                        "Consider increasing Redis memory limit or optimizing memory usage"
                    )
            
            # Check connections
            connected_clients = int(info.get("connected_clients", 0))
            maxclients = int(info.get("maxclients", 0))
            
            if maxclients > 0:
                connection_ratio = float(connected_clients) / float(maxclients)
                results["metrics"]["connection_ratio"] = connection_ratio
                
                if connection_ratio > 0.8:
                    results["status"] = "WARNING"
                    results["issues"].append(f"High connection usage: {connection_ratio:.0%}")
                    results["recommendations"].append(
                        "Consider increasing maxclients or optimizing connection usage"
                    )
            
            # Check operation performance
            if op_time > 0.01:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow operation response: {op_time:.3f}s")
                results["recommendations"].append(
                    "Check Redis load and performance"
                )
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Redis performance test failed: {e}")
    
    def _check_cassandra_performance(self, results):
        """Check Cassandra performance."""
        try:
            from cassandra.cluster import Cluster
            
            cluster = Cluster(
                [self.connection_params.get("host", "localhost")],
                port=self.connection_params.get("port", 9042)
            )
            session = cluster.connect()
            
            # Test connection time
            start_time = time.time()
            session.execute("SELECT now() FROM system.local")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            session.execute("SELECT now() FROM system.local")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check Cassandra load and performance"
                )
            
            session.shutdown()
            cluster.shutdown()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Cassandra performance test failed: {e}")
    
    def _check_elasticsearch_performance(self, results):
        """Check Elasticsearch performance."""
        try:
            es = self.db_driver.Elasticsearch(
                [f"{self.connection_params.get('host', 'localhost')}:{self.connection_params.get('port', 9200)}"],
                timeout=5
            )
            
            # Test connection time
            start_time = time.time()
            es.ping()
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            es.search(index="_all", body={"query": {"match_all": {}}}, size=1)
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get cluster health
            health = es.cluster.health()
            results["metrics"]["cluster_status"] = health.get("status")
            
            # Check cluster status
            if health.get("status") != "green":
                results["status"] = "WARNING"
                results["issues"].append(f"Cluster status is not green: {health.get('status')}")
                results["recommendations"].append(
                    "Check Elasticsearch cluster health and fix any issues"
                )
            
            # Check query performance
            if query_time > 0.5:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check Elasticsearch load and performance"
                )
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Elasticsearch performance test failed: {e}")
    
    def _check_sqlserver_performance(self, results):
        """Check SQL Server performance."""
        try:
            conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={self.connection_params.get('host', 'localhost')},{self.connection_params.get('port', 1433)};DATABASE={self.connection_params.get('database')};UID={self.connection_params.get('user')};PWD={self.connection_params.get('password')}"
            conn = self.db_driver.connect(conn_str, timeout=5)
            cursor = conn.cursor()
            
            # Test connection time
            start_time = time.time()
            cursor.execute("SELECT 1")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            cursor.execute("SELECT 1")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get connection info
            cursor.execute("SELECT COUNT(*) FROM sys.dm_exec_connections")
            connections = cursor.fetchone()[0]
            results["metrics"]["connections"] = connections
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check SQL Server load and performance"
                )
            
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"SQL Server performance test failed: {e}")
    
    def _check_oracle_performance(self, results):
        """Check Oracle performance."""
        try:
            dsn = self.db_driver.makedsn(
                self.connection_params.get("host", "localhost"),
                self.connection_params.get("port", 1521),
                service_name=self.connection_params.get("service_name")
            )
            conn = self.db_driver.connect(
                user=self.connection_params.get("user"),
                password=self.connection_params.get("password"),
                dsn=dsn
            )
            cursor = conn.cursor()
            
            # Test connection time
            start_time = time.time()
            cursor.execute("SELECT 1 FROM DUAL")
            conn_time = time.time() - start_time
            results["metrics"]["connection_time"] = conn_time
            
            # Test simple query
            start_time = time.time()
            cursor.execute("SELECT 1 FROM DUAL")
            query_time = time.time() - start_time
            results["metrics"]["simple_query_time"] = query_time
            
            # Get session info
            cursor.execute("SELECT COUNT(*) FROM V$SESSION")
            sessions = cursor.fetchone()[0]
            results["metrics"]["sessions"] = sessions
            
            # Check query performance
            if query_time > 0.1:
                results["status"] = "WARNING"
                results["issues"].append(f"Slow query response: {query_time:.3f}s")
                results["recommendations"].append(
                    "Check Oracle load and performance"
                )
            
            cursor.close()
            conn.close()
        except Exception as e:
            results["status"] = "FAIL"
            results["issues"].append(f"Oracle performance test failed: {e}")


def main():
    """Main function to run database checks from command line."""
    import argparse
    import json
    import sys
    
    parser = argparse.ArgumentParser(description="Database connectivity and performance checker")
    parser.add_argument("--type", "-t", required=True,
                       choices=["mysql", "postgres", "mongodb", "redis", "cassandra", "elasticsearch", "sqlserver", "oracle"],
                       help="Type of database to check")
    parser.add_argument("--config", "-c",
                       help="Path to config file with connection parameters (JSON format)")
    parser.add_argument("--host",
                       help="Database host")
    parser.add_argument("--port", type=int,
                       help="Database port")
    parser.add_argument("--user", "-u",
                       help="Database username")
    parser.add_argument("--password", "-p",
                       help="Database password")
    parser.add_argument("--database", "-d",
                       help="Database name")
    parser.add_argument("--json", action="store_true",
                       help="Output results in JSON format")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Display detailed results")
    parser.add_argument("--connection-only", action="store_true",
                       help="Check connection only, skip performance tests")
    
    args = parser.parse_args()
    
    # Load configuration
    connection_params = {}
    if args.config:
        try:
            with open(args.config, 'r') as f:
                connection_params = json.load(f)
        except Exception as e:
            print(f"Error loading config file: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Override with command line parameters if provided
    if args.host:
        connection_params["host"] = args.host
    if args.port:
        connection_params["port"] = args.port
    if args.user:
        connection_params["user"] = args.user
    if args.password:
        connection_params["password"] = args.password
    if args.database:
        connection_params["database"] = args.database
    
    # Initialize database checker
    try:
        checker = DatabaseChecker(args.type, connection_params)
        
        # Run check
        if args.connection_only:
            results = checker.check_connection()
        else:
            results = checker.check_all()
        
        # Output results
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("\n=== Database Check Results ===")
            print(f"Database Type: {args.type}")
            print(f"Status: {results['status']}")
            
            if results["issues"]:
                print("\nIssues:")
                for issue in results["issues"]:
                    print(f"  - {issue}")
            
            if results["recommendations"]:
                print("\nRecommendations:")
                for rec in results["recommendations"]:
                    print(f"  - {rec}")
            
            if args.verbose and results["metrics"]:
                print("\nMetrics:")
                for key, value in results["metrics"].items():
                    print(f"  - {key}: {value}")
        
        # Exit with appropriate code
        if results["status"] == "OK":
            sys.exit(0)
        elif results["status"] == "WARNING":
            sys.exit(1)
        else:
            sys.exit(2)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()