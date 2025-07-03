"""
Tests for the main monitoring system implementation.

This module tests the MonitoringSystem class functionality:
- Configuration loading
- Alert manager setup
- Health check scheduling and execution
- Status reporting
- System start/stop functionality
"""

import os
import time
import yaml
import pytest
from unittest.mock import patch, MagicMock, mock_open
from datetime import datetime

from monitoring.monitoring import MonitoringSystem
from monitoring.alerts import AlertManager


@pytest.fixture
def sample_config():
    """Fixture to provide a sample monitoring configuration."""
    return {
        "alerts": {
            "storage": {
                "type": "memory",
                "max_alerts": 1000
            },
            "notifiers": {
                "email": {
                    "enabled": True,
                    "smtp_server": "smtp.example.com",
                    "smtp_port": 587,
                    "sender": "alerts@example.com",
                    "recipients": ["admin@example.com"]
                },
                "slack": {
                    "enabled": True,
                    "webhook_url": "https://hooks.slack.com/services/XXX/YYY/ZZZ"
                }
            }
        },
        "checks": {
            "api_health": {
                "enabled": True,
                "interval": 30,
                "url": "http://localhost:8000/health",
                "timeout": 5,
                "alert_level": "CRITICAL"
            },
            "database": {
                "enabled": True,
                "interval": 60,
                "connection_string": "postgresql://user:pass@localhost:5432/db",
                "timeout": 5,
                "alert_level": "CRITICAL"
            },
            "disk_usage": {
                "enabled": True,
                "interval": 300,
                "paths": ["/", "/data"],
                "threshold": 80,
                "alert_level": "WARNING"
            }
        }
    }


