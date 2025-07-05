#!/usr/bin/env python3
"""
Advanced Monitoring and Alerting Setup for EyewearML Platform

This script sets up comprehensive monitoring, alerting, and notification systems
for the EyewearML platform environment configuration and services.

Author: EyewearML Platform Team
Created: 2025-01-11
"""

import os
import sys
import json
import time
import smtplib
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue
import requests
from urllib.parse import urljoin

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AlertChannel(Enum):
    """Alert notification channels"""
    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"
    LOG = "log"
    CONSOLE = "console"


@dataclass
class Alert:
    """Alert data structure"""
    id: str
    level: AlertLevel
    title: str
    message: str
    source: str
    timestamp: datetime
    metadata: Dict[str, Any]
    resolved: bool = False
    resolved_at: Optional[datetime] = None


@dataclass
class MonitoringConfig:
    """Monitoring configuration"""
    check_interval: int = 60  # seconds
    alert_cooldown: int = 300  # seconds
    max_alerts_per_hour: int = 10
    enabled_channels: List[AlertChannel] = None
    email_config: Dict[str, str] = None
    slack_config: Dict[str, str] = None
    webhook_config: Dict[str, str] = None
    
    def __post_init__(self):
        if self.enabled_channels is None:
            self.enabled_channels = [AlertChannel.LOG, AlertChannel.CONSOLE]
        if self.email_config is None:
            self.email_config = {}
        if self.slack_config is None:
            self.slack_config = {}
        if self.webhook_config is None:
            self.webhook_config = {}


class HealthChecker:
    """Health check utilities"""
    
    @staticmethod
    def check_service_health(url: str, timeout: int = 10) -> Dict[str, Any]:
        """Check service health via HTTP endpoint"""
        try:
            response = requests.get(url, timeout=timeout)
            return {
                "healthy": response.status_code == 200,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "error": None
            }
        except Exception as e:
            return {
                "healthy": False,
                "status_code": None,
                "response_time": None,
                "error": str(e)
            }
    
    @staticmethod
    def check_database_connection(connection_string: str) -> Dict[str, Any]:
        """Check database connectivity"""
        try:
            # This is a simplified check - in production, use proper database clients
            if "mongodb://" in connection_string:
                # MongoDB check would go here
                return {"healthy": True, "type": "mongodb", "error": None}
            elif "redis://" in connection_string:
                # Redis check would go here
                return {"healthy": True, "type": "redis", "error": None}
            else:
                return {"healthy": False, "type": "unknown", "error": "Unsupported database type"}
        except Exception as e:
            return {"healthy": False, "type": "unknown", "error": str(e)}
    
    @staticmethod
    def check_disk_space(path: str = "/", threshold: float = 0.9) -> Dict[str, Any]:
        """Check disk space usage"""
        try:
            import shutil
            total, used, free = shutil.disk_usage(path)
            usage_percent = used / total
            
            return {
                "healthy": usage_percent < threshold,
                "usage_percent": usage_percent,
                "total_gb": total / (1024**3),
                "used_gb": used / (1024**3),
                "free_gb": free / (1024**3),
                "error": None
            }
        except Exception as e:
            return {"healthy": False, "error": str(e)}
    
    @staticmethod
    def check_memory_usage(threshold: float = 0.9) -> Dict[str, Any]:
        """Check memory usage"""
        try:
            import psutil
            memory = psutil.virtual_memory()
            
            return {
                "healthy": memory.percent / 100 < threshold,
                "usage_percent": memory.percent / 100,
                "total_gb": memory.total / (1024**3),
                "used_gb": memory.used / (1024**3),
                "available_gb": memory.available / (1024**3),
                "error": None
            }
        except ImportError:
            return {"healthy": True, "error": "psutil not available"}
        except Exception as e:
            return {"healthy": False, "error": str(e)}


