#!/usr/bin/env python
"""
Monitoring System Diagnostics Script

This script provides diagnostic capabilities for the monitoring system:
- Analyzes current monitoring status and alerts
- Checks system components for issues
- Provides troubleshooting recommendations
- Offers automated fixes for common problems
"""

import os
import sys
import argparse
import socket
import subprocess
import json
import yaml
import logging
import requests
from datetime import datetime
import time
import psutil

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from monitoring.monitoring import MonitoringSystem
from monitoring.health_checks import run_check, get_available_checks

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("monitoring-diagnostics")


class MonitoringDiagnostics:
    """Diagnostic tools for the monitoring system."""
    
    def __init__(self, config_path="config/monitoring.yml"):
        """Initialize the diagnostics tool."""
        self.config_path = config_path
        self.monitoring = MonitoringSystem(config_path=config_path)
        self.config = self._load_config()
        self.issues = []
        self.fixes = []
    
    def _load_config(self):
        """Load monitoring configuration."""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config from {self.config_path}: {e}")
            return {}
    
    def run_diagnostics(self):
        """Run full diagnostics on the monitoring system."""
        logger.info("Starting monitoring system diagnostics")
        
        # Check if monitoring config exists and is valid
        self._check_config()
        
        # Check monitoring system status
        self._check_monitoring_status()
        
        # Analyze current alerts
        self._analyze_alerts()
        
        # Check each monitored component
        self._check_components()
        
        # Check system resources
        self._check_system_resources()
        
        # Check API server status
        self._check_api_server()
        
        # Check database connectivity
        self._check_database()
        
        # Return diagnostic results
        return {
            "issues": self.issues,
            "fixes": self.fixes,
            "timestamp": datetime.now().isoformat()
        }
    
    def _check_config(self):
        """Check monitoring configuration for issues."""
        if not self.config:
            self.issues.append({
                "severity": "CRITICAL",
                "component": "configuration",
                "message": f"Failed to load configuration from {self.config_path}",
                "recommendation": "Verify that the configuration file exists and contains valid YAML"
            })
            return
        
        # Check for required configuration sections
        required_sections = ["check_intervals", "alerts"]
        for section in required_sections:
            if section not in self.config:
                self.issues.append({
                    "severity": "HIGH",
                    "component": "configuration",
                    "message": f"Missing required configuration section: {section}",
                    "recommendation": f"Add the {section} section to your configuration file"
                })
    
    def _check_monitoring_status(self):
        """Check monitoring system status."""
        try:
            status = self.monitoring.get_status()
            
            if not status.get("running", False):
                self.issues.append({
                    "severity": "HIGH",
                    "component": "monitoring",
                    "message": "Monitoring system is not running",
                    "recommendation": "Start the monitoring system using 'python scripts/monitoring_cli.py start'"
                })
                
                # Add to fixes
                self.fixes.append({
                    "issue": "Monitoring system not running",
                    "action": "start_monitoring",
                    "command": "python scripts/monitoring_cli.py start"
                })
        except Exception as e:
            self.issues.append({
                "severity": "HIGH",
                "component": "monitoring",
                "message": f"Failed to get monitoring status: {e}",
                "recommendation": "Verify that the monitoring system is properly installed"
            })
    
    def _analyze_alerts(self):
        """Analyze current alerts for patterns and issues."""
        try:
            # Get all active alerts
            status = self.monitoring.get_status()
            alerts = status.get("alerts", {})
            active_alerts = self.monitoring.get_active_alerts() if status.get("running", False) else []
            
            # Check if there are too many active alerts
            if len(active_alerts) > 5:
                self.issues.append({
                    "severity": "MEDIUM",
                    "component": "alerts",
                    "message": f"High number of active alerts: {len(active_alerts)}",
                    "recommendation": "Investigate and resolve the most critical alerts first"
                })
            
            # Check for CRITICAL alerts
            critical_alerts = [a for a in active_alerts if a.level == "CRITICAL"]
            if critical_alerts:
                for alert in critical_alerts:
                    self.issues.append({
                        "severity": "CRITICAL",
                        "component": alert.source,
                        "message": f"Critical alert: {alert.message}",
                        "recommendation": "Investigate and resolve the critical issue immediately"
                    })
                    
                    # Add specific fixes based on alert source
                    if alert.source == "api_health":
                        self.fixes.append({
                            "issue": "API health check failing",
                            "action": "start_api_server",
                            "command": "python scripts/start_api.py"
                        })
                    elif alert.source == "database_connectivity":
                        self.fixes.append({
                            "issue": "Database connectivity issues",
                            "action": "check_database",
                            "command": "python scripts/database_check.py"
                        })
        except Exception as e:
            logger.error(f"Error analyzing alerts: {e}")
    
    def _check_components(self):
        """Check each monitored component."""
        # Get all available checks
        available_checks = get_available_checks()
        
        for check_name in available_checks:
            try:
                # Run the check directly
                result = run_check(check_name, self.config.get(check_name, {}))
                
                if not result.get("success", False):
                    self.issues.append({
                        "severity": "HIGH" if check_name in ["api_health", "database_connectivity"] else "MEDIUM",
                        "component": check_name,
                        "message": result.get("message", f"Check {check_name} failed"),
                        "recommendation": self._get_recommendation_for_check(check_name, result)
                    })
            except Exception as e:
                logger.error(f"Error running check {check_name}: {e}")
    
    def _check_system_resources(self):
        """Check system resources for potential issues."""
        # Check CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        if cpu_percent > 90:
            self.issues.append({
                "severity": "HIGH",
                "component": "system_resources",
                "message": f"High CPU usage: {cpu_percent}%",
                "recommendation": "Investigate processes consuming high CPU and consider restarting them"
            })
        
        # Check memory usage
        memory = psutil.virtual_memory()
        if memory.percent > 90:
            self.issues.append({
                "severity": "HIGH",
                "component": "system_resources",
                "message": f"High memory usage: {memory.percent}%",
                "recommendation": "Investigate processes consuming high memory and consider restarting them"
            })
        
        # Check disk usage
        disk = psutil.disk_usage('/')
        if disk.percent > 90:
            self.issues.append({
                "severity": "HIGH",
                "component": "system_resources",
                "message": f"High disk usage: {disk.percent}%",
                "recommendation": "Free up disk space by removing unnecessary files"
            })
    
    def _check_api_server(self):
        """Check API server status."""
        # Get API server configuration
        api_config = self.config.get("api_health", {})
        api_url = api_config.get("url", "http://localhost:8000")
        
        # Check if API server is running
        try:
            # Try to connect to the API server
            response = requests.get(f"{api_url}/health", timeout=2)
            
            # If we get here, the API server is running
            if response.status_code != 200:
                self.issues.append({
                    "severity": "HIGH",
                    "component": "api_server",
                    "message": f"API server returned status code {response.status_code}",
                    "recommendation": "Check API server logs for errors"
                })
        except requests.exceptions.ConnectionError:
            self.issues.append({
                "severity": "CRITICAL",
                "component": "api_server",
                "message": "API server is not running or not accessible",
                "recommendation": "Start the API server using 'python scripts/start_api.py'"
            })
            
            # Add to fixes
            self.fixes.append({
                "issue": "API server not running",
                "action": "start_api_server",
                "command": "python scripts/start_api.py"
            })
        except Exception as e:
            self.issues.append({
                "severity": "HIGH",
                "component": "api_server",
                "message": f"Error checking API server: {e}",
                "recommendation": "Investigate API server configuration and logs"
            })
    
    def _check_database(self):
        """Check database connectivity."""
        # Get database configuration
        db_config = self.config.get("database_connectivity", {})
        
        # Check if we can connect to the database
        try:
            # Run the database connectivity check
            result = run_check("database_connectivity", db_config)
            
            if not result.get("success", False):
                self.issues.append({
                    "severity": "HIGH",
                    "component": "database",
                    "message": result.get("message", "Database connectivity check failed"),
                    "recommendation": "Verify database connection settings and ensure the database is running"
                })
                
                # Add to fixes
                self.fixes.append({
                    "issue": "Database connectivity issues",
                    "action": "check_database",
                    "command": "python scripts/database_check.py"
                })
        except Exception as e:
            self.issues.append({
                "severity": "HIGH",
                "component": "database",
                "message": f"Error checking database: {e}",
                "recommendation": "Investigate database configuration and logs"
            })
    
    def _get_recommendation_for_check(self, check_name, result):
        """Get a recommendation for fixing a failed check."""
        recommendations = {
            "api_health": "Verify that the API server is running and accessible",
            "database_connectivity": "Check database connection settings and ensure the database is running",
            "disk_usage": "Free up disk space by removing unnecessary files",
            "memory_usage": "Investigate processes consuming high memory",
            "cpu_usage": "Investigate processes consuming high CPU",
            "log_check": "Review application logs for errors",
            "port_check": "Ensure the required service is running on the specified port"
        }
        
        return recommendations.get(check_name, "Investigate the issue and fix the underlying problem")
    
    def apply_fix(self, fix_action):
        """Apply a fix for a specific issue."""
        for fix in self.fixes:
            if fix["action"] == fix_action:
                try:
                    logger.info(f"Applying fix: {fix['issue']} with command: {fix['command']}")
                    
                    # Execute the command
                    result = subprocess.run(fix["command"], shell=True, check=True,
                                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    
                    return {
                        "success": True,
                        "action": fix_action,
                        "message": f"Successfully applied fix for: {fix['issue']}",
                        "output": result.stdout.decode()
                    }
                except subprocess.CalledProcessError as e:
                    return {
                        "success": False,
                        "action": fix_action,
                        "message": f"Failed to apply fix: {e}",
                        "error": e.stderr.decode()
                    }
                except Exception as e:
                    return {
                        "success": False,
                        "action": fix_action,
                        "message": f"Error applying fix: {e}"
                    }
        
        return {
            "success": False,
            "action": fix_action,
            "message": f"No fix found with action: {fix_action}"
        }


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Monitoring System Diagnostics")
    
    # Define command-line arguments
    parser.add_argument(
        "--config", 
        type=str, 
        default="config/monitoring.yml",
        help="Path to the monitoring configuration file"
    )
    
    # Define subcommands
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Diagnose command
    subparsers.add_parser("diagnose", help="Run diagnostics and report issues")
    
    # Fix command
    fix_parser = subparsers.add_parser("fix", help="Apply fixes for detected issues")
    fix_parser.add_argument(
        "--all", 
        action="store_true",
        help="Apply all available fixes"
    )
    fix_parser.add_argument(
        "--action", 
        type=str,
        help="Specific fix action to apply (e.g., start_api_server)"
    )
    
    # Check command
    check_parser = subparsers.add_parser("check", help="Run a specific health check")
    check_parser.add_argument(
        "--name", 
        type=str, 
        required=True,
        help="Name of the health check to run"
    )
    
    return parser.parse_args()


def main():
    """Main entry point for the diagnostics tool."""
    args = parse_args()
    
    # Create diagnostics instance
    diagnostics = MonitoringDiagnostics(config_path=args.config)
    
    # Execute command
    if args.command == "diagnose":
        # Run diagnostics
        results = diagnostics.run_diagnostics()
        
        # Print diagnostic results
        print("\n" + "="*80)
        print(" Monitoring System Diagnostic Results ")
        print("="*80)
        
        # Print issues
        if results["issues"]:
            print("\nDetected Issues:")
            for i, issue in enumerate(results["issues"], 1):
                print(f"\n{i}. [{issue['severity']}] {issue['component']}: {issue['message']}")
                print(f"   Recommendation: {issue['recommendation']}")
        else:
            print("\nNo issues detected. The monitoring system appears to be healthy.")
        
        # Print available fixes
        if results["fixes"]:
            print("\nAvailable Fixes:")
            for i, fix in enumerate(results["fixes"], 1):
                print(f"\n{i}. Issue: {fix['issue']}")
                print(f"   Action: {fix['action']}")
                print(f"   Command: {fix['command']}")
            
            print("\nTo apply fixes, run:")
            print(f"  python {sys.argv[0]} fix --all")
            print(f"  python {sys.argv[0]} fix --action <action_name>")
        
        print("\n" + "="*80)
    
    elif args.command == "fix":
        if args.all:
            # Apply all fixes
            print("Applying all available fixes...")
            
            # Run diagnostics to get fixes
            results = diagnostics.run_diagnostics()
            
            for fix in results["fixes"]:
                print(f"\nApplying fix for: {fix['issue']}")
                result = diagnostics.apply_fix(fix["action"])
                
                if result["success"]:
                    print(f"✓ Success: {result['message']}")
                else:
                    print(f"✗ Failed: {result['message']}")
                    if "error" in result:
                        print(f"  Error details: {result['error']}")
        
        elif args.action:
            # Apply specific fix
            print(f"Applying fix: {args.action}")
            result = diagnostics.apply_fix(args.action)
            
            if result["success"]:
                print(f"✓ Success: {result['message']}")
                if "output" in result:
                    print(f"\nOutput:\n{result['output']}")
            else:
                print(f"✗ Failed: {result['message']}")
                if "error" in result:
                    print(f"Error details: {result['error']}")
        
        else:
            print("No fix specified. Use --all to apply all fixes or --action to apply a specific fix.")
    
    elif args.command == "check":
        # Run specific check
        print(f"Running health check: {args.name}")
        
        try:
            # Get check configuration from monitoring config
            config = diagnostics.config.get(args.name, {})
            
            # Run the check
            result = run_check(args.name, config)
            
            # Print result
            success_str = "✓ SUCCESS" if result.get("success", False) else "✗ FAILURE"
            
            print(f"\nCheck: {args.name}")
            print(f"Status: {success_str}")
            print(f"Message: {result.get('message', 'No message')}")
            
            # Print details
            details = result.get("details", {})
            if details:
                print("\nDetails:")
                for key, value in details.items():
                    print(f"- {key}: {value}")
        
        except Exception as e:
            print(f"Error running check: {e}")
    
    else:
        print("No command specified. Use --help for usage information.")


if __name__ == "__main__":
    main()