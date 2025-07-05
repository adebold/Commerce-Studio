# Service Discovery Implementation

This document describes the Service Discovery implementation for FastAPI, which replaces Kong API Gateway functionality for internal service communication and health monitoring.

## Overview

The Service Discovery system provides:

1. **Service Registration and Discovery**: Dynamic registration and discovery of microservices
2. **Health Check Aggregation**: Centralized health monitoring of all registered services
3. **Load Balancing**: Multiple load balancing strategies for service calls
4. **Circuit Breakers**: Fault tolerance for service communication
5. **Retry Mechanisms**: Automatic retry with exponential backoff
6. **Communication Patterns**: Predefined patterns for common service interactions

## Architecture

### Core Components

#### ServiceRegistry
- **Purpose**: Manages service registrations and health status
- **Features**:
  - In-memory service storage with optional Redis backing
  - Automatic health checking with configurable intervals
  - Service TTL and heartbeat management
  - Tag-based service grouping

#### ServiceDiscovery
- **Purpose**: High-level interface for service discovery operations
- **Features**:
  - Service registration and deregistration
  - Service endpoint discovery
  - Health status aggregation
  - Communication pattern management

#### ServiceCommunicator
- **Purpose**: Resilient service-to-service communication
- **Features**:
  - Circuit breaker protection
  - Automatic retries with exponential backoff
  - Load balancing across service instances
  - Connection pooling and timeout management

### Communication Patterns

The system supports predefined communication patterns for different service tiers:

1. **Web Tier**: API gateways and web servers
2. **App Tier**: Business logic and microservices
3. **Data Tier**: Databases and caches
4. **ML Tier**: Machine learning and AI services
5. **Monitoring Tier**: Observability services

## API Endpoints

### Service Registration

```http
POST /service-discovery/register
Content-Type: application/json

{
  "service_name": "user-service",
  "host": "localhost",
  "port": 8080,
  "protocol": "http",
  "path": "/api/v1",
  "health_check_path": "/health",
  "metadata": {
    "version": "1.0.0",
    "environment": "production"
  },
  "tags": ["api", "user", "web"]
}
```

### Service Discovery

```http
GET /service-discovery/discover/user-service
```

Response:
```json
{
  "service_name": "user-service",
  "base_url": "http://localhost:8080/api/v1",
  "status": "healthy"
}
```

### Health Check Aggregation

```http
GET /service-discovery/health/aggregated
```

Response:
```json
{
  "overall_status": "healthy",
  "timestamp": "2025-05-23T18:10:00Z",
  "services": {
    "user-service": {
      "status": "healthy",
      "endpoint": "http://localhost:8080/api/v1",
      "last_heartbeat": "2025-05-23T18:09:45Z",
      "health_data": {
        "status": "healthy",
        "uptime": 3600,
        "memory_usage": "45%"
      }
    }
  },
  "total_services": 5,
  "healthy_services": 4,
  "unhealthy_services": 1
}
```

### List Services

```http
GET /service-discovery/services
GET /service-discovery/services/healthy
GET /service-discovery/services/by-tag/api
```

## Configuration

### Environment Variables

```bash
# Service Discovery Mode
SERVICE_DISCOVERY_MODE=hybrid  # memory_only, redis_backed, hybrid

# Health Check Settings
SERVICE_DISCOVERY_HEALTH_CHECK_INTERVAL=30
SERVICE_DISCOVERY_SERVICE_TTL=300
SERVICE_DISCOVERY_HEALTH_CHECK_TIMEOUT=10

# Circuit Breaker Settings
SERVICE_DISCOVERY_CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
SERVICE_DISCOVERY_CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60

# Retry Settings
SERVICE_DISCOVERY_RETRY_MAX_ATTEMPTS=3
SERVICE_DISCOVERY_RETRY_BASE_DELAY=1.0
SERVICE_DISCOVERY_RETRY_MAX_DELAY=60.0

# Load Balancing
SERVICE_DISCOVERY_DEFAULT_LOAD_BALANCING=round_robin
```

### Configuration File

```python
from src.api.config.service_discovery_config import get_service_discovery_config

config = get_service_discovery_config("production")
```

## Usage Examples

### Basic Service Registration

```python
from src.api.services.service_discovery import get_service_discovery

# Get service discovery instance
service_discovery = await get_service_discovery()

# Register a service
await service_discovery.register_service(
    service_name="user-service",
    host="localhost",
    port=8080,
    tags={"api", "user"}
)
```

### Service Communication

```python
from src.api.services.service_communication import service_communicator

# Make a resilient service call
async with service_communicator() as comm:
    response = await comm.call_service_json(
        service_name="user-service",
        path="/users/123",
        method="GET"
    )
    print(response)
```

### Circuit Breaker and Retry

```python
from src.api.services.service_communication import (
    ServiceCommunicator,
    CircuitBreakerConfig,
    RetryConfig
)

# Configure circuit breaker and retry
circuit_config = CircuitBreakerConfig(failure_threshold=3, recovery_timeout=30)
retry_config = RetryConfig(max_attempts=5, base_delay=2.0)

async with ServiceCommunicator(
    circuit_breaker_config=circuit_config,
    retry_config=retry_config
) as comm:
    response = await comm.call_service_json("user-service", "/users")
```

### Load Balancing

```python
from src.api.services.service_communication import LoadBalancingStrategy

# Use different load balancing strategies
async with service_communicator(
    load_balancing_strategy=LoadBalancingStrategy.LEAST_CONNECTIONS
) as comm:
    response = await comm.call_service_json("user-service", "/users")
```

