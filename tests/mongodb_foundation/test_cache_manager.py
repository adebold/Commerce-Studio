"""
Test-Driven Development for Cache Manager Performance Optimization (Priority P2)

This test suite implements comprehensive cache manager testing for:
- Memory cache operations with TTL and LRU eviction
- Thread-safe concurrent access and state management
- Cache hit/miss ratio optimization and statistics
- High-level caching patterns for MongoDB operations

Following TDD Red-Green-Refactor cycle:
1. Write failing tests that define cache requirements
2. Implement minimal cache code to make tests pass
3. Refactor for production readiness and performance

Based on reflection_hardening_LS4.md analysis - Priority P2 performance critical
"""

import pytest
import asyncio
import time
import threading
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from unittest.mock import Mock, patch, AsyncMock
from concurrent.futures import ThreadPoolExecutor


class TestMemoryCacheBasicOperations:
    """
    Test Suite: Memory Cache Basic Operations
    
    RED PHASE: Write failing tests for memory cache functionality
    These tests define the cache operation requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_cache_set_and_get_operations(self):
        """
        TEST: Basic cache set and get operations
        
        Expected behavior:
        - Store values with keys and retrieve them
        - Handle different data types (dict, list, string, int)
        - Return None for non-existent keys
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=100, default_ttl=300)
        
        # Test different data types
        test_data = {
            "string_key": "test_string",
            "dict_key": {"face_shape": "oval", "compatibility": 0.8},
            "list_key": [1, 2, 3, 4, 5],
            "int_key": 42
        }
        
        # Set values
        for key, value in test_data.items():
            cache.set(key, value)
        
        # Get values and verify
        for key, expected_value in test_data.items():
            retrieved_value = cache.get(key)
            assert retrieved_value == expected_value
        
        # Test non-existent key
        assert cache.get("non_existent_key") is None
    
    @pytest.mark.asyncio
    async def test_cache_ttl_expiration(self):
        """
        TEST: Cache entries should expire after TTL
        
        Expected behavior:
        - Entries expire after specified TTL
        - Expired entries return None
        - Custom TTL overrides default TTL
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=100, default_ttl=1)  # 1 second TTL
        
        # Set value with default TTL
        cache.set("short_lived", "value1")
        
        # Set value with custom TTL
        cache.set("long_lived", "value2", ttl=3)
        
        # Verify immediate retrieval works
        assert cache.get("short_lived") == "value1"
        assert cache.get("long_lived") == "value2"
        
        # Wait for short TTL to expire
        await asyncio.sleep(1.5)
        
        # Short-lived should be expired, long-lived should still exist
        assert cache.get("short_lived") is None
        assert cache.get("long_lived") == "value2"
        
        # Wait for long TTL to expire
        await asyncio.sleep(2)
        assert cache.get("long_lived") is None
    
    @pytest.mark.asyncio
    async def test_cache_lru_eviction(self):
        """
        TEST: Cache should evict least recently used entries when full
        
        Expected behavior:
        - Evict oldest entries when max_size is exceeded
        - Recently accessed entries remain in cache
        - LRU order is maintained correctly
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=3, default_ttl=300)
        
        # Fill cache to capacity
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        # All keys should be present
        assert cache.get("key1") == "value1"
        assert cache.get("key2") == "value2"
        assert cache.get("key3") == "value3"
        
        # Access key1 to make it recently used
        cache.get("key1")
        
        # Add new entry - should evict key2 (least recently used)
        cache.set("key4", "value4")
        
        # key2 should be evicted, others should remain
        assert cache.get("key1") == "value1"  # Recently accessed
        assert cache.get("key2") is None      # Evicted
        assert cache.get("key3") == "value3"  # Still present
        assert cache.get("key4") == "value4"  # Newly added
    
    @pytest.mark.asyncio
    async def test_cache_statistics_tracking(self):
        """
        TEST: Cache should track hit/miss statistics
        
        Expected behavior:
        - Track cache hits and misses
        - Calculate hit rate accurately
        - Track eviction count
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=2, default_ttl=300)
        
        # Initially no stats
        stats = cache.get_stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["hit_rate"] == 0.0
        assert stats["evictions"] == 0
        
        # Set and get - should be hit
        cache.set("key1", "value1")
        cache.get("key1")  # Hit
        
        # Get non-existent - should be miss
        cache.get("non_existent")  # Miss
        
        # Check stats
        stats = cache.get_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["hit_rate"] == 0.5
        
        # Force eviction
        cache.set("key2", "value2")
        cache.set("key3", "value3")  # Should evict key1
        
        stats = cache.get_stats()
        assert stats["evictions"] == 1


class TestCacheManagerAsyncOperations:
    """
    Test Suite: Cache Manager Async Operations
    
    RED PHASE: Write failing tests for async cache manager
    These tests define the async wrapper requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_async_cache_operations(self):
        """
        TEST: Async cache manager operations
        
        Expected behavior:
        - Provide async wrappers for all cache operations
        - Handle async/await properly
        - Maintain thread safety
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        
        # Test async set and get
        await cache_manager.set("async_key", {"test": "data"})
        result = await cache_manager.get("async_key")
        assert result == {"test": "data"}
        
        # Test async delete
        deleted = await cache_manager.delete("async_key")
        assert deleted is True
        
        # Verify deletion
        result = await cache_manager.get("async_key")
        assert result is None
    
    @pytest.mark.asyncio
    async def test_cache_cleanup_background_task(self):
        """
        TEST: Background cleanup task for expired entries
        
        Expected behavior:
        - Start background cleanup task automatically
        - Clean up expired entries periodically
        - Stop cleanup task gracefully
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(
            memory_cache_size=100, 
            default_ttl=1,  # 1 second TTL
            cleanup_interval=1  # 1 second cleanup interval
        )
        
        # Start cache manager
        await cache_manager.start()
        
        # Add entries with short TTL
        await cache_manager.set("temp1", "value1", ttl=1)
        await cache_manager.set("temp2", "value2", ttl=1)
        
        # Verify entries exist
        assert await cache_manager.get("temp1") == "value1"
        assert await cache_manager.get("temp2") == "value2"
        
        # Wait for cleanup to run
        await asyncio.sleep(2.5)
        
        # Entries should be cleaned up
        assert await cache_manager.get("temp1") is None
        assert await cache_manager.get("temp2") is None
        
        # Stop cache manager
        await cache_manager.stop()
    
    @pytest.mark.asyncio
    async def test_get_or_set_pattern(self):
        """
        TEST: Get-or-set caching pattern
        
        Expected behavior:
        - Return cached value if present
        - Generate and cache value if not present
        - Support both sync and async factory functions
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        
        call_count = 0
        
        def expensive_sync_operation():
            nonlocal call_count
            call_count += 1
            return {"result": f"sync_value_{call_count}"}
        
        async def expensive_async_operation():
            nonlocal call_count
            call_count += 1
            return {"result": f"async_value_{call_count}"}
        
        # First call - should execute factory function
        result1 = await cache_manager.get_or_set("sync_key", expensive_sync_operation)
        assert result1 == {"result": "sync_value_1"}
        assert call_count == 1
        
        # Second call - should return cached value
        result2 = await cache_manager.get_or_set("sync_key", expensive_sync_operation)
        assert result2 == {"result": "sync_value_1"}
        assert call_count == 1  # Should not increment
        
        # Test async factory function
        result3 = await cache_manager.get_or_set("async_key", expensive_async_operation)
        assert result3 == {"result": "async_value_2"}
        assert call_count == 2


class TestSpecializedCachingPatterns:
    """
    Test Suite: Specialized Caching Patterns for MongoDB Operations
    
    RED PHASE: Write failing tests for MongoDB-specific caching
    These tests define the specialized cache requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_product_compatibility_caching(self):
        """
        TEST: Product compatibility results caching
        
        Expected behavior:
        - Cache product compatibility queries with face shape parameters
        - Generate deterministic cache keys from query parameters
        - Use appropriate TTL for compatibility data
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        
        compatibility_results = [
            {"sku": "ABC-123", "compatibility": 0.8, "face_shape": "oval"},
            {"sku": "DEF-456", "compatibility": 0.9, "face_shape": "oval"}
        ]
        
        # Cache compatibility results
        await cache_manager.cache_product_compatibility(
            face_shape="oval",
            min_compatibility=0.7,
            limit=20,
            results=compatibility_results
        )
        
        # Retrieve cached results
        cached_results = await cache_manager.get_cached_product_compatibility(
            face_shape="oval",
            min_compatibility=0.7,
            limit=20
        )
        
        assert cached_results == compatibility_results
        
        # Different parameters should not return cached results
        different_results = await cache_manager.get_cached_product_compatibility(
            face_shape="round",  # Different face shape
            min_compatibility=0.7,
            limit=20
        )
        
        assert different_results is None
    
    @pytest.mark.asyncio
    async def test_face_analysis_caching(self):
        """
        TEST: Face analysis results caching
        
        Expected behavior:
        - Cache face analysis results by session ID
        - Use longer TTL for expensive analysis operations
        - Handle session-based cache invalidation
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(memory_cache_size=100, default_ttl=300)
        
        session_id = "session_12345"
        analysis_result = {
            "detected_face_shape": "oval",
            "confidence": 0.85,
            "measurements": {
                "face_width": 140,
                "face_height": 180
            }
        }
        
        # Cache face analysis
        await cache_manager.cache_face_analysis(session_id, analysis_result)
        
        # Retrieve cached analysis
        cached_analysis = await cache_manager.get_cached_face_analysis(session_id)
        assert cached_analysis == analysis_result
        
        # Different session should not return cached results
        different_analysis = await cache_manager.get_cached_face_analysis("different_session")
        assert different_analysis is None
    
    @pytest.mark.asyncio
    async def test_cache_key_generation(self):
        """
        TEST: Deterministic cache key generation
        
        Expected behavior:
        - Generate consistent keys for identical parameters
        - Generate different keys for different parameters
        - Handle complex nested dictionaries
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=100, default_ttl=300)
        
        # Test dict-based keys
        query1 = {"face_shape": "oval", "min_compatibility": 0.7, "limit": 20}
        query2 = {"face_shape": "oval", "min_compatibility": 0.7, "limit": 20}
        query3 = {"face_shape": "round", "min_compatibility": 0.7, "limit": 20}
        
        # Set values with dict keys
        cache.set(query1, "result1")
        cache.set(query3, "result3")
        
        # Same query should return same result
        assert cache.get(query2) == "result1"
        
        # Different query should return different result
        assert cache.get(query3) == "result3"


class TestCacheConcurrencyAndThreadSafety:
    """
    Test Suite: Cache Concurrency and Thread Safety
    
    RED PHASE: Write failing tests for concurrent cache access
    These tests define the thread safety requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_concurrent_cache_operations(self):
        """
        TEST: Thread-safe concurrent cache operations
        
        Expected behavior:
        - Handle multiple concurrent reads and writes
        - Maintain data consistency under load
        - Prevent race conditions in cache state
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=1000, default_ttl=300)
        
        # Concurrent write operations
        async def write_operation(thread_id: int):
            for i in range(100):
                key = f"thread_{thread_id}_key_{i}"
                value = f"thread_{thread_id}_value_{i}"
                cache.set(key, value)
        
        # Concurrent read operations
        async def read_operation(thread_id: int):
            for i in range(100):
                key = f"thread_{thread_id}_key_{i}"
                cache.get(key)  # May return None initially
        
        # Run concurrent operations
        write_tasks = [write_operation(i) for i in range(5)]
        read_tasks = [read_operation(i) for i in range(5)]
        
        await asyncio.gather(*write_tasks, *read_tasks)
        
        # Verify final state consistency
        stats = cache.get_stats()
        assert stats["size"] <= cache.max_size
        assert stats["hits"] + stats["misses"] > 0
    
    @pytest.mark.asyncio
    async def test_cache_manager_concurrent_cleanup(self):
        """
        TEST: Concurrent cleanup operations
        
        Expected behavior:
        - Handle cleanup while other operations are running
        - Maintain cache integrity during cleanup
        - Prevent deadlocks between cleanup and operations
        """
        from src.performance.cache_manager import CacheManager
        
        cache_manager = CacheManager(
            memory_cache_size=100,
            default_ttl=1,  # Short TTL
            cleanup_interval=0.5  # Frequent cleanup
        )
        
        await cache_manager.start()
        
        # Continuous operations while cleanup runs
        async def continuous_operations():
            for i in range(200):
                await cache_manager.set(f"key_{i}", f"value_{i}", ttl=1)
                await cache_manager.get(f"key_{i}")
                await asyncio.sleep(0.01)  # Small delay
        
        # Run operations concurrently with cleanup
        await asyncio.gather(
            continuous_operations(),
            continuous_operations(),
            continuous_operations()
        )
        
        await cache_manager.stop()
        
        # Cache should still be functional
        await cache_manager.set("final_test", "final_value")
        assert await cache_manager.get("final_test") == "final_value"


class TestCacheErrorHandlingAndEdgeCases:
    """
    Test Suite: Cache Error Handling and Edge Cases
    
    RED PHASE: Write failing tests for error scenarios
    These tests define the error handling requirements before implementation
    """
    
    @pytest.mark.asyncio
    async def test_cache_with_large_objects(self):
        """
        TEST: Cache behavior with large objects
        
        Expected behavior:
        - Handle large objects gracefully
        - Maintain performance with varied object sizes
        - Properly track memory usage
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=10, default_ttl=300)
        
        # Create large object
        large_object = {
            "products": [{"sku": f"PRODUCT_{i}", "data": "x" * 1000} for i in range(100)]
        }
        
        # Should handle large objects
        cache.set("large_object", large_object)
        retrieved = cache.get("large_object")
        assert retrieved == large_object
        
        # Should still maintain LRU behavior
        for i in range(15):  # Exceed max_size
            cache.set(f"small_key_{i}", f"small_value_{i}")
        
        # Large object should eventually be evicted
        stats = cache.get_stats()
        assert stats["size"] <= cache.max_size
        assert stats["evictions"] > 0
    
    @pytest.mark.asyncio
    async def test_cache_with_none_values(self):
        """
        TEST: Cache behavior with None values
        
        Expected behavior:
        - Distinguish between None values and missing keys
        - Cache None values when explicitly set
        - Handle edge cases with falsy values
        """
        from src.performance.cache_manager import MemoryCache
        
        cache = MemoryCache(max_size=100, default_ttl=300)
        
        # Explicitly cache None value
        cache.set("none_key", None)
        
        # Should return None (cached value), not miss
        result = cache.get("none_key")
        assert result is None
        
        # Should be recorded as cache hit, not miss
        stats = cache.get_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 0
        
        # Test other falsy values
        falsy_values = [0, False, "", []]
        for i, value in enumerate(falsy_values):
            cache.set(f"falsy_{i}", value)
            retrieved = cache.get(f"falsy_{i}")
            assert retrieved == value
    
    @pytest.mark.asyncio
    async def test_cache_context_manager(self):
        """
        TEST: Cache context manager functionality
        
        Expected behavior:
        - Provide context manager for cache operations
        - Handle resource cleanup automatically
        - Work with async context management
        """
        from src.performance.cache_manager import CacheContext
        
        # Test context manager
        async with CacheContext() as cache_manager:
            await cache_manager.set("context_key", "context_value")
            result = await cache_manager.get("context_key")
            assert result == "context_value"
        
        # Context should have been properly managed
        # (Implementation detail - may vary based on global cache handling)


# Test execution markers
pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.cache_manager,
    pytest.mark.performance,
    pytest.mark.mongodb_foundation,
    pytest.mark.tdd
]


if __name__ == "__main__":
    # Run cache manager tests
    pytest.main([__file__, "-v", "--tb=short"])