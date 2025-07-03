"""
Docker control utilities for E2E testing.

This module provides utilities for controlling Docker containers
during end-to-end testing.
"""

import os
import time
import subprocess
from typing import List, Dict, Optional, Union


class DockerController:
    """Controller for Docker operations in E2E tests."""

    def __init__(self, compose_file: str = "docker-compose.yml", project_name: Optional[str] = None):
        """Initialize Docker controller.

        Args:
            compose_file: Path to docker-compose.yml file
            project_name: Docker Compose project name (defaults to directory name)
        """
        self.compose_file = compose_file
        self.project_name = project_name or os.path.basename(os.path.abspath('.'))
        self.services = []
        self.timeout = 120  # Timeout in seconds for service startup

    def start_services(self, services: Optional[List[str]] = None, detached: bool = True) -> bool:
        """Start Docker Compose services.

        Args:
            services: List of service names to start (None for all)
            detached: Run containers in the background

        Returns:
            bool: True if services started successfully, False otherwise
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.append("up")
        
        if detached:
            command.append("-d")
        
        if services:
            command.extend(services)
            self.services = services
        
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            print(f"Started Docker services: {result.stdout}")
            return self._wait_for_healthy_services()
        except subprocess.CalledProcessError as e:
            print(f"Error starting Docker services: {e.stderr}")
            return False

    def stop_services(self, services: Optional[List[str]] = None, remove_volumes: bool = False) -> bool:
        """Stop Docker Compose services.

        Args:
            services: List of service names to stop (None for all)
            remove_volumes: Remove named volumes declared in the volumes section

        Returns:
            bool: True if services stopped successfully, False otherwise
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.append("down")
        
        if remove_volumes:
            command.append("-v")
        
        if services:
            command.extend(services)
        
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            print(f"Stopped Docker services: {result.stdout}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error stopping Docker services: {e.stderr}")
            return False

    def restart_services(self, services: Optional[List[str]] = None) -> bool:
        """Restart Docker Compose services.

        Args:
            services: List of service names to restart (None for all)

        Returns:
            bool: True if services restarted successfully, False otherwise
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.append("restart")
        
        if services:
            command.extend(services)
        
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            print(f"Restarted Docker services: {result.stdout}")
            return self._wait_for_healthy_services()
        except subprocess.CalledProcessError as e:
            print(f"Error restarting Docker services: {e.stderr}")
            return False

    def get_service_status(self, service_name: str) -> Dict[str, str]:
        """Get status of a Docker Compose service.

        Args:
            service_name: Name of the service

        Returns:
            Dict[str, str]: Service status information
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.extend(["ps", "--format", "json", service_name])
        
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            if not result.stdout.strip():
                return {"State": "not found"}
            
            # Parse the JSON output
            import json
            service_info = json.loads(result.stdout.strip())
            return service_info
        except subprocess.CalledProcessError as e:
            print(f"Error getting service status: {e.stderr}")
            return {"State": "error", "Error": e.stderr}

    def _wait_for_healthy_services(self) -> bool:
        """Wait for all services to be healthy or running.

        Returns:
            bool: True if all services are healthy or running, False otherwise
        """
        start_time = time.time()
        while time.time() - start_time < self.timeout:
            all_ready = True
            
            # Check status of each service
            for service in self.services:
                status = self.get_service_status(service)
                state = status.get("State", "")
                health = status.get("Health", "")
                
                # If service is not running or not healthy, wait more
                if state != "running" or (health and health != "healthy"):
                    all_ready = False
                    break
            
            if all_ready:
                return True
            
            # Wait and check again
            time.sleep(2)
        
        # Timeout reached, services not ready
        return False

    def execute_command(self, service_name: str, command: str) -> str:
        """Execute a command in a running container.

        Args:
            service_name: Name of the service
            command: Command to execute

        Returns:
            str: Command output
        """
        docker_command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            docker_command.extend(["-p", self.project_name])
        
        docker_command.extend(["exec", "-T", service_name, "sh", "-c", command])
        
        try:
            result = subprocess.run(docker_command, check=True, capture_output=True, text=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            print(f"Error executing command in container: {e.stderr}")
            return f"Error: {e.stderr}"

    def get_service_logs(self, service_name: str, tail: Optional[int] = None) -> str:
        """Get logs from a service.

        Args:
            service_name: Name of the service
            tail: Number of lines to show from the end of the logs

        Returns:
            str: Service logs
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.extend(["logs", service_name])
        
        if tail:
            command.extend(["--tail", str(tail)])
        
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            print(f"Error getting service logs: {e.stderr}")
            return f"Error: {e.stderr}"

    def simulate_service_failure(self, service_name: str) -> bool:
        """Simulate a service failure by stopping the service.

        Args:
            service_name: Name of the service to stop

        Returns:
            bool: True if service was stopped successfully, False otherwise
        """
        command = ["docker-compose", "-f", self.compose_file]
        
        if self.project_name:
            command.extend(["-p", self.project_name])
        
        command.extend(["stop", service_name])
        
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error stopping service: {e.stderr}")
            return False
