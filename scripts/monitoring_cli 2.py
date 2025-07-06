#!/usr/bin/env python
"""
Command-line interface for the monitoring system.

This script provides a command-line interface to interact with the monitoring system:
- Start/stop the monitoring system
- Run health checks
- View monitoring status
- Reload configuration
"""

import os
import sys
import time
import argparse
import logging
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from monitoring.monitoring import MonitoringSystem


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Monitoring System CLI")
    
    # Define command-line arguments
    parser.add_argument(
        "--config", 
        type=str, 
        default="config/monitoring.yml",
        help="Path to the monitoring configuration file"
    )
    
    # Define subcommands
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start the monitoring system")
    start_parser.add_argument(
        "--status-interval", 
        type=int, 
        default=30,
        help="Interval in seconds to print status updates (0 to disable)"
    )
    
    # Stop command
    subparsers.add_parser("stop", help="Stop the monitoring system")
    
    # Status command
    subparsers.add_parser("status", help="Show monitoring system status")
    
    # Check command
    check_parser = subparsers.add_parser("check", help="Run health checks")
    check_parser.add_argument(
        "--name", 
        type=str, 
        help="Name of the specific check to run (omit to run all checks)"
    )
    
    # Reload command
    subparsers.add_parser("reload", help="Reload monitoring configuration")
    
    return parser.parse_args()


def main():
    """Main entry point for the CLI."""
    args = parse_args()
    
    # Create monitoring system instance
    monitoring = MonitoringSystem(config_path=args.config)
    
    # Execute command
    if args.command == "start":
        print(f"Starting monitoring system (config: {args.config})")
        monitoring.start()
        
        if args.status_interval > 0:
            try:
                print(f"Monitoring started. Press Ctrl+C to stop.")
                
                # Print initial status
                monitoring.print_status()
                
                # Print status at specified interval
                while True:
                    time.sleep(args.status_interval)
                    monitoring.print_status()
            
            except KeyboardInterrupt:
                print("\nStopping monitoring system...")
                monitoring.stop()
                print("Monitoring system stopped.")
        
    elif args.command == "stop":
        print("Stopping monitoring system...")
        monitoring.stop()
        print("Monitoring system stopped.")
    
    elif args.command == "status":
        # Print status
        print(f"Monitoring System Status (config: {args.config})")
        print("=" * 50)
        
        status = monitoring.get_status()
        
        # Print basic status
        print(f"Running: {status['running']}")
        print(f"Uptime: {status['uptime']} seconds")
        
        if status['start_time']:
            start_time = datetime.fromisoformat(status['start_time'])
            print(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Print alert information
        if "alerts" in status:
            alerts = status["alerts"]
            print("\nAlert Information:")
            print(f"- Active alerts: {alerts.get('active', 0)}")
            print(f"- Total alerts: {alerts.get('total', 0)}")
            
            active_by_level = alerts.get("active_by_level", {})
            if active_by_level:
                print("\nActive alerts by level:")
                for level, count in active_by_level.items():
                    print(f"- {level}: {count}")
        
        print("=" * 50)
    
    elif args.command == "check":
        # Run health checks
        if args.name:
            print(f"Running health check: {args.name}")
            result = monitoring.run_check(args.name)
            print_check_result(result)
        else:
            print("Running all health checks")
            results = monitoring.run_all_checks()
            
            for result in results:
                print_check_result(result)
                print("-" * 40)
    
    elif args.command == "reload":
        print("Reloading monitoring configuration...")
        monitoring.reload_config()
        print("Monitoring configuration reloaded.")
    
    else:
        print("No command specified. Use --help for usage information.")


def print_check_result(result):
    """Print a health check result in a readable format."""
    success = result.get("success", False)
    success_str = "✓ SUCCESS" if success else "✗ FAILURE"
    
    print(f"Check: {result.get('check_name', 'Unknown')}")
    print(f"Status: {success_str}")
    print(f"Message: {result.get('message', 'No message')}")
    
    # Print additional details if available
    details = result.get("details", {})
    if details:
        print("Details:")
        for key, value in details.items():
            print(f"- {key}: {value}")


if __name__ == "__main__":
    main()