class AlertManager:
    """Alert management and notification system"""
    
    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.alert_counts: Dict[str, int] = {}
        self.last_alert_times: Dict[str, datetime] = {}
        self.notification_queue = queue.Queue()
        self.logger = self._setup_logger()
        
        # Start notification worker thread
        self.notification_worker = threading.Thread(target=self._process_notifications, daemon=True)
        self.notification_worker.start()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logging for alerts"""
        logger = logging.getLogger("monitoring")
        logger.setLevel(logging.INFO)
        
        # File handler
        log_file = Path(__file__).parent.parent / "logs" / "monitoring.log"
        log_file.parent.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def create_alert(self, level: AlertLevel, title: str, message: str, 
                    source: str, metadata: Dict[str, Any] = None) -> Alert:
        """Create a new alert"""
        alert_id = f"{source}_{int(time.time())}"
        
        alert = Alert(
            id=alert_id,
            level=level,
            title=title,
            message=message,
            source=source,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        # Check cooldown and rate limiting
        if self._should_suppress_alert(alert):
            return alert
        
        self.alerts[alert_id] = alert
        self.alert_history.append(alert)
        
        # Update counters
        hour_key = datetime.now().strftime("%Y-%m-%d-%H")
        self.alert_counts[hour_key] = self.alert_counts.get(hour_key, 0) + 1
        self.last_alert_times[source] = alert.timestamp
        
        # Queue for notification
        self.notification_queue.put(alert)
        
        return alert
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an alert"""
        if alert_id in self.alerts:
            self.alerts[alert_id].resolved = True
            self.alerts[alert_id].resolved_at = datetime.now()
            
            # Create resolution notification
            resolution_alert = Alert(
                id=f"{alert_id}_resolved",
                level=AlertLevel.INFO,
                title=f"Alert Resolved: {self.alerts[alert_id].title}",
                message=f"Alert {alert_id} has been resolved",
                source=self.alerts[alert_id].source,
                timestamp=datetime.now(),
                metadata={"original_alert_id": alert_id}
            )
            
            self.notification_queue.put(resolution_alert)
            return True
        
        return False
    
    def _should_suppress_alert(self, alert: Alert) -> bool:
        """Check if alert should be suppressed due to rate limiting or cooldown"""
        # Check cooldown
        if alert.source in self.last_alert_times:
            time_since_last = (alert.timestamp - self.last_alert_times[alert.source]).total_seconds()
            if time_since_last < self.config.alert_cooldown:
                return True
        
        # Check rate limiting
        hour_key = alert.timestamp.strftime("%Y-%m-%d-%H")
        if self.alert_counts.get(hour_key, 0) >= self.config.max_alerts_per_hour:
            return True
        
        return False
    
    def _process_notifications(self):
        """Process notification queue"""
        while True:
            try:
                alert = self.notification_queue.get(timeout=1)
                self._send_notifications(alert)
                self.notification_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"Error processing notification: {e}")
    
    def _send_notifications(self, alert: Alert):
        """Send alert notifications through configured channels"""
        for channel in self.config.enabled_channels:
            try:
                if channel == AlertChannel.LOG:
                    self._send_log_notification(alert)
                elif channel == AlertChannel.CONSOLE:
                    self._send_console_notification(alert)
                elif channel == AlertChannel.EMAIL:
                    self._send_email_notification(alert)
                elif channel == AlertChannel.SLACK:
                    self._send_slack_notification(alert)
                elif channel == AlertChannel.WEBHOOK:
                    self._send_webhook_notification(alert)
            except Exception as e:
                self.logger.error(f"Failed to send {channel.value} notification: {e}")
    
    def _send_log_notification(self, alert: Alert):
        """Send notification to log file"""
        log_level = {
            AlertLevel.INFO: logging.INFO,
            AlertLevel.WARNING: logging.WARNING,
            AlertLevel.ERROR: logging.ERROR,
            AlertLevel.CRITICAL: logging.CRITICAL
        }.get(alert.level, logging.INFO)
        
        self.logger.log(log_level, f"[{alert.source}] {alert.title}: {alert.message}")
    
    def _send_console_notification(self, alert: Alert):
        """Send notification to console"""
        colors = {
            AlertLevel.INFO: "\033[94m",      # Blue
            AlertLevel.WARNING: "\033[93m",   # Yellow
            AlertLevel.ERROR: "\033[91m",     # Red
            AlertLevel.CRITICAL: "\033[95m"   # Magenta
        }
        reset_color = "\033[0m"
        
        color = colors.get(alert.level, "")
        print(f"{color}[{alert.level.value.upper()}] {alert.title}: {alert.message}{reset_color}")
    
    def _send_email_notification(self, alert: Alert):
        """Send email notification"""
        if not self.config.email_config:
            return
        
        smtp_server = self.config.email_config.get("smtp_server")
        smtp_port = int(self.config.email_config.get("smtp_port", 587))
        username = self.config.email_config.get("username")
        password = self.config.email_config.get("password")
        from_email = self.config.email_config.get("from_email")
        to_emails = self.config.email_config.get("to_emails", "").split(",")
        
        if not all([smtp_server, username, password, from_email, to_emails]):
            return
        
        msg = MIMEMultipart()
        msg["From"] = from_email
        msg["To"] = ", ".join(to_emails)
        msg["Subject"] = f"[{alert.level.value.upper()}] {alert.title}"
        
        body = f"""
Alert Details:
- Level: {alert.level.value.upper()}
- Source: {alert.source}
- Time: {alert.timestamp.isoformat()}
- Message: {alert.message}

Metadata:
{json.dumps(alert.metadata, indent=2)}
"""
        
        msg.attach(MIMEText(body, "plain"))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
    
    def _send_slack_notification(self, alert: Alert):
        """Send Slack notification"""
        if not self.config.slack_config:
            return
        
        webhook_url = self.config.slack_config.get("webhook_url")
        if not webhook_url:
            return
        
        color_map = {
            AlertLevel.INFO: "good",
            AlertLevel.WARNING: "warning",
            AlertLevel.ERROR: "danger",
            AlertLevel.CRITICAL: "danger"
        }
        
        payload = {
            "attachments": [{
                "color": color_map.get(alert.level, "good"),
                "title": alert.title,
                "text": alert.message,
                "fields": [
                    {"title": "Level", "value": alert.level.value.upper(), "short": True},
                    {"title": "Source", "value": alert.source, "short": True},
                    {"title": "Time", "value": alert.timestamp.isoformat(), "short": False}
                ]
            }]
        }
        
        requests.post(webhook_url, json=payload)
    
    def _send_webhook_notification(self, alert: Alert):
        """Send webhook notification"""
        if not self.config.webhook_config:
            return
        
        webhook_url = self.config.webhook_config.get("url")
        if not webhook_url:
            return
        
        payload = {
            "alert": asdict(alert),
            "timestamp": alert.timestamp.isoformat()
        }
        
        requests.post(webhook_url, json=payload)
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active (unresolved) alerts"""
        return [alert for alert in self.alerts.values() if not alert.resolved]
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary statistics"""
        active_alerts = self.get_active_alerts()
        
        return {
            "total_alerts": len(self.alert_history),
            "active_alerts": len(active_alerts),
            "resolved_alerts": len(self.alerts) - len(active_alerts),
            "alerts_by_level": {
                level.value: len([a for a in active_alerts if a.level == level])
                for level in AlertLevel
            },
            "alerts_by_source": {
                source: len([a for a in active_alerts if a.source == source])
                for source in set(a.source for a in active_alerts)
            }
        }


