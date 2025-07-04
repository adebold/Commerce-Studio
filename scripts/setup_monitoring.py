#!/usr/bin/env python3
"""
Script to set up monitoring for the EyewearML platform.
This script installs Prometheus, Grafana, and the ELK stack for monitoring and logging.
"""

import os
import argparse
import logging
import subprocess
import yaml
import tempfile
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"monitoring_setup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("monitoring_setup")

def create_namespace(namespace):
    """
    Create a Kubernetes namespace if it doesn't exist.
    
    Args:
        namespace: Namespace name
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Check if namespace exists
        cmd = ["kubectl", "get", "namespace", namespace]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if result.returncode != 0:
            # Create namespace
            cmd = ["kubectl", "create", "namespace", namespace]
            subprocess.run(cmd, check=True)
            logger.info(f"Created namespace {namespace}")
        else:
            logger.info(f"Namespace {namespace} already exists")
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating namespace {namespace}: {str(e)}")
        return False

def install_prometheus_operator(namespace):
    """
    Install Prometheus Operator using Helm.
    
    Args:
        namespace: Namespace to install Prometheus in
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Installing Prometheus Operator in namespace {namespace}")
        
        # Add Prometheus Helm repository
        cmd = ["helm", "repo", "add", "prometheus-community", "https://prometheus-community.github.io/helm-charts"]
        subprocess.run(cmd, check=True)
        
        # Update Helm repositories
        cmd = ["helm", "repo", "update"]
        subprocess.run(cmd, check=True)
        
        # Install Prometheus Operator
        cmd = [
            "helm", "install", "prometheus", "prometheus-community/kube-prometheus-stack",
            "--namespace", namespace,
            "--set", "prometheus.service.type=ClusterIP",
            "--set", "grafana.service.type=ClusterIP",
            "--set", "alertmanager.service.type=ClusterIP"
        ]
        subprocess.run(cmd, check=True)
        
        logger.info("Successfully installed Prometheus Operator")
        return True
        
    except Exception as e:
        logger.error(f"Error installing Prometheus Operator: {str(e)}")
        return False

