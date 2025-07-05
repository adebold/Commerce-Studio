"""
Tests for the monitoring CLI script.

These tests verify that the monitoring CLI correctly:
- Parses command-line arguments
- Executes commands correctly
- Formats output appropriately
- Handles errors gracefully
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock, call
from io import StringIO
import tempfile
import yaml

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Import the CLI module
from scripts.monitoring_cli import parse_args, main, print_check_result


class TestMonitoringCLI(unittest.TestCase):
    """Test cases for the monitoring CLI."""

    def setUp(self):
        """Set up test fixtures."""
        # Create a temporary config file
        self.temp_config = tempfile.NamedTemporaryFile(delete=False, suffix='.yml')
        
        # Write test configuration
        config = {
            'check_intervals': {
                'api_health': 60,
                'cpu_usage': 120
            },
            'alerts': {
                'email': {
                    'enabled': True,
                    'recipients': ['admin@example.com']
                }
            }
        }
        
        with open(self.temp_config.name, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures."""
        os.unlink(self.temp_config.name)

    def test_parse_args(self):
        """Test argument parsing."""
        # Test default config
        with patch('sys.argv', ['monitoring_cli.py', 'status']):
            args = parse_args()
            self.assertEqual(args.config, 'config/monitoring.yml')
            self.assertEqual(args.command, 'status')
        
        # Test custom config
        with patch('sys.argv', ['monitoring_cli.py', '--config', 'custom/config.yml', 'status']):
            args = parse_args()
            self.assertEqual(args.config, 'custom/config.yml')
            self.assertEqual(args.command, 'status')
        
        # Test start command with interval
        with patch('sys.argv', ['monitoring_cli.py', 'start', '--status-interval', '60']):
            args = parse_args()
            self.assertEqual(args.command, 'start')
            self.assertEqual(args.status_interval, 60)
        
        # Test check command with name
        with patch('sys.argv', ['monitoring_cli.py', 'check', '--name', 'api_health']):
            args = parse_args()
            self.assertEqual(args.command, 'check')
            self.assertEqual(args.name, 'api_health')

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_start_command(self, mock_monitoring_system):
        """Test executing the start command."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Test start command without status interval
        with patch('sys.argv', ['monitoring_cli.py', 'start', '--status-interval', '0']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify monitoring system was started
                mock_instance.start.assert_called_once()
                
                # Verify correct output
                mock_print.assert_any_call(f"Starting monitoring system (config: config/monitoring.yml)")

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_stop_command(self, mock_monitoring_system):
        """Test executing the stop command."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Test stop command
        with patch('sys.argv', ['monitoring_cli.py', 'stop']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify monitoring system was stopped
                mock_instance.stop.assert_called_once()
                
                # Verify correct output
                mock_print.assert_any_call("Stopping monitoring system...")
                mock_print.assert_any_call("Monitoring system stopped.")

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_status_command(self, mock_monitoring_system):
        """Test executing the status command."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Set up mock return value for get_status
        mock_instance.get_status.return_value = {
            'running': True,
            'uptime': 300,
            'start_time': '2023-01-01T12:00:00',
            'alerts': {
                'active': 2,
                'total': 5,
                'active_by_level': {
                    'INFO': 1,
                    'CRITICAL': 1
                }
            }
        }
        
        # Test status command
        with patch('sys.argv', ['monitoring_cli.py', 'status']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify get_status was called
                mock_instance.get_status.assert_called_once()
                
                # Verify correct output (check key parts)
                mock_print.assert_any_call("Monitoring System Status (config: config/monitoring.yml)")
                mock_print.assert_any_call("Running: True")
                mock_print.assert_any_call("Uptime: 300 seconds")
                mock_print.assert_any_call("Alert Information:")
                mock_print.assert_any_call("- Active alerts: 2")
                mock_print.assert_any_call("- Total alerts: 5")
                mock_print.assert_any_call("Active alerts by level:")
                mock_print.assert_any_call("- INFO: 1")
                mock_print.assert_any_call("- CRITICAL: 1")

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_check_command_with_name(self, mock_monitoring_system):
        """Test executing the check command with a specific check name."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Set up mock return value for run_check
        mock_instance.run_check.return_value = {
            'check_name': 'api_health',
            'success': True,
            'message': 'API is healthy',
            'details': {
                'response_time': '50ms',
                'status_code': 200
            }
        }
        
        # Test check command with name
        with patch('sys.argv', ['monitoring_cli.py', 'check', '--name', 'api_health']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify run_check was called with correct parameter
                mock_instance.run_check.assert_called_once_with('api_health')
                
                # Verify correct output
                mock_print.assert_any_call("Running health check: api_health")
                mock_print.assert_any_call("Check: api_health")
                mock_print.assert_any_call("Status: ✓ SUCCESS")
                mock_print.assert_any_call("Message: API is healthy")
                mock_print.assert_any_call("Details:")
                mock_print.assert_any_call("- response_time: 50ms")
                mock_print.assert_any_call("- status_code: 200")

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_check_command_all(self, mock_monitoring_system):
        """Test executing the check command for all checks."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Set up mock return value for run_all_checks
        mock_instance.run_all_checks.return_value = [
            {
                'check_name': 'api_health',
                'success': True,
                'message': 'API is healthy'
            },
            {
                'check_name': 'disk_usage',
                'success': False,
                'message': 'Disk usage critical',
                'details': {'usage_percent': 95}
            }
        ]
        
        # Test check command without name (all checks)
        with patch('sys.argv', ['monitoring_cli.py', 'check']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify run_all_checks was called
                mock_instance.run_all_checks.assert_called_once()
                
                # Verify correct output
                mock_print.assert_any_call("Running all health checks")
                mock_print.assert_any_call("Check: api_health")
                mock_print.assert_any_call("Status: ✓ SUCCESS")
                mock_print.assert_any_call("Check: disk_usage")
                mock_print.assert_any_call("Status: ✗ FAILURE")
                mock_print.assert_any_call("Message: Disk usage critical")
                mock_print.assert_any_call("Details:")
                mock_print.assert_any_call("- usage_percent: 95")

    @patch('scripts.monitoring_cli.MonitoringSystem')
    def test_main_reload_command(self, mock_monitoring_system):
        """Test executing the reload command."""
        # Configure mock
        mock_instance = mock_monitoring_system.return_value
        
        # Test reload command
        with patch('sys.argv', ['monitoring_cli.py', 'reload']):
            with patch('builtins.print') as mock_print:
                main()
                
                # Verify reload_config was called
                mock_instance.reload_config.assert_called_once()
                
                # Verify correct output
                mock_print.assert_any_call("Reloading monitoring configuration...")
                mock_print.assert_any_call("Monitoring configuration reloaded.")

    def test_print_check_result(self):
        """Test the print_check_result function."""
        # Test successful check
        success_result = {
            'check_name': 'api_health',
            'success': True,
            'message': 'API is healthy',
            'details': {
                'response_time': '50ms',
                'status_code': 200
            }
        }
        
        with patch('builtins.print') as mock_print:
            print_check_result(success_result)
            
            mock_print.assert_any_call("Check: api_health")
            mock_print.assert_any_call("Status: ✓ SUCCESS")
            mock_print.assert_any_call("Message: API is healthy")
            mock_print.assert_any_call("Details:")
            mock_print.assert_any_call("- response_time: 50ms")
            mock_print.assert_any_call("- status_code: 200")
        
        # Test failed check
        failure_result = {
            'check_name': 'disk_usage',
            'success': False,
            'message': 'Disk usage critical'
        }
        
        with patch('builtins.print') as mock_print:
            print_check_result(failure_result)
            
            mock_print.assert_any_call("Check: disk_usage")
            mock_print.assert_any_call("Status: ✗ FAILURE")
            mock_print.assert_any_call("Message: Disk usage critical")
        
        # Test minimal check result
        minimal_result = {}
        
        with patch('builtins.print') as mock_print:
            print_check_result(minimal_result)
            
            mock_print.assert_any_call("Check: Unknown")
            mock_print.assert_any_call("Status: ✗ FAILURE")
            mock_print.assert_any_call("Message: No message")


if __name__ == '__main__':
    unittest.main()