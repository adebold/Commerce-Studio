"""
Test-Driven Development for MongoDB Foundation Integration Hardening (Priority P0)

This test suite implements comprehensive integration testing for:
- End-to-end hardening scenario validation
- Cross-module interaction and dependency verification
- System resilience under various failure conditions
- Performance benchmarking and load testing

Following TDD Red-Green-Refactor cycle:
1. Write failing tests that define integration requirements
2. Implement minimal integration code to make tests pass
3. Refactor for production readiness and scalability

Based on reflection_hardening_LS4.md analysis - Priority P0 integration critical
"""

import pytest
import asyncio
import time
import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Callable
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from concurrent.futures import ThreadPoolExecutor
import random


class TestEndToEndHardeningScenarios:
    """
    Test Suite: End-to-End Hardening Scenarios
    
    RED PHASE: Write failing tests for complete hardening workflows
    These tests define the integration requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_complete_face_shape_analysis_workflow(self):
        """
        TEST: Complete face shape analysis with all hardening layers
        
        Expected behavior:
        - Input validation → Cache check → Circuit breaker → MongoDB → Response caching
        - Handle failures gracefully at each layer
        - Maintain performance under normal and degraded conditions
        """
        from src.validation.validators import validate_face_shape_query
        from src.performance.cache_manager import CacheManager
        from src.reliability.circuit_breaker import MongoDBCircuitBreaker
        
        # Initialize hardening components
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        await cache_manager.start()
        
        circuit_breaker = MongoDBCircuitBreaker()
        
        # Mock MongoDB client
        mock_mongodb_client = AsyncMock()
        mock_mongodb_client.find.return_value = [
            {"sku": "ABC-123", "compatibility": 0.8, "face_shape": "oval"},
            {"sku": "DEF-456", "compatibility": 0.9, "face_shape": "oval"}
        ]
        
        async def integrated_face_analysis(query_params: Dict[str, Any]):
            """Simulated end-to-end face analysis workflow"""
            
            # Step 1: Input validation
            validated_query = await validate_face_shape_query(query_params)
            
            # Step 2: Check cache
            cache_key = f"face_analysis:{validated_query['face_shape']}:{validated_query['min_compatibility']}"
            cached_result = await cache_manager.get(cache_key)
            if cached_result:
                return {"source": "cache", "data": cached_result}
            
            # Step 3: Circuit breaker protected MongoDB call
            async def mongodb_operation():
                return await mock_mongodb_client.find({
                    "face_shape_compatibility": {
                        validated_query["face_shape"]: {"$gte": validated_query["min_compatibility"]}
                    }
                }).to_list(validated_query["limit"])
            
            try:
                db_result = await circuit_breaker.call_with_fallback(
                    mongodb_operation,
                    fallback_data=[],
                    cache_key=cache_key
                )
                
                # Step 4: Cache successful result
                await cache_manager.set(cache_key, db_result, ttl=300)
                
                return {"source": "database", "data": db_result}
                
            except Exception as e:
                # Fallback to empty result with error indication
                return {"source": "fallback", "data": [], "error": str(e)}
        
        # Test successful workflow
        valid_query = {
            "face_shape": "oval",
            "min_compatibility": 0.7,
            "limit": 20
        }
        
        result = await integrated_face_analysis(valid_query)
        
        assert result["source"] == "database"
        assert len(result["data"]) == 2
        assert all(item["face_shape"] == "oval" for item in result["data"])
        
        # Test cache hit on second call
        cached_result = await integrated_face_analysis(valid_query)
        assert cached_result["source"] == "cache"
        
        await cache_manager.stop()
    
    @pytest.mark.asyncio
    async def test_security_injection_attack_prevention(self):
        """
        TEST: Comprehensive security attack prevention
        
        Expected behavior:
        - Block SQL injection attempts at validation layer
        - Prevent MongoDB operator injection
        - Sanitize all user inputs before processing
        - Log security violations for monitoring
        """
        from src.validation.validators import (
            validate_face_shape_query,
            detect_sql_injection,
            sanitize_query
        )
        
        # Various injection attack patterns
        injection_attacks = [
            {
                "face_shape": "'; DROP TABLE products; --",
                "min_compatibility": 0.7,
                "limit": 20
            },
            {
                "face_shape": "oval",
                "min_compatibility": {"$ne": None},  # MongoDB injection
                "limit": 20
            },
            {
                "face_shape": "<script>alert('xss')</script>",
                "min_compatibility": 0.7,
                "limit": 20
            },
            {
                "face_shape": "oval' OR '1'='1",
                "min_compatibility": 0.7,
                "limit": 20
            }
        ]
        
        security_violations = []
        
        for attack_query in injection_attacks:
            try:
                # Should be blocked at validation layer
                with pytest.raises((ValueError, TypeError, Exception)):
                    await validate_face_shape_query(attack_query)
                
                # Should be detected by injection scanner
                is_injection = await detect_sql_injection(attack_query)
                if is_injection:
                    security_violations.append(attack_query)
                
                # Should be sanitized
                sanitized = await sanitize_query(attack_query)
                assert "$ne" not in str(sanitized)  # MongoDB operators removed
                
            except Exception as e:
                # Expected for malicious inputs
                assert "security" in str(e).lower() or "invalid" in str(e).lower()
        
        # Should have detected multiple violations
        assert len(security_violations) > 0
    
    @pytest.mark.asyncio
    async def test_performance_under_load_with_degradation(self):
        """
        TEST: Performance under load with graceful degradation
        
        Expected behavior:
        - Handle high concurrent load gracefully
        - Activate circuit breaker when failures occur
        - Fall back to cached data during degradation
        - Maintain acceptable response times
        """
        from src.performance.cache_manager import CacheManager
        from src.reliability.circuit_breaker import MongoDBCircuitBreaker
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        # Initialize performance components
        cache_manager = CacheManager(memory_cache_size=1000, default_ttl=300)
        await cache_manager.start()
        
        circuit_breaker = MongoDBCircuitBreaker()
        concurrent_limiter = ConcurrentLimiter(max_concurrent=10, operation_timeout=5.0)
        
        # Mock database with intermittent failures
        failure_rate = 0.3  # 30% failure rate
        
        async def unreliable_database_operation(query_id: int):
            await asyncio.sleep(random.uniform(0.1, 0.3))  # Simulate latency
            
            if random.random() < failure_rate:
                raise ConnectionError(f"Database connection failed for query {query_id}")
            
            return {
                "query_id": query_id,
                "results": [f"result_{i}" for i in range(random.randint(1, 5))],
                "timestamp": time.time()
            }
        
        # Pre-populate cache with fallback data
        for i in range(50):
            cache_key = f"query_cache_{i}"
            fallback_data = {
                "query_id": i,
                "results": [f"cached_result_{j}" for j in range(3)],
                "source": "cache"
            }
            await cache_manager.set(cache_key, fallback_data, ttl=600)
        
        async def resilient_query_handler(query_id: int):
            """Query handler with full hardening stack"""
            cache_key = f"query_cache_{query_id}"
            
            # Check cache first
            cached_result = await cache_manager.get(cache_key)
            if cached_result and random.random() < 0.7:  # 70% cache hit simulation
                return cached_result
            
            # Use concurrent limiter and circuit breaker
            async def limited_db_operation():
                return await circuit_breaker.call_with_fallback(
                    lambda: unreliable_database_operation(query_id),
                    fallback_data=cached_result,
                    cache_key=cache_key
                )
            
            try:
                result = await concurrent_limiter.execute(limited_db_operation)
                
                # Cache successful results
                if result and "error" not in result:
                    await cache_manager.set(cache_key, result, ttl=300)
                
                return result
                
            except Exception as e:
                # Return cached data if available
                if cached_result:
                    return cached_result
                else:
                    return {"error": str(e), "query_id": query_id}
        
        # Simulate high load
        start_time = time.time()
        tasks = [resilient_query_handler(i) for i in range(100)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()
        
        # Analyze results
        successful_results = [r for r in results if isinstance(r, dict) and "error" not in r]
        error_results = [r for r in results if isinstance(r, dict) and "error" in r]
        exceptions = [r for r in results if isinstance(r, Exception)]
        
        # Performance assertions
        total_time = end_time - start_time
        assert total_time < 10.0  # Should complete within 10 seconds
        
        # Resilience assertions
        success_rate = len(successful_results) / len(results)
        assert success_rate > 0.5  # Should maintain >50% success rate even with failures
        
        # Circuit breaker should have activated
        cb_stats = circuit_breaker.get_stats()
        assert cb_stats["total_failures"] > 0
        
        await cache_manager.stop()


class TestCrossModuleInteractionValidation:
    """
    Test Suite: Cross-Module Interaction Validation
    
    RED PHASE: Write failing tests for module interactions
    These tests define the interaction requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_cache_manager_circuit_breaker_integration(self):
        """
        TEST: Cache manager and circuit breaker should work together seamlessly
        
        Expected behavior:
        - Circuit breaker should use cache for fallback data
        - Cache should be updated after successful circuit breaker calls
        - Both components should handle failures gracefully
        """
        from src.performance.cache_manager import CacheManager
        from src.reliability.circuit_breaker import MongoDBCircuitBreaker
        
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        await cache_manager.start()
        
        circuit_breaker = MongoDBCircuitBreaker()
        
        # Mock database operation that will fail
        failure_count = 0
        
        async def failing_database_operation():
            nonlocal failure_count
            failure_count += 1
            if failure_count <= 3:
                raise ConnectionError("Database connection failed")
            return {"data": "success", "attempt": failure_count}
        
        # Pre-populate cache with fallback data
        cache_key = "test_operation"
        fallback_data = {"data": "cached_fallback", "source": "cache"}
        await cache_manager.set(cache_key, fallback_data)
        
        # First attempts should fail and use cached fallback
        for attempt in range(3):
            result = await circuit_breaker.call_with_fallback(
                failing_database_operation,
                fallback_data=await cache_manager.get(cache_key),
                cache_key=cache_key
            )
            
            assert result == fallback_data  # Should return cached data
        
        # Circuit should be open now
        assert circuit_breaker.state.value == "open"
        
        # After recovery timeout, should eventually succeed
        await asyncio.sleep(0.1)  # Brief wait
        circuit_breaker.state = circuit_breaker.state.__class__("half_open")
        
        success_result = await circuit_breaker.call_with_fallback(
            failing_database_operation,
            cache_key=cache_key
        )
        
        assert success_result["data"] == "success"
        
        await cache_manager.stop()
    
    @pytest.mark.asyncio
    async def test_validation_sanitization_integration(self):
        """
        TEST: Input validation and query sanitization should work together
        
        Expected behavior:
        - Validation should occur before sanitization
        - Sanitized queries should pass validation
        - Failed validation should prevent unsafe sanitization
        """
        from src.validation.validators import (
            validate_product_filter,
            sanitize_query,
            sanitize_query_fields
        )
        
        # Test clean integration flow
        clean_query = {
            "sku": "ABC-123",
            "price_min": 50.0,
            "price_max": 200.0,
            "active": True
        }
        
        # Should pass validation
        validated_query = await validate_product_filter(clean_query)
        assert validated_query["sku"] == "ABC-123"
        
        # Should pass sanitization
        sanitized_query = await sanitize_query(validated_query)
        assert "sku" in sanitized_query
        
        # Should pass field whitelisting
        whitelisted_query = await sanitize_query_fields(sanitized_query)
        assert whitelisted_query == sanitized_query
        
        # Test malicious input handling
        malicious_query = {
            "sku": "ABC'; DROP TABLE products; --",
            "price_min": {"$gt": 0},  # MongoDB injection
            "unauthorized_field": "malicious_value"
        }
        
        # Should fail at validation stage
        with pytest.raises((ValueError, TypeError, Exception)):
            await validate_product_filter(malicious_query)
        
        # Even if sanitized, should fail field whitelisting
        try:
            sanitized_malicious = await sanitize_query(malicious_query)
            with pytest.raises(Exception):  # SecurityError or similar
                await sanitize_query_fields(sanitized_malicious)
        except Exception:
            pass  # Expected for malicious input
    
    @pytest.mark.asyncio
    async def test_datetime_utils_cache_integration(self):
        """
        TEST: DateTime utilities should integrate properly with cache TTL management
        
        Expected behavior:
        - Cache TTL should use datetime utilities for accuracy
        - Expiration checks should be consistent
        - Timezone handling should be uniform
        """
        from src.utils.datetime_utils import utc_now, get_expiry_datetime, is_expired
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=100, default_ttl=300)
        
        # Test cache entry with datetime utils integration
        current_time = utc_now()
        ttl_seconds = 2  # 2 seconds for quick testing
        
        # Set cache entry
        cache.set("datetime_test", "test_value", ttl=ttl_seconds)
        
        # Should be available immediately
        assert cache.get("datetime_test") == "test_value"
        
        # Wait for expiration
        await asyncio.sleep(2.5)
        
        # Should be expired now
        assert cache.get("datetime_test") is None
        
        # Test expiration calculation consistency
        base_time = current_time
        expiry_time = get_expiry_datetime(base_time, ttl_seconds)
        
        # Check if properly expired
        future_time = current_time + timedelta(seconds=ttl_seconds + 1)
        with patch('src.utils.datetime_utils.utc_now', return_value=future_time):
            assert is_expired(expiry_time) is True