### Parallel Service Calls

```python
from src.api.services.service_communication import parallel_service_calls

# Make multiple service calls in parallel
calls = [
    {"service_name": "user-service", "path": "/users/123"},
    {"service_name": "order-service", "path": "/orders/456"},
    {"service_name": "inventory-service", "path": "/inventory/789"}
]

results = await parallel_service_calls(calls)
for result in results:
    if result["success"]:
        print(f"Call {result['call_index']}: {result['data']}")
    else:
        print(f"Call {result['call_index']} failed: {result['error']}")
```

### Service Fallback

```python
from src.api.services.service_communication import call_service_with_fallback

# Call primary service with fallback
try:
    response = await call_service_with_fallback(
        primary_service="primary-ml-service",
        fallback_service="backup-ml-service",
        path="/recommend",
        method="POST",
        json={"user_id": 123}
    )
except Exception as e:
    print(f"Both services failed: {e}")
```

## Kong Replacement Mapping

| Kong Feature | Service Discovery Equivalent | Description |
|--------------|------------------------------|-------------|
| Upstream Health Checks | Health Check Aggregation | Centralized health monitoring |
| Load Balancing | Load Balancer | Multiple strategies (round-robin, least-connections, etc.) |
| Service Discovery | Service Registry | Dynamic service registration and discovery |
| Circuit Breaker | Circuit Breaker | Fault tolerance with configurable thresholds |
| Retry Policy | Retry Handler | Exponential backoff with jitter |
| Service Mesh | Service Communicator | Resilient service-to-service communication |

## Benefits Over Kong

1. **Native Integration**: Direct integration with FastAPI without external dependencies
2. **Performance**: Reduced latency by eliminating proxy layer
3. **Simplicity**: Simplified deployment and configuration
4. **Flexibility**: Customizable patterns and strategies
5. **Observability**: Built-in metrics and health aggregation
6. **Cost**: No licensing costs or additional infrastructure

## Monitoring and Observability

### Health Check Integration

The service discovery system integrates with the existing health check endpoint:

```http
GET /health
```

Response includes service discovery information:
```json
{
  "status": "healthy",
  "service_discovery": {
    "overall_status": "healthy",
    "total_services": 5,
    "healthy_services": 4,
    "unhealthy_services": 1
  }
}
```

### Metrics

The system provides metrics for:
- Service registration/deregistration events
- Health check success/failure rates
- Circuit breaker state changes
- Retry attempt counts
- Load balancing decisions

### Logging

Comprehensive logging includes:
- Service lifecycle events
- Health check results
- Communication failures
- Circuit breaker state changes
- Load balancing decisions

## Testing

### Unit Tests

```bash
# Run service discovery tests
pytest src/api/tests/test_service_discovery.py -v
```

### Integration Tests

```python
import pytest
from src.api.services.service_discovery import init_service_discovery, cleanup_service_discovery

@pytest.mark.asyncio
async def test_service_discovery_integration():
    # Initialize service discovery
    discovery = await init_service_discovery()
    
    # Register a test service
    await discovery.register_service("test-service", "localhost", 8080)
    
    # Test service discovery
    endpoint = await discovery.discover_service("test-service")
    assert endpoint is not None
    
    # Cleanup
    await cleanup_service_discovery()
```

## Migration from Kong

### Step 1: Identify Kong Services
1. List all services configured in Kong
2. Document their upstream configurations
3. Note health check configurations
4. Identify load balancing strategies

### Step 2: Configure Service Discovery
1. Update FastAPI application configuration
2. Define communication patterns
3. Configure health check intervals
4. Set up circuit breaker thresholds

### Step 3: Register Services
1. Register existing services in the service registry
2. Configure health check endpoints
3. Set appropriate tags for service grouping
4. Test service discovery functionality

### Step 4: Update Service Calls
1. Replace direct service URLs with service discovery calls
2. Implement circuit breakers and retries
3. Configure load balancing strategies
4. Test resilient communication patterns

### Step 5: Monitoring and Validation
1. Monitor service health aggregation
2. Validate circuit breaker functionality
3. Test failover scenarios
4. Verify performance improvements

## Troubleshooting

### Common Issues

1. **Service Not Discovered**
   - Check service registration
   - Verify service health status
   - Confirm service tags

2. **Health Checks Failing**
   - Verify health check endpoint
   - Check network connectivity
   - Review timeout configurations

3. **Circuit Breaker Always Open**
   - Review failure threshold settings
   - Check service health
   - Verify recovery timeout

4. **Load Balancing Not Working**
   - Confirm multiple service instances
   - Check load balancing strategy
   - Verify service health status

### Debug Commands

```python
# List all registered services
services = await service_discovery.registry.list_services()
print(services)

# Check service health
health = await service_discovery.get_aggregated_health()
print(health)

# Test service communication
async with service_communicator() as comm:
    try:
        response = await comm.call_service_json("test-service", "/health")
        print(response)
    except Exception as e:
        print(f"Communication failed: {e}")
```

## Future Enhancements

1. **Service Mesh Integration**: Integration with Istio or Linkerd
2. **Advanced Metrics**: Prometheus metrics export
3. **Distributed Tracing**: OpenTelemetry integration
4. **Service Versioning**: Support for service version management
5. **Auto-scaling Integration**: Integration with Kubernetes HPA
6. **Security**: mTLS support for service communication