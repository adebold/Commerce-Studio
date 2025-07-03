#!/usr/bin/env python
"""
Test suite for the monitoring diagnostics script.

These tests verify the functionality of the monitoring diagnostics tool:
- Running diagnostics
- Checking system components
- Analyzing alerts
- Applying fixes
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
import yaml

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from scripts.monitoring_diagnostics import MonitoringDiagnostics, parse_args, main


class TestMonitoringDiagnostics(unittest.TestCase):
    """Test suite for the MonitoringDiagnostics class."""

    def setUp(self):
        """Set up test fixtures."""
        # Mock configuration data
        self.mock_config = {
            "check_intervals": {
                "api_health": 30,
                "database_connectivity": 60,
                "disk_usage": 300,
                "memory_usage": 300,
                "cpu_usage": 300,
                "log_check": 600,
                "port_check": 60
            },
            "alerts": {
                "storage_path": "data/alerts.json",
                "notifiers": {
                    "email": {
                        "enabled": True,
                        "recipients": ["admin@example.com"]
                    },
                    "slack": {
                        "enabled": True,
                        "webhook_url": "https://hooks.slack.com/services/XXX/YYY/ZZZ"
                    }
                }
            },
            "api_health": {
                "url": "http://localhost:8000",
                "timeout": 5,
                "expected_status": 200
            },
            "database_connectivity": {
                "connection_string": "postgresql://user:password@localhost:5432/db",
                "timeout": 5
            },
            "disk_usage": {
                "path": "/",
                "threshold": 90
            },
            "memory_usage": {
                "threshold": 90
            },
            "cpu_usage": {
                "threshold": 90
            },
            "log_check": {
                "log_file": "/var/log/application.log",
                "patterns": ["ERROR", "CRITICAL"]
            },
            "port_check": {
                "host": "localhost",
                "ports": [80, 443, 5432, 8000]
            }
        }
        
        # Mock monitoring system status
        self.mock_status = {
            "running": True,
            "start_time": "2025-06-11T14:00:00",
            "uptime": 1440,
            "active_checks": [
                "api_health",
                "database_connectivity",
                "disk_usage",
                "memory_usage",
                "cpu_usage"
            ],
            "alert_count": {
                "total": 10,
                "active": 8,
                "by_level": {
                    "INFO": 1,
                    "WARNING": 0,
                    "ERROR": 0,
                    "CRITICAL": 7
                }
            }
        }
        
        # Create mock Alert objects
        self.mock_alerts = [
            MagicMock(
                id="alert1",
                source="api_health",
                level="CRITICAL",
                message="API server is not responding",
                timestamp="2025-06-11T14:10:00",
                details={
                    "url": "http://localhost:8000/health",
                    "error": "Connection refused"
                },
                acknowledged=False,
                resolved=False
            ),
            MagicMock(
                id="alert2",
                source="database_connectivity",
                level="CRITICAL",
                message="Database connection failed",
                timestamp="2025-06-11T14:15:00",
                details={
                    "connection_string": "postgresql://user:password@localhost:5432/db",
                    "error": "Connection refused"
                },
                acknowledged=False,
                resolved=False
            ),
            MagicMock(
                id="alert3",
                source="memory_usage",
                level="INFO",
                message="Memory usage is at 75%",
                timestamp="2025-06-11T14:20:00",
                details={
                    "usage": 75,
                    "threshold": 90
                },
                acknowledged=False,
                resolved=False
            )
        ]
        
        # Mock check results
        self.mock_check_results = {
            "api_health": {
                "success": False,
                "message": "API health check failed: Connection refused",
                "details": {
                    "url": "http://localhost:8000/health",
                    "error": "Connection refused"
                }
            },
            "database_connectivity": {
                "success": False,
                "message": "Database connection failed: Connection refused",
                "details": {
                    "connection_string": "postgresql://user:password@localhost:5432/db",
                    "error": "Connection refused"
                }
            },
            "disk_usage": {
                "success": True,
                "message": "Disk usage is at 65%",
                "details": {
                    "path": "/",
                    "usage": 65,
                    "threshold": 90
                }
            },
            "memory_usage": {
                "success": True,
                "message": "Memory usage is at 75%",
                "details": {
                    "usage": 75,
                    "threshold": 90
                }
            },
            "cpu_usage": {
                "success": True,
                "message": "CPU usage is at 50%",
                "details": {
                    "usage": 50,
                    "threshold": 90
                }
            }
        }

    @patch("builtins.open", new_callable=mock_open, read_data=yaml.dump({"check_intervals": {}, "alerts": {}}))
    @patch("monitoring.monitoring.MonitoringSystem")
    def test_init(self, mock_monitoring, mock_file):
        """Test initialization of MonitoringDiagnostics."""
        # Create instance
        diagnostics = MonitoringDiagnostics(config_path="test_config.yml")
        
        # Verify initialization
        self.assertEqual(diagnostics.config_path, "test_config.yml")
        self.assertEqual(diagnostics.issues, [])
        self.assertEqual(diagnostics.fixes, [])
        mock_monitoring.assert_called_once_with(config_path="test_config.yml")

    @patch("builtins.open", new_callable=mock_open)
    def test_load_config_success(self, mock_file):
        """Test loading configuration successfully."""
        # Mock the file content
        mock_file.return_value.read.return_value = yaml.dump(self.mock_config)
        
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics(config_path="test_config.yml")
        diagnostics.monitoring = mock_monitoring
        
        # Call method
        config = diagnostics._load_config()
        
        # Verify result
        self.assertEqual(config["check_intervals"]["api_health"], 30)
        self.assertEqual(config["alerts"]["notifiers"]["email"]["recipients"], ["admin@example.com"])

    @patch("builtins.open")
    def test_load_config_failure(self, mock_file):
        """Test handling of configuration loading failure."""
        # Mock file open to raise exception
        mock_file.side_effect = Exception("File not found")
        
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics(config_path="test_config.yml")
        diagnostics.monitoring = mock_monitoring
        
        # Call method
        config = diagnostics._load_config()
        
        # Verify result
        self.assertEqual(config, {})

    @patch("builtins.open", new_callable=mock_open)
    def test_check_config_missing_section(self, mock_file):
        """Test checking configuration with missing sections."""
        # Mock the file content with missing sections
        mock_file.return_value.read.return_value = yaml.dump({"check_intervals": {}})
        
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics(config_path="test_config.yml")
        diagnostics.monitoring = mock_monitoring
        diagnostics.config = {"check_intervals": {}}
        
        # Call method
        diagnostics._check_config()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 1)
        self.assertEqual(diagnostics.issues[0]["severity"], "HIGH")
        self.assertEqual(diagnostics.issues[0]["component"], "configuration")
        self.assertIn("Missing required configuration section", diagnostics.issues[0]["message"])

    @patch("monitoring.monitoring.MonitoringSystem")
    def test_check_monitoring_status_running(self, mock_monitoring_class):
        """Test checking monitoring status when running."""
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        mock_monitoring.get_status.return_value = {"running": True}
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics()
        diagnostics.monitoring = mock_monitoring
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_monitoring_status()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 0)

    @patch("monitoring.monitoring.MonitoringSystem")
    def test_check_monitoring_status_not_running(self, mock_monitoring_class):
        """Test checking monitoring status when not running."""
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        mock_monitoring.get_status.return_value = {"running": False}
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics()
        diagnostics.monitoring = mock_monitoring
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_monitoring_status()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 1)
        self.assertEqual(diagnostics.issues[0]["severity"], "HIGH")
        self.assertEqual(diagnostics.issues[0]["component"], "monitoring")
        self.assertIn("not running", diagnostics.issues[0]["message"])
        
        # Verify fix was added
        self.assertEqual(len(diagnostics.fixes), 1)
        self.assertEqual(diagnostics.fixes[0]["action"], "start_monitoring")

    @patch("monitoring.monitoring.MonitoringSystem")
    def test_analyze_alerts_critical(self, mock_monitoring_class):
        """Test analyzing alerts with critical alerts."""
        # Create mock MonitoringSystem
        mock_monitoring = MagicMock()
        mock_monitoring.get_status.return_value = self.mock_status
        mock_monitoring.get_active_alerts.return_value = self.mock_alerts
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics()
        diagnostics.monitoring = mock_monitoring
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._analyze_alerts()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 3)  # 1 for high count, 2 for critical alerts
        
        # Check for critical alert issues
        critical_issues = [i for i in diagnostics.issues if i["severity"] == "CRITICAL"]
        self.assertEqual(len(critical_issues), 2)
        
        # Verify fixes were added
        self.assertEqual(len(diagnostics.fixes), 2)
        actions = [f["action"] for f in diagnostics.fixes]
        self.assertIn("start_api_server", actions)
        self.assertIn("check_database", actions)

    @patch("monitoring.health_checks.run_check")
    @patch("monitoring.health_checks.get_available_checks")
    def test_check_components(self, mock_get_checks, mock_run_check):
        """Test checking components."""
        # Mock available checks
        mock_get_checks.return_value = ["api_health", "database_connectivity", "disk_usage"]
        
        # Mock run_check to return success for disk_usage and failure for others
        def mock_run_check_side_effect(check_name, config):
            return self.mock_check_results.get(check_name, {"success": True})
        
        mock_run_check.side_effect = mock_run_check_side_effect
        
        # Create instance with mocked dependencies
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_components()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 2)  # api_health and database_connectivity fail
        
        # Verify component issues
        component_issues = [(i["component"], i["severity"]) for i in diagnostics.issues]
        self.assertIn(("api_health", "HIGH"), component_issues)
        self.assertIn(("database_connectivity", "HIGH"), component_issues)

    @patch("psutil.cpu_percent")
    @patch("psutil.virtual_memory")
    @patch("psutil.disk_usage")
    def test_check_system_resources_normal(self, mock_disk, mock_memory, mock_cpu):
        """Test checking system resources with normal usage."""
        # Mock system resource usage
        mock_cpu.return_value = 50
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 60
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.percent = 70
        mock_disk.return_value = mock_disk_obj
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        
        # Call method
        diagnostics._check_system_resources()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 0)

    @patch("psutil.cpu_percent")
    @patch("psutil.virtual_memory")
    @patch("psutil.disk_usage")
    def test_check_system_resources_high(self, mock_disk, mock_memory, mock_cpu):
        """Test checking system resources with high usage."""
        # Mock system resource usage
        mock_cpu.return_value = 95
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 95
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.percent = 95
        mock_disk.return_value = mock_disk_obj
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        
        # Call method
        diagnostics._check_system_resources()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 3)  # CPU, memory, and disk all high
        
        # Verify resource issues
        resources = [i["component"] for i in diagnostics.issues]
        self.assertIn("system_resources", resources)

    @patch("requests.get")
    def test_check_api_server_running(self, mock_get):
        """Test checking API server when it's running."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_api_server()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 0)
        mock_get.assert_called_once_with("http://localhost:8000/health", timeout=2)

    @patch("requests.get")
    def test_check_api_server_wrong_status(self, mock_get):
        """Test checking API server when it returns a non-200 status."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_api_server()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 1)
        self.assertEqual(diagnostics.issues[0]["severity"], "HIGH")
        self.assertEqual(diagnostics.issues[0]["component"], "api_server")
        self.assertIn("status code 500", diagnostics.issues[0]["message"])

    @patch("requests.get")
    def test_check_api_server_not_running(self, mock_get):
        """Test checking API server when it's not running."""
        # Mock API response to raise connection error
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_api_server()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 1)
        self.assertEqual(diagnostics.issues[0]["severity"], "CRITICAL")
        self.assertEqual(diagnostics.issues[0]["component"], "api_server")
        self.assertIn("not running", diagnostics.issues[0]["message"])
        
        # Verify fix was added
        self.assertEqual(len(diagnostics.fixes), 1)
        self.assertEqual(diagnostics.fixes[0]["action"], "start_api_server")

    @patch("monitoring.health_checks.run_check")
    def test_check_database_success(self, mock_run_check):
        """Test checking database connectivity with success."""
        # Mock run_check to return success
        mock_run_check.return_value = {"success": True, "message": "Connected successfully"}
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_database()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 0)

    @patch("monitoring.health_checks.run_check")
    def test_check_database_failure(self, mock_run_check):
        """Test checking database connectivity with failure."""
        # Mock run_check to return failure
        mock_run_check.return_value = {"success": False, "message": "Connection failed"}
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.config = self.mock_config
        
        # Call method
        diagnostics._check_database()
        
        # Verify result
        self.assertEqual(len(diagnostics.issues), 1)
        self.assertEqual(diagnostics.issues[0]["severity"], "HIGH")
        self.assertEqual(diagnostics.issues[0]["component"], "database")
        self.assertIn("Connection failed", diagnostics.issues[0]["message"])
        
        # Verify fix was added
        self.assertEqual(len(diagnostics.fixes), 1)
        self.assertEqual(diagnostics.fixes[0]["action"], "check_database")

    def test_get_recommendation_for_check(self):
        """Test getting recommendations for different check types."""
        # Create instance
        diagnostics = MonitoringDiagnostics()
        
        # Test recommendations for different check types
        api_rec = diagnostics._get_recommendation_for_check("api_health", {})
        db_rec = diagnostics._get_recommendation_for_check("database_connectivity", {})
        disk_rec = diagnostics._get_recommendation_for_check("disk_usage", {})
        unknown_rec = diagnostics._get_recommendation_for_check("unknown_check", {})
        
        # Verify recommendations
        self.assertIn("API server", api_rec)
        self.assertIn("database", db_rec)
        self.assertIn("disk space", disk_rec)
        self.assertIn("Investigate", unknown_rec)  # Default recommendation

    @patch("subprocess.run")
    def test_apply_fix_success(self, mock_run):
        """Test applying a fix successfully."""
        # Mock subprocess.run
        mock_process = MagicMock()
        mock_process.stdout = b"Fix applied successfully"
        mock_run.return_value = mock_process
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.fixes = [{
            "issue": "API server not running",
            "action": "start_api_server",
            "command": "python scripts/start_api.py"
        }]
        
        # Call method
        result = diagnostics.apply_fix("start_api_server")
        
        # Verify result
        self.assertTrue(result["success"])
        self.assertEqual(result["action"], "start_api_server")
        mock_run.assert_called_once_with(
            "python scripts/start_api.py",
            shell=True,
            check=True,
            stdout=unittest.mock.ANY,
            stderr=unittest.mock.ANY
        )

    @patch("subprocess.run")
    def test_apply_fix_failure(self, mock_run):
        """Test applying a fix with failure."""
        # Mock subprocess.run to raise exception
        mock_run.side_effect = subprocess.CalledProcessError(
            returncode=1,
            cmd="python scripts/start_api.py",
            stderr=b"Failed to start API server"
        )
        
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.fixes = [{
            "issue": "API server not running",
            "action": "start_api_server",
            "command": "python scripts/start_api.py"
        }]
        
        # Call method
        result = diagnostics.apply_fix("start_api_server")
        
        # Verify result
        self.assertFalse(result["success"])
        self.assertEqual(result["action"], "start_api_server")
        self.assertIn("Failed to apply fix", result["message"])

    def test_apply_fix_not_found(self):
        """Test applying a fix that doesn't exist."""
        # Create instance
        diagnostics = MonitoringDiagnostics()
        diagnostics.fixes = [{
            "issue": "API server not running",
            "action": "start_api_server",
            "command": "python scripts/start_api.py"
        }]
        
        # Call method
        result = diagnostics.apply_fix("unknown_action")
        
        # Verify result
        self.assertFalse(result["success"])
        self.assertEqual(result["action"], "unknown_action")
        self.assertIn("No fix found", result["message"])

    @patch("argparse.ArgumentParser.parse_args")
    def test_parse_args(self, mock_parse_args):
        """Test parsing command-line arguments."""
        # Mock parse_args to return specific values
        mock_args = MagicMock()
        mock_args.config = "test_config.yml"
        mock_args.command = "diagnose"
        mock_parse_args.return_value = mock_args
        
        # Call function
        args = parse_args()
        
        # Verify result
        self.assertEqual(args.config, "test_config.yml")
        self.assertEqual(args.command, "diagnose")

    @patch("scripts.monitoring_diagnostics.parse_args")
    @patch("scripts.monitoring_diagnostics.MonitoringDiagnostics")
    @patch("builtins.print")
    def test_main_diagnose(self, mock_print, mock_diagnostics_class, mock_parse_args):
        """Test main function with diagnose command."""
        # Mock parse_args
        mock_args = MagicMock()
        mock_args.config = "test_config.yml"
        mock_args.command = "diagnose"
        mock_parse_args.return_value = mock_args
        
        # Mock MonitoringDiagnostics
        mock_diagnostics = MagicMock()
        mock_diagnostics.run_diagnostics.return_value = {
            "issues": [{"severity": "CRITICAL", "component": "api_server", "message": "Not running", "recommendation": "Start it"}],
            "fixes": [{"issue": "API server not running", "action": "start_api_server", "command": "python scripts/start_api.py"}],
            "timestamp": "2025-06-11T14:30:00"
        }
        mock_diagnostics_class.return_value = mock_diagnostics
        
        # Call function
        main()
        
        # Verify interactions
        mock_diagnostics_class.assert_called_once_with(config_path="test_config.yml")
        mock_diagnostics.run_diagnostics.assert_called_once()
        
        # Check that print was called multiple times
        self.assertTrue(mock_print.call_count > 5)

    @patch("scripts.monitoring_diagnostics.parse_args")
    @patch("scripts.monitoring_diagnostics.MonitoringDiagnostics")
    @patch("builtins.print")
    def test_main_fix_all(self, mock_print, mock_diagnostics_class, mock_parse_args):
        """Test main function with fix --all command."""
        # Mock parse_args
        mock_args = MagicMock()
        mock_args.config = "test_config.yml"
        mock_args.command = "fix"
        mock_args.all = True
        mock_args.action = None
        mock_parse_args.return_value = mock_args
        
        # Mock MonitoringDiagnostics
        mock_diagnostics = MagicMock()
        mock_diagnostics.run_diagnostics.return_value = {
            "issues": [{"severity": "CRITICAL", "component": "api_server", "message": "Not running", "recommendation": "Start it"}],
            "fixes": [{"issue": "API server not running", "action": "start_api_server", "command": "python scripts/start_api.py"}],
            "timestamp": "2025-06-11T14:30:00"
        }
        mock_diagnostics.apply_fix.return_value = {
            "success": True,
            "action": "start_api_server",
            "message": "Successfully started API server",
            "output": "API server started on port 8000"
        }
        mock_diagnostics_class.return_value = mock_diagnostics
        
        # Call function
        main()
        
        # Verify interactions
        mock_diagnostics_class.assert_called_once_with(config_path="test_config.yml")
        mock_diagnostics.run_diagnostics.assert_called_once()
        mock_diagnostics.apply_fix.assert_called_once_with("start_api_server")
        
        # Check that print was called
        self.assertTrue(mock_print.call_count > 3)

    @patch("scripts.monitoring_diagnostics.parse_args")
    @patch("scripts.monitoring_diagnostics.MonitoringDiagnostics")
    @patch("builtins.print")
    def test_main_fix_specific(self, mock_print, mock_diagnostics_class, mock_parse_args):
        """Test main function with fix --action command."""
        # Mock parse_args
        mock_args = MagicMock()
        mock_args.config = "test_config.yml"
        mock_args.command = "fix"
        mock_args.all = False
        mock_args.action = "start_api_server"
        mock_parse_args.return_value = mock_args
        
        # Mock MonitoringDiagnostics
        mock_diagnostics = MagicMock()
        mock_diagnostics.apply_fix.return_value = {
            "success": True,
            "action": "start_api_server",
            "message": "Successfully started API server",
            "output": "API server started on port 8000"
        }
        mock_diagnostics_class.return_value = mock_diagnostics
        
        # Call function
        main()
        
        # Verify interactions
        mock_diagnostics_class.assert_called_once_with(config_path="test_config.yml")
        mock_diagnostics.apply_fix.assert_called_once_with("start_api_server")
        
        # Check that print was called
        self.assertTrue(mock_print.call_count > 3)

    @patch("scripts.monitoring_diagnostics.parse_args")
    @patch("scripts.monitoring_diagnostics.run_check")
    @patch("scripts.monitoring_diagnostics.MonitoringDiagnostics")
    @patch("builtins.print")
    def test_main_check(self, mock_print, mock_diagnostics_class, mock_run_check, mock_parse_args):
        """Test main function with check command."""
        # Mock parse_args
        mock_args = MagicMock()
        mock_args.config = "test_config.yml"
        mock_args.command = "check"
        mock_args.name = "api_health"
        mock_parse_args.return_value = mock_args
        
        # Mock run_check
        mock_run_check.return_value = {
            "success": True,
            "message": "API health check passed",
            "details": {
                "url": "http://localhost:8000/health",
                "status_code": 200,
                "response_time": 0.05
            }
        }
        
        # Mock MonitoringDiagnostics
        mock_diagnostics = MagicMock()
        mock_diagnostics.config = {"api_health": {"url": "http://localhost:8000"}}
        mock_diagnostics_class.return_value = mock_diagnostics
        
        # Call function
        main()
        
        # Verify interactions
        mock_diagnostics_class.assert_called_once_with(config_path="test_config.yml")
        mock_run_check.assert_called_once_with("api_health", {"url": "http://localhost:8000"})
        
        # Check that print was called
        self.assertTrue(mock_print.call_count > 3)


if __name__ == "__main__":
    unittest.main()