def install_elk_stack(namespace):
    """
    Install ELK stack using Helm.
    
    Args:
        namespace: Namespace to install ELK in
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Installing ELK stack in namespace {namespace}")
        
        # Add Elastic Helm repository
        cmd = ["helm", "repo", "add", "elastic", "https://helm.elastic.co"]
        subprocess.run(cmd, check=True)
        
        # Update Helm repositories
        cmd = ["helm", "repo", "update"]
        subprocess.run(cmd, check=True)
        
        # Install Elasticsearch
        cmd = [
            "helm", "install", "elasticsearch", "elastic/elasticsearch",
            "--namespace", namespace,
            "--set", "replicas=1",
            "--set", "minimumMasterNodes=1",
            "--set", "resources.requests.cpu=100m",
            "--set", "resources.requests.memory=512Mi",
            "--set", "resources.limits.cpu=1000m",
            "--set", "resources.limits.memory=2Gi"
        ]
        subprocess.run(cmd, check=True)
        
        # Install Kibana
        cmd = [
            "helm", "install", "kibana", "elastic/kibana",
            "--namespace", namespace,
            "--set", "resources.requests.cpu=100m",
            "--set", "resources.requests.memory=256Mi",
            "--set", "resources.limits.cpu=500m",
            "--set", "resources.limits.memory=1Gi"
        ]
        subprocess.run(cmd, check=True)
        
        # Install Filebeat
        cmd = [
            "helm", "install", "filebeat", "elastic/filebeat",
            "--namespace", namespace
        ]
        subprocess.run(cmd, check=True)
        
        logger.info("Successfully installed ELK stack")
        return True
        
    except Exception as e:
        logger.error(f"Error installing ELK stack: {str(e)}")
        return False

def create_service_monitors(app_namespace, monitoring_namespace):
    """
    Create ServiceMonitor resources for application services.
    
    Args:
        app_namespace: Application namespace
        monitoring_namespace: Monitoring namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Creating ServiceMonitor resources for namespace {app_namespace}")
        
        # Get all services in the application namespace
        cmd = ["kubectl", "get", "services", "-n", app_namespace, "-o", "json"]
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        services = json.loads(process.stdout.decode())
        
        for service in services.get("items", []):
            service_name = service["metadata"]["name"]
            
            # Skip Kubernetes service
            if service_name == "kubernetes":
                continue
            
            # Create ServiceMonitor for the service
            service_monitor = {
                "apiVersion": "monitoring.coreos.com/v1",
                "kind": "ServiceMonitor",
                "metadata": {
                    "name": f"{service_name}-monitor",
                    "namespace": monitoring_namespace,
                    "labels": {
                        "app": service_name,
                        "release": "prometheus"
                    }
                },
                "spec": {
                    "selector": {
                        "matchLabels": {
                            "app": service_name
                        }
                    },
                    "namespaceSelector": {
                        "matchNames": [app_namespace]
                    },
                    "endpoints": [
                        {
                            "port": "http",
                            "interval": "15s",
                            "path": "/metrics"
                        }
                    ]
                }
            }
            
            # Write ServiceMonitor to temporary file
            with tempfile.NamedTemporaryFile(suffix=".yaml", delete=False) as temp_file:
                yaml.dump(service_monitor, temp_file)
                temp_file_path = temp_file.name
            
            # Apply ServiceMonitor
            cmd = ["kubectl", "apply", "-f", temp_file_path]
            subprocess.run(cmd, check=True)
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            logger.info(f"Created ServiceMonitor for {service_name}")
        
        logger.info("Successfully created ServiceMonitor resources")
        return True
        
    except Exception as e:
        logger.error(f"Error creating ServiceMonitor resources: {str(e)}")
        return False