class TestMonitoringSystem:
    """Test cases for the MonitoringSystem class."""

    @patch("os.path.exists")
    @patch("builtins.open", new_callable=mock_open)
    @patch("yaml.safe_load")
    def test_load_config(self, mock_yaml_load, mock_file_open, mock_path_exists, sample_config):
        """Test configuration loading functionality."""
        # Setup mocks
        mock_path_exists.return_value = True
        mock_yaml_load.return_value = sample_config
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        
        # Verify config was loaded
        assert monitoring.config == sample_config
        mock_path_exists.assert_called_once_with("config/monitoring.yml")
        mock_file_open.assert_called_once_with("config/monitoring.yml", "r")
        mock_yaml_load.assert_called_once()

    @patch("os.path.exists")
    def test_load_config_file_not_found(self, mock_path_exists):
        """Test configuration loading when file is not found."""
        # Setup mock
        mock_path_exists.return_value = False
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        
        # Verify empty config was created
        assert monitoring.config == {}
        mock_path_exists.assert_called_once_with("config/monitoring.yml")

    @patch("os.path.exists")
    @patch("builtins.open", new_callable=mock_open)
    @patch("yaml.safe_load")
    def test_load_config_exception(self, mock_yaml_load, mock_file_open, mock_path_exists):
        """Test configuration loading when an exception occurs."""
        # Setup mocks
        mock_path_exists.return_value = True
        mock_yaml_load.side_effect = Exception("Test exception")
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        
        # Verify empty config was created
        assert monitoring.config == {}
        mock_path_exists.assert_called_once_with("config/monitoring.yml")
        mock_file_open.assert_called_once_with("config/monitoring.yml", "r")

    @patch.object(MonitoringSystem, "load_config")
    def test_setup_alert_manager(self, mock_load_config, sample_config):
        """Test alert manager setup."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.config = sample_config
        
        # Setup alert manager
        monitoring.setup_alert_manager()
        
        # Verify alert manager was created
        assert monitoring.alert_manager is not None
        assert isinstance(monitoring.alert_manager, AlertManager)

    @patch.object(MonitoringSystem, "load_config")
    @patch("monitoring.monitoring.schedule")
    def test_schedule_checks(self, mock_schedule, mock_load_config, sample_config):
        """Test health check scheduling."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.config = sample_config
        
        # Schedule checks
        monitoring.schedule_checks()
        
        # Verify schedule was cleared
        mock_schedule.clear.assert_called_once()
        
        # Verify checks were scheduled
        # There are 3 checks in sample_config, each should be scheduled
        assert mock_schedule.every.call_count == 3
        
        # Verify disabled checks are not scheduled
        monitoring.config["checks"]["api_health"]["enabled"] = False
        monitoring.schedule_checks()
        
        # Clear is called again, but we only schedule 2 checks now
        assert mock_schedule.every.call_count == 5  # 3 from before + 2 now

    @patch.object(MonitoringSystem, "load_config")
    @patch("monitoring.monitoring.run_health_check")
    def test_run_check(self, mock_run_check, mock_load_config, sample_config):
        """Test running a specific health check."""
        # Setup mock
        mock_run_check.return_value = {
            "check_name": "api_health",
            "success": True,
            "message": "API is healthy",
            "timestamp": datetime.now().isoformat()
        }
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.config = sample_config
        monitoring.alert_manager = MagicMock()
        
        # Run check
        result = monitoring.run_check("api_health")
        
        # Verify check was run
        mock_run_check.assert_called_once_with("api_health", sample_config["checks"]["api_health"])
        
        # Verify result was processed
        assert result["check_name"] == "api_health"
        assert result["success"] is True
        monitoring.alert_manager.process_check_result.assert_called_once_with(result)

    @patch.object(MonitoringSystem, "load_config")
    @patch.object(MonitoringSystem, "run_check")
    def test_run_all_checks(self, mock_run_check, mock_load_config, sample_config):
        """Test running all health checks."""
        # Setup mock
        mock_run_check.return_value = {"success": True}
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.config = sample_config
        
        # Run all checks
        results = monitoring.run_all_checks()
        
        # Verify all checks were run
        assert mock_run_check.call_count == 3
        assert len(results) == 3

    @patch.object(MonitoringSystem, "load_config")
    @patch.object(MonitoringSystem, "schedule_checks")
    @patch.object(MonitoringSystem, "run_all_checks")
    @patch("threading.Thread")
    def test_start(self, mock_thread, mock_run_all, mock_schedule, mock_load_config):
        """Test starting the monitoring system."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.running = False
        
        # Start monitoring
        monitoring.start()
        
        # Verify system was started
        assert monitoring.running is True
        assert monitoring.start_time is not None
        mock_schedule.assert_called_once()
        mock_run_all.assert_called_once()
        mock_thread.assert_called_once()
        mock_thread.return_value.start.assert_called_once()

    @patch.object(MonitoringSystem, "load_config")
    def test_stop(self, mock_load_config):
        """Test stopping the monitoring system."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.running = True
        monitoring.scheduler_thread = MagicMock()
        
        # Stop monitoring
        monitoring.stop()
        
        # Verify system was stopped
        assert monitoring.running is False
        monitoring.scheduler_thread.join.assert_called_once_with(timeout=5)

    @patch.object(MonitoringSystem, "load_config")
    def test_get_status(self, mock_load_config):
        """Test getting the monitoring system status."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.running = True
        monitoring.start_time = time.time() - 3600  # 1 hour ago
        
        # Setup mock alert manager
        monitoring.alert_manager = MagicMock()
        monitoring.alert_manager.get_active_alerts.return_value = ["alert1", "alert2"]
        monitoring.alert_manager.get_active_alerts_by_level.return_value = {"CRITICAL": 1, "WARNING": 1}
        monitoring.alert_manager.alert_storage.alerts = ["alert1", "alert2", "alert3"]
        
        # Get status
        status = monitoring.get_status()
        
        # Verify status
        assert status["running"] is True
        assert status["uptime"] >= 3600
        assert status["start_time"] is not None
        assert status["current_time"] is not None
        assert status["alerts"]["active"] == 2
        assert status["alerts"]["total"] == 3
        assert status["alerts"]["active_by_level"] == {"CRITICAL": 1, "WARNING": 1}

    @patch.object(MonitoringSystem, "load_config")
    @patch.object(MonitoringSystem, "get_status")
    @patch("builtins.print")
    def test_print_status(self, mock_print, mock_get_status, mock_load_config):
        """Test printing the monitoring system status."""
        # Setup mock
        mock_get_status.return_value = {
            "running": True,
            "uptime": 3600,
            "start_time": "2023-01-01T00:00:00",
            "current_time": "2023-01-01T01:00:00",
            "alerts": {
                "active": 2,
                "total": 3,
                "active_by_level": {"CRITICAL": 1, "WARNING": 1}
            }
        }
        
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        
        # Print status
        monitoring.print_status()
        
        # Verify print was called (at least 5 times for header and data)
        assert mock_print.call_count >= 5

    @patch.object(MonitoringSystem, "load_config")
    @patch.object(MonitoringSystem, "stop")
    @patch.object(MonitoringSystem, "setup_alert_manager")
    @patch.object(MonitoringSystem, "start")
    def test_reload_config(self, mock_start, mock_setup, mock_stop, mock_load_config):
        """Test reloading the monitoring configuration."""
        # Create monitoring system instance
        monitoring = MonitoringSystem()
        monitoring.running = True
        
        # Reload config
        monitoring.reload_config()
        
        # Verify actions
        mock_stop.assert_called_once()
        mock_load_config.assert_called_once()
        mock_setup.assert_called_once()
        mock_start.assert_called_once()