#!/usr/bin/env python3
"""
Unit tests for the database_check.py script.
Tests the database connectivity and performance checking functionality.
"""

import unittest
import json
import sys
import time
from unittest.mock import patch, MagicMock, call
from io import StringIO
import importlib.util
import os

# Import the module directly from the scripts directory
script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                          "scripts", "database_check.py")
spec = importlib.util.spec_from_file_location("database_check", script_path)
database_check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(database_check)


class TestDatabaseChecker(unittest.TestCase):
    """Test the DatabaseChecker class and its methods."""

    def setUp(self):
        """Set up test environment."""
        self.basic_config = {
            "host": "localhost",
            "port": 3306,
            "user": "testuser",
            "password": "testpass",
            "database": "testdb"
        }

    def test_initialization(self):
        """Test initialization with different database types."""
        # Test MySQL initialization
        checker = database_check.DatabaseChecker("mysql", self.basic_config)
        self.assertEqual(checker.db_type, "mysql")
        self.assertEqual(checker.connection_params, self.basic_config)
        
        # Test with minimal config
        minimal_config = {"host": "localhost"}
        checker = database_check.DatabaseChecker("postgres", minimal_config)
        self.assertEqual(checker.db_type, "postgres")
        self.assertEqual(checker.connection_params, minimal_config)
        
        # Test with empty config
        checker = database_check.DatabaseChecker("mongodb", {})
        self.assertEqual(checker.db_type, "mongodb")
        self.assertEqual(checker.connection_params, {})

    def test_invalid_db_type(self):
        """Test initialization with invalid database type."""
        with self.assertRaises(ValueError):
            database_check.DatabaseChecker("invalid_db", self.basic_config)

    @patch("importlib.import_module")
    def test_driver_loading(self, mock_import):
        """Test loading of different database drivers."""
        # Mock the imported modules
        mock_mysql = MagicMock()
        mock_import.return_value = mock_mysql
        
        # Test MySQL driver loading
        checker = database_check.DatabaseChecker("mysql", self.basic_config)
        mock_import.assert_called_with("mysql.connector")
        self.assertEqual(checker.db_driver, mock_import.return_value)
        
        # Test PostgreSQL driver loading
        mock_import.reset_mock()
        mock_pg = MagicMock()
        mock_import.return_value = mock_pg
        checker = database_check.DatabaseChecker("postgres", self.basic_config)
        mock_import.assert_called_with("psycopg2")
        self.assertEqual(checker.db_driver, mock_import.return_value)

    @patch("importlib.import_module")
    def test_driver_import_error(self, mock_import):
        """Test handling of driver import errors."""
        mock_import.side_effect = ImportError("Driver not found")
        
        with self.assertRaises(ImportError):
            database_check.DatabaseChecker("mysql", self.basic_config)

    def test_check_connection_mysql(self):
        """Test MySQL connection checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the MySQL connector
            mock_mysql = MagicMock()
            mock_connection = MagicMock()
            mock_mysql.connect.return_value = mock_connection
            mock_import.return_value = mock_mysql
            
            # Create checker and test connection
            checker = database_check.DatabaseChecker("mysql", self.basic_config)
            results = checker.check_connection()
            
            # Verify connection was attempted with correct parameters
            mock_mysql.connect.assert_called_with(
                host='localhost',
                port=3306,
                user='testuser',
                password='testpass',
                database='testdb',
                connect_timeout=5
            )
            
            # Verify results
            self.assertEqual(results["status"], "OK")
            self.assertEqual(len(results["issues"]), 0)
            
            # Test connection failure
            mock_mysql.connect.side_effect = Exception("Connection failed")
            results = checker.check_connection()
            self.assertEqual(results["status"], "FAIL")
            self.assertTrue(any("Connection failed" in issue for issue in results["issues"]))

    def test_check_connection_postgres(self):
        """Test PostgreSQL connection checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the PostgreSQL connector
            mock_pg = MagicMock()
            mock_connection = MagicMock()
            mock_pg.connect.return_value = mock_connection
            mock_import.return_value = mock_pg
            
            # Create checker and test connection
            checker = database_check.DatabaseChecker("postgres", self.basic_config)
            results = checker.check_connection()
            
            # Verify connection was attempted with correct parameters
            mock_pg.connect.assert_called_with(
                host='localhost',
                port=3306,
                user='testuser',
                password='testpass',
                dbname='testdb',
                connect_timeout=5
            )
            
            # Verify results
            self.assertEqual(results["status"], "OK")
            self.assertEqual(len(results["issues"]), 0)

    def test_check_connection_mongodb(self):
        """Test MongoDB connection checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the MongoDB connector
            mock_mongo = MagicMock()
            mock_client = MagicMock()
            mock_mongo.MongoClient.return_value = mock_client
            mock_import.return_value = mock_mongo
            
            # Create checker and test connection
            checker = database_check.DatabaseChecker("mongodb", self.basic_config)
            results = checker.check_connection()
            
            # Verify connection was attempted with correct parameters
            mock_mongo.MongoClient.assert_called_with(
                host='localhost',
                port=3306,
                username='testuser',
                password='testpass',
                serverSelectionTimeoutMS=5000
            )
            
            # Verify results
            self.assertEqual(results["status"], "OK")
            self.assertEqual(len(results["issues"]), 0)

    def test_check_connection_redis(self):
        """Test Redis connection checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the Redis connector
            mock_redis = MagicMock()
            mock_client = MagicMock()
            mock_redis.Redis.return_value = mock_client
            mock_import.return_value = mock_redis
            
            # Create checker and test connection
            checker = database_check.DatabaseChecker("redis", self.basic_config)
            results = checker.check_connection()
            
            # Verify connection was attempted with correct parameters
            mock_redis.Redis.assert_called_with(
                host='localhost',
                port=3306,
                password='testpass',
                db=0,
                socket_timeout=5
            )
            
            # Verify results
            self.assertEqual(results["status"], "OK")
            self.assertEqual(len(results["issues"]), 0)

    def test_check_mysql_performance(self):
        """Test MySQL performance checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the MySQL connector
            mock_mysql = MagicMock()
            mock_connection = MagicMock()
            mock_cursor = MagicMock()
            mock_connection.cursor.return_value = mock_cursor
            mock_cursor.fetchall.return_value = [("information_schema",), ("mysql",)]
            mock_mysql.connect.return_value = mock_connection
            mock_import.return_value = mock_mysql
            
            # Create checker
            checker = database_check.DatabaseChecker("mysql", self.basic_config)
            
            # Mock time.time to simulate query performance
            with patch("time.time") as mock_time:
                mock_time.side_effect = [0, 0.05, 0.1, 0.2]  # Connection, query times
                results = {"status": "OK", "issues": [], "recommendations": [], "metrics": {}}
                checker._check_mysql_performance(results)
            
            # Verify queries were executed
            mock_cursor.execute.assert_any_call("SHOW DATABASES")
            
            # Verify metrics were collected
            self.assertIn("connection_time", results["metrics"])
            self.assertIn("query_time", results["metrics"])
            
            # Verify slow query warning
            self.assertEqual(results["status"], "WARNING")
            self.assertTrue(any("Slow query" in issue for issue in results["issues"]))

    def test_check_postgres_performance(self):
        """Test PostgreSQL performance checking."""
        with patch("importlib.import_module") as mock_import:
            # Mock the PostgreSQL connector
            mock_pg = MagicMock()
            mock_connection = MagicMock()
            mock_cursor = MagicMock()
            mock_connection.cursor.return_value = mock_cursor
            mock_cursor.fetchall.return_value = [("postgres",), ("template0",)]
            mock_pg.connect.return_value = mock_connection
            mock_import.return_value = mock_pg
            
            # Create checker
            checker = database_check.DatabaseChecker("postgres", self.basic_config)
            
            # Mock time.time to simulate query performance
            with patch("time.time") as mock_time:
                mock_time.side_effect = [0, 0.05, 0.1, 0.2]  # Connection, query times
                results = {"status": "OK", "issues": [], "recommendations": [], "metrics": {}}
                checker._check_postgres_performance(results)
            
            # Verify queries were executed
            mock_cursor.execute.assert_any_call("SELECT datname FROM pg_database")
            
            # Verify metrics were collected
            self.assertIn("connection_time", results["metrics"])
            self.assertIn("query_time", results["metrics"])
            
            # Verify slow query warning
            self.assertEqual(results["status"], "WARNING")
            self.assertTrue(any("Slow query" in issue for issue in results["issues"]))

    def test_check_all(self):
        """Test the check_all method that runs all checks."""
        with patch.object(database_check.DatabaseChecker, "check_connection") as mock_conn:
            with patch.object(database_check.DatabaseChecker, "check_performance") as mock_perf:
                # Set up return values
                mock_conn.return_value = {
                    "status": "OK",
                    "issues": [],
                    "recommendations": [],
                    "metrics": {"connection_time": 0.01}
                }
                mock_perf.return_value = {
                    "status": "WARNING",
                    "issues": ["Slow query: 0.2s"],
                    "recommendations": ["Optimize your queries"],
                    "metrics": {"query_time": 0.2}
                }
                
                # Create checker and run check_all
                checker = database_check.DatabaseChecker("mysql", self.basic_config)
                results = checker.check_all()
                
                # Verify both methods were called
                mock_conn.assert_called_once()
                mock_perf.assert_called_once()
                
                # Verify results were combined (WARNING status should take precedence)
                self.assertEqual(results["status"], "WARNING")
                self.assertEqual(len(results["issues"]), 1)
                self.assertEqual(len(results["recommendations"]), 1)
                self.assertEqual(len(results["metrics"]), 2)

    @patch("sys.stdout", new_callable=StringIO)
    @patch("sys.stderr", new_callable=StringIO)
    @patch("sys.argv", ["database_check.py", "--type", "mysql", "--host", "localhost"])
    @patch.object(database_check.DatabaseChecker, "check_all")
    def test_main_function(self, mock_check_all, mock_stderr, mock_stdout):
        """Test the main function and command line arguments."""
        # Set up return value
        mock_check_all.return_value = {
            "status": "OK",
            "issues": [],
            "recommendations": [],
            "metrics": {"connection_time": 0.01, "query_time": 0.05}
        }
        
        # Call main function
        with patch.object(sys, "exit") as mock_exit:
            database_check.main()
            
            # Verify checker was created with correct arguments
            mock_check_all.assert_called_once()
            mock_exit.assert_called_with(0)  # Exit with 0 for OK status
            
            # Verify output
            output = mock_stdout.getvalue()
            self.assertIn("Database Type: mysql", output)
            self.assertIn("Status: OK", output)

    @patch("sys.stdout", new_callable=StringIO)
    @patch("sys.argv", ["database_check.py", "--type", "mysql", "--host", "localhost", "--json"])
    @patch.object(database_check.DatabaseChecker, "check_all")
    def test_json_output(self, mock_check_all, mock_stdout):
        """Test JSON output format."""
        # Set up return value
        return_value = {
            "status": "OK",
            "issues": [],
            "recommendations": [],
            "metrics": {"connection_time": 0.01, "query_time": 0.05}
        }
        mock_check_all.return_value = return_value
        
        # Call main function
        with patch.object(sys, "exit"):
            database_check.main()
            
            # Verify JSON output
            output = mock_stdout.getvalue()
            output_dict = json.loads(output)
            self.assertEqual(output_dict, return_value)

    @patch("sys.stderr", new_callable=StringIO)
    @patch("sys.argv", ["database_check.py", "--type", "invalid"])
    def test_invalid_arguments(self, mock_stderr):
        """Test handling of invalid command line arguments."""
        # Call main function
        with self.assertRaises(SystemExit):
            database_check.main()

    @patch("sys.stdout", new_callable=StringIO)
    @patch("sys.argv", ["database_check.py", "--type", "mysql", "--config", "non_existent.json"])
    def test_config_file_error(self, mock_stdout):
        """Test handling of config file errors."""
        # Call main function
        with patch.object(sys, "exit") as mock_exit:
            database_check.main()
            
            # Verify exit code
            mock_exit.assert_called_with(1)


if __name__ == "__main__":
    unittest.main()