def configure_grafana_dashboards(monitoring_namespace):
    """
    Configure Grafana dashboards.
    
    Args:
        monitoring_namespace: Monitoring namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info("Configuring Grafana dashboards")
        
        # Create ConfigMap for Grafana dashboards
        dashboard_config = {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": {
                "name": "eyewear-ml-dashboards",
                "namespace": monitoring_namespace,
                "labels": {
                    "grafana_dashboard": "1"
                }
            },
            "data": {
                "kubernetes-pod-overview.json": """
                {
                    "annotations": {
                        "list": []
                    },
                    "editable": true,
                    "gnetId": null,
                    "graphTooltip": 0,
                    "id": null,
                    "links": [],
                    "panels": [
                        {
                            "datasource": "Prometheus",
                            "fieldConfig": {
                                "defaults": {
                                    "color": {
                                        "mode": "palette-classic"
                                    },
                                    "custom": {
                                        "axisLabel": "",
                                        "axisPlacement": "auto",
                                        "barAlignment": 0,
                                        "drawStyle": "line",
                                        "fillOpacity": 10,
                                        "gradientMode": "none",
                                        "hideFrom": {
                                            "legend": false,
                                            "tooltip": false,
                                            "viz": false
                                        },
                                        "lineInterpolation": "linear",
                                        "lineWidth": 1,
                                        "pointSize": 5,
                                        "scaleDistribution": {
                                            "type": "linear"
                                        },
                                        "showPoints": "never",
                                        "spanNulls": false
                                    },
                                    "mappings": [],
                                    "thresholds": {
                                        "mode": "absolute",
                                        "steps": [
                                            {
                                                "color": "green",
                                                "value": null
                                            },
                                            {
                                                "color": "red",
                                                "value": 80
                                            }
                                        ]
                                    },
                                    "unit": "percent"
                                },
                                "overrides": []
                            },
                            "gridPos": {
                                "h": 8,
                                "w": 12,
                                "x": 0,
                                "y": 0
                            },
                            "id": 1,
                            "options": {
                                "legend": {
                                    "calcs": [],
                                    "displayMode": "list",
                                    "placement": "bottom"
                                },
                                "tooltip": {
                                    "mode": "single"
                                }
                            },
                            "targets": [
                                {
                                    "expr": "sum(rate(container_cpu_usage_seconds_total{namespace=\\"$namespace\\", pod=~\\"$pod\\"}[5m])) by (pod) * 100",
                                    "interval": "",
                                    "legendFormat": "{{pod}}",
                                    "refId": "A"
                                }
                            ],
                            "title": "CPU Usage",
                            "type": "timeseries"
                        },
                        {
                            "datasource": "Prometheus",
                            "fieldConfig": {
                                "defaults": {
                                    "color": {
                                        "mode": "palette-classic"
                                    },
                                    "custom": {
                                        "axisLabel": "",
                                        "axisPlacement": "auto",
                                        "barAlignment": 0,
                                        "drawStyle": "line",
                                        "fillOpacity": 10,
                                        "gradientMode": "none",
                                        "hideFrom": {
                                            "legend": false,
                                            "tooltip": false,
                                            "viz": false
                                        },
                                        "lineInterpolation": "linear",
                                        "lineWidth": 1,
                                        "pointSize": 5,
                                        "scaleDistribution": {
                                            "type": "linear"
                                        },
                                        "showPoints": "never",
                                        "spanNulls": false
                                    },
                                    "mappings": [],
                                    "thresholds": {
                                        "mode": "absolute",
                                        "steps": [
                                            {
                                                "color": "green",
                                                "value": null
                                            },
                                            {
                                                "color": "red",
                                                "value": 80
                                            }
                                        ]
                                    },
                                    "unit": "bytes"
                                },
                                "overrides": []
                            },
                            "gridPos": {
                                "h": 8,
                                "w": 12,
                                "x": 12,
                                "y": 0
                            },
                            "id": 2,
                            "options": {
                                "legend": {
                                    "calcs": [],
                                    "displayMode": "list",
                                    "placement": "bottom"
                                },
                                "tooltip": {
                                    "mode": "single"
                                }
                            },
                            "targets": [
                                {
                                    "expr": "sum(container_memory_working_set_bytes{namespace=\\"$namespace\\", pod=~\\"$pod\\"}) by (pod)",
                                    "interval": "",
                                    "legendFormat": "{{pod}}",
                                    "refId": "A"
                                }
                            ],
                            "title": "Memory Usage",
                            "type": "timeseries"
                        }
                    ],
                    "refresh": "10s",
                    "schemaVersion": 30,
                    "style": "dark",
                    "tags": [],
                    "templating": {
                        "list": [
                            {
                                "allValue": null,
                                "current": {},
                                "datasource": "Prometheus",
                                "definition": "label_values(kube_pod_info, namespace)",
                                "description": null,
                                "error": null,
                                "hide": 0,
                                "includeAll": false,
                                "label": "Namespace",
                                "multi": false,
                                "name": "namespace",
                                "options": [],
                                "query": {
                                    "query": "label_values(kube_pod_info, namespace)",
                                    "refId": "StandardVariableQuery"
                                },
                                "refresh": 1,
                                "regex": "",
                                "skipUrlSync": false,
                                "sort": 0,
                                "tagValuesQuery": "",
                                "tags": [],
                                "tagsQuery": "",
                                "type": "query",
                                "useTags": false
                            },
                            {
                                "allValue": ".*",
                                "current": {},
                                "datasource": "Prometheus",
                                "definition": "label_values(kube_pod_info{namespace=\\"$namespace\\"}, pod)",
                                "description": null,
                                "error": null,
                                "hide": 0,
                                "includeAll": true,
                                "label": "Pod",
                                "multi": false,
                                "name": "pod",
                                "options": [],
                                "query": {
                                    "query": "label_values(kube_pod_info{namespace=\\"$namespace\\"}, pod)",
                                    "refId": "StandardVariableQuery"
                                },
                                "refresh": 1,
                                "regex": "",
                                "skipUrlSync": false,
                                "sort": 0,
                                "tagValuesQuery": "",
                                "tags": [],
                                "tagsQuery": "",
                                "type": "query",
                                "useTags": false
                            }
                        ]
                    },
                    "time": {
                        "from": "now-1h",
                        "to": "now"
                    },
                    "timepicker": {},
                    "timezone": "",
                    "title": "Kubernetes Pod Overview",
                    "uid": "kubernetes-pod-overview",
                    "version": 1
                }
                """
            }
        }
        
        # Write dashboard config to temporary file
        with tempfile.NamedTemporaryFile(suffix=".yaml", delete=False) as temp_file:
            yaml.dump(dashboard_config, temp_file)
            temp_file_path = temp_file.name
        
        # Apply dashboard config
        cmd = ["kubectl", "apply", "-f", temp_file_path]
        subprocess.run(cmd, check=True)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        logger.info("Successfully configured Grafana dashboards")
        return True
        
    except Exception as e:
        logger.error(f"Error configuring Grafana dashboards: {str(e)}")
        return False

def setup_monitoring(app_namespace, monitoring_namespace):
    """
    Set up monitoring for the EyewearML platform.
    
    Args:
        app_namespace: Application namespace
        monitoring_namespace: Monitoring namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create monitoring namespace
        if not create_namespace(monitoring_namespace):
            logger.error(f"Failed to create namespace {monitoring_namespace}")
            return False
        
        # Install Prometheus Operator
        if not install_prometheus_operator(monitoring_namespace):
            logger.error("Failed to install Prometheus Operator")
            return False
        
        # Install ELK stack
        if not install_elk_stack(monitoring_namespace):
            logger.error("Failed to install ELK stack")
            return False
        
        # Create ServiceMonitor resources
        if not create_service_monitors(app_namespace, monitoring_namespace):
            logger.error("Failed to create ServiceMonitor resources")
            return False
        
        # Configure Grafana dashboards
        if not configure_grafana_dashboards(monitoring_namespace):
            logger.error("Failed to configure Grafana dashboards")
            return False
        
        # Get Grafana admin password
        cmd = ["kubectl", "get", "secret", "prometheus-grafana", "-n", monitoring_namespace, "-o", "jsonpath='{.data.admin-password}'"]
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        grafana_password_base64 = process.stdout.decode().strip("'")
        
        # Decode base64 password
        import base64
        grafana_password = base64.b64decode(grafana_password_base64).decode()
        
        logger.info(f"Grafana admin password: {grafana_password}")
        
        # Set up port forwarding for Grafana
        logger.info("To access Grafana, run the following command:")
        logger.info(f"kubectl port-forward svc/prometheus-grafana 3000:80 -n {monitoring_namespace}")
        logger.info("Then open http://localhost:3000 in your browser")
        logger.info("Username: admin")
        logger.info(f"Password: {grafana_password}")
        
        # Set up port forwarding for Kibana
        logger.info("To access Kibana, run the following command:")
        logger.info(f"kubectl port-forward svc/kibana-kibana 5601:5601 -n {monitoring_namespace}")
        logger.info("Then open http://localhost:5601 in your browser")
        
        return True
        
    except Exception as e:
        logger.error(f"Error setting up monitoring: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Set up monitoring for the EyewearML platform')
    parser.add_argument('--app-namespace', default='varai-prod', help='Application namespace')
    parser.add_argument('--monitoring-namespace', default='monitoring', help='Monitoring namespace')
    
    args = parser.parse_args()
    
    if setup_monitoring(args.app_namespace, args.monitoring_namespace):
        logger.info("Successfully set up monitoring")
    else:
        logger.error("Failed to set up monitoring")
        exit(1)

if __name__ == "__main__":
    main()