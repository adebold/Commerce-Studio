#!/usr/bin/env python3
"""
Script to build and push container images to a container registry.
This script builds all the necessary container images for the EyewearML platform
and pushes them to the specified container registry.
"""

import os
import argparse
import logging
import subprocess
import yaml
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"image_build_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)

logger = logging.getLogger("image_build")

def build_image(service_name, dockerfile_path, tag, build_args=None):
    """
    Build a container image.
    
    Args:
        service_name: Name of the service
        dockerfile_path: Path to the Dockerfile
        tag: Image tag
        build_args: Optional build arguments
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Building image for {service_name} with tag {tag}")
        
        cmd = ["docker", "build", "-t", tag, "-f", dockerfile_path]
        
        # Add build arguments if provided
        if build_args:
            for arg_name, arg_value in build_args.items():
                cmd.extend(["--build-arg", f"{arg_name}={arg_value}"])
        
        # Add context path
        cmd.append(".")
        
        # Run build command
        process = subprocess.run(cmd, check=True)
        
        logger.info(f"Successfully built image for {service_name}")
        return True
        
    except Exception as e:
        logger.error(f"Error building image for {service_name}: {str(e)}")
        return False

def push_image(tag):
    """
    Push a container image to the registry.
    
    Args:
        tag: Image tag
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info(f"Pushing image {tag}")
        
        # Run push command
        process = subprocess.run(["docker", "push", tag], check=True)
        
        logger.info(f"Successfully pushed image {tag}")
        return True
        
    except Exception as e:
        logger.error(f"Error pushing image {tag}: {str(e)}")
        return False

def update_kubernetes_manifests(registry, tag, namespace):
    """
    Update Kubernetes manifests with new image references.
    
    Args:
        registry: Container registry
        tag: Image tag
        namespace: Kubernetes namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        logger.info("Updating Kubernetes manifests with new image references")
        
        # Get all deployments in the namespace
        cmd = ["kubectl", "get", "deployments", "-n", namespace, "-o", "json"]
        process = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        deployments = json.loads(process.stdout.decode())
        
        for deployment in deployments.get("items", []):
            deployment_name = deployment["metadata"]["name"]
            
            # Get current image
            containers = deployment["spec"]["template"]["spec"]["containers"]
            for container in containers:
                if container["name"] == deployment_name:
                    current_image = container["image"]
                    
                    # Extract image name without registry and tag
                    image_parts = current_image.split("/")
                    if len(image_parts) > 1:
                        image_name = image_parts[-1].split(":")[0]
                    else:
                        image_name = current_image.split(":")[0]
                    
                    # Create new image reference
                    new_image = f"{registry}/{image_name}:{tag}"
                    
                    logger.info(f"Updating deployment {deployment_name} image from {current_image} to {new_image}")
                    
                    # Update deployment image
                    cmd = ["kubectl", "set", "image", f"deployment/{deployment_name}", f"{deployment_name}={new_image}", "-n", namespace]
                    process = subprocess.run(cmd, check=True)
        
        logger.info("Successfully updated Kubernetes manifests")
        return True
        
    except Exception as e:
        logger.error(f"Error updating Kubernetes manifests: {str(e)}")
        return False

def build_and_push_images(registry, tag, namespace):
    """
    Build and push all container images for the EyewearML platform.
    
    Args:
        registry: Container registry
        tag: Image tag
        namespace: Kubernetes namespace
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Define services and their Dockerfile paths
        services = {
            "api": "Dockerfile",
            "auth": "auth-service/Dockerfile",
            "recommendation": "business-services/recommendation/Dockerfile",
            "virtual-try-on": "business-services/virtual-try-on/Dockerfile",
            "analytics": "business-services/analytics/Dockerfile",
            "frontend": "frontend/Dockerfile"
        }
        
        # Build and push images for each service
        for service_name, dockerfile_path in services.items():
            # Check if Dockerfile exists
            if not os.path.exists(dockerfile_path):
                logger.warning(f"Dockerfile not found for {service_name} at {dockerfile_path}, skipping")
                continue
            
            # Build image
            image_tag = f"{registry}/varai-{service_name}:{tag}"
            if not build_image(service_name, dockerfile_path, image_tag):
                logger.warning(f"Failed to build image for {service_name}, skipping push")
                continue
            
            # Push image
            if not push_image(image_tag):
                logger.warning(f"Failed to push image for {service_name}")
        
        # Update Kubernetes manifests with new image references
        update_kubernetes_manifests(registry, tag, namespace)
        
        return True
        
    except Exception as e:
        logger.error(f"Error building and pushing images: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Build and push container images for the EyewearML platform')
    parser.add_argument('--registry', required=True, help='Container registry (e.g., gcr.io/project-id)')
    parser.add_argument('--tag', default='prod', help='Image tag')
    parser.add_argument('--namespace', default='varai-prod', help='Kubernetes namespace')
    
    args = parser.parse_args()
    
    if build_and_push_images(args.registry, args.tag, args.namespace):
        logger.info("Successfully built and pushed all images")
    else:
        logger.error("Failed to build and push images")
        exit(1)

if __name__ == "__main__":
    main()