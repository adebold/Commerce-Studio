import pytest
import subprocess
import json
import time
from typing import List, Dict, Any

class TestDockerContainerHealth:
    """Test suite for Docker container health validation."""
    
    @pytest.fixture
    def docker_containers(self) -> List[Dict[Any, Any]]:
        """Fixture to get list of running containers for the application."""
        # Get all running containers in JSON format
        result = subprocess.run(
            ["docker", "ps", "--format", "{{json .}}"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse each line as a separate JSON object
        containers = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    containers.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
                    
        return containers
    
    @pytest.fixture
    def app_containers(self, docker_containers) -> List[Dict[Any, Any]]:
        """Fixture to filter only containers related to our application."""
        # Filter containers by name patterns or labels that identify our app
        app_name_patterns = ["api", "mongodb", "redis", "frontend", "nginx"]
        
        return [
            container for container in docker_containers
            if any(pattern in container.get("Names", "").lower() for pattern in app_name_patterns)
        ]
    
    def test_required_containers_running(self, app_containers):
        """Test that all required containers are running."""
        # RED: This will fail if required containers are not running
        container_names = [container.get("Names", "") for container in app_containers]
        
        # Check for essential services
        assert any("api" in name.lower() for name in container_names), "API container not running"
        assert any("mongodb" in name.lower() for name in container_names), "MongoDB container not running"
        assert any("redis" in name.lower() for name in container_names), "Redis container not running"
    
    def test_container_health_status(self, app_containers):
        """Test that all containers have healthy status."""
        # RED: This will fail if containers are unhealthy
        
        for container in app_containers:
            container_id = container.get("ID", "")
            container_name = container.get("Names", "")
            
            # Get detailed health status for each container
            inspect_result = subprocess.run(
                ["docker", "inspect", container_id],
                capture_output=True,
                text=True,
                check=True
            )
            
            inspect_data = json.loads(inspect_result.stdout)
            
            # Check health status if health check is configured
            if "Health" in inspect_data[0]["State"]:
                health_status = inspect_data[0]["State"]["Health"]["Status"]
                assert health_status == "healthy", f"Container {container_name} health status is {health_status}"
    
    def test_container_logs_for_errors(self, app_containers):
        """Test container logs for critical error messages."""
        # RED: This will fail if there are critical errors in logs
        
        error_patterns = [
            "ERROR", "CRITICAL", "FATAL", "Exception", 
            "failed to connect", "connection refused"
        ]
        
        for container in app_containers:
            container_id = container.get("ID", "")
            container_name = container.get("Names", "")
            
            # Get recent logs (last 50 lines)
            logs_result = subprocess.run(
                ["docker", "logs", "--tail", "50", container_id],
                capture_output=True,
                text=True
            )
            
            # Check for error patterns
            logs = logs_result.stdout.lower()
            found_errors = [pattern for pattern in error_patterns 
                           if pattern.lower() in logs]
            
            assert not found_errors, (
                f"Container {container_name} logs contain errors: {found_errors}\n"
                f"Log excerpt: {logs[-500:]}"
            )
    
    def test_container_network_connectivity(self, app_containers):
        """Test network connectivity between containers."""
        # RED: This will fail if containers cannot communicate
        
        # Get the API container
        api_container = next(
            (c for c in app_containers if "api" in c.get("Names", "").lower()),
            None
        )
        
        if not api_container:
            pytest.skip("API container not found, skipping network connectivity test")
            
        container_id = api_container.get("ID", "")
        
        # Test connection to MongoDB
        mongo_result = subprocess.run(
            ["docker", "exec", container_id, "ping", "-c", "2", "mongodb"],
            capture_output=True,
            text=True
        )
        assert mongo_result.returncode == 0, "API container cannot connect to MongoDB"
        
        # Test connection to Redis
        redis_result = subprocess.run(
            ["docker", "exec", container_id, "ping", "-c", "2", "redis"],
            capture_output=True,
            text=True
        )
        assert redis_result.returncode == 0, "API container cannot connect to Redis"
    
    def test_container_resource_usage(self, app_containers):
        """Test that containers are not using excessive resources."""
        # RED: This will fail if containers use too many resources
        
        for container in app_containers:
            container_id = container.get("ID", "")
            container_name = container.get("Names", "")
            
            # Get stats for the container
            stats_result = subprocess.run(
                ["docker", "stats", "--no-stream", "--format", "{{json .}}", container_id],
                capture_output=True,
                text=True,
                check=True
            )
            
            stats = json.loads(stats_result.stdout)
            
            # Extract CPU and memory usage
            cpu_usage = stats.get("CPUPerc", "0%").replace("%", "")
            mem_usage = stats.get("MemPerc", "0%").replace("%", "")
            
            try:
                cpu_usage_float = float(cpu_usage)
                mem_usage_float = float(mem_usage)
                
                # Check for excessive resource usage
                assert cpu_usage_float < 90, f"Container {container_name} CPU usage too high: {cpu_usage}%"
                assert mem_usage_float < 90, f"Container {container_name} memory usage too high: {mem_usage}%"
            except ValueError:
                # If parsing fails, just log a warning
                pytest.warn(f"Could not parse resource usage for {container_name}: CPU={cpu_usage}, Mem={mem_usage}")