class TestSystemResilienceUnderFailure:
    """
    Test Suite: System Resilience Under Various Failure Conditions
    
    RED PHASE: Write failing tests for failure scenarios
    These tests define the resilience requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_cascading_failure_prevention(self):
        """
        TEST: System should prevent cascading failures
        
        Expected behavior:
        - Isolate failures to prevent system-wide impact
        - Maintain partial functionality during component failures
        - Recover gracefully when components are restored
        """
        from src.performance.cache_manager import CacheManager
        from src.reliability.circuit_breaker import MongoDBCircuitBreaker
        
        # Initialize components
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        await cache_manager.start()
        
        circuit_breaker = MongoDBCircuitBreaker()
        
        # Simulate database failure
        async def always_failing_database():
            raise ConnectionError("Database completely unavailable")
        
        # Pre-populate cache to test isolation
        await cache_manager.set("cached_data", {"value": "cached_response"})
        
        # Database failures should not affect cache operations
        cached_result = await cache_manager.get("cached_data")
        assert cached_result["value"] == "cached_response"
        
        # Circuit breaker should activate but not crash
        for _ in range(6):  # Exceed failure threshold
            try:
                await circuit_breaker.call(always_failing_database)
            except Exception:
                pass  # Expected failures
        
        # Circuit should be open but system still functional
        assert circuit_breaker.state.value == "open"
        
        # Cache should still work
        await cache_manager.set("new_data", {"value": "new_response"})
        new_result = await cache_manager.get("new_data")
        assert new_result["value"] == "new_response"
        
        await cache_manager.stop()
    
    @pytest.mark.asyncio
    async def test_memory_pressure_handling(self):
        """
        TEST: System should handle memory pressure gracefully
        
        Expected behavior:
        - Cache should evict entries under memory pressure
        - Circuit breaker should maintain minimal memory footprint
        - System should remain stable under resource constraints
        """
        from src.performance.cache_manager import MemoryCache
        
        # Create cache with small size to simulate memory pressure
        small_cache = MemoryCache(max_size=10, default_ttl=300)
        
        # Fill cache beyond capacity
        for i in range(20):
            large_data = {"data": "x" * 1000, "id": i}  # Create larger entries
            small_cache.set(f"large_entry_{i}", large_data)
        
        # Cache should have evicted older entries
        stats = small_cache.get_stats()
        assert stats["size"] <= 10
        assert stats["evictions"] > 0
        
        # Most recent entries should still be available
        recent_entries = []
        for i in range(15, 20):
            entry = small_cache.get(f"large_entry_{i}")
            if entry:
                recent_entries.append(entry)
        
        assert len(recent_entries) > 0  # Some recent entries should remain
    
    @pytest.mark.asyncio
    async def test_concurrent_failure_isolation(self):
        """
        TEST: Concurrent operation failures should not affect each other
        
        Expected behavior:
        - Failed operations should not block successful ones
        - Isolation between different operation types
        - Consistent behavior under concurrent stress
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=5, operation_timeout=2.0)
        
        success_count = 0
        failure_count = 0
        
        async def mixed_operation(operation_id: int):
            nonlocal success_count, failure_count
            
            if operation_id % 3 == 0:  # Every third operation fails
                await asyncio.sleep(0.1)
                failure_count += 1
                raise ValueError(f"Operation {operation_id} failed")
            else:
                await asyncio.sleep(0.1)
                success_count += 1
                return f"Success {operation_id}"
        
        # Run concurrent operations with mixed success/failure
        tasks = [limiter.execute(mixed_operation, i) for i in range(30)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Verify isolation - failures shouldn't affect successes
        successful_results = [r for r in results if isinstance(r, str)]
        failed_results = [r for r in results if isinstance(r, Exception)]
        
        assert len(successful_results) > 0
        assert len(failed_results) > 0
        assert len(successful_results) + len(failed_results) == 30
        
        # Success rate should be approximately 2/3
        success_rate = len(successful_results) / 30
        assert 0.6 <= success_rate <= 0.7


class TestPerformanceBenchmarkingAndOptimization:
    """
    Test Suite: Performance Benchmarking and Optimization Validation
    
    RED PHASE: Write failing tests for performance requirements
    These tests define the performance targets before optimization
    """
    
    @pytest.mark.asyncio
    async def test_cache_performance_benchmarks(self):
        """
        TEST: Cache operations should meet performance benchmarks
        
        Expected behavior:
        - Get operations should complete in <1ms on average
        - Set operations should complete in <2ms on average
        - Bulk operations should scale linearly
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=10000, default_ttl=300)
        
        # Benchmark individual operations
        start_time = time.time()
        for i in range(1000):
            cache.set(f"bench_key_{i}", f"bench_value_{i}")
        set_time = time.time() - start_time
        
        start_time = time.time()
        for i in range(1000):
            cache.get(f"bench_key_{i}")
        get_time = time.time() - start_time
        
        # Performance assertions
        avg_set_time = set_time / 1000
        avg_get_time = get_time / 1000
        
        assert avg_set_time < 0.002  # <2ms per set operation
        assert avg_get_time < 0.001  # <1ms per get operation
        
        print(f"Average set time: {avg_set_time*1000:.2f}ms")
        print(f"Average get time: {avg_get_time*1000:.2f}ms")
    
    @pytest.mark.asyncio
    async def test_concurrent_throughput_benchmarks(self):
        """
        TEST: Concurrent operations should achieve target throughput
        
        Expected behavior:
        - Handle >100 operations per second under normal load
        - Maintain <100ms response time for 95th percentile
        - Scale with available CPU cores
        """
        from src.performance.concurrent_limiter import ConcurrentLimiter
        
        limiter = ConcurrentLimiter(max_concurrent=20, operation_timeout=5.0)
        
        response_times = []
        
        async def benchmark_operation():
            start = time.time()
            await asyncio.sleep(random.uniform(0.01, 0.05))  # Simulate work
            end = time.time()
            response_times.append(end - start)
            return "completed"
        
        # Run throughput test
        start_time = time.time()
        tasks = [limiter.execute(benchmark_operation) for _ in range(200)]
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        # Calculate metrics
        total_time = end_time - start_time
        throughput = len(results) / total_time
        
        # Sort response times for percentile calculation
        response_times.sort()
        p95_response_time = response_times[int(len(response_times) * 0.95)]
        
        # Performance assertions
        assert throughput > 100  # >100 operations per second
        assert p95_response_time < 0.1  # <100ms for 95th percentile
        
        print(f"Throughput: {throughput:.1f} ops/sec")
        print(f"95th percentile response time: {p95_response_time*1000:.1f}ms")
    
    @pytest.mark.asyncio
    async def test_memory_efficiency_benchmarks(self):
        """
        TEST: Memory usage should remain within acceptable bounds
        
        Expected behavior:
        - Cache memory usage should be predictable
        - No memory leaks during normal operations
        - Efficient cleanup of expired entries
        """
        import psutil
        import os
        
        from src.performance.cache_manager import CacheManager
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        cache_manager = CacheManager(memory_cache_size=1000, default_ttl=1)
        await cache_manager.start()
        
        # Populate cache with data
        for i in range(1000):
            data = {"id": i, "data": "x" * 100}  # ~100 bytes per entry
            await cache_manager.set(f"memory_test_{i}", data)
        
        # Measure memory after population
        populated_memory = process.memory_info().rss
        memory_increase = populated_memory - initial_memory
        
        # Wait for TTL expiration and cleanup
        await asyncio.sleep(2)
        
        # Measure memory after cleanup
        cleaned_memory = process.memory_info().rss
        memory_after_cleanup = cleaned_memory - initial_memory
        
        await cache_manager.stop()
        
        # Memory efficiency assertions
        expected_memory_per_entry = 200  # ~200 bytes per entry (with overhead)
        max_expected_memory = 1000 * expected_memory_per_entry
        
        assert memory_increase < max_expected_memory * 2  # Allow 2x overhead
        assert memory_after_cleanup < memory_increase * 0.5  # Should cleanup significantly
        
        print(f"Memory increase: {memory_increase / 1024:.1f} KB")
        print(f"Memory after cleanup: {memory_after_cleanup / 1024:.1f} KB")


# Test execution markers
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.integration,
    pytest.mark.hardening,
    pytest.mark.mongodb_foundation,
    pytest.mark.tdd,
    pytest.mark.slow  # Integration tests may take longer
]


if __name__ == "__main__":
    # Run integration hardening tests
    pytest.main([__file__, "-v", "--tb=short", "-s"])