class SystemMonitor:
    """Main system monitoring class"""
    
    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.alert_manager = AlertManager(config)
        self.health_checker = HealthChecker()
        self.running = False
        self.monitor_thread = None
        
        # Load environment configuration
        self.env_config = self._load_environment_config()
    
    def _load_environment_config(self) -> Dict[str, Any]:
        """Load environment configuration for monitoring"""
        try:
            # Try to import settings from new configuration
            from api.core.config_new import settings
            return {
                "api_url": f"http://{settings.HOST}:{settings.PORT}",
                "database_url": settings.database.database_url,
                "redis_url": str(settings.redis.redis_url),
                "environment": settings.environment
            }
        except ImportError:
            # Fallback to environment variables
            return {
                "api_url": os.environ.get("API_URL", "http://localhost:8000"),
                "database_url": os.environ.get("DATABASE_URL", ""),
                "redis_url": os.environ.get("REDIS_URL", ""),
                "environment": os.environ.get("ENVIRONMENT", "development")
            }
    
    def start_monitoring(self):
        """Start the monitoring system"""
        if self.running:
            return
        
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitor_thread.start()
        
        self.alert_manager.create_alert(
            AlertLevel.INFO,
            "Monitoring Started",
            f"System monitoring started for environment: {self.env_config.get('environment')}",
            "system_monitor"
        )
    
    def stop_monitoring(self):
        """Stop the monitoring system"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        self.alert_manager.create_alert(
            AlertLevel.INFO,
            "Monitoring Stopped",
            "System monitoring has been stopped",
            "system_monitor"
        )
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                self._run_health_checks()
                time.sleep(self.config.check_interval)
            except Exception as e:
                self.alert_manager.create_alert(
                    AlertLevel.ERROR,
                    "Monitoring Error",
                    f"Error in monitoring loop: {e}",
                    "system_monitor",
                    {"error": str(e)}
                )
                time.sleep(self.config.check_interval)
    
    def _run_health_checks(self):
        """Run all configured health checks"""
        checks = [
            ("api_health", self._check_api_health),
            ("database_health", self._check_database_health),
            ("disk_space", self._check_disk_space),
            ("memory_usage", self._check_memory_usage),
            ("configuration_integrity", self._check_configuration_integrity)
        ]
        
        for check_name, check_func in checks:
            try:
                check_func()
            except Exception as e:
                self.alert_manager.create_alert(
                    AlertLevel.ERROR,
                    f"Health Check Failed: {check_name}",
                    f"Health check '{check_name}' failed: {e}",
                    "health_check",
                    {"check_name": check_name, "error": str(e)}
                )
    
    def _check_api_health(self):
        """Check API health"""
        api_url = self.env_config.get("api_url")
        if not api_url:
            return
        
        health_url = urljoin(api_url, "health")
        result = self.health_checker.check_service_health(health_url)
        
        if not result["healthy"]:
            self.alert_manager.create_alert(
                AlertLevel.CRITICAL,
                "API Health Check Failed",
                f"API health check failed: {result.get('error', 'Unknown error')}",
                "api_health",
                result
            )
    
    def _check_database_health(self):
        """Check database health"""
        database_url = self.env_config.get("database_url")
        if not database_url:
            return
        
        result = self.health_checker.check_database_connection(database_url)
        
        if not result["healthy"]:
            self.alert_manager.create_alert(
                AlertLevel.CRITICAL,
                "Database Health Check Failed",
                f"Database health check failed: {result.get('error', 'Unknown error')}",
                "database_health",
                result
            )
    
    def _check_disk_space(self):
        """Check disk space"""
        result = self.health_checker.check_disk_space()
        
        if not result["healthy"]:
            usage_percent = result.get("usage_percent", 0) * 100
            self.alert_manager.create_alert(
                AlertLevel.WARNING,
                "Low Disk Space",
                f"Disk usage is at {usage_percent:.1f}%",
                "disk_space",
                result
            )
    
    def _check_memory_usage(self):
        """Check memory usage"""
        result = self.health_checker.check_memory_usage()
        
        if not result["healthy"]:
            usage_percent = result.get("usage_percent", 0) * 100
            self.alert_manager.create_alert(
                AlertLevel.WARNING,
                "High Memory Usage",
                f"Memory usage is at {usage_percent:.1f}%",
                "memory_usage",
                result
            )
    
    def _check_configuration_integrity(self):
        """Check configuration file integrity"""
        config_files = [
            "src/api/core/config.py",
            ".env",
            "docker-compose.yml"
        ]
        
        project_root = Path(__file__).parent.parent
        
        for config_file in config_files:
            file_path = project_root / config_file
            if not file_path.exists():
                self.alert_manager.create_alert(
                    AlertLevel.ERROR,
                    "Configuration File Missing",
                    f"Configuration file missing: {config_file}",
                    "config_integrity",
                    {"file": config_file}
                )
    
    def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        return {
            "running": self.running,
            "config": asdict(self.config),
            "environment": self.env_config,
            "alert_summary": self.alert_manager.get_alert_summary(),
            "uptime": time.time() - getattr(self, '_start_time', time.time())
        }


def load_monitoring_config() -> MonitoringConfig:
    """Load monitoring configuration from environment and files"""
    config_file = Path(__file__).parent.parent / "monitoring-config.json"
    
    # Default configuration
    config_data = {
        "check_interval": int(os.environ.get("MONITORING_CHECK_INTERVAL", 60)),
        "alert_cooldown": int(os.environ.get("MONITORING_ALERT_COOLDOWN", 300)),
        "max_alerts_per_hour": int(os.environ.get("MONITORING_MAX_ALERTS_PER_HOUR", 10)),
        "enabled_channels": os.environ.get("MONITORING_CHANNELS", "log,console").split(","),
        "email_config": {
            "smtp_server": os.environ.get("SMTP_SERVER"),
            "smtp_port": os.environ.get("SMTP_PORT", "587"),
            "username": os.environ.get("SMTP_USERNAME"),
            "password": os.environ.get("SMTP_PASSWORD"),
            "from_email": os.environ.get("SMTP_FROM_EMAIL"),
            "to_emails": os.environ.get("ALERT_EMAIL_RECIPIENTS", "")
        },
        "slack_config": {
            "webhook_url": os.environ.get("SLACK_WEBHOOK_URL")
        },
        "webhook_config": {
            "url": os.environ.get("ALERT_WEBHOOK_URL")
        }
    }
    
    # Load from file if exists
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                file_config = json.load(f)
                config_data.update(file_config)
        except Exception as e:
            print(f"Warning: Could not load monitoring config file: {e}")
    
    # Convert channel strings to enums
    enabled_channels = []
    for channel_str in config_data["enabled_channels"]:
        try:
            enabled_channels.append(AlertChannel(channel_str.strip()))
        except ValueError:
            print(f"Warning: Unknown alert channel: {channel_str}")
    
    config_data["enabled_channels"] = enabled_channels
    
    return MonitoringConfig(**config_data)


def main():
    """Main monitoring setup function"""
    print("🔍 Setting up Advanced Monitoring System")
    print("="*60)
    
    # Load configuration
    config = load_monitoring_config()
    
    print(f"✅ Configuration loaded:")
    print(f"  - Check interval: {config.check_interval}s")
    print(f"  - Alert cooldown: {config.alert_cooldown}s")
    print(f"  - Max alerts/hour: {config.max_alerts_per_hour}")
    print(f"  - Enabled channels: {[c.value for c in config.enabled_channels]}")
    
    # Create monitor
    monitor = SystemMonitor(config)
    monitor._start_time = time.time()
    
    # Start monitoring
    monitor.start_monitoring()
    
    print("🚀 Monitoring system started!")
    print("📊 Monitoring status:")
    
    try:
        while True:
            time.sleep(30)  # Status update every 30 seconds
            status = monitor.get_monitoring_status()
            alert_summary = status["alert_summary"]
            
            print(f"\n📈 Status Update ({datetime.now().strftime('%H:%M:%S')}):")
            print(f"  - Active alerts: {alert_summary['active_alerts']}")
            print(f"  - Total alerts: {alert_summary['total_alerts']}")
            print(f"  - Uptime: {status['uptime']:.0f}s")
            
            if alert_summary["active_alerts"] > 0:
                print("⚠️  Active alerts by level:")
                for level, count in alert_summary["alerts_by_level"].items():
                    if count > 0:
                        print(f"    - {level.upper()}: {count}")
    
    except KeyboardInterrupt:
        print("\n🛑 Stopping monitoring system...")
        monitor.stop_monitoring()
        print("✅ Monitoring system stopped.")


if __name__ == "__main__":
    main()