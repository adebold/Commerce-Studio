"""
Test-Driven Development for Concurrent Limiter Performance Optimization (Priority P2)

This test suite implements comprehensive concurrent limiter testing for:
- Request rate limiting and quota management
- Concurrent connection pooling and throttling
- Resource allocation and fair usage enforcement
- Performance monitoring and degradation prevention

Following TDD Red-Green-Refactor cycle:
1. Write failing tests that define concurrency limits
2. Implement minimal limiter code to make tests pass
3. Refactor for production readiness and scalability

Based on reflection_hardening_LS4.md analysis - Priority P2 performance critical
"""

import pytest
import asyncio
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Callable
from unittest.mock import Mock, patch, AsyncMock
from concurrent.futures import ThreadPoolExecutor
import threading


class TestConcurrentLimiterBasicOperations:
    """
    Test Suite: Concurrent Limiter Basic Operations
    
    RED PHASE: Write failing tests for concurrent limiting
    These tests define the concurrency control requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_concurrent_limiter_initialization(self):
        """
        TEST: Concurrent limiter should initialize with proper configuration
        
        Expected behavior:
        - Set maximum concurrent operations limit
        - Initialize with zero active operations
        - Configure timeout and queue settings
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        max_concurrent = 10
        operation_timeout = 30.0
        queue_timeout = 5.0
        
        limiter = ConcurrentLimiter(
            max_concurrent=max_concurrent,
            operation_timeout=operation_timeout,
            queue_timeout=queue_timeout
        )
        
        assert limiter.max_concurrent == max_concurrent
        assert limiter.operation_timeout == operation_timeout
        assert limiter.queue_timeout == queue_timeout
        assert limiter.active_count == 0
        assert limiter.queued_count == 0
    
    @pytest.mark.asyncio
    async def test_concurrent_operations_within_limit(self):
        """
        TEST: Operations within limit should execute immediately
        
        Expected behavior:
        - Allow operations up to max_concurrent limit
        - Track active operation count accurately
        - Complete operations and update counters
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=3, operation_timeout=10.0)
        
        execution_order = []
        
        async def test_operation(operation_id: int):
            execution_order.append(f"start_{operation_id}")
            await asyncio.sleep(0.1)  # Simulate work
            execution_order.append(f"end_{operation_id}")
            return f"result_{operation_id}"
        
        # Start 3 operations simultaneously (within limit)
        tasks = [
            limiter.execute(test_operation, i)
            for i in range(3)
        ]
        
        # All should start immediately
        await asyncio.sleep(0.05)  # Let operations start
        assert limiter.active_count == 3
        assert limiter.queued_count == 0
        
        # Wait for completion
        results = await asyncio.gather(*tasks)
        
        # Verify results and cleanup
        assert len(results) == 3
        assert all(result.startswith("result_") for result in results)
        assert limiter.active_count == 0
    
    @pytest.mark.asyncio
    async def test_operations_queued_when_limit_exceeded(self):
        """
        TEST: Operations should queue when limit is exceeded
        
        Expected behavior:
        - Queue operations beyond max_concurrent limit
        - Process queued operations as slots become available
        - Maintain FIFO order for queued operations
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=2, operation_timeout=10.0)
        
        execution_order = []
        operation_started = asyncio.Event()
        
        async def blocking_operation(operation_id: int):
            execution_order.append(f"start_{operation_id}")
            if operation_id < 2:  # First two operations block
                operation_started.set()
                await asyncio.sleep(0.5)
            execution_order.append(f"end_{operation_id}")
            return f"result_{operation_id}"
        
        # Start 4 operations (2 should execute, 2 should queue)
        tasks = [
            limiter.execute(blocking_operation, i)
            for i in range(4)
        ]
        
        # Wait for first operations to start
        await operation_started.wait()
        await asyncio.sleep(0.1)
        
        # Should have 2 active, 2 queued
        assert limiter.active_count == 2
        assert limiter.queued_count == 2
        
        # Wait for all to complete
        results = await asyncio.gather(*tasks)
        
        # All should complete successfully
        assert len(results) == 4
        assert limiter.active_count == 0
        assert limiter.queued_count == 0
    
    @pytest.mark.asyncio
    async def test_operation_timeout_handling(self):
        """
        TEST: Operations should timeout if they exceed operation_timeout
        
        Expected behavior:
        - Cancel operations that exceed timeout
        - Free up slots for other operations
        - Raise appropriate timeout exceptions
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter, OperationTimeoutError
        
        limiter = ConcurrentLimiter(max_concurrent=2, operation_timeout=0.2)
        
        async def fast_operation():
            await asyncio.sleep(0.1)
            return "fast_result"
        
        async def slow_operation():
            await asyncio.sleep(0.5)  # Longer than timeout
            return "slow_result"
        
        # Start fast and slow operations
        fast_task = limiter.execute(fast_operation)
        slow_task = limiter.execute(slow_operation)
        
        # Fast operation should succeed
        fast_result = await fast_task
        assert fast_result == "fast_result"
        
        # Slow operation should timeout
        with pytest.raises(OperationTimeoutError):
            await slow_task
        
        # Limiter should be clean after timeout
        await asyncio.sleep(0.1)
        assert limiter.active_count == 0
    
    @pytest.mark.asyncio
    async def test_queue_timeout_handling(self):
        """
        TEST: Queued operations should timeout if they wait too long
        
        Expected behavior:
        - Cancel queued operations that exceed queue_timeout
        - Raise appropriate queue timeout exceptions
        - Maintain queue integrity after timeouts
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter, QueueTimeoutError
        
        limiter = ConcurrentLimiter(
            max_concurrent=1, 
            operation_timeout=10.0,
            queue_timeout=0.2
        )
        
        operation_block = asyncio.Event()
        
        async def blocking_operation():
            await operation_block.wait()  # Block until released
            return "blocking_result"
        
        async def queued_operation():
            await asyncio.sleep(0.1)
            return "queued_result"
        
        # Start blocking operation (takes slot)
        blocking_task = limiter.execute(blocking_operation)
        await asyncio.sleep(0.05)  # Let it start
        
        # Start queued operation (should timeout waiting)
        queued_task = limiter.execute(queued_operation)
        
        # Queued operation should timeout
        with pytest.raises(QueueTimeoutError):
            await queued_task
        
        # Release blocking operation
        operation_block.set()
        result = await blocking_task
        assert result == "blocking_result"


