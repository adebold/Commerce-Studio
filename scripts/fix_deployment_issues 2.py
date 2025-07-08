#!/usr/bin/env python3
"""
Script to fix common deployment issues in the EyewearML platform.
This script addresses issues with pending pods and image pull errors.
"""

import argparse
import logging
import subprocess
import json
import yaml
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"deployment_fix_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("deployment_fix")

def get_pod_status(namespace):
    """
    Get the status of all pods in the specified namespace.
    
    Args:
        namespace: Kubernetes namespace
        
    Returns:
        Dictionary of pod statuses
    """
    try:
        cmd = ["kubectl", "get", "pods", "-n", namespace, "-o", "json"]
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        pods = json.loads(process.stdout.decode())
        
        pod_status = {}
        for pod in pods.get("items", []):
            name = pod["metadata"]["name"]
            status = pod["status"]["phase"]
            
            # Check for container statuses
            container_statuses = pod["status"].get("containerStatuses", [])
            waiting_reason = None
            for container in container_statuses:
                if container.get("state", {}).get("waiting", {}):
                    waiting_reason = container["state"]["waiting"].get("reason")
            
            pod_status[name] = {
                "status": status,
                "waiting_reason": waiting_reason
            }
        
        return pod_status
        
    except Exception as e:
        logger.error(f"Error getting pod status: {str(e)}")
        return {}

def fix_image_pull_errors(namespace):
    """
    Fix image pull errors by updating image references.
    
    Args:
        namespace: Kubernetes namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Get deployments with image pull errors
        pod_status = get_pod_status(namespace)
        deployments_to_fix = set()
        
        for pod_name, status in pod_status.items():
            if status.get("waiting_reason") == "ErrImagePull" or status.get("waiting_reason") == "ImagePullBackOff":
                # Extract deployment name from pod name (remove random suffix)
                deployment_name = "-".join(pod_name.split("-")[:-2])
                deployments_to_fix.add(deployment_name)
        
        if not deployments_to_fix:
            logger.info("No deployments with image pull errors found")
            return True
        
        logger.info(f"Found {len(deployments_to_fix)} deployments with image pull errors: {', '.join(deployments_to_fix)}")
        
        # Update image references to use local images
        for deployment in deployments_to_fix:
            # Get current image
            cmd = ["kubectl", "get", "deployment", deployment, "-n", namespace, "-o", "jsonpath={.spec.template.spec.containers[0].image}"]
            process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
            current_image = process.stdout.decode().strip()
            
            # Extract image name without tag
            image_parts = current_image.split(":")
            image_name = image_parts[0]
            
            # Use local image with latest tag
            new_image = f"{image_name}:latest"
            
            logger.info(f"Updating deployment {deployment} image from {current_image} to {new_image}")
            
            # Update deployment image
            cmd = ["kubectl", "set", "image", f"deployment/{deployment}", f"{deployment}={new_image}", "-n", namespace]
            process = subprocess.run(cmd, check=True)
            
            # Restart deployment
            cmd = ["kubectl", "rollout", "restart", f"deployment/{deployment}", "-n", namespace]
            process = subprocess.run(cmd, check=True)
        
        logger.info("Successfully updated image references")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing image pull errors: {str(e)}")
        return False

def fix_pending_pods(namespace):
    """
    Fix pending pods by adjusting resource requests.
    
    Args:
        namespace: Kubernetes namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Get pods in pending state
        pod_status = get_pod_status(namespace)
        deployments_to_fix = set()
        
        for pod_name, status in pod_status.items():
            if status.get("status") == "Pending":
                # Extract deployment name from pod name (remove random suffix)
                deployment_name = "-".join(pod_name.split("-")[:-2])
                deployments_to_fix.add(deployment_name)
        
        if not deployments_to_fix:
            logger.info("No deployments with pending pods found")
            return True
        
        logger.info(f"Found {len(deployments_to_fix)} deployments with pending pods: {', '.join(deployments_to_fix)}")
        
        # Reduce resource requests for deployments with pending pods
        for deployment in deployments_to_fix:
            # Get current deployment yaml
            cmd = ["kubectl", "get", "deployment", deployment, "-n", namespace, "-o", "yaml"]
            process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
            deployment_yaml = yaml.safe_load(process.stdout.decode())
            
            # Adjust resource requests
            containers = deployment_yaml["spec"]["template"]["spec"]["containers"]
            for container in containers:
                if "resources" in container:
                    if "requests" in container["resources"]:
                        # Reduce CPU request by 50%
                        if "cpu" in container["resources"]["requests"]:
                            cpu_request = container["resources"]["requests"]["cpu"]
                            if cpu_request.endswith("m"):
                                cpu_value = int(cpu_request[:-1])
                                new_cpu_value = max(50, cpu_value // 2)
                                container["resources"]["requests"]["cpu"] = f"{new_cpu_value}m"
                            else:
                                try:
                                    cpu_value = float(cpu_request)
                                    new_cpu_value = max(0.05, cpu_value / 2)
                                    container["resources"]["requests"]["cpu"] = str(new_cpu_value)
                                except ValueError:
                                    pass
                        
                        # Reduce memory request by 50%
                        if "memory" in container["resources"]["requests"]:
                            memory_request = container["resources"]["requests"]["memory"]
                            if memory_request.endswith("Mi"):
                                memory_value = int(memory_request[:-2])
                                new_memory_value = max(64, memory_value // 2)
                                container["resources"]["requests"]["memory"] = f"{new_memory_value}Mi"
                            elif memory_request.endswith("Gi"):
                                memory_value = float(memory_request[:-2])
                                new_memory_value = max(0.1, memory_value / 2)
                                container["resources"]["requests"]["memory"] = f"{new_memory_value}Gi"
            
            # Save updated deployment yaml to temporary file
            with open("temp_deployment.yaml", "w") as f:
                yaml.dump(deployment_yaml, f)
            
            # Apply updated deployment
            cmd = ["kubectl", "apply", "-f", "temp_deployment.yaml"]
            process = subprocess.run(cmd, check=True)
            
            # Clean up temporary file
            subprocess.run(["rm", "temp_deployment.yaml"], check=True)
            
            logger.info(f"Successfully updated resource requests for deployment {deployment}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error fixing pending pods: {str(e)}")
        return False

def fix_deployment_issues(namespace):
    """
    Fix common deployment issues.
    
    Args:
        namespace: Kubernetes namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Fix image pull errors
        if not fix_image_pull_errors(namespace):
            logger.warning("Failed to fix image pull errors")
        
        # Fix pending pods
        if not fix_pending_pods(namespace):
            logger.warning("Failed to fix pending pods")
        
        # Wait for pods to stabilize
        logger.info("Waiting for pods to stabilize...")
        subprocess.run(["kubectl", "wait", "--for=condition=Ready", "pods", "--all", "-n", namespace, "--timeout=300s"], check=False)
        
        # Get final pod status
        cmd = ["kubectl", "get", "pods", "-n", namespace]
        process = subprocess.run(cmd, check=True)
        
        return True
        
    except Exception as e:
        logger.error(f"Error fixing deployment issues: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Fix common deployment issues in the EyewearML platform')
    parser.add_argument('--namespace', default='varai-prod', help='Kubernetes namespace')
    
    args = parser.parse_args()
    
    if fix_deployment_issues(args.namespace):
        logger.info("Successfully fixed deployment issues")
    else:
        logger.error("Failed to fix deployment issues")
        exit(1)

if __name__ == "__main__":
    main()