class TestConcurrentLimiterResourceManagement:
    """
    Test Suite: Resource Management and Fair Usage
    
    RED PHASE: Write failing tests for resource allocation
    These tests define the resource management requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_resource_pool_allocation(self):
        """
        TEST: Resource pool should allocate and track resources fairly
        
        Expected behavior:
        - Allocate resources from finite pool
        - Track resource usage per operation
        - Return resources to pool when operations complete
        """
        from src.performance.concurrent_limiter import ResourcePool
        
        # Create resource pool with database connections
        pool = ResourcePool(
            resource_type="db_connection",
            max_resources=3,
            resource_factory=lambda: f"connection_{time.time()}"
        )
        
        acquired_resources = []
        
        async def use_resource():
            async with pool.acquire() as resource:
                acquired_resources.append(resource)
                await asyncio.sleep(0.1)
                return resource
        
        # Start multiple operations requiring resources
        tasks = [use_resource() for _ in range(5)]
        
        # Should handle resource contention
        results = await asyncio.gather(*tasks)
        
        # Verify resource allocation
        assert len(results) == 5
        assert len(set(results)) <= pool.max_resources  # May reuse connections
        assert pool.available_count == pool.max_resources  # All returned
    
    @pytest.mark.asyncio
    async def test_fair_usage_enforcement(self):
        """
        TEST: Fair usage should be enforced across different clients
        
        Expected behavior:
        - Limit operations per client/tenant
        - Prevent single client from monopolizing resources
        - Apply fair queuing algorithms
        """
        from src.performance.concurrent_limiter import FairUsageLimiter
        
        limiter = FairUsageLimiter(
            max_concurrent_per_client=2,
            max_concurrent_total=4
        )
        
        execution_times = {}
        
        async def client_operation(client_id: str, operation_id: int):
            start_time = time.time()
            await limiter.execute_for_client(
                client_id,
                lambda: asyncio.sleep(0.2)
            )
            execution_times[f"{client_id}_{operation_id}"] = time.time() - start_time
        
        # Start operations for multiple clients
        tasks = []
        for client in ["client_a", "client_b", "client_c"]:
            for op_id in range(3):  # 3 operations per client
                tasks.append(client_operation(client, op_id))
        
        await asyncio.gather(*tasks)
        
        # Verify fair distribution (no client should monopolize)
        client_a_times = [v for k, v in execution_times.items() if k.startswith("client_a")]
        client_b_times = [v for k, v in execution_times.items() if k.startswith("client_b")]
        client_c_times = [v for k, v in execution_times.items() if k.startswith("client_c")]
        
        # All clients should have similar average execution times
        avg_times = [
            sum(client_a_times) / len(client_a_times),
            sum(client_b_times) / len(client_b_times),
            sum(client_c_times) / len(client_c_times)
        ]
        
        # Standard deviation should be reasonable (fair distribution)
        import statistics
        assert statistics.stdev(avg_times) < 0.5  # Reasonable fairness
    
    @pytest.mark.asyncio
    async def test_priority_based_scheduling(self):
        """
        TEST: Higher priority operations should execute first
        
        Expected behavior:
        - Support operation priority levels
        - Schedule higher priority operations first
        - Maintain priority order in queue
        """
        from src.performance.concurrent_limiter import PriorityLimiter
        
        limiter = PriorityLimiter(max_concurrent=1)
        
        execution_order = []
        operation_started = asyncio.Event()
        
        async def blocking_operation():
            execution_order.append("blocking_start")
            operation_started.set()
            await asyncio.sleep(0.3)
            execution_order.append("blocking_end")
        
        async def priority_operation(priority: int, name: str):
            execution_order.append(f"{name}_start")
            await asyncio.sleep(0.1)
            execution_order.append(f"{name}_end")
            return name
        
        # Start blocking operation
        blocking_task = limiter.execute(blocking_operation, priority=0)
        await operation_started.wait()
        
        # Queue operations with different priorities
        low_task = limiter.execute(priority_operation, 1, "low", priority=1)
        high_task = limiter.execute(priority_operation, 3, "high", priority=3)
        medium_task = limiter.execute(priority_operation, 2, "medium", priority=2)
        
        # Wait for all to complete
        await asyncio.gather(blocking_task, low_task, high_task, medium_task)
        
        # Verify priority order (high, medium, low)
        priority_starts = [
            execution_order.index("high_start"),
            execution_order.index("medium_start"),
            execution_order.index("low_start")
        ]
        
        assert priority_starts == sorted(priority_starts)  # Should be in order


class TestConcurrentLimiterMonitoringAndMetrics:
    """
    Test Suite: Monitoring and Performance Metrics
    
    RED PHASE: Write failing tests for monitoring capabilities
    These tests define the monitoring requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_performance_metrics_collection(self):
        """
        TEST: Limiter should collect detailed performance metrics
        
        Expected behavior:
        - Track operation counts and timing
        - Monitor queue lengths and wait times
        - Calculate throughput and latency statistics
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=2, operation_timeout=10.0)
        
        async def timed_operation(duration: float):
            await asyncio.sleep(duration)
            return "completed"
        
        # Execute operations with varying durations
        durations = [0.1, 0.2, 0.1, 0.3, 0.1]
        tasks = [
            limiter.execute(timed_operation, duration)
            for duration in durations
        ]
        
        await asyncio.gather(*tasks)
        
        # Get performance metrics
        metrics = limiter.get_metrics()
        
        # Verify metrics collection
        assert metrics["total_operations"] == 5
        assert metrics["completed_operations"] == 5
        assert metrics["failed_operations"] == 0
        assert metrics["average_execution_time"] > 0
        assert metrics["max_queue_length"] >= 0
        assert metrics["throughput_per_second"] > 0
    
    @pytest.mark.asyncio
    async def test_real_time_monitoring(self):
        """
        TEST: Real-time monitoring of limiter state
        
        Expected behavior:
        - Provide real-time state information
        - Monitor active and queued operation counts
        - Track resource utilization percentages
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=3, operation_timeout=10.0)
        
        monitoring_data = []
        
        async def monitor_state():
            for _ in range(10):
                state = limiter.get_current_state()
                monitoring_data.append({
                    "timestamp": time.time(),
                    "active_count": state["active_count"],
                    "queued_count": state["queued_count"],
                    "utilization": state["utilization_percentage"]
                })
                await asyncio.sleep(0.05)
        
        async def long_operation(op_id: int):
            await asyncio.sleep(0.3)
            return f"result_{op_id}"
        
        # Start monitoring and operations concurrently
        monitor_task = asyncio.create_task(monitor_state())
        
        # Start operations that will create queuing
        operation_tasks = [
            limiter.execute(long_operation, i)
            for i in range(6)  # More than max_concurrent
        ]
        
        await asyncio.gather(monitor_task, *operation_tasks)
        
        # Verify monitoring captured state changes
        assert len(monitoring_data) == 10
        max_active = max(data["active_count"] for data in monitoring_data)
        max_queued = max(data["queued_count"] for data in monitoring_data)
        
        assert max_active <= 3  # Should not exceed limit
        assert max_queued > 0   # Should have queuing
    
    @pytest.mark.asyncio
    async def test_health_check_integration(self):
        """
        TEST: Health check integration for monitoring systems
        
        Expected behavior:
        - Provide health status based on performance metrics
        - Flag degraded performance conditions
        - Support health check endpoints
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(
            max_concurrent=2,
            operation_timeout=1.0,
            health_check_enabled=True
        )
        
        # Normal operations - should be healthy
        async def normal_operation():
            await asyncio.sleep(0.1)
            return "normal"
        
        for _ in range(3):
            await limiter.execute(normal_operation)
        
        health = limiter.get_health_status()
        assert health["status"] == "healthy"
        assert health["utilization"] < 0.8  # Not overloaded
        
        # Create degraded conditions
        async def slow_operation():
            await asyncio.sleep(0.8)  # Close to timeout
            return "slow"
        
        # Fill up capacity with slow operations
        tasks = [limiter.execute(slow_operation) for _ in range(4)]
        
        # Check health during load
        await asyncio.sleep(0.2)  # Let operations start
        degraded_health = limiter.get_health_status()
        
        # Should detect degraded performance
        assert degraded_health["status"] in ["degraded", "unhealthy"]
        assert degraded_health["utilization"] > 0.5
        
        await asyncio.gather(*tasks)


class TestConcurrentLimiterErrorHandlingAndRecovery:
    """
    Test Suite: Error Handling and Recovery Scenarios
    
    RED PHASE: Write failing tests for error conditions
    These tests define the error handling requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_operation_failure_handling(self):
        """
        TEST: Failed operations should not block limiter
        
        Expected behavior:
        - Handle operation exceptions gracefully
        - Free up slots when operations fail
        - Maintain accurate counters after failures
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=2, operation_timeout=10.0)
        
        async def failing_operation():
            await asyncio.sleep(0.1)
            raise ValueError("Operation failed")
        
        async def successful_operation():
            await asyncio.sleep(0.1)
            return "success"
        
        # Mix of failing and successful operations
        tasks = [
            limiter.execute(failing_operation),
            limiter.execute(successful_operation),
            limiter.execute(failing_operation),
            limiter.execute(successful_operation)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Check results
        exceptions = [r for r in results if isinstance(r, Exception)]
        successes = [r for r in results if r == "success"]
        
        assert len(exceptions) == 2
        assert len(successes) == 2
        
        # Limiter should be clean
        assert limiter.active_count == 0
        assert limiter.queued_count == 0
    
    @pytest.mark.asyncio
    async def test_limiter_shutdown_and_cleanup(self):
        """
        TEST: Graceful shutdown should handle active operations
        
        Expected behavior:
        - Wait for active operations to complete
        - Cancel queued operations gracefully
        - Clean up resources properly
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=1, operation_timeout=10.0)
        
        shutdown_started = asyncio.Event()
        
        async def long_operation():
            shutdown_started.set()
            await asyncio.sleep(0.3)
            return "completed"
        
        async def queued_operation():
            await asyncio.sleep(0.1)
            return "queued_completed"
        
        # Start operations
        active_task = limiter.execute(long_operation)
        await shutdown_started.wait()
        
        queued_task = limiter.execute(queued_operation)
        
        # Initiate shutdown
        shutdown_task = asyncio.create_task(limiter.shutdown(graceful_timeout=1.0))
        
        # Active operation should complete
        active_result = await active_task
        assert active_result == "completed"
        
        # Queued operation should be cancelled
        with pytest.raises(asyncio.CancelledError):
            await queued_task
        
        # Shutdown should complete
        await shutdown_task
        
        # Limiter should reject new operations
        with pytest.raises(RuntimeError):
            await limiter.execute(lambda: "new_operation")


# Custom exceptions for testing
class OperationTimeoutError(Exception):
    """Exception raised when operation exceeds timeout"""
    pass


class QueueTimeoutError(Exception):
    """Exception raised when operation times out waiting in queue"""
    pass


# Test execution markers
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.concurrent_limiter,
    pytest.mark.performance,
    pytest.mark.mongodb_foundation,
    pytest.mark.tdd
]


if __name__ == "__main__":
    # Run concurrent limiter tests
    pytest.main([__file__, "-v", "--tb=short"])